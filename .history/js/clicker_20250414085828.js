document.addEventListener('DOMContentLoaded', async function () {
    // Éléments DOM
    const ptsCont = document.getElementById('cookieCounter');
    const cpsCont = document.getElementById('cookiePerSecond');
    const clicker = document.getElementById('cookie');
    const upgradeContainer = document.getElementById('upgrade');
    const buildingsContainer = document.getElementById('buildingsMaster');

    if (!ptsCont || !cpsCont || !clicker || !upgradeContainer || !buildingsContainer) {
        console.error('Un ou plusieurs éléments DOM sont manquants.');
        return;
    }

    // Variables de jeu
    let pts = parseFloat(localStorage.getItem('pts')) || 0;
    let cps = parseFloat(localStorage.getItem('cps')) || 0;
    let cpc = parseFloat(localStorage.getItem('cpc')) || 1;
    let shopData = JSON.parse(localStorage.getItem('shopData')) || [];
    let upgradeData = JSON.parse(localStorage.getItem('upgradeData')) || [];

    // Chargement JSON
    try {
        if (!Array.isArray(shopData) || shopData.length === 0) {
            shopData = await getShopData();
            localStorage.setItem('shopData', JSON.stringify(shopData));
        }
        if (!Array.isArray(upgradeData) || upgradeData.length === 0) {
            upgradeData = await getUpgradeData();
            localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
        return;
    }

    let buildings = Array.isArray(shopData) ? shopData : [];
    let upgrades = Array.isArray(upgradeData) ? upgradeData : [];

    // Mise à jour de l'affichage
    function updateDisplay() {
        ptsCont.textContent = `${Math.floor(pts)} Ressources`;
        cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;
    }
    updateDisplay();

    // Clic sur le rocher
    clicker.addEventListener('click', function () {
        pts += cpc;
        console.log(`Clic ! cpc = ${cpc}, pts = ${pts}`); // DEBUG
        updateDisplay();
        saveGame();
    });

    // Achat d'une amélioration
    function buyUpgrade(upgrade) {
        if (pts >= upgrade.cost && !upgrade.owned) {
            pts -= upgrade.cost;
            const cpcGain = Number(upgrade.cpc) || 0;
            cpc += cpcGain;
            upgrade.owned = true;
            console.log(`Upgrade "${upgrade.name}" acheté ! +${cpcGain} cpc (total: ${cpc})`);
            updateDisplay();
            saveGame();
            loadUpgrades();
        }
    }

    // Affichage des améliorations
    function loadUpgrades() {
        upgradeContainer.innerHTML = '';
        upgrades.forEach((upgrade, index) => {
            if (upgrade.owned) return;

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

    // Achat d'un bâtiment
    function buyBuilding(building, index) {
        if (pts >= building.cost) {
            pts -= building.cost;
            building.count = (building.count || 0) + 1;
            building.cost = Math.ceil(building.cost * 1.15);
            cps += building.cps || 0;

            const priceCont = document.getElementById(`pricebuilding${index}`);
            const ownedCont = document.getElementById(`ownedbuilding${index}`);
            if (priceCont) priceCont.textContent = `${building.cost} ressources`;
            if (ownedCont) ownedCont.textContent = building.count;

            updateDisplay();
            saveGame();
        }
    }

    // Affichage des bâtiments
    function loadBuildings() {
        buildingsContainer.innerHTML = '';
        buildings.forEach((building, index) => {
            const buildingItem = document.createElement('div');
            buildingItem.classList.add('building');
            buildingItem.id = `building${index}`;

            const iconOrImage = building.image && building.image.src
                ? `<img src="${building.image.src}" alt="${building.image.alt}" class="building-image">`
                : `<i class="fas fa-question"></i>`;

            buildingItem.innerHTML = `
                <div class="building-icon">${iconOrImage}</div>
                <div class="building-info">
                    <span class="building-name">${building.name}</span>
                    <span class="building-cost" id="pricebuilding${index}">${building.cost} ressources</span>
                </div>
                <div class="building-count" id="ownedbuilding${index}">${building.count || 0}</div>
            `;

            buildingItem.addEventListener('click', () => buyBuilding(building, index));
            buildingsContainer.appendChild(buildingItem);
        });
    }

    // Tick automatique des ressources par seconde
    setInterval(() => {
        pts += cps / 100;
        updateDisplay();
        saveGame();
    }, 10);

    // Sauvegarde
    function saveGame() {
        localStorage.setItem('pts', JSON.stringify(pts));
        localStorage.setItem('cps', JSON.stringify(cps));
        localStorage.setItem('cpc', JSON.stringify(cpc));
        localStorage.setItem('shopData', JSON.stringify(buildings));
        localStorage.setItem('upgradeData', JSON.stringify(upgrades));
    }

    // Chargement JSON
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

/*multiplier ressources */
function buyUpgrade(upgrade) {
    if (pts >= upgrade.cost && !upgrade.owned) {
        pts -= upgrade.cost;

        const cpcGain = Number(upgrade.cpc) || 0;
        const multiplier = Number(upgrade.multiplier) || 1;

        // Appliquer cpc gain
        cpc += cpcGain;

        // Appliquer multiplicateur s'il existe
        if (multiplier > 1) {
            cpc *= multiplier;
        }

        // Changer l'image si spécifiée
        if (upgrade.image && upgrade.image.src) {
            const cookieImg = document.querySelector('#cookie img');
            if (cookieImg) {
                cookieImg.src = upgrade.image.src;
                cookieImg.alt = upgrade.image.alt || 'Amélioration';
            }
        }

        upgrade.owned = true;
        updateDisplay();
        saveGame();
        loadUpgrades();
    }
}


    // Lancement du jeu
    loadUpgrades();
    loadBuildings();
   

    
});
