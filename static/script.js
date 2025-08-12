// Liste des éléments à afficher dans le formulaire
const elements = ['Mg', 'Al', 'Si', 'P', 'S', 'K', 'Ca', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'As', 'Ag', 'Ba', 'Ce', 'Au'];

function afficherRechercheParNom() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-nom").classList.remove("hidden");
}

function afficherRechercheParElements() {
  document.getElementById("accueil").classList.add("hidden");
  document.getElementById("recherche-elements").classList.remove("hidden");

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
    alert("Enter rock name.");
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

    const comp = data.composition_moyenne;
    let html = `<h3>Mean composition for ${data.roche} :</h3><ul>`;
    for (const [elem, val] of Object.entries(comp)) {
      html += `<li>${elem} : ${val} %</li>`;
    }
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
    alert("Enter at least 1 element.");
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
      div.innerHTML = `<p>No corresponding rock found.</p>`;
      return;
    }

    div.innerHTML = `
      <h3>Most probable rock :</h3>
      <p><strong>${resultats.roche}</strong> : ${resultats.probabilite} %</p>
      <h4>Mean composition :</h4>
      <ul>
        ${Object.entries(resultats.composition_moyenne)
          .map(([elem, val]) => `<li>${elem} : ${val} %</li>`)
          .join('')}
      </ul>
    `;

  } catch (err) {
    console.error("Error during request :", err);
    document.getElementById("resultatElements").innerHTML = `<p style="color:red;">Erreur lors de la requête : ${err.message}</p>`;
  }
}
