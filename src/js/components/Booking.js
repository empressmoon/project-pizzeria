import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking{
  constructor(bookingData){
    const thisBooking = this;

    thisBooking.render(bookingData);
    thisBooking.initWidgets();
  }

  render(bookingData){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingData;

    thisBooking.bookingData = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom.wrapper.appendChild(thisBooking.bookingData);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}
