import React from 'react';

interface OAuthConnectButtonProps {
  provider: 'simkl' | 'mal' | 'anilist';
  connected: boolean;
  isLoading?: boolean;
  onConnect: (provider: string) => void;
}

export const OAuthConnectButton: React.FC<OAuthConnectButtonProps> = ({ provider, connected, isLoading, onConnect }) => {
  let label = 'Simkl';
  let defaultClass = 'bg-indigo-600 hover:bg-indigo-500 text-white';

  if (provider === 'mal') {
    label = 'MyAnimeList';
    defaultClass = 'bg-blue-600 hover:bg-blue-500 text-white';
  } else if (provider === 'anilist') {
    label = 'AniList';
    defaultClass = 'bg-sky-600 hover:bg-sky-500 text-white';
  }

  return (
    <button
      type="button"
      onClick={() => onConnect(provider)}
      disabled={isLoading}
      className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
        isLoading 
          ? 'bg-gray-200 text-gray-500 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed border border-transparent'
          : connected
          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
          : defaultClass
      }`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        <span>{connected ? `${label} Connected ✓` : `Connect with ${label}`}</span>
      )}
    </button>
  );
};
