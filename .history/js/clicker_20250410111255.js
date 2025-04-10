function loadUpgrades() {
    upgradeContainer.innerHTML = '';
    const availableUpgrades = originalUpgrades.filter(upgrade => upgrade.owned === 0 && upgrade.cost <= pts);
    
    if (availableUpgrades.length === 0) {
        upgradeContainer.innerHTML = '<p style="color: white;">Aucune upgrade disponible.</p>';
    } else {
        availableUpgrades.forEach((upgrade, index) => {
            // Conteneur principal
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');
            upgradeItem.id = `upgrade${index}`;
            upgradeItem.style.zIndex = '10'; // Assure que l'élément est au-dessus
            upgradeItem.style.pointerEvents = 'auto'; // Permet les interactions

            const name = upgrade.name || 'Amélioration inconnue';
            const cost = upgrade.cost || 0;
            const description = upgrade.description || 'Aucune description';

            // Créer l'icône comme élément séparé
            let iconElement;
            if (upgrade.image && upgrade.image.src) {
                iconElement = document.createElement('img');
                iconElement.src = upgrade.image.src;
                iconElement.alt = upgrade.image.alt;
                iconElement.classList.add('upgrade-image');
            } else {
                iconElement = document.createElement('i');
                iconElement.className = upgrade.icon || 'fas fa-question';
            }

            // Ajouter l'événement clic uniquement à l'icône
            iconElement.onclick = () => {
                console.log('Clic détecté sur icône:', name, 'Coût:', cost, 'Ressources:', pts);
                buyUpgrade(upgrade, index);
            };

            // Créer le tooltip
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            tooltip.innerHTML = `
                ${name} - ${cost} ressources <hr></br>
                ${description}
            `;

            // Assembler l'élément
            upgradeItem.appendChild(iconElement);
            upgradeItem.appendChild(tooltip);
            upgradeContainer.appendChild(upgradeItem);
        });
    }
}