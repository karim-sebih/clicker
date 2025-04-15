// Fonction pour charger le JSON et remplir les sections
async function loadGameData() {
    try {
        // Charger le fichier JSON
        const response = await fetch('data.json');
        const data = await response.json();

        // Remplir la section "upgrade" avec des icônes
        const upgradeContainer = document.getElementById('upgrade');
        data.upgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');
            upgradeItem.innerHTML = `
                        <i class="${upgrade.icon}"></i>
                        <div class="tooltip">
                            ${upgrade.name} - ${upgrade.cost} ressources
                        </div>
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
