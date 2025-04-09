document.addEventListener('DOMContentLoaded', async function() {
    let pts = JSON.parse(localStorage.getItem('pts')) || 0; 
    let cps = JSON.parse(localStorage.getItem('cps')) || 0;

    const dataShop = await getData();

    let shop = JSON.parse(localStorage.getItem('shop')) || dataShop;
    console.log(shop);

    const store = document.getElementById("shop");
    shop.forEach(item => {
        console.log(item);

        let i = 1;
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
        itemPriceCont.innerText = item.price;

        itemCont.appendChild(itemPriceCont);

        let itemOwnedCont = document.createElement('span');
        itemOwnedCont.classList.add('item-owned');
        itemOwnedCont.innerText = item.owned;

        itemCont.appendChild(itemOwnedCont);
        
        i++;
    });
});

// récupérér les données du shop sur le JSON si le localstorage est vide
async function getData() {
    const res =  await fetch('http://localhost/clicker/assets/shop.json');
    const data = await res.json();
    return data;
}