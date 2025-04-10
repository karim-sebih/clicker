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

    // Charger les données initiales si elles ne sont pas dans localStorage
    try {
        if (!shopData) {
            console.log('Chargement de shopData depuis shop.json...');
            shopData = await getShopData();
            localStorage.setItem('shopData', JSON.stringify(shopData));
        }
        if (!upgradeData) {
            console.log('Chargement de upgradeData depuis upgrade.json...');
            upgradeData = await getUpgradeData();
            localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
        return;
    }

    // Normaliser shopData et upgradeData
    let buildings = Array.isArray(shopData) ? shopData : shopData.buildings || [];
    let upgrades = Array.isArray(upgradeData) ? upgradeData : upgradeData.upgrades || [];

    if (!Array.isArray(buildings) || !Array.isArray(upgrades)) {
        console.error('Les données JSON ne sont pas des tableaux valides.');
        return;
    }

    // Conserver une copie des données originales
    const originalUpgrades = [...upgrades];
    const originalBuildings = [...buildings];

    // Initialisation de l'affichage
    ptsCont.textContent = `${Math.floor(pts)} Ressources`;
    cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;

    // Charger les améliorations
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

                // Ajouter l'événement de clic
                upgradeItem.addEventListener('click', () => {
                    console.log('Clic détecté sur:', name);
                    buyUpgrade(upgrade, index);
                });

                upgradeContainer.appendChild(upgradeItem);
            });
        }
    }

    // Charger les bâtiments
    function loadBuildings() {
        buildingsContainer.innerHTML = '';
        originalBuildings.forEach((building, index) => {
            const buildingItem = document.createElement('div');
            buildingItem.classList.add('building');
            buildingItem.id = `building${index}`;

            let iconOrImage = building.image && building.image.src
                ? `<img src="${building.image.src}" alt="${building.image.alt}" class="building-image">`
                : `<i class="${building.icon || 'fas fa-question'}"></i>`;

            const name = building.name || 'Bâtiment inconnu';
            const cost = building.cost || 0;
            const count = building.count || 0;

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

            buildingItem.addEventListener('click', () => buyBuilding(building, index));
            buildingsContainer.appendChild(buildingItem);
        });
    }

    // Charger au démarrage
    loadUpgrades();
    loadBuildings();

    // Clic sur le rocher
    clicker.addEventListener('click', function() {
        pts += cpc;
        updateDisplay();
        loadUpgrades();
        saveGame(); // Sauvegarder après chaque clic
    });

    // Fonction d'achat pour upgrades
    function buyUpgrade(upgrade, index) {
        console.log('Tentative d\'achat upgrade:', upgrade.name, 'Coût:', upgrade.cost, 'Ressources:', pts);
        if (pts >= upgrade.cost) {
            pts -= upgrade.cost;
            cpc += upgrade.cpc || 0;
            upgrade.owned = 1;

            const upgradeIndex = originalUpgrades.findIndex(u => u.name === upgrade.name);
            if (upgradeIndex !== -1) {
                originalUpgrades[upgradeIndex].owned = 1;
            }

            const itemElement = document.getElementById(`upgrade${index}`);
            if (itemElement) itemElement.remove();

            updateDisplay();
            loadUpgrades();
            saveGame();
            console.log('Achat réussi:', upgrade.name);
        } else {
            console.log('Pas assez de ressources pour:', upgrade.name);
        }
    }

    // Fonction d'achat pour bâtiments
    function buyBuilding(building, index) {
        console.log('Tentative d\'achat building:', building.name, 'Coût:', building.cost, 'Ressources:', pts);
        if (pts >= building.cost) {
            pts -= building.cost;
            building.count = (building.count || 0) + 1;
            building.cost = Math.ceil(building.cost * 1.15);
            cps += building.cps || 0;

            const priceCont = document.getElementById(`pricebuilding${index}`);
            const ownedCont = document.getElementById(`ownedbuilding${index}`);
            priceCont.textContent = `${building.cost} ressources`;
            ownedCont.textContent = building.count;

            updateDisplay();
            loadUpgrades();
            saveGame();
            console.log('Achat réussi:', building.name);
        } else {
            console.log('Pas assez de ressources pour:', building.name);
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
        loadUpgrades();
        saveGame(); // Sauvegarder à chaque tick
    }
    setInterval(addCps, 10);

    // Sauvegarde
    function saveGame() {
        localStorage.setItem('pts', JSON.stringify(pts));
        localStorage.setItem('cps', JSON.stringify(cps));
        localStorage.setItem('cpc', JSON.stringify(cpc));
        localStorage.setItem('shopData', JSON.stringify(originalBuildings));
        localStorage.setItem('upgradeData', JSON.stringify(originalUpgrades));
    }

    // Chargement des données
    async function getShopData() {
        const res = await fetch('./json/shop.json');
        if (!res.ok) throw new Error(`Erreur shop.json: ${res.status}`);
        return await res.json();
    }

    async function getUpgradeData() {
        const res = await fetch('./json/upgrade.json');
        if (!res.ok) throw new Error(`Erreur upgrade.json: ${res.status}`);
        return await res.json();
    }
});