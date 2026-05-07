import os
import uuid
import shutil
from datetime import datetime, timedelta, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import bcrypt # type: ignore
from dotenv import load_dotenv # type: ignore
import bson # type: ignore
from bson import ObjectId # type: ignore

load_dotenv()

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "poxscan-secret-key-2025")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
DATASET_MONKEYPOX = os.path.join(os.path.dirname(__file__), "..", "dataset", "train", "Monkeypox")
DATASET_NORMAL = os.path.join(os.path.dirname(__file__), "..", "dataset", "train", "Normal")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATASET_MONKEYPOX, exist_ok=True)
os.makedirs(DATASET_NORMAL, exist_ok=True)

# ─── Load models at startup ───────────────────────────────────────────────────
from model_loader import load_all_models
load_all_models()

from database import (
    create_user, get_user_by_email, get_user_by_id,
    save_prediction, get_user_predictions,
    save_review, get_all_reviews,
    save_uploaded_image, get_stats,
    disease_updates_col, seed_disease_updates,
    users_col, predictions_col
)
from predict import run_all_predictions

seed_disease_updates()


# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = create_user(username, email, hashed)
    token = create_access_token(identity=str(user_id))
    return jsonify({"token": token, "user": {"id": user_id, "username": username, "email": email}}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = get_user_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "predictions_count": user.get("predictions_count", 0),
        }
    }), 200


@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "predictions_count": user.get("predictions_count", 0),
        "created_at": user["created_at"].isoformat(),
    })


# ─── PREDICTION ROUTE ─────────────────────────────────────────────────────────

@app.route("/api/predict", methods=["POST"])
@jwt_required()
def predict():
    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]:
        return jsonify({"error": "Unsupported file type"}), 400

    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        results = run_all_predictions(filepath)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

    # Save to dataset folder for future retraining
    label = results["final_prediction"]
    dataset_dest = DATASET_MONKEYPOX if label == "Monkeypox" else DATASET_NORMAL
    shutil.copy(filepath, os.path.join(dataset_dest, filename))

    # Save to database
    pred_id = save_prediction(user_id, filepath, results)
    save_uploaded_image(user_id, filename, filepath, label)

    results["prediction_id"] = pred_id
    return jsonify(results), 200


# ─── REVIEWS ROUTES ───────────────────────────────────────────────────────────

@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    reviews = get_all_reviews(50)
    return jsonify(reviews)


@app.route("/api/reviews", methods=["POST"])
@jwt_required()
def post_review():
    user_id = get_jwt_identity()
    data = request.json
    rating = data.get("rating", 5)
    comment = data.get("comment", "")
    prediction_id = data.get("prediction_id", "")
    prediction_label = data.get("prediction_label", "")

    user = users_col.find_one({"_id": ObjectId(user_id)})
    username = user["username"] if user else "Anonymous"

    rev_id = save_review(user_id, username, prediction_id, rating, comment, prediction_label)
    return jsonify({"id": rev_id, "message": "Review saved"}), 201


# ─── DISEASE UPDATES ROUTE ────────────────────────────────────────────────────

@app.route("/api/disease-updates", methods=["GET"])
def disease_updates():
    updates = list(disease_updates_col.find().sort("date", -1))
    for u in updates:
        u["_id"] = str(u["_id"])
        u["date"] = u["date"].isoformat()
    return jsonify(updates)


# ─── USER PREDICTIONS ─────────────────────────────────────────────────────────

@app.route("/api/user/predictions", methods=["GET"])
@jwt_required()
def user_predictions():
    user_id = get_jwt_identity()
    preds = get_user_predictions(user_id)
    for p in preds:
        p["created_at"] = p["created_at"].isoformat() if isinstance(p.get("created_at"), datetime) else p.get("created_at", "")
    return jsonify(preds)


# ─── STATS ROUTE ──────────────────────────────────────────────────────────────

@app.route("/api/stats", methods=["GET"])
def stats():
    return jsonify(get_stats())


# ─── SETTINGS / PROFILE ───────────────────────────────────────────────────────

@app.route("/api/user/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.json
    update = {}
    if "username" in data:
        update["username"] = data["username"]
    if update:
        users_col.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    return jsonify({"message": "Profile updated"})


# ─── CHATBOT ROUTE ────────────────────────────────────────────────────────────

@app.route("/api/chat", methods=["POST"])
def chatbot():
    msg = request.json.get("message", "").lower().strip()

    responses = {
        "symptom": "Monkeypox symptoms include fever, rash, swollen lymph nodes, and lesions. The rash often starts on the face and spreads. If you notice skin lesions, please use the Prediction page to upload an image for analysis.",
        "predict": "Go to the **Prediction** page to upload or capture a skin image. Our AI models (VGG16, ResNet18, ShuffleNet+CBAM) will analyze it instantly.",
        "prevention": "Prevent monkeypox by: avoiding contact with infected persons, practicing good hand hygiene, using PPE when caring for patients, and getting vaccinated if eligible.",
        "what is": "Monkeypox is a viral zoonotic disease caused by the Monkeypox virus. It causes fever, rash, and skin lesions. It is related to smallpox but generally less severe.",
        "treatment": "There's no specific FDA-approved treatment for monkeypox, but antivirals like Tecovirimat (TPOXX) can help. Consult a healthcare provider immediately.",
        "hello": "Hello! I'm PoxBot 🤖, your AI health assistant. I can help you with monkeypox info, symptoms, prevention, or guide you to the prediction tool.",
        "hi": "Hi there! 👋 I'm PoxBot. Ask me about monkeypox symptoms, prevention, or how to use PoxScan AI.",
        "help": "I can help you with: symptoms, prevention tips, treatment info, navigation, and using the prediction tool. What would you like to know?",
        "dashboard": "The Dashboard shows health awareness content, global disease updates, and system statistics. Navigate there from the sidebar.",
        "review": "After getting a prediction, you can leave a review on the Community page — rate accuracy and share your experience!",
    }

    reply = "I'm not sure about that. Try asking about monkeypox symptoms, prevention, treatment, or how to use the prediction tool. 🤖"
    for key, resp in responses.items():
        if key in msg:
            reply = resp
            break

    return jsonify({"reply": reply})


# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

@app.route("/api/admin/stats", methods=["GET"])
@jwt_required()
def admin_stats():
    user_id = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    recent_preds = list(predictions_col.find().sort("created_at", -1).limit(10))
    for p in recent_preds:
        p["_id"] = str(p["_id"])
        p["created_at"] = p["created_at"].isoformat()
        p.pop("gradcam_image", None)

    return jsonify({**get_stats(), "recent_predictions": recent_preds})


if __name__ == "__main__":
    app.run(debug=True, port=5000)