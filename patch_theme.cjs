const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const CustomTheme = \(\) => \([\s\S]*?\}\} \/>\n  \);/;

const newTheme = `const CustomTheme = () => {
    const t = settings.theme || {};
    const gradientColors = t.gradientColors && t.gradientColors.length > 0 
      ? t.gradientColors.join(', ') 
      : (t.gradientStart && t.gradientEnd ? \`\${t.gradientStart}, \${t.gradientEnd}\` : '#4f46e5, #ec4899');
    
    const gradient = t.isGradient 
      ? \`linear-gradient(\${t.gradientDirection || 'to right'}, \${gradientColors})\`
      : (t.accentColor || '#4f46e5');

    const buttonStyle = t.buttonColor || gradient;
    const headerBg = t.headerColor || 'transparent';
    const paddingSz = t.paddingSize || '1.5rem';

    return (
      <style dangerouslySetInnerHTML={{__html: \`
        :root {
          --accent-base: \${t.accentColor || '#4f46e5'};
          --accent-gradient: \${gradient};
          --button-bg: \${buttonStyle};
          --header-bg: \${headerBg};
          --app-padding: \${paddingSz};
        }
        /* Buttons overriding */
        button.bg-indigo-600, button.bg-indigo-500, .bg-indigo-600, .bg-indigo-500, .bg-purple-600 {
          background: var(--button-bg) !important;
        }
        /* Text overriding */
        .text-indigo-500, .text-indigo-600, .text-purple-500, .text-purple-600 {
          color: var(--accent-base) !important;
        }
        /* Borders */
        .border-indigo-500, .border-purple-500 {
          border-color: var(--accent-base) !important;
        }
        /* App Layout Overrides */
        main {
          padding: var(--app-padding) !important;
        }
        nav {
          background-color: var(--header-bg) !important;
        }
      \`}} />
    );
  };`;

code = code.replace(regex, newTheme);
fs.writeFileSync('src/App.tsx', code);
