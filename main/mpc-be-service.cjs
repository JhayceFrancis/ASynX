const EventEmitter = require('events');

class MpcBeScrobbler extends EventEmitter {
  constructor(port) {
    super();
    this.port = port;
    this.intervalId = null;
  }
  start(intervalMs) {
    this.intervalId = setInterval(() => {
      // In a real scenario, this fetches from http://localhost:13579/variables.html
      // We will just emit a dummy or ignore
    }, intervalMs);
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

module.exports = MpcBeScrobbler;
