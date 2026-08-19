const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add state for isOffline
code = code.replace(/const \[isSyncing, setIsSyncing\] = useState\(false\);/, "const [isSyncing, setIsSyncing] = useState(false);\n  const [isOffline, setIsOffline] = useState(false);");

// Cache implementation in safeFetchJson
const newSafeFetchJson = `const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP error \${res.status}\`);
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = JSON.parse(text);
      }
      
      // Cache successful response in localStorage
      localStorage.setItem('asynx_cache_' + url, JSON.stringify(data));
      setIsOffline(false);
      return data;
    } catch (e) {
      console.warn(\`Failed to fetch \${url}, falling back to local cache. Error: \`, e);
      setIsOffline(true);
      const cached = localStorage.getItem('asynx_cache_' + url);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch(err) {}
      }
      return null;
    }
  };`;

code = code.replace(/const safeFetchJson = async \(url: string\) => \{[\s\S]*?\} catch \{\s*return null;\s*\}\s*\};/, newSafeFetchJson);

// Pass isOffline to Win11StatusBar
code = code.replace(/isSyncing=\{isSyncing\}/, "isSyncing={isSyncing}\n        isOffline={isOffline}");


fs.writeFileSync('src/App.tsx', code);
