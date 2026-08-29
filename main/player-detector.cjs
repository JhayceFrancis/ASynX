const { exec } = require('child_process');

class PlayerDetector {
  /**
   * Scans Windows processes to find recognised media players.
   * Returns 'mpc-be', 'mpv', 'vlc', or null.
   */
  static getActivePlayer() {
    return new Promise((resolve) => {
      // Execute native Windows tasklist in CSV format without headers
      exec('tasklist /FO CSV /NH', (err, stdout) => {
        if (err) return resolve(null);
        
        const output = stdout.toLowerCase();
        
        // Priority order (if multiple are open, the first matched wins)
        if (output.includes('mpc-be64.exe') || output.includes('mpc-be.exe')) {
          return resolve('mpc-be');
        }
        if (output.includes('mpv.exe')) {
          return resolve('mpv');
        }
        if (output.includes('vlc.exe')) {
          return resolve('vlc');
        }
        
        resolve(null);
      });
    });
  }
}

module.exports = PlayerDetector;
