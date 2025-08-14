// Liste des éléments à afficher dans le formulaire
const elements = ['Mg', 'Al', 'Si', 'P', 'S', 'K', 'Ca', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'As', 'Ag', 'Ba', 'Ce', 'Au'];

function afficherAccueil() {
  document.getElementById("accueil").classList.remove("hidden");
  document.getElementById("recherche-nom").classList.add("hidden");
  document.getElementById("recherche-elements").classList.add("hidden");
}

function afficherRechercheParNom() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-nom").classList.remove("hidden");

  // Ajouter bouton retour si pas déjà présent
  if (!document.getElementById("btnRetourNom")) {
    const btnRetour = document.createElement("button");
    btnRetour.id = "btnRetourNom";
    btnRetour.textContent = "⬅ Retour";
    btnRetour.onclick = afficherAccueil;
    document.getElementById("recherche-nom").prepend(btnRetour);
  }
}

function afficherRechercheParElements() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-elements").classList.remove("hidden");

  // Ajouter bouton retour si pas déjà présent
  if (!document.getElementById("btnRetourElements")) {
    const btnRetour = document.createElement("button");
    btnRetour.id = "btnRetourElements";
    btnRetour.textContent = "⬅ Retour";
    btnRetour.onclick = afficherAccueil;
    document.getElementById("recherche-elements").prepend(btnRetour);
  }

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

async function chercherParNom() {
  const nom = document.getElementById("nomRoche").value.trim().toLowerCase();
  if (!nom) {
    alert("Veuillez entrer un nom de roche.");
    return;
  }

  try {
    const response = await fetch(`/composition/${encodeURIComponent(nom)}`);
    if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

    const data = await response.json();

    if (data.error) {
      document.getElementById("resultatNom").innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    // Trier par valeur décroissante
    const compEntries = Object.entries(data.composition_moyenne)
      .sort(([, valA], [, valB]) => valB - valA);

    let html = `<h3>Composition moyenne pour ${data.roche} :</h3><ul>`;
    compEntries.forEach(([elem, val]) => {
      html += `<li>${elem} : ${val} %</li>`;
    });
    html += `</ul>`;
    document.getElementById("resultatNom").innerHTML = html;

  } catch (err) {
    document.getElementById("resultatNom").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}

async function chercherParElements() {
  const form = document.getElementById("form-elements");
  const formData = new FormData(form);
  const payload = {};

  // Inclure uniquement les éléments renseignés
  elements.forEach(elem => {
    const value = formData.get(elem);
    if (value !== null && value !== '') {
      payload[elem] = parseFloat(value);
    }
  });

  if (Object.keys(payload).length === 0) {
    alert("Veuillez renseigner au moins un élément.");
    return;
  }

  try {
    const response = await fetch("/predict_elements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);

    const resultats = await response.json();
    const div = document.getElementById("resultatElements");

    if (!resultats || !resultats.roche) {
      div.innerHTML = `<p>Aucune roche correspondante trouvée.</p>`;
      return;
    }

    // Trier par valeur décroissante
    const compEntries = Object.entries(resultats.composition_moyenne)
      .sort(([, valA], [, valB]) => valB - valA);

    div.innerHTML = `
      <h3>Roche la plus probable :</h3>
      <p><strong>${resultats.roche}</strong> : ${resultats.probabilite} %</p>
      <h4>Composition moyenne :</h4>
      <ul>
        ${compEntries.map(([elem, val]) => `<li>${elem} : ${val} %</li>`).join('')}
      </ul>
    `;

  } catch (err) {
    console.error("Erreur lors de la requête :", err);
    document.getElementById("resultatElements").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}
