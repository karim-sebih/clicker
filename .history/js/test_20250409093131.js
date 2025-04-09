// Fonction pour charger le JSON et remplir les sections
async function loadGameData() {
    try {
        // Charger le fichier JSON
        const response = await fetch('../json/data.json');
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

            // Ajouter des écouteurs d'événements pour positionner le tooltip
            const tooltip = upgradeItem.querySelector('.tooltip');
            upgradeItem.addEventListener('mouseenter', () => {
                // Calculer la position de l'icône
                const rect = upgradeItem.getBoundingClientRect();
                const tooltipWidth = tooltip.offsetWidth;

                // Positionner le tooltip à gauche de l'icône
                tooltip.style.left = `${rect.left - tooltipWidth - 10}px`; // 10px d'espace
                tooltip.style.top = `${rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2)}px`;
            });
        });

        // Remplir la section "buildingsMaster"
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