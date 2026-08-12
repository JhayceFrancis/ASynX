const fs = require('fs');

const file = 'README.md';
let content = fs.readFileSync(file, 'utf8');

const oldDockerText = `The server will build and boot up on port \`3000\`. 
Your encrypted database will be safely stored and persisted in the newly created \`./data\` folder on your host machine.

#### Configuring the App to Use Your Remote Sync Server:`;

const newDockerText = `The server will build and boot up on port \`3000\`. 
Your encrypted database will be safely stored and persisted in the newly created \`./data\` folder on your host machine.

#### Setting Your Credentials (Docker Environment Variables):
Before starting the container, you can edit the \`docker-compose.yml\` file to set your strict server bind addresses and remote sync credentials:
- \`HOST\`: The address the backend binds to (default: \`0.0.0.0\` to allow external traffic). You can set this to a specific IP or SSL Hostname.
- \`REMOTE_SYNC_API_KEY\`: A secure password/key you define. The desktop client MUST provide this key to push/pull data to the server.

#### Configuring the App to Use Your Remote Sync Server:`;

content = content.replace(oldDockerText, newDockerText);
fs.writeFileSync(file, content);
