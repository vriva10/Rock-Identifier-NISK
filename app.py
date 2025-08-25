from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import os

app = Flask(__name__)
CORS(app)

# Chargement des données
df = pd.read_excel("rock_database_test2_NISK24.xlsx")

# Normalisation du nom des roches
df['Roche'] = df['Roche'].str.strip().str.lower()

# Nettoyage : supprime les lignes contenant des valeurs manquantes
df.dropna(inplace=True)

# Séparation des features et de la cible
features = ['Mg', 'Al', 'Si', 'P', 'S', 'K', 'Ca', 'Ti', 'V', 'Cr', 
            'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'As', 'Ag', 'Ba', 'Ce', 'Au']
X = df[features]
y = df['Roche']

# Standardisation
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Entraînement du modèle global
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
        return jsonify({"error": "Missing datas"}), 400

    try:
        # Garder uniquement les éléments renseignés par l'utilisateur
        valid_elements = [elem for elem in features if elem in data]

        if not valid_elements:
            return jsonify({"error": "No element entered for prediction."}), 400

        input_values = [data[elem] for elem in valid_elements]

        # Sélectionner uniquement les colonnes correspondantes dans le dataset
        X_partial = df[valid_elements]
        scaler_partial = StandardScaler().fit(X_partial)
        scaled_input = scaler_partial.transform([input_values])

        # Réentraîner un modèle sur ces colonnes uniquement
        model_partial = RandomForestClassifier(n_estimators=100, random_state=42)
        model_partial.fit(scaler_partial.transform(X_partial), df["Roche"])

        # Obtenir toutes les probabilités
        probabilities = model_partial.predict_proba(scaled_input)[0]

        # Associer classes ↔ probas
        class_probs = list(zip(model_partial.classes_, probabilities))

        # Trier par proba décroissante
        class_probs = sorted(class_probs, key=lambda x: x[1], reverse=True)

        # Prendre le top 5
        top5 = [(rock, round(prob * 100, 2)) for rock, prob in class_probs[:5]]

        # Ajouter les compositions moyennes pour ces 5 roches
        results = []
        for rock, prob in top5:
            subset = df[df['Roche'] == rock]
            mean_comp = subset[features].mean().to_dict()
            results.append({
                "roche": rock,
                "probabilite": prob,
                "composition_moyenne": {k: round(v, 2) for k, v in mean_comp.items()}
            })

        return jsonify({"predictions": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API : moyenne des éléments pour une roche donnée
@app.route("/composition/<nom>")
def composition_par_nom(nom):
    nom = nom.strip().lower()
    subset = df[df['Roche'] == nom]

    if subset.empty:
        return jsonify({"error": f"No data found for this rock : {nom}"}), 404

    mean_comp = subset[features].mean().to_dict()

    return jsonify({
        "roche": nom,
        "composition_moyenne": {k: round(v, 2) for k, v in mean_comp.items()}
    })

if __name__ == "__main__":
    app.run(debug=True)
