import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
from model_loader import vgg_model, resnet_model, shuffle_model, MODEL_ACCURACIES, device
from gradcam import generate_gradcam_overlay

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])


def predict_single(image_path, model):
    """Run a single model prediction on an image."""
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        output = model(tensor)

    prob = torch.sigmoid(output).item()

    # Binary classification: >0.5 → Normal, ≤0.5 → Monkeypox
    if prob > 0.5:
        label = "Normal"
        confidence = prob
    else:
        label = "Monkeypox"
        confidence = 1.0 - prob

    return label, round(confidence * 100, 2)


def run_all_predictions(image_path):
    """Run all three models and generate Grad-CAM."""
    vgg_label, vgg_conf = predict_single(image_path, vgg_model)
    resnet_label, resnet_conf = predict_single(image_path, resnet_model)
    shuffle_label, shuffle_conf = predict_single(image_path, shuffle_model)

    # Majority vote for final prediction
    labels = [vgg_label, resnet_label, shuffle_label]
    final = max(set(labels), key=labels.count)

    # Generate Grad-CAM using ShuffleNet (best model)
    gradcam_b64 = generate_gradcam_overlay(image_path, shuffle_model, "shuffle", transform)

    return {
        "vgg_prediction": vgg_label,
        "vgg_confidence": f"{vgg_conf}%",
        "vgg_accuracy": f"{MODEL_ACCURACIES['vgg']}%",

        "resnet_prediction": resnet_label,
        "resnet_confidence": f"{resnet_conf}%",
        "resnet_accuracy": f"{MODEL_ACCURACIES['resnet']}%",

        "shuffle_prediction": shuffle_label,
        "shuffle_confidence": f"{shuffle_conf}%",
        "shuffle_accuracy": f"{MODEL_ACCURACIES['shuffle']}%",

        "final_prediction": final,
        "gradcam_image": gradcam_b64,
    }
