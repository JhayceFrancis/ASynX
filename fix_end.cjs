const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// I removed 2 div closures from the end earlier, but the script replaced it with only 1.
// Let's add the missing </div> back.
content = content.replace('        </div>\n    </form>', '        </div>\n      </div>\n    </form>');
fs.writeFileSync('src/components/SettingsView.tsx', content);
