# 🧪 ChemViz Pro

**Hybrid Web + Desktop Analytics Platform**

**ChemViz Pro** is a full-stack analytics application designed to visualize and analyze operational parameters of chemical equipment. It demonstrates a unified architecture where a single **Django REST Framework** backend serves both a modern **React Web Dashboard** and a native **PyQt6 Desktop Application**.

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [0. Clone Repository](#0-clone-repository)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend (Web) Setup](#2-frontend-web-setup)
  - [3. Desktop App Setup](#3-desktop-app-setup)
- [Usage & Workflow](#-usage--workflow)
- [Input Data Format](#-input-dataset-format)
- [Shutdown](#-shutdown)

## 🧠 Project Overview

In chemical and industrial environments, equipment data (Flow, Pressure, Temperature) is often stored as raw CSV logs. Manually analyzing these datasets is time-consuming, error-prone, and lacks visual insight.

**ChemViz Pro** automates this entire workflow into a **single unified system**, allowing users to:

- **Upload** CSV datasets via Web or Desktop interfaces.
- **Analyze** automatically computed statistical summaries.
- **Visualize** data through interactive Pie and Bar charts.
- **Report** via professional, auto-generated PDF downloads.
- **Secure** access using centralized JWT authentication.

## 🏗 System Architecture

The system uses a centralized backend to ensure data consistency across both client platforms.
```text
┌──────────────────────┐  
│ React Web Client     │  
│ (Charts + Reports)   │  
└──────────┬───────────┘  
           │ REST API (JWT)  
           ▼  
┌──────────────────────┐  
│ Django Backend       |  
│ (DRF + Pandas + PDF) │  
└──────────────────────┘  
           ▲  
           │ REST API (JWT)  
┌──────────┴───────────┐  
│ PyQt6 Desktop App    │  
│ (Native Python UI)   │  
└──────────────────────┘  
```
## 🧩 Tech Stack

### 🔹 Backend

- **Framework:** Django, Django REST Framework (DRF)
- **Authentication:** JWT (JSON Web Tokens)
- **Data Analysis:** Pandas, NumPy
- **Reporting:** ReportLab (PDF Generation)
- **Database:** SQLite (Default) / PostgreSQL (Supported)

### 🔹 Web Frontend

- **Framework:** React.js
- **UI Component Library:** Material UI (MUI)
- **Visualization:** Chart.js, React-Chartjs-2
- **Networking:** Axios

### 🔹 Desktop Application

- **Language:** Python
- **GUI Framework:** PyQt6
- **Visualization:** Matplotlib (Embedded in Qt)
- **Networking:** Requests

## 🛠 Prerequisites

Ensure your system meets the following requirements:

- **Python:** Version 3.9 or higher
- **Node.js:** Version 18 or higher (includes npm)
- **Git**
- **Virtualenv** (Optional but recommended)

## 🚀 Installation & Setup

Follow these steps in order to get the full system running.

### 0\. Clone Repository

Start by cloning the repository to your local machine and navigating into the project folder.

git clone \[<https://github.com/OmDhavale/Chemical_Equipment_Parameter_Visualizer.git>](<https://github.com/OmDhavale/Chemical_Equipment_Parameter_Visualizer.git>)  
cd chemviz-pro  

### 1\. Backend Setup

_Location: Chemical_Equipment_Parameter_Visualizer/backend_

- **Create a virtual environment:**
    ```bash  
    python -m venv venv  

- **Activate the virtual environment (Windows):**
    ```bash
    venv\Scripts\activate  

- **Install backend dependencies:**
    ```bash  
    pip install -r requirements.txt  

- **Apply database migrations:**
    ```bash
    python manage.py migrate  

- **Create an Admin User (Required for login):**
    ```bash 
    python manage.py createsuperuser
    (Follow the prompts to set a username and password. You will use this to log in)._
- **Start the Django Development Server:**
    ```bash  
    python manage.py runserver  
    **Note:** The backend runs at <http://127.0.0.1:8000>. Keep this terminal open.

### 2\. Frontend (Web) Setup

_Location: Chemical_Equipment_Parameter_Visualizer/frontend_

- **Open a new terminal** and navigate to the frontend directory.
- **Install dependencies:**
    ```bash  
    npm install  

- **Start the React Development Server:**
    ```bash  
    npm start  
    **Note:** The web app launches at <http://localhost:3000>.

### 3\. Desktop App Setup

_Location: Chemical_Equipment_Parameter_Visualizer/desktop-app_

- **Open a new terminal** and navigate to the desktop app directory.
- **Activate the shared Python virtual environment:**
  ```bash
    ..\\backend\\venv\\Scripts\\activate  
    (Note: The desktop app uses the same environment/dependencies as the backend)._
- **Install desktop-specific dependencies:**
  ```bash 
    pip install -r requirements.txt  

- **Launch the application:**
  ```bash 
    python main.py  

## 🔄 Usage & Workflow

### 1️⃣ Authentication

- Log in using the **superuser credentials** created during backend setup.
- The backend issues a **JWT Access Token**.
- This token is automatically attached to all subsequent API requests (Upload, History, Reports).

### 2️⃣ Dataset Upload

- Navigate to **Data Intake**.
- Select a .csv file.
- The backend validates the file, calculates statistics using **Pandas**, and stores the results.

### 3️⃣ Visualization & Analysis

Once a file is uploaded (or a history item selected), the app displays:

- **Performance Metrics:** Average Flow, Pressure, and Temperature.
- **Pie Chart:** Distribution of equipment types.
- **Bar Chart:** Performance averages.

### 4️⃣ Reporting

- Click **Download Report** to receive a server-generated PDF.
- The PDF includes a summary table and snapshot charts generated via **ReportLab**.

## 📁 Input Dataset Format

Your CSV files must contain the following specific columns for the analyzer to work correctly:

| **Column Name** | **Description** | **Example** |
| --- | --- | --- |
| Equipment Name | ID or Name of the unit | Pump-A01 |
| --- | --- | --- |
| Type | Category of equipment | Rotary |
| --- | --- | --- |
| Flowrate | Numeric value | 45.2 |
| --- | --- | --- |
| Pressure | Numeric value | 1200 |
| --- | --- | --- |
| Temperature | Numeric value | 85.5 |
| --- | --- | --- |

## 🌟 Features

### 🌐 Web App Features

- Modern **Material UI** dashboard
- Responsive layout
- Animated Chart.js visualizations
- History cards with staggered animation
- Instant PDF download

### 🖥️ Desktop App Features

- Native **PyQt6** UI
- File picker for system-level integration
- Embedded **Matplotlib** interactive charts
- Offline-like user experience
- Loading states for login & upload

## 🔐 Security & Authentication

For security reasons, user credentials are not hard-coded in the source code.

**To access the application:**

- Ensure you have run python manage.py createsuperuser in the backend setup.
- Use those specific credentials (username/password) to log in to both the Web and Desktop clients.
- The system uses **JWT (JSON Web Tokens)** to secure the session.

## 🛑 Shutdown

To stop the application safely:

- **Web Client:** Click inside the React terminal and press Ctrl + C.
- **Backend:** Click inside the Django terminal and press Ctrl + C.
- **Desktop Client:** Simply close the application window.





