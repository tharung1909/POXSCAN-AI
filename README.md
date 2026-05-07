#POXSCAN-AI

<div align="center">

# 🧬 POXSCAN-AI
### AI-Powered Monkeypox Detection System

![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-EE4C2C?style=for-the-badge&logo=pytorch)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)


> A full-stack web application for early monkeypox detection using an ensemble of three deep learning models with GradCAM explainability and real-time webcam support.

[POXSCAN-AI Screenshot](Screenshot.png)

</div>

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Differs](#-how-it-differs-from-existing-systems)
- [Tech Stack](#-tech-stack)
- [Model Architecture](#-model-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Results](#-results)
- [Team](#-team)

---

## 🔍 Overview

**POXSCAN-AI** is an AI-powered web application designed for early-stage monkeypox detection from skin lesion images. The user uploads an image or uses their webcam, and the system runs it through **3 deep learning models simultaneously**, returning an ensemble prediction, individual confidence scores, and a **GradCAM heatmap** showing which skin regions influenced the decision.

> ⚠️ This tool is designed as a **screening assistance system** — not a replacement for clinical diagnosis.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **3-Model Ensemble** | VGG16, ResNet18, ShuffleNet V2+CBAM vote together for a reliable final prediction |
| 🧠 **CBAM Attention** | Channel + Spatial attention on ShuffleNet focuses the model on relevant skin regions |
| 🗺️ **GradCAM Heatmap** | Visual explanation overlay showing *why* the model made its decision |
| 📷 **Webcam Support** | Real-time capture and instant prediction without file upload |
| 👤 **User Auth** | Login / Signup with session management via React Context |
| 🌗 **Dark/Light Mode** | Theme switching across the entire application |
| 💬 **AI Chatbot** | Built-in chatbot widget for user assistance on any page |
| 📰 **Disease Updates** | Latest monkeypox news and awareness information |
| 👥 **Community Page** | Shared space for awareness and discussions |
| 🗄️ **MongoDB Database** | User data and scan history stored in MongoDB Atlas |

---

## 🆚 How It Differs From Existing Systems

| Aspect | Typical Research Tools | POXSCAN-AI |
|---|---|---|
| Models | Single model | 3-model ensemble with majority voting |
| Attention | None | CBAM (channel + spatial) on ShuffleNet |
| Explainability | None | GradCAM heatmap on every prediction |
| Interface | Jupyter notebook / script | Full React web application |
| Input | File upload only | Upload + live webcam capture |
| Output | Label only | Label + confidence per model + heatmap |
| Database | None | MongoDB for users and scan history |
| Deployment | Research prototype | Full-stack deployable application |

---

## 🛠 Tech Stack

**Frontend**
- React 18
- React Context API (Auth + Theme state)
- CSS Modules / globals.css

**Backend**
- Python 3.10
- Flask (REST API)
- PyTorch + Torchvision
- pytorch-grad-cam

**Database**
- MongoDB (via PyMongo)
- Stores user accounts, login sessions, scan history

**Models**
- VGG16 (fine-tuned, ImageNet pretrained)
- ResNet18 (fine-tuned, ImageNet pretrained)
- ShuffleNet V2 x1.0 + CBAM Attention (fine-tuned)

**Other**
- OpenCV (image processing)
- PIL / Pillow

---

## 🧠 Model Architecture

### Ensemble Flow
```
Input Image (224×224)
        │
   ┌────┴─────┬──────────────┐
   ▼          ▼              ▼
 VGG16    ResNet18    ShuffleNet V2
                         + CBAM
   │          │              │
 logit      logit          logit
   │          │              │
sigmoid    sigmoid        sigmoid
   │          │              │
 label      label          label
   └────┬─────┴──────────────┘
        ▼
  Majority Vote
        │
  Final Prediction
```

### CBAM Attention Module
```
Feature Map → Channel Attention (Avg+Max Pool → MLP) → Spatial Attention (Conv) → Output
```
- **Channel Attention** — learns *which feature channels* matter
- **Spatial Attention** — learns *where in the image* to focus

### Training Details
| Setting | Value |
|---|---|
| Input Size | 224 × 224 |
| Normalization | ImageNet mean/std |
| Loss Function | BCEWithLogitsLoss |
| Optimizer | AdamW (lr=1e-4, wd=1e-4) |
| Scheduler | Cosine Annealing |
| Epochs | Up to 20 (early stopping, patience=5) |
| Batch Size | 32 |
| Augmentation | Random flip, rotation, color jitter |
| Class Imbalance | WeightedRandomSampler |

---

## 📁 Project Structure

```
POXSCAN-AI/
├── backend/
│   ├── app.py                    # Flask entry point
│   ├── model_loader.py           # Loads all 3 models from .pth files
│   ├── predict.py                # Inference + ensemble logic
│   ├── gradcam.py                # GradCAM heatmap generation
│   ├── database.py               # MongoDB connection & queries
│   ├── .env                      # MongoDB URI + secret keys (not in repo)
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── ChatbotWidget.js  # AI chatbot (all pages)
│       │   └── Layout.js         # Shared navbar/layout
│       ├── context/
│       │   ├── AuthContext.js    # Global auth state
│       │   └── ThemeContext.js   # Dark/light mode state
│       ├── pages/
│       │   ├── PredictionPage.js      # Core detection UI
│       │   ├── DashboardPage.js       # User dashboard
│       │   ├── LoginPage.js           # Authentication
│       │   ├── SignupPage.js          # Registration
│       │   ├── CommunityPage.js       # Community awareness
│       │   ├── DiseaseUpdatesPage.js  # Latest updates
│       │   └── SettingsPage.js        # User settings
│       ├── services/
│       │   └── api.js            # Axios calls to Flask backend
│       └── styles/
│           └── globals.css
│
├── models/                       # Place trained .pth files here
│   ├── vgg_model.pth
│   ├── resnet_model.pth
│   └── shufflenet_cbam_model.pth
│
├── uploads/
├── .gitignore
├── HOW_TO_RUN.txt
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free) or local MongoDB
- Git

### 1. Clone the repository
```bash
git clone https://github.com/tharung1909/POXSCAN-AI.git
cd POXSCAN-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Set up Environment Variables
Create a `.env` file inside the `backend/` folder:
```
MONGO_URI=your_mongodb_connection_string_here
SECRET_KEY=your_secret_key_here
```
> Get your MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Connect → Drivers

### 4. Add Model Files
Place your trained `.pth` files in the `models/` folder:
```
models/
├── vgg_model.pth
├── resnet_model.pth
└── shufflenet_cbam_model.pth
```

> 📥 Download trained models from Google Drive: [Click Here](PASTE_YOUR_DRIVE_LINK_HERE)

### 5. Start Backend
```bash
cd backend
python app.py
# Runs on http://localhost:5000
```

### 6. Frontend Setup
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 💻 Usage

1. Open `http://localhost:3000` in your browser
2. Sign up or log in
3. Navigate to the **Prediction** page
4. Upload a skin lesion image **or** click **Use Webcam**
5. Click **Analyze**
6. View results:
   - Individual predictions from all 3 models
   - Confidence scores per model
   - Ensemble (final) prediction
   - GradCAM heatmap showing areas of focus

---

## 📊 Results

| Model | Validation Accuracy |
|---|---|
| VGG16 | 87.5% |
| ResNet18 | 85.2% |
| ShuffleNet V2 + CBAM | 91.3% |
| **Ensemble (Majority Vote)** | **~92%** |

> Models trained on Monkeypox skin lesion dataset with data augmentation and class balancing.

---

## 👥 Team

| Member | Contribution |
|---|---|
| Tharun | Frontend — React UI, all pages, Auth/Theme context, API integration |
| TEAMMATE 2 | Backend — Flask API, model inference, GradCAM |
| TEAMMATE 3 | ML — Model training, CBAM implementation, dataset preprocessing |
| TEAMMATE 4 | Database (MongoDB), deployment, documentation |

---



## ⚠️ Disclaimer

POXSCAN-AI is an academic project and is **not** intended for clinical or medical use. Always consult a qualified healthcare professional for medical diagnosis.

---
