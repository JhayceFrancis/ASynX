const EventEmitter = require('events');

class MpvScrobbler extends EventEmitter {
  constructor(pipeName) {
    super();
    this.pipeName = pipeName;
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

module.exports = MpvScrobbler;
