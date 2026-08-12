const fs = require('fs');

const file = 'src/components/SettingsView.tsx';
let content = fs.readFileSync(file, 'utf8');

const testBtn = `            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
             <button
              onClick={async () => {
                if (!formState.remoteSync?.serverUrl) {
                   alert("Please enter a Remote Server URL.");
                   return;
                }
                try {
                  const res = await fetch(\`\${formState.remoteSync.serverUrl}/api/remote-sync/info\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: formState.remoteSync.apiKey })
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert(\`\${data.message}\\nVersion: \${data.version}\`);
                  } else {
                    alert(data.error || 'Failed to connect. Invalid API Key or Server.');
                  }
                } catch (err) {
                  alert("Failed to connect to the server. Is it running and reachable?");
                }
              }}
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black hover:bg-neutral-700 dark:hover:bg-neutral-300 rounded-xl text-xs font-semibold transition"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>`;

content = content.replace(`            />
          </div>
        </div>
      </div>`, testBtn);

fs.writeFileSync(file, content);
