<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./style/cookie.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <title>Cookie Clicker avec Sections</title>
</head>
<body>
    <div id="gameWrapper">
        <!-- Section gauche : Cookie principal -->
        <div id="sectionLeft" class="inset">
            <br>
            <div id="cookieCounter">0 Ressources</div>
            <div id="cookiePerSecond">par seconde : 0</div>
            <div id="cookie">
                <img src="assets/pixel-art-rock-pile-detailed-8-bit-illustration-grey-stones_1292377-12348-removebg-preview.png" alt="Rock Pile">
            </div>
        </div>

        <!-- Section droite : Améliorations -->
        <div id="sectionRight" class="inset">
            <div id="upgradeTitle" class="inset title zoneTitle">Upgrade</div>
            <div id="upgrade">
                <!-- Les upgrades seront ajoutés dynamiquement via JavaScript -->
            </div>
            <div id="buildingsTitle" class="inset title zoneTitle">Boutique</div>
            <div id="buildingsMaster">
                <!-- Les buildings seront ajoutés dynamiquement via JavaScript -->
            </div>
        </div>
    </div>

    <!-- Script pour charger les données JSON -->
    <script>
        // Fonction pour charger le JSON et remplir les sections
        async function loadGameData() {
            try {
                // Charger le fichier JSON
                const response = await fetch('data.json');
                const data = await response.json();

                // Remplir la section "upgrade" avec des icônes
                const upgradeContainer = document.getElementById('upgrade');
                data.upgrades.forEach(upgrade => {
                    const upgradeItem = document.createElement('div');
                    upgradeItem.classList.add('upgrade-item');
                    upgradeItem.innerHTML = `
                        <i class="${upgrade.icon}"></i>
                        <div class="tooltip">
                            ${upgrade.name} - ${upgrade.cost} ressources
                        </div>
                    `;
                    upgradeContainer.appendChild(upgradeItem);
                });

                // Remplir la section "buildingsMaster"
                const buildingsContainer = document.getElementById('buildingsMaster');
                data.buildings.forEach(building => {
                    const buildingItem = document.createElement('div');
                    buildingItem.classList.add('building');
                    buildingItem.innerHTML = `
                        <span>${building.name}</span>
                        <span>${building.cost} ressources</span>
                    `;
                    buildingsContainer.appendChild(buildingItem);
                });
            } catch (error) {
                console.error('Erreur lors du chargement des données JSON :', error);
            }
        }

        // Appeler la fonction au chargement de la page
        window.onload = loadGameData;
   