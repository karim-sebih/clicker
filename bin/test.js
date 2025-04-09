document.addEventListener('DOMContentLoaded', async function() {
        let pts = JSON.parse(localStorage.getItem('pts')) || 0; 
        ptsCont.innerText = pts;
        let cps = JSON.parse(localStorage.getItem('cps')) || 0;

        const dataShop = await getData();

        let shop = JSON.parse(localStorage.getItem('shop')) || dataShop;
        console.log(shop);

        const store = document.getElementById("shop");

        let i = 1;

        shop.forEach(item => {
            console.log(item);

            let itemCont = document.createElement('div');
            itemCont.id = 'item'+i;
            itemCont.classList.add('shop-item');

            store.appendChild(itemCont);
            
            let itemNameCont = document.createElement('span');
            itemNameCont.classList.add('item-name');
            itemNameCont.innerText = item.name;

            itemCont.appendChild(itemNameCont);

            let itemPriceCont = document.createElement('span');
            itemPriceCont.classList.add('item-price');
            itemPriceCont.id = 'price'+i;
            itemPriceCont.innerText = item.price;

            itemCont.appendChild(itemPriceCont);

            let itemOwnedCont = document.createElement('span');
            itemOwnedCont.classList.add('item-owned');
            itemOwnedCont.id = 'owned'+i;
            itemOwnedCont.innerText = item.owned;

            itemCont.appendChild(itemOwnedCont);

            itemCont.addEventListener('click', () => buy(item, i));
            
            i++;    
        });

        clicker.addEventListener('click', function(){        // Foction pour obtenir des points
            pts++;
            ptsCont.textContent = Math.floor(pts);
            console.log('pts = '+pts);
        });
        
        function addCps() {                                  // Ajoute les cps
            pts += cps/100;
            ptsCont.textContent = Math.floor(pts);
        }
        setInterval(addCps, 10);                             // Appelle la fonction qui ajoute les cps chaque 10 ms
        function isBuyable () {
            if (pts>=price1) {
                price1Cont.classList.remove('unbuyable');    // class '.unbuyable' = CCS pour afficher le prix en ROUGE
            } else {
                price1Cont.classList.add('unbuyable');
        }};
        
    });


// récupérér les données du shop sur le JSON si le localstorage est vide
async function getData() {
    const res =  await fetch('http://localhost/clicker/assets/shop.json');
    const data = await res.json();
    return data;
};
    

function buy(item, id){                          // Fonction pour acheter l'item 1       
    console.log(item);
    const priceCont = document.getElementById('price'+id);
    const ownedCont = document.getElementById('owned'+id);
    if (priceCont && ownedCont) {
        if (pts >= item.price) {
            pts -= item.price;
            item.price = Math.ceil(item.price * 1.15);
            cps += item.cps;
            item.owned++;
            ptsCont.textContent = Math.floor(pts);
            cpsCont.textContent = Math.round(cps * 10) / 10;
            priceCont.textContent = item.price;
            ownedCont.textContent = `(tu as ${item.owned})`;
        } else {
            console.log(`Pas assez de points pour acheter l'item ${id}`);
        }
    } else {
        console.error(`Éléments avec les IDs price${id} ou owned${id} non trouvés.`);
    }
    // if (pts <= item.price){                                // Vérifie que l'item est achetable
    //     pts -= item.price;
    //     item.price *= 1.15;                              // Augmente le prix de manière logique
    //     // price1 =  Math.round(price1);
    //     cps += item.cps;                             // Augmente le nombre total de cps
    //     item.owned++;
    //     // item1cps *= 1.2;
    //     ptsCont.textContent = Math.floor(pts);       // Affiche le nbe de pts en INT arrondi vers le bas 
    //     cpsCont.textContent = Math.round(cps * 10)/10;  // Affiche le nombre de CPS arrondi (1 chiffre après la virgule)
    //     priceCont.textContent = Math.ceil(item.price);  // Affiche le prix actuel de l'item arrondi à l'INT supérieur
    //     ownedCont.textContent = `(tu as ${item.owned})`;  // Affiche le nombre d'item 1 possédés
};

    // setInterval(isBuyable, 10);                          // Vérifie si l'item 1 est achetable chaque 10 ms

