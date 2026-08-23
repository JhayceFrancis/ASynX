const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

let target = `    const buttonStyle = t.buttonColor || gradient;
    const headerBg = t.headerColor || 'transparent';
    const paddingSz = t.paddingSize || '1.5rem';
    const btnText = t.buttonTextColor || '#ffffff';`;

let replacement = `    const buttonStyle = t.buttonColor || gradient;
    
    // Header background (gradient or solid)
    let headerBg = t.headerColor || 'transparent';
    if (t.headerIsGradient && t.headerGradientColors && t.headerGradientColors.length > 0) {
       const hGradColors = t.headerGradientColors.join(', ');
       headerBg = t.headerGradientDirection === 'circle at center'
         ? \`radial-gradient(\${t.headerGradientDirection}, \${hGradColors})\`
         : \`linear-gradient(\${t.headerGradientDirection || 'to right'}, \${hGradColors})\`;
    }
    
    const paddingSz = t.paddingSize || '1.5rem';
    const btnText = t.buttonTextColor || '#ffffff';
    const icnColor = t.iconColor || 'currentColor';`;

if (content.includes(target)) {
   content = content.replace(target, replacement);
   console.log('App.tsx part 1 patched.');
} else {
   console.log('App.tsx part 1 not found.');
}

let target2 = `        /* Text overriding */`;
let replacement2 = `        /* Icon overriding */
        svg.lucide {
           color: \${icnColor} !important;
        }
        
        /* Text overriding */`;

if (content.includes(target2)) {
   content = content.replace(target2, replacement2);
   console.log('App.tsx part 2 patched.');
} else {
   console.log('App.tsx part 2 not found.');
}

fs.writeFileSync('src/App.tsx', content);
