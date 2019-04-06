/* global rangeSlider */

import {utils} from '../utils.js';
import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.renderValue();
    thisWidget.parseValue();
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input;
  }

  initPlugin(){
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input;
    });
  }

  parseValue(newValue){
    utils.numberToHour(newValue);

  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output = thisWidget.value;
    console.log('widget-value:', thisWidget.value);
  }

}
