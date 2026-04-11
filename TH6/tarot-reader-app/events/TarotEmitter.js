const EventEmitter = require('events');

class TarotEmitter extends EventEmitter {
  constructor() {
    super();
    this.on('cardDrawn', this.handleCardDrawn.bind(this));
    this.on('readingComplete', this.handleReadingComplete.bind(this));
  }

  drawCard(card) {
    console.log(`Drawing card: ${card}`);
    this.emit('cardDrawn', card);
  }

  completeReading(reading) {
    console.log('Reading complete');
    this.emit('readingComplete', reading);
  }

  handleCardDrawn(card) {
    console.log(`Mystical energies reveal: ${card}`);
  }

  handleReadingComplete(reading) {
    console.log(`The reading concludes: ${reading}`);
  }
}

module.exports = TarotEmitter;