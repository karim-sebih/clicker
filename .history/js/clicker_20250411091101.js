// Charger les améliorations
function loadUpgrades() {
    upgradeContainer.innerHTML = '';
    upgrades.forEach((upgrade, index) => {
        if (upgrade.owned) return; // Ignore les upgrades déjà achetées

        const upgradeItem = document.createElement('div');
        upgradeItem.classList.add('upgrade-item');
        upgradeItem.id = `upgrade${index}`;

        const iconOrImage = upgrade.image && upgrade.image.src
            ? `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`
            : `<i class="fas fa-question"></i>`;

        upgradeItem.innerHTML = `
            ${iconOrImage}
            <div class="tooltip">
                <div class="building-icon">${iconOrImage}</div>  
                ${upgrade.name} - ${upgrade.cost} ressources <hr>
                ${upgrade.description}
            </div>
        `;

        upgradeItem.addEventListener('click', () => {
            buyUpgrade(upgrade);
        });

        upgradeContainer.appendChild(upgradeItem);
    });
}

// Achat d'une amélioration
function buyUpgrade(upgrade) {
    if (pts >= upgrade.cost && !upgrade.owned) {
        pts -= upgrade.cost;
        cpc += upgrade.cpc || 0;
        upgrade.owned = true;

        updateDisplay();
        saveGame();
        loadUpgrades(); // Recharger les upgrades visibles
    }
}

// Clic sur le rocher (debug console en option)
clicker.addEventListener('click', function() {
    pts += cpc;
    console.log('Clic ! cpc =', cpc); // Pour test
    updateDisplay();
    saveGame();
});
