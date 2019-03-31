import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';

const app = {
  initMenu: function(){
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);

        /* save parsedResponse at thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();

      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initPages: function(){
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    //thisApp.activePage(thisApp.pages[0].id);

    let pagesMatchingHash = [];
    if(window.location.hash.lenght >2){
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });

      thisApp.activePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    }

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();


        /* TODO: get page id from href */
        const href = clickedElement.getAttribute('href');
        const id = href.replace('#', '');

        /* TODO: active page */
        thisApp.activePage(id);
      });
    }
  },

  activePage: function(pageId){
    const thisApp = this;

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let activePage of thisApp.pages){
      activePage.classList.toggle(classNames.pages.active, activePage.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
  },

};

app.init();
