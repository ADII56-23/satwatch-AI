# SatWatch AI: System Architecture & Feature Overview

SatWatch AI is a cutting-edge satellite intelligence platform designed to democratize geospatial monitoring using Artificial Intelligence, Real-time Orbital Tracking, and Multi-temporal analysis.

---

## 🚀 Core Features

### 1. AI Change Detection Dashboard
*   **Overview**: Allows users to upload "Before" and "After" satellite imagery to detect changes automatically.
*   **Technology**: Built with **PyTorch** on the backend using deep feature comparison (Cosine Similarity on ResNet50 features).
*   **Benefit**: Identifies discrepancies like new construction, deforestation, or disaster impact with high precision.
*   **Impact**: Reduces manual labor of comparing images from hours to seconds.

### 2. Live Intelligence Terminal
*   **Overview**: An interactive map interface that integrates global search and spatial data visualization.
*   **Technology**: **React-Leaflet** for mapping, **Nominatim (OSM)** for geocoding, and **ESRI/GEE** for satellite overlays.
*   **Benefit**: Users can explore any coordinate on Earth with real-time contextual data.
*   **Impact**: Centralizes global monitoring into a single, intuitive dashboard.

### 3. Historical Imagery Timeline
*   **Overview**: A "Time Machine" feature that retrieves satellite data for any location from 2000 to 2025.
*   **Technology**: Seamless integration with **Google Earth Engine (GEE)** API.
*   **Benefit**: Allows longitudinal studies of land development and environmental changes.
*   **Impact**: Enables historical accountability and environmental trend analysis.

### 4. Strategic Alert & Surveillance System
*   **Overview**: Users can "Arm" a satellite to monitor a specific region for a set duration (1-10 hours) or request a retrospective PDF report.
*   **Technology**: Custom surveillance logic in **FastAPI** coupled with **jsPDF** for dynamic report generation.
*   **Benefit**: Automated notifications and printable intelligence briefings delivered to email.
*   **Impact**: Provides proactive security and operational awareness without manual oversight.

### 5. Global Orbital Tracker
*   **Overview**: Real-time visualization of the satellite network (LEO, MEO, GEO) orbiting the planet.
*   **Technology**: Fetches live **TLE (Two-Line Element)** data from **CelesTrak** and calculates positions using orbital mechanics.
*   **Benefit**: Visualizes the density and health of the global satellite infrastructure.
*   **Impact**: Essential for space situational awareness and communication planning.

---

## 🛠 Technology Stack

### Frontend (User Interface)
| Technology | Usage | Benefit |
| :--- | :--- | :--- |
| **React (Vite)** | Core Framework | Ultra-fast development and optimized build performance. |
| **Leaflet** | Mapping Engine | Lightweight, mobile-friendly map rendering. |
| **Tailwind CSS** | Styling | Rapid UI building with a cohesive design system. |
| **Lucide React** | Iconography | High-quality, consistent tactical icons. |
| **jsPDF** | reporting | Client-side generation of Top Secret intelligence reports. |

### Backend (Intelligence Engine)
| Technology | Usage | Benefit |
| :--- | :--- | :--- |
| **FastAPI** | REST API | High-performance asynchronous requests and auto-documentation. |
| **PyTorch** | AI/ML | Industry-standard library for computer vision and feature extraction. |
| **Google Earth Engine** | Big Data Source | Petabyte-scale satellite database for historical analysis. |
| **HTTPX** | Networking | Modern, async HTTP client for syncing with external orbital servers. |
| **Uvicorn** | ASGI Server | Production-grade server for handling concurrent users. |

---

## 💡 Impact and Business Benefits

1.  **Cost Reduction**: Eliminates the need for expensive manual imagery analysis teams.
2.  **Strategic Advantage**: Provides "first-look" intelligence for logistics, urban planning, and environmental NGOs.
3.  **Scalability**: Optimized for global use, allowing thousands of regions to be monitored simultaneously.
4.  **User-Centric Design**: Minimalist and "Tactical" UI ensures that even non-expert users can extract high-value intelligence.

---

*© 2025 SatWatch AI - Advanced Orbital Intelligence Intelligence Unit.*
