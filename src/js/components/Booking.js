import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking{
  constructor(bookingData){
    const thisBooking = this;

    thisBooking.render(bookingData);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(bookingData){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.defaultValues = {
      date: utils.dateToStr(new Date()),
      hour: settings.hours.open,
      people: settings.amountWidget.defaultValue,
      duration: settings.amountWidget.defaultValue
    };

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingData;

    thisBooking.bookingData = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom.wrapper.appendChild(thisBooking.bookingData);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.inputPhone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.inputAddress = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

    thisBooking.setDefaultValues();
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      thisBooking.people = thisBooking.peopleAmount.value;

    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      thisBooking.duration = thisBooking.hoursAmount.value;
    });

    for(let table of thisBooking.dom.tables){
      const tableNumber = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      table.addEventListener('click', function(){
        event.preventDefault();
        table.classList.toggle(classNames.booking.tableBooked);
        thisBooking.table = tableNumber;
      });
    }

    thisBooking.starters = [];

    for(let starter of thisBooking.dom.starters){
      starter.addEventListener('change', function(){
        if(this.checked){
          thisBooking.starters.push(starter.value);
        } else {
          thisBooking.starters.splice(thisBooking.starters.indexOf(starter.value, 1));
        }
      });
    }

    thisBooking.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    //console.log('eventsRepeat', eventsRepeat);
    //console.log('bookings', bookings);
    //console.log('events:', eventsCurrent);

    for(let eventBooked of eventsCurrent){
      thisBooking.makeBooked(eventBooked.date, eventBooked.hour, eventBooked.duration, eventBooked.table);
    }

    for(let booking of bookings){
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }

    for(let eventRepeat of eventsRepeat){
      const minDate = utils.dateToStr(thisBooking.datePicker.minDate);
      const maxDate = utils.dateToStr(thisBooking.datePicker.maxDate);

      for(let i = minDate; i < maxDate; i = utils.dateToStr(utils.addDays(i, 1))){
        thisBooking.makeBooked(i, eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
      }
    }


    //thisBooking.updateDOM();

    console.log('thisBooking.booked:', thisBooking.booked);
  }

  makeBooked(eventDate, eventHour, eventDuration, eventTable){
    const thisBooking = this;

    const hour = utils.hourToNumber(eventHour);

    for(let i = hour; i < hour + eventDuration; i += 0.5){
      if(thisBooking.booked[eventDate]){

        if(thisBooking.booked[eventDate][i]){
          thisBooking.booked[eventDate][i].push(eventTable);
        } else {
          thisBooking.booked[eventDate][i] = [eventTable];
        }

      } else {
        thisBooking.booked[eventDate] = {
          [hour]: [eventTable]
        };
      }
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for(let table of thisBooking.dom.tables){

      const tableNumber = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      if(thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableNumber)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  setDefaultValues(){
    const thisBooking = this;

    thisBooking.hour = thisBooking.defaultValues.hour;
    thisBooking.date = thisBooking.defaultValues.date;
    thisBooking.people = thisBooking.defaultValues.people;
    thisBooking.duration = thisBooking.defaultValues.duration;
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.table,
      ppl: thisBooking.people,
      duration: thisBooking.duration,
      Phone: thisBooking.dom.inputPhone.value,
      Address: thisBooking.dom.inputAddress.value,
      starters: thisBooking.starters,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        thisBooking.dom.form.reset();
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        //thisBooking.makeBooked(thisBooking.date, thisBooking.hour, thisBooking.duration, thisBooking.table);
      });
  }
}
