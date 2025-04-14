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

    // Appliquer image de ressource si une upgrade avec multiplier et image est owned
    function applyLastOwnedImage() {
        const ownedWithImage = upgrades.filter(up => up.owned && up.multiplier && up.image && up.image.src);
        if (ownedWithImage.length > 0) {
            const last = ownedWithImage[ownedWithImage.length - 1];
            cookieImg.src = last.image.src;
            cookieImg.alt = last.image.alt || 'Amélioration';
        }
    }

    // Chargement JSON
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

    function updateDisplay() {
        ptsCont.textContent = `${Math.floor(pts)} Ressources`;
        cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;
    }
    updateDisplay();
    applyLastOwnedImage();

    clicker.addEventListener('click', function () {
        pts += cpc;
        updateDisplay();
        saveGame();
    });

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
            saveGame();
            loadUpgrades();
            applyLastOwnedImage();
        }
    }

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

            upgradeItem.addEventListener('click', () => buyUpgrade(upgrade));
            upgradeContainer.appendChild(upgradeItem);
        });
    }

    function buyBuilding(building, index) {