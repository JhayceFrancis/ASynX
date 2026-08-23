const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const views = [
  'SyncMatrixView',
  'ConflictResolutionView',
  'PlexWebhookView',
  'ExtensionCompanionView',
  'SettingsView',
  'DatabaseView',
  'ApiDocumentationView',
  'DockerBackendView',
  'SystemHealthView',
  'SyncPerformanceView'
];

views.forEach(view => {
  const regex = new RegExp(`import { ${view} } from './components/${view}';`, 'g');
  content = content.replace(regex, `const ${view} = React.lazy(() => import('./components/${view}').then(module => ({ default: module.${view} })));`);
});

// BookmarkTab also
content = content.replace(
  "import { BookmarkTab } from './components/bookmarks/BookmarkTab';",
  "const BookmarkTab = React.lazy(() => import('./components/bookmarks/BookmarkTab').then(module => ({ default: module.BookmarkTab })));"
);

// We need to wrap the switch statement or conditional rendering in Suspense.
// Let's check where the views are rendered. They are wrapped in <AnimatePresence mode="wait"><motion.div>
// Let's add Suspense inside the motion.div
if (!content.includes('<React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>')) {
  content = content.replace(
    /(<AnimatePresence mode="wait">\s*<motion\.div[^>]*>)/,
    '$1\n          <React.Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>'
  );
  content = content.replace(
    /(\s*<\/motion\.div>\s*<\/AnimatePresence>)/,
    '\n          </React.Suspense>$1'
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('Optimized App.tsx');
