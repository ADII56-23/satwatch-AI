# Satellite Imagery Change Detection System

## Overview
This project implements an AI/ML pipeline for detecting man-made changes in satellite imagery, fused with a modern full-stack web application.

## Key Features
- **Multi-Source Ingestion**: Handles 3m Planet Labs and 10m Sentinel-2 data.
- **Deep Learning Model**: Siamese Encoder-Decoder network for change detection.
- **Interactive Web App**: React-based dashboard to upload images and visualize changes on a map.
- **Vector Output**: Generates GeoJSON polygons of detected changes.

## Architecture
- **Frontend**: React, Vite, TailwindCSS, Leaflet.
- **Backend**: Python FastAPI, PyTorch.
- **Pipeline**: Automated co-registration, cloud masking, and inference.

## Prerequisites
- Python 3.10+ (Recommended)
- Node.js & npm

## Installation

1.  **Backend Setup**:
    ```bash
    pip install -r requirements.txt
    pip install fastapi uvicorn python-multipart
    ```

2.  **Frontend Setup**:
    ```bash
    cd web-app
    npm install
    cd ..
    ```

## Usage

### Running the Full Stack App
We have provided a helper script to start both the backend API and the frontend dev server.

**Windows (PowerShell):**
```powershell
./start_app.ps1
```

Or manually:
1.  **Start Backend**: `python src/api.py` (Runs on http://localhost:8000)
2.  **Start Frontend**: `cd web-app && npm run dev` (Runs on http://localhost:5173)

### Running Inference CLI
To run the inference pipeline on a directory of image pairs without the UI:
```bash
python src/inference.py --before_dir inputs/t1 --after_dir inputs/t2 --output_dir results
```
