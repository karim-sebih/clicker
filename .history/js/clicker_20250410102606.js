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
    const buildings = Array.isArray(shopData) ? shopData : shopData.buildings || [];
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



    // Conserver une copie des upgrades originaux
    const originalUpgrades = [...upgrades];

    // Filtrer les upgrades pour n'afficher que ceux qui n'ont pas été achetés (owned = 0)
    // et que le joueur peut se permettre d'acheter (cost <= pts)
    upgrades = upgrades.filter(upgrade => upgrade.owned === 0 && upgrade.cost <= pts);

    // Log pour vérifier les upgrades filtrés
    console.log('Upgrades après filtrage initial :', upgrades);

    // Initialisation de l'affichage
    ptsCont.textContent = `${Math.floor(pts)} Ressources`;
    cpsCont.textContent = `par seconde : ${Math.round(cps * 10) / 10}`;

    // Charger les améliorations (style : uniquement l'icône, coût dans le tooltip)
    if (upgrades.length === 0) {
        upgradeContainer.innerHTML = '<p style="color: white;">Aucune upgrade disponible.</p>';
    } else {
        upgrades.forEach((upgrade, index) => {
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');
            upgradeItem.id = `upgrade${index}`;

            let iconOrImage;
            if (upgrade.image && upgrade.image.src) {
                iconOrImage = `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`;
            } else {
                iconOrImage = `<i class="${upgrade.icon || 'fas fa-question'}"></i>`;
            }

            const name = upgrade.name || 'Amélioration inconnue';
            const cost = upgrade.cost !== undefined ? upgrade.cost : 0;
            const description = upgrade.description || 'Aucune description disponible';
            const owned = upgrade.owned !== undefined ? upgrade.owned : 0;

            upgradeItem.innerHTML = `
                ${iconOrImage}
                <div class="tooltip">
                    ${name} - ${cost} ressources <hr></br>
                    ${description}
                </div>
                <!-- Cacher les éléments pour la logique d'achat -->
                <span class="upgrade-cost hidden" id="priceupgrade${index}">${cost}</span>
                <span class="upgrade-count hidden" id="ownedupgrade${index}">${owned}</span>
            `;

            upgradeItem.addEventListener('click', () => buy(upgrade, index, 'upgrade'));
            upgradeContainer.appendChild(upgradeItem);
        });
    }

    // Charger les bâtiments
    buildings.forEach((building, index) => {
        const buildingItem = document.createElement('div');
        buildingItem.classList.add('building');
        buildingItem.id = `building${index}`;

        let iconOrImage;
        if (building.image && building.image.src) {
            iconOrImage = `<img src="${building.image.src}" alt="${building.image.alt}" class="building-image">`;
        } else {
            iconOrImage = `<i class="${building.icon || 'fas fa-question'}"></i>`;
        }

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
        updateUpgrades(); // Mettre à jour les upgrades après chaque clic
    });

    // Fonction pour mettre à jour l'affichage des upgrades
    function updateUpgrades() {
        // Re-filtrer les upgrades à partir des données originales
        upgrades = originalUpgrades.filter(upgrade => upgrade.owned === 0 && upgrade.cost <= pts);

        // Log pour vérifier les upgrades filtrés
       

        // Mettre à jour l'affichage des upgrades
        upgradeContainer.innerHTML = ''; // Vider le conteneur
        if (upgrades.length === 0) {
            upgradeContainer.innerHTML = '<p style="color: white;">Aucune upgrade disponible.</p>';
        } else {
            upgrades.forEach((upgrade, index) => {
                const upgradeItem = document.createElement('div');
                upgradeItem.classList.add('upgrade-item');
                upgradeItem.id = `upgrade${index}`;

                let iconOrImage;
                if (upgrade.image && upgrade.image.src) {
                    iconOrImage = `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`;
                } else {
                    iconOrImage = `<i class="${upgrade.icon || 'fas fa-question'}"></i>`;
                }

                const name = upgrade.name || 'Amélioration inconnue';
                const cost = upgrade.cost !== undefined ? upgrade.cost : 0;
                const description = upgrade.description || 'Aucune description disponible';
                const owned = upgrade.owned !== undefined ? upgrade.owned : 0;

                upgradeItem.innerHTML = `
                    ${iconOrImage}
                    <div class="tooltip">
                        ${name} - ${cost} ressources <hr></br>
                        ${description}
                    </div>
                    <!-- Cacher les éléments pour la logique d'achat -->
                    
                `;

                upgradeItem.addEventListener('click', () => buy(upgrade, index, 'upgrade'));
                upgradeContainer.appendChild(upgradeItem);
            });
        }
    }

    // Fonction d'achat
    function buy(item, index, type) {
        const priceCont = document.getElementById(`price${type}${index}`);
        const ownedCont = document.getElementById(`owned${type}${index}`);
        const itemElement = document.getElementById(`${type}${index}`);

        if (pts >= item.cost) {
            pts -= item.cost;
            
            if (type === 'building') {
                item.cost = Math.ceil(item.cost * 1.15);
                item.count++;
                cps += item.cps;
                ownedCont.textContent = item.count;
                priceCont.textContent = `${item.cost}`;
            } else {
                item.owned++;
                cpc += item.cpc;
                ownedCont.textContent = item.owned;
                // Mettre à jour l'état dans originalUpgrades
                const upgradeIndex = originalUpgrades.findIndex(u => u.name === item.name);
                if (upgradeIndex !== -1) {
                    originalUpgrades[upgradeIndex].owned = item.owned;
                }
                if (itemElement) {
                    itemElement.remove();
                }
            }

            updateDisplay();
            updateUpgrades(); // Mettre à jour les upgrades après un achat
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
        updateUpgrades(); // Mettre à jour les upgrades à chaque tick
    }
    setInterval(addCps, 10);

    // Sauvegarde
    function saveGame() {
        localStorage.setItem('pts', JSON.stringify(pts));
        localStorage.setItem('cps', JSON.stringify(cps));
        localStorage.setItem('cpc', JSON.stringify(cpc));
        localStorage.setItem('shopData', JSON.stringify(shopData));
        localStorage.setItem('upgradeData', JSON.stringify(originalUpgrades));
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