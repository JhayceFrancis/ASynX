const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Remove padding on subheader items as requested
content = content.replace('py-0.5 flex items-center', 'flex items-center');
content = content.replace('select-none py-1', 'select-none');

// 2. Add the NotificationTicker to the unscrolled view (under the subheader, same height)
// To place it "under the subheading from both ends and same height of subheading", we can 
// wrap the `activeTabNode` in a container that stacks them. Wait, "same height of subheading" 
// implies it might be a 2-row layout in the subheader, OR just replacing space.
// "On scroll and merged heading and subheading, this will be placed underneath the active tab title."

// Let's modify the scrolled view first (around line 170):
// Old: 
// <span className="w-px h-6 bg-gray-200 dark:bg-neutral-800 mx-2 hidden sm:block"></span>
// {activeTabNode}
// New:
// <span className="w-px h-6 bg-gray-200 dark:bg-neutral-800 mx-2 hidden sm:block"></span>
// <div className="flex flex-col">
//   <div className="flex items-center">{activeTabNode}</div>
//   <NotificationTicker notifications={notifications} isScrolled={true} />
// </div>

const scrolledTarget = `<span className="w-px h-6 bg-gray-200 dark:bg-neutral-800 mx-2 hidden sm:block"></span>
                    {activeTabNode}`;
const scrolledReplacement = `<span className="w-px h-6 bg-gray-200 dark:bg-neutral-800 mx-2 hidden sm:block"></span>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center space-x-2">{activeTabNode}</div>
                      <NotificationTicker notifications={notifications} isScrolled={true} />
                    </div>`;
                    
content = content.replace(scrolledTarget, scrolledReplacement);

// Let's modify the unscrolled view:
const unscrolledTarget = `<div className="flex items-center space-x-2 flex-shrink-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none">
             {activeTabNode}
          </div>`;
          
const unscrolledReplacement = `<div className="flex flex-col justify-center space-y-0 text-gray-900 dark:text-gray-100 font-bold text-sm select-none">
             <div className="flex items-center space-x-2">{activeTabNode}</div>
             <NotificationTicker notifications={notifications} isScrolled={false} />
          </div>`;
          
content = content.replace(unscrolledTarget, unscrolledReplacement);

fs.writeFileSync('src/components/Navbar.tsx', content);
