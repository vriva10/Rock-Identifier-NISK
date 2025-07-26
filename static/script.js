// Liste des éléments à afficher dans le formulaire
const elements = ['Si', 'Ca', 'K', 'Al', 'Mg', 'Fe', 'P', 'Cr', 'Ti', 'S', 'Cu', 'Ni', 'Mn', 'Br', 'V', 'Ba', 'Au', 'Ce'];

function afficherRechercheParNom() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-nom").classList.remove("hidden");
}

function afficherRechercheParElements() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-elements").classList.remove("hidden");

  // Créer les champs pour chaque élément
  const container = document.getElementById("elements-inputs");
  container.innerHTML = '';
  elements.forEach(elem => {
    const div = document.createElement('div');
    div.classList.add('form-group');
    div.innerHTML = `<label>${elem}</label><input type="number" step="any" name="${elem}" placeholder="% de ${elem}">`;
    container.appendChild(div);
  });
}

async function chercherParElements() {
  const form = document.getElementById("form-elements");
  const formData = new FormData(form);
  const payload = {};

  // Construire le dictionnaire des valeurs entrées (mettre 0 si vide)
  elements.forEach(elem => {
    const value = formData.get(elem);
    payload[elem] = value ? parseFloat(value) : 0;
  });

  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const resultats = await response.json();

    const div = document.getElementById("resultatElements");
    if (resultats.length === 0) {
      div.innerHTML = `<p>Aucune roche correspondante trouvée.</p>`;
      return;
    }

    div.innerHTML = `<h3>Roches les plus probables :</h3><ul>` +
      resultats.map(r => `<li><strong>${r.roche}</strong> : ${r.probabilite}%</li>`).join('') +
      `</ul>`;

  } catch (err) {
    console.error("Erreur lors de la requête :", err);
    document.getElementById("resultatElements").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}
