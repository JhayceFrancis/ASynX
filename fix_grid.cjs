const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `        {/* Section 5: Media Servers & Scrobbler */}`;
const replacement = `      </div>

      {/* Section 5: Media Servers & Scrobbler */}`;

if (content.includes(target) && !content.includes(replacement)) {
    content = content.replace(target, replacement);
    // Remove the extra </div> at the end of the form
    const endForm = `        </div>\n      </div>\n    </form>`;
    const newEndForm = `        </div>\n    </form>`;
    content = content.replace(endForm, newEndForm);
    fs.writeFileSync('src/components/SettingsView.tsx', content);
    console.log("Grid patched!");
} else {
    console.log("Grid patch failed.");
}
