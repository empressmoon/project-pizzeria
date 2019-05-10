import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';
import {select, settings, classNames, templates} from './settings.js';
import {utils} from './utils.js';

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

    //thisApp.activatePage(thisApp.pages[0].id);

    let pagesMatchingHash = [];
    if(window.location.hash.lenght > 2){
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });

      thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    }

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        const href = clickedElement.getAttribute('href');
        const id = href.replace('#', '');

        thisApp.activatePage(id);
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let activatePage of thisApp.pages){
      activatePage.classList.toggle(classNames.pages.active, activatePage.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
  },

  initHomePage: function(){
    const thisApp = this;

    const generatedHTML = templates.homePage();

    const homePage = utils.createDOMFromHTML(generatedHTML);

    const homeContainer = document.querySelector(select.containerOf.homePage);

    homeContainer.appendChild(homePage);

    const orderLink = document.querySelector(select.containerOf.orderLink);
    const bookLink = document.querySelector(select.containerOf.bookLink);

    orderLink.addEventListener('click', function(){
      thisApp.activatePage('order');
    });

    bookLink.addEventListener('click', function(){
      thisApp.activatePage('booking');
    });
  },

  initBooking: function(){
    const thisApp = this;

    const bookingElem = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingElem);
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
    thisApp.initBooking();
    thisApp.initHomePage();
  },
};

app.init();
