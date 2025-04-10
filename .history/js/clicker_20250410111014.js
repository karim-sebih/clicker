function loadUpgrades() {
    upgradeContainer.innerHTML = '';
    const availableUpgrades = originalUpgrades.filter(upgrade => upgrade.owned === 0 && upgrade.cost <= pts);
    
    if (availableUpgrades.length === 0) {
        upgradeContainer.innerHTML = '<p style="color: white;">Aucune upgrade disponible.</p>';
    } else {
        availableUpgrades.forEach((upgrade, index) => {
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');
            upgradeItem.id = `upgrade${index}`;
            // Forcer le style inline pour tester
            upgradeItem.style.zIndex = '10';
            upgradeItem.style.pointerEvents = 'auto';

            let iconOrImage = upgrade.image && upgrade.image.src
                ? `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`
                : `<i class="${upgrade.icon || 'fas fa-question'}"></i>`;

            const name = upgrade.name || 'Amélioration inconnue';
            const cost = upgrade.cost || 0;
            const description = upgrade.description || 'Aucune description';

            upgradeItem.innerHTML = `
                ${iconOrImage}
                <div class="tooltip">
                    ${name} - ${cost} ressources <hr></br>
                    ${description}
                </div>
            `;

            upgradeItem.onclick = () => {
                console.log('Clic détecté sur:', name, 'Coût:', cost, 'Ressources:', pts);
                buyUpgrade(upgrade, index);
            };

            upgradeContainer.appendChild(upgradeItem);
        });
    }
}