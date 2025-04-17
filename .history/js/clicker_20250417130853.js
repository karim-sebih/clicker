document.addEventListener('DOMContentLoaded', async function () {
    // Éléments DOM
    const ptsCont = document.getElementById('cookieCounter');
    const cpsCont = document.getElementById('cookiePerSecond');
    const clicker = document.getElementById('cookie');
    const upgradeContainer = document.getElementById('upgrade');
    const buildingsContainer = document.getElementById('buildingsMaster');
    const cookieImg = document.querySelector('#cookie img');

    if (!ptsCont || !cpsCont || !clicker || !upgradeContainer || !buildingsContainer || !cookieImg) {
        console.error('Un ou plusieurs éléments DOM sont manquants.');
        return;
    }

    // Variables de jeu
    let pts = parseFloat(localStorage.getItem('pts')) || 0;
    let cps = parseFloat(localStorage.getItem('cps')) || 0;
    let cpc = parseFloat(localStorage.getItem('cpc')) || 1;
    let shopData = JSON.parse(localStorage.getItem('shopData')) || [];
    let upgradeData = JSON.parse(localStorage.getItem('upgradeData')) || [];
    let buildings = Array.isArray(shopData) ? shopData : [];
    let upgrades = Array.isArray(upgradeData) ? upgradeData : [];

    function applyLastOwnedImage() {
        const ownedWithImage = upgrades.filter(up => up.owned && up.multiplier && up.image && up.image.src);
        if (ownedWithImage.length > 0) {
            const last = ownedWithImage[ownedWithImage.length - 1];
            cookieImg.src = last.image.src;
            cookieImg.alt = last.image.alt || 'Amélioration';
        }
    }

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

    async function getRessourceData() {
        const res = await fetch('./json/ressources.json');
        if (!res.ok) throw new Error(`Erreur ressources.json: ${res.status}`);
        return await res.json();
    }

    function updateDisplay() {
        ptsCont.textContent = `${Math.floor(pts)} Ressources`;
        cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;
    }

    function updateAffordability() {
        upgrades.forEach((upgrade, index) => {
            const el = document.getElementById(`upgrade${index}`);
            if (el && !upgrade.owned) {
                if (pts < upgrade.cost) {
                    el.classList.add('unaffordable');
                } else {
                    el.classList.remove('unaffordable');
                }
            }
        });

        buildings.forEach((building, index) => {
            const el = document.getElementById(`building${index}`);
            if (el) {
                if (pts < building.cost) {
                    el.classList.add('unaffordable');
                } else {
                    el.classList.remove('unaffordable');
                }
            }
        });
    }

    function buyUpgrade(upgrade) {
        if (pts >= upgrade.cost && !upgrade.owned) {
            pts -= upgrade.cost;
            const cpcGain = Number(upgrade.cpc) || 0;
            const multiplier = Number(upgrade.multiplier) || 1;

            cpc += cpcGain;
            if (multiplier > 1) {
                cpc *= multiplier;
            }

            upgrade.owned = true;
            updateDisplay();
            updateAffordability();
            saveGame();
            loadUpgrades();
            applyLastOwnedImage();
        }
    }

    function loadUpgrades() {
        upgradeContainer.innerHTML = '';

        let upgradesVisible = 0;

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
                if (pts >= upgrade.cost && !upgrade.owned) {
                    buyUpgrade(upgrade);
                }
            });

            if (pts < upgrade.cost) {
                upgradeItem.classList.add('unaffordable');
            }

            upgradeContainer.appendChild(upgradeItem);
            upgradesVisible++;
        });

        if (upgradesVisible === 0) {
            upgradeContainer.innerHTML = `<div style="text-align: center; color: white; font-size: 1em;">Aucune amélioration disponible pour le moment.</div>`;
        }
    }

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
            updateAffordability();
            saveGame();
        }
    }

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

    clicker.addEventListener('click', function () {
        pts += cpc;
        updateDisplay();
        updateAffordability();
        loadUpgrades();
        loadBuildings();
        saveGame();
    });


    function saveGame() {
        localStorage.setItem('pts', JSON.stringify(pts));
        localStorage.setItem('cps', JSON.stringify(cps));
        localStorage.setItem('cpc', JSON.stringify(cpc));
        localStorage.setItem('shopData', JSON.stringify(buildings));
        localStorage.setItem('upgradeData', JSON.stringify(upgrades));
    }

    try {
        if (!Array.isArray(shopData) || shopData.length === 0) {
            shopData = await getShopData();
            localStorage.setItem('shopData', JSON.stringify(shopData));
        }
        if (!Array.isArray(upgradeData) || upgradeData.length === 0) {
            const classicUpgrades = await getUpgradeData();
            const ressourceUpgrades = await getRessourceData();
            upgradeData = [...classicUpgrades, ...ressourceUpgrades];
            localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données JSON :', error);
        return;
    }

    upgrades = upgradeData;

    updateDisplay();
    applyLastOwnedImage();
    loadUpgrades();
    loadBuildings();
    updateAffordability();
});