import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def train_from_csv():
    # 1. Load Data
    if not os.path.exists('sample_activity_data.csv'):
        print("CSV not found. Run generate_sample_csv.py first.")
        return

    df = pd.read_csv('sample_activity_data.csv')
    print("📋 Loaded 50 sample records from CSV.")
    print(df.head())

    # 2. Preprocessing
    age_map = {'teen': 0, 'adult': 1, 'midlife': 2, 'senior': 3, 'elderly': 4}
    df['age_group_enc'] = df['user_age_group'].map(age_map)
    df['activity_type_enc'] = df['activity_type'].apply(lambda x: hash(x) % 100)

    X = df[['age_group_enc', 'goals_count', 'activity_type_enc']]
    y = df['improvement']

    # 3. Split data for validation
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Train Random Forest
    print("\n🌲 Training Random Forest Regressor...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    rf.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = rf.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"✅ Training Complete!")
    print(f"📊 Mean Squared Error: {mse:.4f}")
    print(f"📈 R2 Score: {r2:.4f}")

    # 6. Save Model for use in app
    model_dir = os.path.join('ai_engine', 'bin')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'activity_rf.joblib')
    joblib.dump(rf, model_path)
    print(f"\n💾 Model exported to: {model_path}")

if __name__ == "__main__":
    train_from_csv()
