document.addEventListener('DOMContentLoaded', async function() {
    // Éléments DOM
    const ptsCont = document.getElementById('cookieCounter');
    const cpsCont = document.getElementById('cookiePerSecond');
    const clicker = document.getElementById('cookie');
    const upgradeContainer = document.getElementById('upgrade');
    const buildingsContainer = document.getElementById('buildingsMaster');

    // Variables de jeu
    let pts = JSON.parse(localStorage.getItem('pts')) || 0;
    let cps = JSON.parse(localStorage.getItem('cps')) || 0;
    let cpc = JSON.parse(localStorage.getItem('cpc')) || 1;
    let shopData = JSON.parse(localStorage.getItem('shopData')) || await getShopData();
    let upgradeData = JSON.parse(localStorage.getItem('upgradeData')) || await getUpgradeData();

    // Initialisation de l'affichage
    ptsCont.textContent = `${Math.floor(pts)} Ressources`;
    cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;

    // Charger les bâtiments
    shopData.forEach((building, index) => {
        const buildingItem = createShopItem(building, index, 'building');
        buildingsContainer.appendChild(buildingItem);
    });

    // Charger les améliorations
    upgradeData.forEach((upgrade, index) => {
        const upgradeItem = createShopItem(upgrade, index, 'upgrade');
        upgradeContainer.appendChild(upgradeItem);
    });

    // Événement de clic
    clicker.addEventListener('click', function() {
        pts += cpc;
        updateDisplay();
    });

    // Fonction de création d'item boutique
    function createShopItem(item, index, type) {
        const itemCont = document.createElement('div');
        itemCont.classList.add(type === 'building' ? 'building' : 'upgrade-item');
        itemCont.id = `${type}${index}`;

        itemCont.innerHTML = `
            <img src="${item.image.src}" alt="${item.image.alt}" class="${type}-image">
            <div class="${type}-info">
                <span class="${type}-name">${item.name}</span>
                <span class="${type}-cost" id="price${type}${index}">${item.cost} ressources</span>
            </div>
            <div class="${type}-count" id="owned${type}${index}">${item.owned || item.count}</div>
            <div class="tooltip">${item.description || ''}</div>
        `;

        itemCont.addEventListener('click', () => buy(item, index, type));
        return itemCont;
    }

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

            priceCont.textContent = `${item.cost} ressources`;
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
        const res = await fetch('../json/shop.json');
        return await res.json();
    }

    async function getUpgradeData() {
        const res = await fetch('../json/upgrade.json');
        return await res.json();
    }
});