    clicker.addEventListener('click', function(){        // Foction pour obtenir des points
        pts++;
        ptsCont.textContent = Math.floor(pts);
    });
    item1.addEventListener('click', function(){          // Fonction pour acheter l'item 1
        if (pts>=price1){                                // Vérifie que l'item est achetable
            pts -= price1;
            price1 *= 1.15;                              // Augmente le prix de manière logique
            // price1 =  Math.round(price1);
            cps += item1cps;                             // Augmente le nombre total de cps
            item1Possessed++;
            // item1cps *= 1.2;
            ptsCont.textContent = Math.floor(pts);       // Affiche le nbe de pts en INT arrondi vers le bas 
            cpsCont.textContent = Math.round(cps * 10)/10;  // Affiche le nombre de CPS arrondi (1 chiffre après la virgule)
            price1Cont.textContent = Math.ceil(price1);  // Affiche le prix actuel de l'item arrondi à l'INT supérieur
            possessed1Cont.textContent = `(tu as ${item1Possessed})`;  // Affiche le nombre d'item 1 possédés
    }});
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
    setInterval(isBuyable, 10);                          // Vérifie si l'item 1 est achetable chaque 10 ms