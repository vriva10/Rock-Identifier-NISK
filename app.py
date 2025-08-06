from flask import Flask, request, jsonify, render_template, send_from_directory
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import os

app = Flask(__name__)

# Chargement des données
df = pd.read_excel("rock_database_test2_NISK24.xlsx")

# Normalisation du nom des roches
df['Roche'] = df['Roche'].str.strip().str.lower()

# Séparation des features et de la cible
features = ['Mg', 'Al', 'Si', 'P', 'S', 'K', 'Ca', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'As', 'Ag', 'Ba', 'Ce', 'Au']
X = df[features]
y = df['Roche']

# Standardisation
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Entraînement du modèle
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# Route statique pour l'interface
@app.route("/")
def index():
    return render_template("index.html")

# Pour que le HTML charge les fichiers CSS/JS correctement
@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory("static", path)

# API : prédiction à partir des éléments
@app.route("/predict_elements", methods=["POST"])
def predict_elements():
    data = request.json
    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    try:
        # Remplir les valeurs manquantes avec 0
        input_values = [float(data.get(elem, 0)) for elem in features]
        scaled_input = scaler.transform([input_values])
        prediction = model.predict(scaled_input)[0]
        proba = model.predict_proba(scaled_input).max()

        # Calcul des moyennes pour la roche prédite
        subset = df[df['Roche'] == prediction]
        mean_comp = subset[features].mean().to_dict()

        return jsonify({
            "roche": prediction,
            "probabilite": round(proba * 100, 2),
            "composition_moyenne": {k: round(v, 2) for k, v in mean_comp.items()}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API : moyenne des éléments pour une roche donnée
@app.route("/composition/<nom>")
def composition_par_nom(nom):
    nom = nom.strip().lower()
    subset = df[df['Roche'] == nom]

    if subset.empty:
        return jsonify({"error": f"Aucune donnée trouvée pour la roche : {nom}"}), 404

    mean_comp = subset[features].mean().to_dict()

    return jsonify({
        "roche": nom,
        "composition_moyenne": {k: round(v, 2) for k, v in mean_comp.items()}
    })

if __name__ == "__main__":
    app.run(debug=True)
