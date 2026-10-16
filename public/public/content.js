// SUCCEEDS across Chrome, Edge, and Safari!
// Sends a message to public/background.js, which performs the fetch outside the https:// sandbox
const response = await requestLocalAsynxApi('/api/sync/resolve?mal=51415');
if (response && response.success) {
  console.log('Resolved Cross-Platform Links:', response.data.links);
}
