const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetListener = `    socket.on('state_change', (data) => {`;
const injectListener = `    socket.on('push_notification', (data) => {
      // Browser Native Push if permitted
      if (Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/krainstream.svg'
        });
      }
    });
`;

if (code.includes(targetListener) && !code.includes('push_notification')) {
   code = code.replace(targetListener, injectListener + '\\n' + targetListener);
   fs.writeFileSync('src/App.tsx', code);
   console.log('Added native push to App.tsx');
}
