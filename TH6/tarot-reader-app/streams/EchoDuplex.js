const { Duplex } = require('stream');

class EchoDuplex extends Duplex {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.buffer = [];
  }

  _write(chunk, encoding, callback) {
    // Store the chunk
    this.buffer.push(chunk);
    // Echo it back with modification
    const echoed = { ...chunk, echoed: true, echoTime: Date.now() };
    this.push(echoed);
    callback();
  }

  _read(size) {
    // Read from buffer if available
    if (this.buffer.length > 0) {
      const chunk = this.buffer.shift();
      this.push(chunk);
    } else {
      this.push(null); // End of stream
    }
  }

  _final(callback) {
    // Clean up
    this.buffer = [];
    callback();
  }
}

module.exports = EchoDuplex;