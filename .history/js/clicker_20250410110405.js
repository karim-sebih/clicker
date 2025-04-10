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

    // Vérifier que les données normalisées sont des tableaux
    if (!Array.isArray(buildings)) {
        console.error('buildings n\'est pas un tableau valide:', buildings);
        return;
    }
    if (!Array.isArray(upgrades)) {
        console.error('upgrades n\'est pas un tableau valide:', upgrades);
        return;
    }

    // Conserver une copie des données pour la logique interne
    const originalUpgrades = [...upgrades];
    const originalBuildings = [...buildings];

    // Filtrer les upgrades pour n'afficher que ceux qui n'ont pas été achetés (owned = 0)
    // et que le joueur peut se permettre d'acheter (cost <= pts)
    upgrades = originalUpgrades.filter(upgrade => upgrade.owned === 0 && upgrade.cost <= pts);

    // Initialisation de l'affichage
    ptsCont.textContent = `${Math.floor(pts)} Ressources`;
    cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;

    // Charger les améliorations
    function loadUpgrades() {
        upgradeContainer.innerHTML = ''; // Vider le conteneur
        upgrades = originalUpgrades.filter(upgrade => upgrade.owned === 0 && upgrade.cost <= pts);
        console.log('Upgrades après filtrage :', upgrades);

        if (upgrades.length === 0) {
            upgradeContainer.innerHTML = '<p style="color: white;">Aucune upgrade disponible.</p>';
        } else {
            upgrades.forEach((upgrade, index) => {
                const upgradeItem = document.createElement('div');
                upgradeItem.classList.add('upgrade-item');
                upgradeItem.id = `upgrade${index}`;

                let iconOrImage = upgrade.image && upgrade.image.src
                    ? `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`
                    : `<i class="${upgrade.icon || 'fas fa-question'}"></i>`;

                const name = upgrade.name || 'Amélioration inconnue';
                const cost = upgrade.cost !== undefined ? upgrade.cost : 0;
                const description = upgrade.description || 'Aucune description';

                upgradeItem.innerHTML = `
                    ${iconOrImage}
                    <div class="tooltip">
                        ${name} - ${cost} ressources <hr></br>
                        ${description}
                    </div>
                `;

                upgradeItem.addEventListener('click', () => {
                    console.log('Clic sur upgrade:', name);
                    buy(upgrade, index, 'upgrade');
                });
                upgradeContainer.appendChild(upgradeItem);
            });
        }
    }

    // Charger les bâtiments
    function loadBuildings() {
        buildingsContainer.innerHTML = ''; // Vider le conteneur pour éviter les doublons
        originalBuildings.forEach((building, index) => {
            const buildingItem = document.createElement('div');
            buildingItem.classList.add('building');
            buildingItem.id = `building${index}`;

            let iconOrImage = building.image && building.image.src
                ? `<img src="${building.image.src}" alt="${building.image.alt}" class="building-image">`
                : `<i class="${building.icon || 'fas fa-question'}"></i>`;

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
    }

    // Charger les éléments au démarrage
    loadUpgrades();
    loadBuildings();

    // Événement de clic sur le rocher
    clicker.addEventListener('click', function() {
        pts += cpc;
        updateDisplay();
        loadUpgrades(); // Mettre à jour les upgrades après chaque clic
    });

    // Fonction d'achat
    function buy(item, index, type) {
        const itemElement = document.getElementById(`${type}${index}`);
        console.log('Tentative d\'achat :', item.name, 'Coût :', item.cost, 'Ressources actuelles :', pts);

        if (pts >= item.cost) {
            pts -= item.cost;

            if (type === 'building') {
                const priceCont = document.getElementById(`pricebuilding${index}`);
                const ownedCont = document.getElementById(`ownedbuilding${index}`);
                item.cost = Math.ceil(item.cost * 1.15);
                item.count = (item.count || 0) + 1;
                cps += item.cps || 0; // Ajouter cps seulement si défini
                ownedCont.textContent = item.count;
                priceCont.textContent = `${item.cost} ressources`;
            } else {
                item.owned = 1; // Marquer comme possédé
                cpc += item.cpc || 0; // Ajouter cpc seulement si défini
                const upgradeIndex = originalUpgrades.findIndex(u => u.name === item.name);
                if (upgradeIndex !== -1) {
                    originalUpgrades[upgradeIndex].owned = 1;
                }
                if (itemElement) {
                    itemElement.remove();
                }
            }

            updateDisplay();
            loadUpgrades(); // Mettre à jour les upgrades après un achat
            saveGame();
        } else {
            console.log('Pas assez de ressources pour acheter cet upgrade !');
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
        loadUpgrades(); // Mettre à jour les upgrades à chaque tick
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
        if (!res.ok) throw new Error(`Erreur lors du chargement de shop.json: ${res.status}`);
        return await res.json();
    }

    async function getUpgradeData() {
        const res = await fetch('./json/upgrade.json');
        if (!res.ok) throw new Error(`Erreur lors du chargement de upgrade.json: ${res.status}`);
        return await res.json();
    }
});