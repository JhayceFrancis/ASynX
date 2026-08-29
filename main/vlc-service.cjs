const EventEmitter = require('events');

class VlcScrobbler extends EventEmitter {
  constructor(password, port) {
    super();
    this.password = password;
    this.port = port;
    this.intervalId = null;
  }
  start(intervalMs) {
    this.intervalId = setInterval(() => {
      // Dummy
    }, intervalMs);
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

module.exports = VlcScrobbler;
