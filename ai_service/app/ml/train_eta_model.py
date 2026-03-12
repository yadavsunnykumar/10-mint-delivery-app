import pandas as pd
import joblib
import os
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

def train_eta_model():
    # Use absolute path for CSV file
    csv_path = os.path.join(os.path.dirname(__file__), '../../eta_training_data.csv')
    df = pd.read_csv(csv_path)

    X = df[["warehouse_load", "order_size", "distance_km"]]
    y = df["delivery_time_minutes"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = XGBRegressor(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)

    print(f"MAE: {mae:.2f} minutes")
    
    if 1.5 <= mae <= 3.0:
        print("✓ Great for quick commerce!")
    elif mae < 1.5:
        print("✓ Excellent performance!")
    else:
        print("⚠ Model accuracy could be improved")

    model_path = os.path.join(os.path.dirname(__file__), 'eta_model.pkl')
    joblib.dump(model, model_path)
    print("Model saved!")

if __name__ == "__main__":
    train_eta_model()
