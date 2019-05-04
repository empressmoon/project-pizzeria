import {templates, select} from '../settings.js';
import {utils} from '../utils.js';


function render(){

  const generatedHTML = templates.homePage();

  const homePage = utils.createDOMFromHTML(generatedHTML);

  const homeContainer = document.querySelector(select.containerOf.homePage);

  homeContainer.appendChild(homePage);

  console.log(generatedHTML);
}

render();
