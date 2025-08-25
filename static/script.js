// Recherche par éléments (Top 5 roches probables)
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

    if (!resultats || !resultats.predictions || resultats.predictions.length === 0) {
      div.innerHTML = `<p>Aucune roche correspondante trouvée.</p>`;
      return;
    }

    // Générer HTML avec les 5 roches les plus probables
    let html = `<h3>Top 5 des roches les plus probables :</h3><ol>`;
    resultats.predictions.forEach(pred => {
      const comp = Object.entries(pred.composition_moyenne)
        .sort((a, b) => b[1] - a[1]); // Tri composition décroissant

      html += `
        <li>
          <p><strong>${pred.roche}</strong> : ${pred.probabilite} %</p>
          <details>
            <summary>Composition moyenne</summary>
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
