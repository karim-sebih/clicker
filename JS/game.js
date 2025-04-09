        let pts = JSON.parse(localStorage.getItem('pts')) || 0;
        let ptsPerClick = 1;
        let cps = JSON.parse(localStorage.getItem('cps')) || 0;

        const ptsCont = document.getElementById('nbe-pts');
        const cpsCont = document.getElementById('cps');

        document.getElementById('clicker').addEventListener('click', function() {
            pts += ptsPerClick;
            document.getElementById('nbe-pts').innerText = pts;
        });

        function loadShopItems() {
            return new Promise((resolve, reject) => {
                // Vérifie si les données du magasin sont dans le localStorage
                const shopData = localStorage.getItem('shopData');
                if (shopData) {
                    // Si oui, les parse et les utilise
                    console.log('Données chargées depuis le localStorage');
                    resolve(JSON.parse(shopData));
                } else {
                    // Sinon, charge les données depuis le fichier JSON
                    fetch('shop.json')
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Erreur réseau lors de la récupération du JSON');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Stocke les données dans le localStorage
                            localStorage.setItem('shopData', JSON.stringify(data));
                            console.log('Données chargées depuis le fichier JSON');
                            resolve(data);
                        })
                        .catch(error => reject(error));
                }
            });
        }

        loadShopItems().then(data => {
            console.log('Données du magasin :', data);
            const store = document.getElementById('shop');
            let i = 0;
            ptsCont.innerText = pts;
            data.forEach(item => {
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
                itemPriceCont.classList.add('unbuyable');
                itemPriceCont.innerText = item.price;
        
                itemCont.appendChild(itemPriceCont);
        
                let itemOwnedCont = document.createElement('span');
                itemOwnedCont.classList.add('item-owned');
                itemOwnedCont.innerText = item.owned;
        
                itemCont.appendChild(itemOwnedCont);
                
                i++;      
            
        
                itemCont.addEventListener('click', function() {
                    if (pts >= item.price) {
                        pts -= item.price;
                        item.price = Math.ceil(item.price * 1.15);
                        cps += item.cps;
                        item.owned++;
                        ptsCont.textContent = Math.floor(pts);
                        cpsCont.textContent = Math.round(cps * 10) / 10;
                        itemPriceCont.textContent = item.price;
                        itemOwnedCont.textContent = item.owned;
                    }
                });

                function isBuyable () {
                    if (pts>=item.price) {    // class '.unbuyable' = CCS pour afficher le prix en ROUGE
                        itemPriceCont.classList.replace('unbuyable', 'buyable');
                    } else {
                        itemPriceCont.classList.replace('buyable', 'unbuyable');
                }};
                setInterval(isBuyable, 10);  
                function saveProgress() {
                    localStorage.setItem('pts', pts);
                    localStorage.setItem('cps', cps);
                    localStorage.setItem('shopData', JSON.stringify(data));
                }
                setInterval(saveProgress, 1000);
            });
        }).catch(error => {
            console.error('Erreur lors du chargement des données du magasin :', error);
        });

        function addCps() {                                  // Ajoute les cps
            pts += cps/100;
            ptsCont.textContent = Math.floor(pts);
        }
        setInterval(addCps, 10);

                             