const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const target = `  theme?: {
    accentColor?: string;
    isGradient?: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    headerColor?: string;
    buttonColor?: string;
    paddingSize?: string;
    buttonTextColor?: string;
    gradientColors?: string[];
    gradientDirection?: string;
    appBackgroundGradient?: string;
    subheaderColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    layoutDensity?: 'compact' | 'comfortable' | 'spacious';
    cardStyle?: 'flat' | 'glass' | 'neumorphic' | 'outlined';
    animationSpeed?: 'fast' | 'normal' | 'slow' | 'none';
    defaultViewMode?: 'grid' | 'list' | 'block';
  };`;

const replacement = `  theme?: {
    accentColor?: string;
    isGradient?: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    headerColor?: string;
    headerIsGradient?: boolean;
    headerGradientColors?: string[];
    headerGradientDirection?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    iconColor?: string;
    paddingSize?: string;
    gradientColors?: string[];
    gradientDirection?: string;
    appBackgroundGradient?: string;
    subheaderColor?: string;
    subheadingText?: string;
    borderRadius?: string;
    fontFamily?: string;
    layoutDensity?: 'compact' | 'comfortable' | 'spacious';
    cardStyle?: 'flat' | 'glass' | 'neumorphic' | 'outlined';
    animationSpeed?: 'fast' | 'normal' | 'slow' | 'none';
    defaultViewMode?: 'grid' | 'list' | 'block';
  };`;

if(content.includes(target)) {
    fs.writeFileSync('src/types.ts', content.replace(target, replacement));
    console.log("Patched types.ts!");
} else {
    console.log("Could not find target in types.ts. Check spacing.");
}
