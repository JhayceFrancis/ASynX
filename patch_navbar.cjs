const fs = require('fs');
const content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const replacement = `                  <LogoBanner
                    gradientColors={settings?.theme?.gradientColors}
                    accentColor={settings?.theme?.accentColor}
                    isScrolled={isScrolled}
                    isSyncing={isSyncing}
                    onAnimationPhaseChange={setAnimPhase}
                  />
                </div>
              </Tooltip>
              <AnimatePresence>
                {(isScrolled && (animPhase === 'returning' || animPhase === 'dropped')) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                    transition={{ duration: 0.6, delay: animPhase === 'returning' ? 0.2 : 0 }}
                    className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 font-bold ml-4 hidden sm:flex"
                  >
                    <span className="w-px h-6 bg-gray-200 dark:bg-neutral-800 mx-2 hidden sm:block"></span>
                    {activeTabNode}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>`;

const updated = content.replace(/<LogoBanner[\s\S]*?\/>\s*<\/div>\s*<\/Tooltip>\s*<\/div>\s*<\/div>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/Navbar.tsx', updated);
