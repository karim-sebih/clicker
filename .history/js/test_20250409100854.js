// Fonction pour charger le JSON et remplir les sections
async function loadGameData() {
    try {
        // Charger le fichier JSON
        const response = await fetch('../json/data.json');
        const data = await response.json();

        // Remplir la section "upgrade" avec des icônes ou images
        const upgradeContainer = document.getElementById('upgrade');
        data.upgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');

            // Vérifier si une image est définie, sinon utiliser l'icône
            let iconOrImage;
            if (upgrade.image && upgrade.image.src) {
                iconOrImage = `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`;
            } else {
                iconOrImage = `<i class="${upgrade.icon}"></i>`;
            }

            upgradeItem.innerHTML = `
                ${iconOrImage}
                <div class="tooltip">
                    ${upgrade.name} - ${upgrade.cost} ressources
                </div>
            `;
            upgradeContainer.appendChild(upgradeItem);
        });

        // Remplir la section "buildingsMaster" (inchangée)
        const buildingsContainer = document.getElementById('buildingsMaster');
        data.buildings.forEach(building => {
            const buildingItem = document.createElement('div');
            buildingItem.classList.add('building');
            buildingItem.innerHTML = `
                <div class="building-icon">
                    <i class="${building.icon}"></i>
                </div>
                <div class="building-info">
                    <span class="building-name">${building.name}</span>
                    <span class="building-cost">${building.cost} ressources</span>
                </div>
                <div class="building-count">${building.count}</div>
            `;
            buildingsContainer.appendChild(buildingItem);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
    }
}

// Appeler la fonction au chargement de la page
window.onload = loadGameData;