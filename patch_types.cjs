const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const layoutTypes = `
export interface PanelConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  bgColor?: string;
  isStatic?: boolean;
}

export type TabLayouts = Record<string, PanelConfig[]>;

`;

code = layoutTypes + code;

code = code.replace(
  /syncRules: \{/,
  `customLayouts?: TabLayouts;
  syncRules: {`
);

fs.writeFileSync('src/types.ts', code);
