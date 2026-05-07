from pymongo import MongoClient
from datetime import datetime
import os 
from dotenv import load_dotenv 

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "poxscan_ai")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
users_col = db["users"]
predictions_col = db["predictions"]
reviews_col = db["reviews"]
images_col = db["uploaded_images"]
disease_updates_col = db["disease_updates"]

# Indexes
users_col.create_index("email", unique=True)
users_col.create_index("username", unique=True)


def create_user(username, email, password_hash, role="user"):
    user = {
        "username": username,
        "email": email,
        "password": password_hash,
        "role": role,
        "avatar": "",
        "created_at": datetime.utcnow(),
        "predictions_count": 0,
    }
    result = users_col.insert_one(user)
    return str(result.inserted_id)


def get_user_by_email(email):
    return users_col.find_one({"email": email})


def get_user_by_id(user_id):
    from bson import ObjectId # type: ignore
    return users_col.find_one({"_id": ObjectId(user_id)})


def save_prediction(user_id, image_path, results):
    pred = {
        "user_id": user_id,
        "image_path": image_path,
        "vgg_prediction": results.get("vgg_prediction"),
        "vgg_confidence": results.get("vgg_confidence"),
        "vgg_accuracy": results.get("vgg_accuracy"),
        "resnet_prediction": results.get("resnet_prediction"),
        "resnet_confidence": results.get("resnet_confidence"),
        "resnet_accuracy": results.get("resnet_accuracy"),
        "shuffle_prediction": results.get("shuffle_prediction"),
        "shuffle_confidence": results.get("shuffle_confidence"),
        "shuffle_accuracy": results.get("shuffle_accuracy"),
        "gradcam_image": results.get("gradcam_image"),
        "final_prediction": results.get("final_prediction"),
        "created_at": datetime.utcnow(),
    }
    result = predictions_col.insert_one(pred)
    users_col.update_one({"_id": user_id}, {"$inc": {"predictions_count": 1}})
    return str(result.inserted_id)


def get_user_predictions(user_id):
    preds = list(predictions_col.find({"user_id": user_id}).sort("created_at", -1).limit(50))
    for p in preds:
        p["_id"] = str(p["_id"])
        p.pop("gradcam_image", None)
    return preds


def save_review(user_id, username, prediction_id, rating, comment, prediction_label):
    review = {
        "user_id": user_id,
        "username": username,
        "prediction_id": prediction_id,
        "rating": rating,
        "comment": comment,
        "prediction_label": prediction_label,
        "created_at": datetime.utcnow(),
    }
    result = reviews_col.insert_one(review)
    return str(result.inserted_id)


def get_all_reviews(limit=50):
    reviews = list(reviews_col.find().sort("created_at", -1).limit(limit))
    for r in reviews:
        r["_id"] = str(r["_id"])
        r["created_at"] = r["created_at"].isoformat()
    return reviews


def save_uploaded_image(user_id, filename, path, prediction_label):
    img = {
        "user_id": user_id,
        "filename": filename,
        "path": path,
        "prediction_label": prediction_label,
        "created_at": datetime.utcnow(),
    }
    images_col.insert_one(img)


def get_stats():
    total_users = users_col.count_documents({})
    total_predictions = predictions_col.count_documents({})
    total_monkeypox = predictions_col.count_documents({"final_prediction": "Monkeypox"})
    total_normal = predictions_col.count_documents({"final_prediction": "Normal"})
    total_reviews = reviews_col.count_documents({})
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "monkeypox_cases": total_monkeypox,
        "normal_cases": total_normal,
        "total_reviews": total_reviews,
    }


# Seed disease updates if empty
def seed_disease_updates():
    if disease_updates_col.count_documents({}) == 0:
        updates = [
            {
                "title": "WHO Issues Global Monkeypox Advisory",
                "category": "Monkeypox",
                "summary": "The World Health Organization has issued a fresh advisory regarding the spread of monkeypox in multiple countries. Officials urge caution and early testing.",
                "severity": "high",
                "date": datetime(2025, 3, 1),
                "source": "WHO",
                "icon": "🦠"
            },
            {
                "title": "Chickenpox Outbreak Reported in Southeast Asia",
                "category": "Chickenpox",
                "summary": "Health authorities in Southeast Asia have reported a spike in chickenpox cases particularly among children under 12. Vaccination drives have been initiated.",
                "severity": "medium",
                "date": datetime(2025, 2, 20),
                "source": "Asia Health Monitor",
                "icon": "⚠️"
            },
            {
                "title": "New Monkeypox Strain Detected – Research Update",
                "category": "Monkeypox",
                "summary": "Scientists have identified a new variant with slightly different dermatological presentation. AI-based early detection tools are being updated accordingly.",
                "severity": "high",
                "date": datetime(2025, 2, 14),
                "source": "CDC Research",
                "icon": "🔬"
            },
            {
                "title": "Smallpox Vaccination History and Monkeypox Protection",
                "category": "Smallpox",
                "summary": "Research confirms that historical smallpox vaccination provides approximately 85% cross-protection against monkeypox. Younger populations remain more vulnerable.",
                "severity": "low",
                "date": datetime(2025, 1, 30),
                "source": "NEJM",
                "icon": "💉"
            },
            {
                "title": "Mpox Cases Rise in Central Africa – Emergency Response",
                "category": "Monkeypox",
                "summary": "Emergency health response teams have been deployed to Central African nations reporting a significant increase in mpox cases. International aid requested.",
                "severity": "critical",
                "date": datetime(2025, 1, 15),
                "source": "MSF",
                "icon": "🚨"
            },
            {
                "title": "Antiviral Therapy Shows Promise Against Monkeypox",
                "category": "Treatment",
                "summary": "Clinical trials of tecovirimat antiviral therapy have shown promising outcomes in reducing symptom duration and severity in confirmed mpox patients.",
                "severity": "low",
                "date": datetime(2024, 12, 22),
                "source": "Lancet",
                "icon": "💊"
            },
        ]
        disease_updates_col.insert_many(updates)
        print("Disease updates seeded.")
