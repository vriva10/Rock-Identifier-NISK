// === Navigation depuis la page d'accueil ===
document.addEventListener('DOMContentLoaded', function () {
  const searchByNameBtn = document.getElementById('searchByName');
  const searchByElementsBtn = document.getElementById('searchByElements');

  if (searchByNameBtn) {
    searchByNameBtn.addEventListener('click', () => {
      window.location.href = 'search_name.html';
    });
  }

  if (searchByElementsBtn) {
    searchByElementsBtn.addEventListener('click', () => {
      window.location.href = 'search_elements.html';
    });
  }

  // === Formulaire Recherche par Nom ===
  const nameForm = document.getElementById('nameForm');
  if (nameForm) {
    nameForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const rockName = document.getElementById('rockName').value.trim().toLowerCase();

      // Simulation d'une base de données locale
      const averageData = {
        'gabbro': { Si: 22, Mg: 6, Al: 5, Fe: 4, Ca: 1 },
        'amphibolite': { Si: 24, Mg: 5, Al: 6, Fe: 6, Ca: 2 },
        'dunite': { Si: 18, Mg: 23, Al: 2, Fe: 15, Ca: 0 },
        'websterite': { Si: 20, Mg: 17, Al: 6, Fe: 10, Ca: 3 },
        'pegmatite': { Si: 30, Mg: 2, Al: 10, Fe: 2, Ca: 9 }
      };

      const resultDiv = document.getElementById('result');
      if (averageData[rockName]) {
        const data = averageData[rockName];
        resultDiv.innerHTML = `<h3>Composition moyenne de "${rockName}"</h3>
          <ul>
            ${Object.entries(data).map(([el, val]) => `<li>${el}: ${val} %</li>`).join('')}
          </ul>`;
      } else {
        resultDiv.innerHTML = `<p>Aucune donnée trouvée pour la roche "${rockName}".</p>`;
      }
    });
  }

  // === Formulaire Recherche par Éléments ===
  const elementForm = document.getElementById('elementForm');
  if (elementForm) {
    elementForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Récupère les valeurs entrées
      const elements = ['Si', 'Ca', 'K', 'Al', 'Mg', 'Fe', 'P', 'Cr', 'Ti', 'S', 'Cu', 'Ni', 'Mn', 'Br', 'V', 'Ba', 'Au', 'Ce'];
      const inputValues = {};

      elements.forEach(el => {
        const val = parseFloat(document.getElementById(el)?.value);
        if (!isNaN(val)) inputValues[el] = val;
      });

      // === Simulation d'un résultat d'identification ===
      // Ici tu remplaceras par une requête API vers ton backend Flask ou autre
      const mockResults = [
        { name: "Gabbro", probability: 0.68 },
        { name: "Amphibolite", probability: 0.21 },
        { name: "Dunite", probability: 0.11 }
      ];

      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = `<h3>Résultats probables</h3>
        <ul>
          ${mockResults.map(r => `<li>${r.name} : ${(r.probability * 100).toFixed(1)}%</li>`).join('')}
        </ul>`;
    });
  }
});
