import os, joblib, pandas as pd
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="static", static_url_path="")
bundle = joblib.load(os.path.join(os.path.dirname(__file__), "heart_model.pkl"))
model, FEATURES = bundle["model"], bundle["features"]

# DATA NOTE: is heart.csv mein target=1 un patients ke saath aata hai jinki exang/oldpeak/ca kam
# aur thalach zyada hai, yaani target=1 asal mein "disease NAHI" ke barabar behave karta hai
# (notebook ki description ke ulat). Isliye disease probability = 1 - P(target=1).
TARGET1_MEANS_DISEASE = False

NUMERIC_RANGES = {"age": (1, 120), "trestbps": (60, 250), "chol": (80, 700),
                  "thalach": (40, 230), "oldpeak": (0, 10)}

def parse(form):
    row = {}
    for f in FEATURES:
        v = form.get(f)
        if v is None or v == "":
            raise ValueError(f"'{f}' missing hai")
        row[f] = float(v)
        if f in NUMERIC_RANGES:
            lo, hi = NUMERIC_RANGES[f]
            if not lo <= row[f] <= hi:
                raise ValueError(f"'{f}' {lo} se {hi} ke darmiyan honi chahiye")
    return pd.DataFrame([row], columns=FEATURES)

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/info")
def info():
    return jsonify(model=bundle["name"])

@app.route("/predict", methods=["POST"])
def predict():
    try:
        X = parse(request.form)
    except ValueError as e:
        return jsonify(error=str(e)), 400
    p = float(model.predict_proba(X)[0][1])
    if not TARGET1_MEANS_DISEASE:
        p = 1 - p
    level = "High" if p >= 0.7 else "Moderate" if p >= 0.4 else "Low"
    return jsonify(disease=bool(p >= 0.5), probability=round(p * 100, 1), level=level)

@app.route("/health")
def health():
    return "ok"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)