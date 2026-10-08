# Heart Disease Predictor

## Local run
    pip install -r requirements.txt
    python app.py          # http://localhost:5000

## Retrain
Run all cells in `Heart_Disease_Classification_Project.ipynb` (creates `heart_model.pkl`).

## Deploy (Render.com)
1. Push this folder to a GitHub repo.
2. Render -> New -> Web Service -> select repo.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
