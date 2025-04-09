 // Fonction pour charger le JSON et remplir les sections
 async function loadGameData() {
    try {
        // Charger le fichier JSON
        const response = await fetch('./json/data.json');
        const data = await response.json();

        // Remplir la section "upgrade"
        const upgradeContainer = document.getElementById('upgrade');
        data.upgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');
            upgradeItem.innerHTML = `
                <span>${upgrade.name}</span>
                <span class="cost">${upgrade.cost} ressources</span>
            `;
            upgradeContainer.appendChild(upgradeItem);
        });

        // Remplir la section "buildingsMaster"
        const buildingsContainer = document.getElementById('buildingsMaster');
        data.buildings.forEach(building => {
            const buildingItem = document.createElement('div');
            buildingItem.classList.add('building');
            buildingItem.innerHTML = `
                <span>${building.name}</span>
                <span>${building.cost} ressources</span>
            `;
            buildingsContainer.appendChild(buildingItem);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
    }
}

// Appeler la fonction au chargement de la page
window.onload = loadGameData;