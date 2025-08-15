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
  container.classList.add("grid-elements"); // ✅ Ajout de la classe grille
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
    const response = await fetch(`/composition/${nom}`);
    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      document.getElementById("resultatNom").innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    const comp = Object.entries(data.composition_moyenne)
      .sort((a, b) => b[1] - a[1]); // ✅ tri numérique décroissant

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

// Recherche par éléments
async function chercherParElements() {
  const form = document.getElementById("form-elements");
  const formData = new FormData(form);
  const payload = {};

  // Prend en compte seulement les valeurs renseignées
  elements.forEach(elem => {
    const value = formData.get(elem);
    if (value !== null && value.trim() !== "") {
      payload[elem] = parseFloat(value);
    }
  });

  try {
    const response = await fetch("/predict_elements", {
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

    if (!resultats || !resultats.roche) {
      div.innerHTML = `<p>Aucune roche correspondante trouvée.</p>`;
      return;
    }

    const comp = Object.entries(resultats.composition_moyenne)
      .sort((a, b) => b[1] - a[1]); // ✅ tri numérique décroissant

    div.innerHTML = `
      <h3>Roche la plus probable :</h3>
      <p><strong>${resultats.roche}</strong> : ${resultats.probabilite} %</p>
      <h4>Composition moyenne :</h4>
      <ul>
        ${comp.map(([elem, val]) => `<li>${elem} : ${val} %</li>`).join('')}
      </ul>
    `;
  } catch (err) {
    console.error("Erreur lors de la requête :", err);
    document.getElementById("resultatElements").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}
