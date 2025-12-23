# Automated Satellite Imagery Change Detection System Architecture

## 1. Executive Summary
This document outlines the technical architecture for an automated AI/ML system designed to detect man-made changes (mining, infrastructure, urbanization) in satellite imagery. The system integrates data from Planet Labs (3m) and Sentinel-2 (10m) to process upwards of 1000 images daily with a target precision of 95%.

## 2. System Overview
The system follows a standard ETL (Extract, Transform, Load) pattern enriched with Deep Learning inference steps.

**High-Level Pipeline:**
1.  **Ingestion Service**: Fetches imagery from providers.
2.  **Preprocessing Engine**: Normalizes and aligns data.
3.  **Inference Engine**: Runs Change Detection Models (CDM).
4.  **Post-Processing & Validation**: Filters noise and converts to Vector data.
5.  **Storage & API**: Indexes results for retrieval.

## 3. Data Processing Pipeline

### 3.1 Data Source Characteristics & Handling
| Feature | Planet Labs | Sentinel-2 | Handling Strategy |
| :--- | :--- | :--- | :--- |
| **Resolution** | 3m | 10m | Resample Sentinel-2 to 3m for fusion or use multi-scale model architecture. |
| **Format** | PNG (Visual) | GeoTIFF (Multispectral) | Convert PNGs to GeoTIFF using provided metadata (World Files/RPCs) for georeferencing. |
| **Frequency** | Weekly | Daily | Temporal alignment window of +/- 3 days for "before" and "after" pairs. |

### 3.2 Preprocessing Steps
1.  **Georeferencing (Planet Labs)**: Since Planet data comes as PNG, use associated JSON metadata/World files to map pixels to coords.
2.  **Co-registration**: Align "Before" (t1) and "After" (t2) images precisely. Errors >1 pixel lead to false alarms. Use algorithm: *SIFT/SURF feature matching + RANSAC*.
3.  **Atmospheric Correction & Cloud Masking**:
    *   **Sentinel-2**: Use `s2cloudless` or Sen2Cor.
    *   **Planet**: Use U-Net based cloud segmentation if alpha mask is unavailable.
4.  **Normalization**: Histogram matching to reduce radiometric differences caused by lighting/seasons.

## 4. Model Architecture & Selection

### 4.1 Approach: Deep Siamese Networks
We will use a **Siamese Encoder-Decoder** architecture, specifically tailored for Change Detection (e.g., **ChangeNet**, **SNUNet-CD**).

*   **Encoder**: Shared weights twin neural network (e.g., **ResNet50** or **EfficientNet-B4** pretrained on ImageNet/BigEarthNet) to extract features from t1 and t2 images independently.
*   **Fusion Module**: Concatenation and difference of feature maps at multiple scales.
*   **Decoder**: Reconstructs a binary change mask (0 = no change, 1 = change).

### 4.2 Handling Multi-Resolution
*   **Strategy**: Upsample Sentinel-2 (10m) to match Planet (3m) using Bicubic interpolation before feeding into the network.
*   **Alternative**: Use a Dual-Stream network where one stream handles 10m and other 3m, fusing at the bottleneck. *Chosen approach: Resampling for simplicity and compatibility.*

### 4.3 Training Strategy
*   **Loss Function**: Weighted Binary Cross-Entropy + Dice Loss (to handle class imbalance, as changes are rare pixels).
*   **Augmentation**: Random rotations, flips, and color jitter to robustness against seasonal variations.

## 5. False Alarm Minimization
To achieve 95% precision:
1.  **Semantic Filtering**: Run a secondary Semantic Segmentation model (e.g., DeepLabV3+) to classify the *type* of change. If the change area is "Cloud", "Water", or "Vegetation phenology", discard it. Keep only "Barren Land", "Impervious Surface".
2.  **Shape Filtering**: Discard small, salt-and-pepper noise polygons (< 100 sq meters).

## 6. Implementation Strategy

### 6.1 Technology Stack
*   **Language**: Python 3.9+
*   **ML Framework**: PyTorch (Lightning)
*   **Geospatial**: Rasterio, GDAL, Shapely, Geopandas
*   **Orchestration**: Apache Airflow or Prefect
*   **Containerization**: Docker & Kubernetes (for scaling)

### 6.2 Infrastructure Requirements
*   **Compute**: GPU instances (e.g., NVIDIA T4 or A10G) for inference.
*   **Storage**: S3-compatible object storage for raw rasters; PostGIS for GeoJSON results.

## 7. Operational Workflow (Daily)
1.  **00:00 - 04:00**: Fetch new imagery feeds for ROI (Region of Interest).
2.  **04:00 - 08:00**: Preprocessing (Cloud mask, co-registration).
3.  **08:00 - 12:00**: Batch Inference (1000 images).
4.  **12:00 - 14:00**: Polygonization & QA.
5.  **14:00**: Push updates to dashboard/API.

## 8. Output Format
Results will be delivered as standard GeoJSON FeatureCollections:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "change_type": "new_construction",
        "confidence": 0.98,
        "date_detected": "2023-10-27",
        "area_sqm": 4500
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```
