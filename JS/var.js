const clicker = document.getElementById('clicker');  // Objet sur lequel on clique pour gagner des points
const ptsCont = document.getElementById('nbe-pts');  // Cont pour Container, compteur de points gagnés
const cpsCont = document.getElementById('cps');      // cps = Clicks (Auto) Par Seconde
const price1Cont = document.getElementById('price-1');  // Container du prix de l'item 1
const possessed1Cont = document.getElementById('possessed-1');
const item1Cont = document.getElementById('item-1');


let pts = 0;
let cps = 0;

const name1 = 'Curseur'
let price1 = 15;                                     // Prix de base de l'item 1
let item1cps = 0.1;                                  // Nombre de cps gagnés lors de l'achat de l'item 1
let item1Possessed = 0;                              // Nombre d'item 1 possédés par le joueur

let item1 = {name: name1, price: price1, cps: item1cps, poss: item1Possessed};