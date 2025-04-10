// clicker.js
document.addEventListener('DOMContentLoaded', async function() {
    // Éléments DOM
    const ptsCont = document.getElementById('cookieCounter');
    const cpsCont = document.getElementById('cookiePerSecond');
    const clicker = document.getElementById('cookie');
    const upgradeContainer = document.getElementById('upgrade');
    const buildingsContainer = document.getElementById('buildingsMaster');

    // Vérifier que les éléments DOM existent
    if (!ptsCont || !cpsCont || !clicker || !upgradeContainer || !buildingsContainer) {
        console.error('Un ou plusieurs éléments DOM sont manquants.');
        return;
    }

    // Variables de jeu
    let pts = JSON.parse(localStorage.getItem('pts')) || 0;
    let cps = JSON.parse(localStorage.getItem('cps')) || 0;
    let cpc = JSON.parse(localStorage.getItem('cpc')) || 1;
    let shopData = JSON.parse(localStorage.getItem('shopData'));
    let upgradeData = JSON.parse(localStorage.getItem('upgradeData'));

    // Charger les données si elles ne sont pas dans le localStorage
    try {
        if (!shopData) {
            shopData = await getShopData();
            localStorage.setItem('shopData', JSON.stringify(shopData));
        }
        if (!upgradeData) {
            upgradeData = await getUpgradeData();
            localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
        return;
    }

    // Normaliser shopData et upgradeData
    const buildings = Array.isArray(shopData) ? shopData : shopData.buildings || [];
    const upgrades = Array.isArray(upgradeData) ? upgradeData : upgradeData.upgrades || [];

    // Vérifier que les données normalisées sont des tableaux
    if (!Array.isArray(buildings)) {
        console.error('buildings n\'est pas un tableau valide:', buildings);
        return;
    }
    if (!Array.isArray(upgrades)) {
        console.error('upgrades n\'est pas un tableau valide:', upgrades);
        return;
    }

    // Initialisation de l'affichage
    ptsCont.textContent = `${Math.floor(pts)} Ressources`;
    cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;

    // Charger les améliorations (style de loadGameData)
    upgrades.forEach((upgrade, index) => {
        const upgradeItem = document.createElement('div');
        upgradeItem.classList.add('upgrade-item');
        upgradeItem.id = `upgrade${index}`;

        let iconOrImage;
        if (upgrade.image && upgrade.image.src) {
            iconOrImage = `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`;
        } else {
            iconOrImage = `<i class="${upgrade.icon || 'fas fa-question'}"></i>`; // Icône par défaut si aucune icône n'est définie
        }

       

        upgradeItem.innerHTML = `
            ${iconOrImage}
            <div class="tooltip">
                ${name} - ${cost} ressources <hr></br>
                ${description}
            </div>
            <!-- Cacher les éléments pour la logique d'achat, mais les garder pour JavaScript -->
            <span class="upgrade-cost hidden" id="priceupgrade${index}">${cost}</span>
            <span class="upgrade-count hidden" id="ownedupgrade${index}">${owned}</span>
        `;

        upgradeItem.addEventListener('click', () => buy(upgrade, index, 'upgrade'));
        upgradeContainer.appendChild(upgradeItem);
    });

    // Charger les bâtiments
    buildings.forEach((building, index) => {
        const buildingItem = document.createElement('div');
        buildingItem.classList.add('building');
        buildingItem.id = `building${index}`;

        let iconOrImage;
        if (building.image && building.image.src) {
            iconOrImage = `<img src="${building.image.src}" alt="${building.image.alt}" class="building-image">`;
        } else {
            iconOrImage = `<i class="${building.icon || 'fas fa-question'}"></i>`; // Icône par défaut si aucune icône n'est définie
        }

        // Valider les propriétés pour les bâtiments
        const name = building.name || 'Bâtiment inconnu';
        const cost = building.cost !== undefined ? building.cost : 0;
        const count = building.count !== undefined ? building.count : 0;

        buildingItem.innerHTML = `
            <div class="building-icon">
                ${iconOrImage}
            </div>
            <div class="building-info">
                <span class="building-name">${name}</span>
                <span class="building-cost" id="pricebuilding${index}">${cost} ressources</span>
            </div>
            <div class="building-count" id="ownedbuilding${index}">${count}</div>
        `;

        buildingItem.addEventListener('click', () => buy(building, index, 'building'));
        buildingsContainer.appendChild(buildingItem);
    });

    // Événement de clic
    clicker.addEventListener('click', function() {
        pts += cpc;
        updateDisplay();
    });

    // Fonction d'achat
    function buy(item, index, type) {
        const priceCont = document.getElementById(`price${type}${index}`);
        const ownedCont = document.getElementById(`owned${type}${index}`);

        if (pts >= item.cost) {
            pts -= item.cost;
            item.cost = Math.ceil(item.cost * 1.15);
            
            if (type === 'building') {
                item.count++;
                cps += item.cps;
                ownedCont.textContent = item.count;
            } else {
                item.owned++;
                cpc += item.cpc;
                ownedCont.textContent = item.owned;
            }

            priceCont.textContent = `${item.cost}`; // Mettre à jour le coût (même s'il est caché pour les upgrades)
            updateDisplay();
            saveGame();
        }
    }

    // Mise à jour de l'affichage
    function updateDisplay() {
        ptsCont.textContent = `${Math.floor(pts)} Ressources`;
        cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;
    }

    // Ajout automatique des CPS
    function addCps() {
        pts += cps / 100;
        updateDisplay();
    }
    setInterval(addCps, 10);

    // Sauvegarde
    function saveGame() {
        localStorage.setItem('pts', JSON.stringify(pts));
        localStorage.setItem('cps', JSON.stringify(cps));
        localStorage.setItem('cpc', JSON.stringify(cpc));
        localStorage.setItem('shopData', JSON.stringify(shopData));
        localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
    }

    // Chargement des données
    async function getShopData() {
        const res = await fetch('./json/shop.json');
        if (!res.ok) {
            throw new Error(`Erreur lors du chargement de shop.json: ${res.status}`);
        }
        return await res.json();
    }

    async function getUpgradeData() {
        const res = await fetch('./json/upgrade.json');
        if (!res.ok) {
            throw new Error(`Erreur lors du chargement de upgrade.json: ${res.status}`);
        }
        return await res.json();
    }
});