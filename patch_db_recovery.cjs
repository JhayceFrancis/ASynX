const fs = require('fs');
let content = fs.readFileSync('db.ts', 'utf8');

const oldCatchBlock = `    } catch (err) {
      console.error("Failed to decrypt DB, using default data.", err);
      return defaultData;
    }`;

const newCatchBlock = `    } catch (err) {
      console.error("[Database] Failed to decrypt DB (Cryptographic integrity check failed or file corrupted):", err);
      
      // --- Database Maintenance & Recovery ---
      try {
        const bakDir = path.join(dataDir, '.bak');
        if (!fs.existsSync(bakDir)) {
          fs.mkdirSync(bakDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const corruptedFilePath = path.join(bakDir, \`asynx_data.corrupted.\${timestamp}.bak\`);
        
        // Isolate the damaged file
        fs.renameSync(DB_FILE, corruptedFilePath);
        console.warn(\`[Database] Corrupted database isolated to: \${corruptedFilePath}\`);
        console.warn("[Database] Initiating fresh database recovery process...");
      } catch (backupErr) {
        console.error("[Database] Failed to isolate corrupted database:", backupErr);
      }
      
      saveDb(defaultData);
      return defaultData;
    }`;

if (content.includes('console.error("Failed to decrypt DB, using default data.", err);')) {
  content = content.replace(oldCatchBlock, newCatchBlock);
  fs.writeFileSync('db.ts', content);
  console.log("Successfully patched db.ts");
} else {
  console.log("Could not find exact block to replace");
}
