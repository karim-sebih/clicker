// ================================================ Game Logic ================================================= //

// This variable keeps track of the resources you’ve mined
let resources = 0;



// ======================= Cursor Logic ======================= //
// Create a custom pickaxe image to replace the regular cursor
// Create the custom cursor (the pickaxe image)
const cursor = document.createElement('img');
cursor.src = '../assets/pixel-art-pickaxe-vector-illustration-retro-video-game-design_1292377-22737-removebg-preview.png';  // Ensure this path is correct
cursor.style.position = 'absolute'; // Position it absolutely so it can move freely
cursor.style.width = '52px';  // Adjust size if necessary
cursor.style.height = '52px'; // Adjust size if necessary
cursor.style.pointerEvents = 'none';  // Prevent it from interfering with clicks
cursor.style.zIndex = '9999';  // Make sure it is on top of everything else
document.body.appendChild(cursor);  // Add the cursor to the page

// Update cursor position based on mouse movement
document.addEventListener('mousemove', (e) => { 
    cursor.style.left = `${e.pageX - 16}px`;  // Position the cursor (adjust offset if needed)
    cursor.style.top = `${e.pageY - 16}px`;  // Position the cursor (adjust offset if needed)
});

// When hovering over the right section (Upgrade section), hide the cursor
const sectionRight = document.getElementById('sectionRight');   // Get the right section element (Upgrade section)

// Hide the cursor when entering sectionRight
sectionRight.addEventListener('mouseenter', () => {
    cursor.style.display = 'none'; // Hide the custom cursor
});

// Show the cursor again when leaving sectionRight
sectionRight.addEventListener('mouseleave', () => {     
    cursor.style.display = 'block'; // Show the custom cursor again
});

// ======================= Mining Sound ======================= //
// This loads a sound that plays whenever you click to mine
const miningSound = new Audio('./assets/hammer-2.mp3'); // Make sure the sound file path is correct

// ======================= Click Effects ======================= //
// Find the clickable object on the page, like a big rock or a cookie
const cookie = document.getElementById('cookie'); 

// When you click on the object, this function runs
cookie.addEventListener('click', (e) => {
    // Play the mining sound
    miningSound.currentTime = 0; // Start from the beginning of the sound
    miningSound.play(); // Play the sound

    // Make the pickaxe cursor do a shake animation
    cursor.classList.add('cursor-shake'); // Add a shaking class to the cursor
    setTimeout(() => cursor.classList.remove('cursor-shake'), 300); // Remove the shaking effect after 300 milliseconds

    // Shake the image of the clickable object (e.g., the rock)
    const cookieImg = cookie.querySelector('img');
    cookieImg.classList.add('shake-pickaxe'); // Add a shake effect to the rock image
    setTimeout(() => cookieImg.classList.remove('shake-pickaxe'), 300); // Remove it after 300 milliseconds

// Supprimer la ligne : const perClick = 1;


const currentCpc = parseFloat(localStorage.getItem('cpc')) || 1;
resources += currentCpc;
document.getElementById('cookieCounter').textContent = `${Math.floor(resources)} Ressources`;
spawnFloatingText(e.clientX, e.clientY, `+${Math.floor(currentCpc)}`);


    // Create tiny particles (like rocks flying out) near the click
    spawnRockParticles(e);
});

// ======================= Floating Text Effect ======================= //
// This function creates a floating "+1" or "+X" text effect
function spawnFloatingText(x, y, text) {
    const floatText = document.createElement('div'); // Create a new <div> for the floating text
    floatText.textContent = text; // Set the text (e.g., "+1")
    floatText.className = 'floating-text'; // Use a CSS class for the floating effect
    floatText.style.left = `${x}px`; // Position the text at the X (horizontal) position of the click
    floatText.style.top = `${y}px`; // Position the text at the Y (vertical) position of the click
    document.body.appendChild(floatText); // Add the floating text to the page

    // Animate the text to float upwards and fade out
    requestAnimationFrame(() => {
        floatText.style.transform = 'translateY(-150px)'; // Move it up by 150 pixels
        floatText.style.opacity = '0.2'; // Make it fade out to 30% opacity
    });

    // Remove the text after the animation is done (800 milliseconds later)
    setTimeout(() => floatText.remove(), 600);
}

// ======================= Rock Particle Effect ======================= //
// This function creates tiny rock particles that fly out when you click
function spawnRockParticles(e) {
    const count = 1; // Number of particles to create (you can increase this for more particles)
    const cookie = document.getElementById('cookie'); // Get the clickable object (e.g., the rock)
    const rect = cookie.getBoundingClientRect(); // Get the position and size of the object

    // Create the particles in a loop (1 particle in this case)
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('img'); // Create an image element for each particle
        particle.src = '../assets/'; // Set the image for the particle
        particle.classList.add('rock-particle'); // Add a CSS class for the particle's style and animation
        
        // Pick a random direction and distance for the particle to "fly"
        const randomDirection = Math.random() * 360; // Pick a random angle (0 to 360 degrees)
        const randomDistance = Math.random() * 50 + 100; // Random distance from 50 to 150 pixels

        // Calculate the particle's X and Y movement based on the random direction and distance
        const x = Math.cos(randomDirection * Math.PI / 180) * randomDistance; // X movement
        const y = Math.sin(randomDirection * Math.PI / 180) * randomDistance; // Y movement

        // Set the starting position of the particle (adjusted to center it on the click)
        particle.style.left = `${e.clientX - rect.left - 100}px`; // Align X position
        particle.style.top = `${e.clientY - rect.top - 100}px`; // Align Y position
        
        // Add the particle to the clickable object (e.g., the rock)
        cookie.appendChild(particle);

        // Make the particle move outward and fade away
        setTimeout(() => {
            particle.style.transform = `translate(${x}px, ${y}px)`; // Move in a random direction
            particle.style.opacity = '0'; // Fade out

            // Remove the particle after the animation is complete
            setTimeout(() => {
                particle.remove();
            }, 500); // Remove after half a second
        }, 10); // Slight delay so the animation starts properly
    }
}