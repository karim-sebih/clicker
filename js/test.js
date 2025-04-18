let resources = 0; // The total resources
let perClick = 1; // Resources per click
let cookiesPerSecond = 0; // Passive resources per second

let loadedUpgrades = [];
let loadedBuildings = [];

// Load game data (upgrades and buildings)
async function loadGameData() {
    try {
        // Load the game data from the JSON file
        const response = await fetch('../json/data.json');
        const data = await response.json();

        // Handle upgrades
        const upgradeContainer = document.getElementById('upgrade');
        data.upgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.classList.add('upgrade-item');
            upgradeItem.id = upgrade.name;

            let iconOrImage = '';
            if (upgrade.image && upgrade.image.src) {
                iconOrImage = `<img src="${upgrade.image.src}" alt="${upgrade.image.alt}" class="upgrade-image">`;
            } else {
                iconOrImage = `<i class="${upgrade.icon}"></i>`;
            }

            upgradeItem.innerHTML = `
                ${iconOrImage}
                <div class="tooltip">${upgrade.name} - ${upgrade.cost} Ressources</div>
            `;

            upgradeItem.addEventListener('click', () => {
                purchaseUpgrade(upgrade);
            });

            upgradeContainer.appendChild(upgradeItem);
        });

        // Handle buildings
        const buildingContainer = document.getElementById('buildingsMaster');
        data.buildings.forEach(building => {
            const buildingItem = document.createElement('div');
            buildingItem.classList.add('building');
            buildingItem.id = building.name;

            let iconOrImage = '';
            if (building.image && building.image.src) {
                iconOrImage = `<img src="${building.image.src}" alt="${building.image.alt}" class="building-image">`;
            } else {
                iconOrImage = `<i class="${building.icon}"></i>`;
            }

            buildingItem.innerHTML = `
                <div class="building-icon">${iconOrImage}</div>
                <div class="building-info">
                    <span class="building-name">${building.name}</span>
                    <span class="building-cost">${building.cost} Ressources</span>
                </div>
                <div class="building-count" id="${building.name}Count">x${building.count}</div>
            `;

            buildingItem.addEventListener('click', () => {
                purchaseBuilding(building);
            });

            buildingContainer.appendChild(buildingItem);
        });
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Call loadGameData on page load
window.onload = loadGameData;

// ======================= Upgrade Logic ======================= //
// This function handles the purchase of upgrades
function purchaseUpgrade(upgrade) {
    if (resources >= upgrade.cost) {
        resources -= upgrade.cost;
        if (upgrade.type === 'click') {
            perClick += upgrade.effect; // Increase resources per click
        } else if (upgrade.type === 'passive') {
            cookiesPerSecond += upgrade.effect; // Increase passive resource generation
        }

        updateResourceCounts();
        document.getElementById(upgrade.name).style.display = 'none'; // Hide the upgrade after purchasing
    }
}

// ======================= Building Logic ======================= //
// This function allows the player to buy buildings that increase passive resource generation
function purchaseBuilding(building) {
    if (resources >= building.cost) {
        resources -= building.cost; // Deduct the cost of the building from resources
        building.count++; // Increase the count of the building
        cookiesPerSecond += building.effect; // Add the building's effect to passive resource generation
        updateResourceCounts();

        // Update the building count display
        document.getElementById(`${building.name}Count`).textContent = `x${building.count}`;

        // Update the building cost based on the number of buildings owned (for scaling effect)
        building.cost = Math.floor(building.cost * 1.15); // Increase the cost by 15% for next purchase
        document.getElementById(`${building.name}`).querySelector('.building-cost').textContent = `${building.cost} Ressources`;
    }
}

// ======================= Update Resource Counts ======================= //
// This function updates the number of resources and resources per second
function updateResourceCounts() {
    resources += perClick; // Add resources earned per click
    document.getElementById('cookieCounter').textContent = `${resources} Ressources`; // Update resource count display
    resources += cookiesPerSecond; // Add resources earned passively every second
    document.getElementById('cookiePerSecond').textContent = `${cookiesPerSecond} Ressources/s`; // Update passive resource generation display
}

// ======================= Passive Resource Generation ======================= //
// Automatically adds resources every 1000 milliseconds (1 second)
setInterval(() => {
    updateResourceCounts(); // Call the function to update resources
}, 1000); // Interval set to 1000 milliseconds (1 second)

// ======================= Click Effects ======================= //
// When you click on the cookie or rock, increase the resources
const cookie = document.getElementById('cookie'); 
cookie.addEventListener('click', (e) => {
    resources += perClick;
    updateResourceCounts();
    spawnFloatingText(e.clientX, e.clientY, `+${perClick}`);
    spawnRockParticles(e);
});

// ======================= Floating Text Effect ======================= //
// This function creates a floating "+1" or "+X" text effect
function spawnFloatingText(x, y, text) {
    const floatText = document.createElement('div');
    floatText.textContent = text;
    floatText.className = 'floating-text';
    floatText.style.left = `${x}px`;
    floatText.style.top = `${y}px`;
    document.body.appendChild(floatText);

    requestAnimationFrame(() => {
        floatText.style.transform = 'translateY(-150px)';
        floatText.style.opacity = '0.2';
    });

    setTimeout(() => floatText.remove(), 600);
}

// ======================= Rock Particle Effect ======================= //
// This function creates tiny rock particles that fly out when you click
function spawnRockParticles(e) {
    const count = 1;
    const cookie = document.getElementById('cookie');
    const rect = cookie.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('img');
        particle.src = './assets/tiny-rock.png';
        particle.classList.add('rock-particle');
        const randomDirection = Math.random() * 360;
        const randomDistance = Math.random() * 50 + 100;
        const x = Math.cos(randomDirection * Math.PI / 180) * randomDistance;
        const y = Math.sin(randomDirection * Math.PI / 180) * randomDistance;

        particle.style.left = `${e.clientX - rect.left - 100}px`;
        particle.style.top = `${e.clientY - rect.top - 100}px`;
        cookie.appendChild(particle);

        setTimeout(() => {
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = '0';
            setTimeout(() => particle.remove(), 500);
        }, 10);
    }
}

// ======================= Cursor Logic ======================= //
const cursor = document.createElement('img');
cursor.src = '../assets/pixel-art-pickaxe-vector-illustration-retro-video-game-design_1292377-22737-removebg-preview.png'; 
cursor.style.position = 'absolute'; 
cursor.style.width = '52px'; 
cursor.style.height = '52px';
cursor.style.pointerEvents = 'none'; 
cursor.style.zIndex = '9999'; 
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => { 
    cursor.style.left = `${e.pageX - 16}px`; 
    cursor.style.top = `${e.pageY - 16}px`; 
});

// ======================= Hide Cursor in Upgrade Section ======================= //
const sectionRight = document.getElementById('sectionRight');   
sectionRight.addEventListener('mouseenter', () => {
    cursor.style.display = 'none'; 
});

sectionRight.addEventListener('mouseleave', () => {     
    cursor.style.display = 'block'; 
});

// ======================= Mining Sound ======================= //
const miningSound = new Audio('./assets/hammer-2.mp3'); 

cookie.addEventListener('click', (e) => {
    miningSound.currentTime = 0; 
    miningSound.play(); 
    cursor.classList.add('cursor-shake');
    setTimeout(() => cursor.classList.remove('cursor-shake'), 300);
    const cookieImg = cookie.querySelector('img');
    cookieImg.classList.add('shake-pickaxe');
    setTimeout(() => cookieImg.classList.remove('shake-pickaxe'), 300);
});


function updateClickableMaterial() {
    const materials = [
        { src: "assets/charbonpixelart.png", threshold: 0 },
        { src: "assets/pixel-art-rock-pile-detailed-8-bit-illustration-grey-stones_1292377-12348-removebg-preview.png", threshold: 51 },
        { src: "assets/silverpixelart.png", threshold: 201 },
        { src: "assets/Goldpixelart.png", threshold: 501 },
        { src: "assets/diamondpixelart.png", threshold: 1001 }
    ];

    const currentMaterial = materials.find(material => resources >= material.threshold);
    if (currentMaterial) {
        const cookieImg = document.querySelector("#cookie img");
        cookieImg.src = currentMaterial.src; // Update the image source
    }
}

// Update material on click
cookie.addEventListener("click", () => {
    resources += perClick; // Increase resources
    updateResourceCounts(); // Update resource displays
    updateClickableMaterial(); // Check and update the clickable material
});


materials.forEach(material => {
    const img = new Image();
    img.src = material.src;
});