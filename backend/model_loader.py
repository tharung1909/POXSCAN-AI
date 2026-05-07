import torch
import torch.nn as nn
import torchvision.models as models
import os

print("CUDA Available:", torch.cuda.is_available())
print("GPU Count:", torch.cuda.device_count())
if torch.cuda.is_available():
    print("GPU Name:", torch.cuda.get_device_name(0))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[ModelLoader] Using device: {device}")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

# ─── CBAM Attention Modules ───────────────────────────────────────────────────

class ChannelAttention(nn.Module):
    def __init__(self, in_channels, ratio=16):
        super().__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)
        self.fc = nn.Sequential(
            nn.Conv2d(in_channels, max(in_channels // ratio, 1), 1, bias=False),
            nn.ReLU(),
            nn.Conv2d(max(in_channels // ratio, 1), in_channels, 1, bias=False),
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        return self.sigmoid(self.fc(self.avg_pool(x)) + self.fc(self.max_pool(x)))


class SpatialAttention(nn.Module):
    def __init__(self, kernel_size=7):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size, padding=kernel_size // 2, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg = torch.mean(x, dim=1, keepdim=True)
        mx, _ = torch.max(x, dim=1, keepdim=True)
        return self.sigmoid(self.conv(torch.cat([avg, mx], dim=1)))


class CBAM(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.ca = ChannelAttention(channels)  # must match notebook: self.ca
        self.sa = SpatialAttention()           # must match notebook: self.sa

    def forward(self, x):
        x = x * self.ca(x)
        x = x * self.sa(x)
        return x


# ─── Model Factories ──────────────────────────────────────────────────────────
# NOTE: These must exactly match the architecture used in the Colab notebook.
# Hidden size = 256, NO Sigmoid at end (model outputs raw logit).
# Sigmoid is applied during inference in predict.py using torch.sigmoid().

def build_vgg():
    model = models.vgg16(weights=None)
    model.classifier[6] = nn.Sequential(
        nn.Linear(4096, 256), nn.ReLU(), nn.Dropout(0.5),
        nn.Linear(256, 1)   # raw logit — no Sigmoid here
    )
    return model.to(device)


def build_resnet():
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 256), nn.ReLU(), nn.Dropout(0.5),
        nn.Linear(256, 1)   # raw logit — no Sigmoid here
    )
    return model.to(device)


def build_shufflenet_cbam():
    model = models.shufflenet_v2_x1_0(weights=None)
    model.conv5 = nn.Sequential(model.conv5, CBAM(1024))
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 256), nn.ReLU(), nn.Dropout(0.4),
        nn.Linear(256, 1)   # raw logit — no Sigmoid here
    )
    return model.to(device)


# ─── Helper: load checkpoint (handles both plain state_dict and checkpoint dict)

def _load_weights(model, path, name):
    """
    Safely loads weights from a .pth file.
    Handles two formats:
      - New format (from enhanced notebook): dict with 'state_dict' key
      - Old format (plain state_dict): loaded directly
    """
    raw = torch.load(path, map_location=device)

    if isinstance(raw, dict) and "state_dict" in raw:
        # New checkpoint format saved by enhanced notebook
        state_dict   = raw["state_dict"]
        class_names  = raw.get("class_names", ["Monkeypox", "Normal"])
        accuracy     = raw.get("accuracy", "N/A")
        print(f"[ModelLoader] {name} — checkpoint format detected")
        print(f"[ModelLoader] {name} — classes: {class_names}, accuracy: {accuracy:.2f}%")
    else:
        # Old plain state_dict format
        state_dict  = raw
        class_names = ["Monkeypox", "Normal"]
        print(f"[ModelLoader] {name} — plain state_dict format detected")

    model.load_state_dict(state_dict)
    return model, class_names


# ─── Global models & class names ─────────────────────────────────────────────

vgg_model     = None
resnet_model  = None
shuffle_model = None

# Class names will be set from checkpoint (consistent across all models)
CLASS_NAMES = ["Monkeypox", "Normal"]

# Stored accuracies — updated from checkpoint if available
MODEL_ACCURACIES = {
    "vgg":     0.0,
    "resnet":  0.0,
    "shuffle": 0.0,
}


def load_all_models():
    global vgg_model, resnet_model, shuffle_model, CLASS_NAMES

    vgg_path     = os.path.join(MODEL_DIR, "vgg_model.pth")
    resnet_path  = os.path.join(MODEL_DIR, "resnet_model.pth")
    shuffle_path = os.path.join(MODEL_DIR, "shufflenet_cbam_model.pth")

    # ── VGG16 ────────────────────────────────────────────────────────
    vgg_model = build_vgg()
    if os.path.exists(vgg_path):
        vgg_model, CLASS_NAMES = _load_weights(vgg_model, vgg_path, "VGG16")
        raw = torch.load(vgg_path, map_location=device)
        if isinstance(raw, dict):
            MODEL_ACCURACIES["vgg"] = raw.get("accuracy", 0.0)
        print("[ModelLoader] VGG16 loaded ✅")
    else:
        print("[ModelLoader] VGG16 .pth not found – using untrained weights (demo mode).")
    vgg_model.eval()

    # ── ResNet18 ─────────────────────────────────────────────────────
    resnet_model = build_resnet()
    if os.path.exists(resnet_path):
        resnet_model, _ = _load_weights(resnet_model, resnet_path, "ResNet18")
        raw = torch.load(resnet_path, map_location=device)
        if isinstance(raw, dict):
            MODEL_ACCURACIES["resnet"] = raw.get("accuracy", 0.0)
        print("[ModelLoader] ResNet18 loaded ✅")
    else:
        print("[ModelLoader] ResNet18 .pth not found – using untrained weights (demo mode).")
    resnet_model.eval()

    # ── ShuffleNet + CBAM ────────────────────────────────────────────
    shuffle_model = build_shufflenet_cbam()
    if os.path.exists(shuffle_path):
        shuffle_model, _ = _load_weights(shuffle_model, shuffle_path, "ShuffleNet+CBAM")
        raw = torch.load(shuffle_path, map_location=device)
        if isinstance(raw, dict):
            MODEL_ACCURACIES["shuffle"] = raw.get("accuracy", 0.0)
        print("[ModelLoader] ShuffleNet+CBAM loaded ✅")
    else:
        print("[ModelLoader] ShuffleNet+CBAM .pth not found – using untrained weights (demo mode).")
    shuffle_model.eval()

    print(f"[ModelLoader] All models ready | Classes: {CLASS_NAMES}")