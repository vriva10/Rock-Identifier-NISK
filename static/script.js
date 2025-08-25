// Liste des éléments à afficher dans le formulaire
const elements = ['Mg', 'Al', 'Si', 'P', 'S', 'K', 'Ca', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'As', 'Ag', 'Ba', 'Ce', 'Au'];

// Afficher recherche par nom
function afficherRechercheParNom() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-nom").classList.remove("hidden");
}

// Afficher recherche par éléments avec grille
function afficherRechercheParElements() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-elements").classList.remove("hidden");

  const container = document.getElementById("elements-inputs");
  container.classList.add("grid-elements"); // classe grille si tu l'as en CSS
  container.innerHTML = '';

  elements.forEach(elem => {
    const div = document.createElement('div');
    div.classList.add('form-group');
    div.innerHTML = `<label>${elem}</label><input type="number" step="any" name="${elem}" placeholder="% de ${elem}">`;
    container.appendChild(div);
  });
}

// Retour au menu principal
function retourAccueil() {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById("accueil").classList.remove("hidden");
}

// Recherche par nom
async function chercherParNom() {
  const nom = document.getElementById("nomRoche").value.trim().toLowerCase();
  if (!nom) {
    alert("Veuillez entrer un nom de roche.");
    return;
  }

  try {
    const response = await fetch(`/composition/${encodeURIComponent(nom)}`);
    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      document.getElementById("resultatNom").innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    const comp = Object.entries(data.composition_moyenne)
      .sort((a, b) => b[1] - a[1]); // tri décroissant

    let html = `<h3>Composition moyenne pour ${data.roche} :</h3><ul>`;
    for (const [elem, val] of comp) {
      html += `<li>${elem} : ${val} %</li>`;
    }
    html += `</ul>`;

    document.getElementById("resultatNom").innerHTML = html;
  } catch (err) {
    document.getElementById("resultatNom").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}

// Recherche par éléments (Top 5)
async function chercherParElements() {
  const form = document.getElementById("form-elements");
  const formData = new FormData(form);
  const payload = {};

  // Prend en compte seulement les valeurs renseignées
  elements.forEach(elem => {
    const value = formData.get(elem);
    if (value !== null && String(value).trim() !== "") {
      payload[elem] = parseFloat(value);
    }
  });

  if (Object.keys(payload).length === 0) {
    document.getElementById("resultatElements").innerHTML = `<p style="color:red;">Veuillez saisir au moins un élément.</p>`;
    return;
  }

  try {
    const response = await fetch("/predict_elements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const resultats = await response.json();
    const div = document.getElementById("resultatElements");

    // On attend un objet { predictions: [ { roche, probabilite, composition_moyenne }, ... ] }
    if (!resultats || !Array.isArray(resultats.predictions) || resultats.predictions.length === 0) {
      div.innerHTML = `<p>Aucune roche correspondante trouvée.</p>`;
      return;
    }

    let html = `<h3>Top 5 des roches les plus probables :</h3><ol>`;
    resultats.predictions.forEach((pred) => {
      const comp = Object.entries(pred.composition_moyenne)
        .sort((a, b) => b[1] - a[1]);

      html += `
        <li>
          <p><strong>${pred.roche}</strong> : ${pred.probabilite} %</p>
          <details>
            <summary>Voir la composition moyenne</summary>
            <ul>
              ${comp.map(([elem, val]) => `<li>${elem} : ${val} %</li>`).join('')}
            </ul>
          </details>
        </li>
      `;
    });
    html += `</ol>`;

    div.innerHTML = html;

  } catch (err) {
    console.error("Erreur lors de la requête :", err);
    document.getElementById("resultatElements").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}
