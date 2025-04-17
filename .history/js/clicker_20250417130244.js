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