import React from 'react';

interface OAuthConnectButtonProps {
  provider: 'simkl' | 'mal' | 'anilist';
  connected: boolean;
  onConnect: (provider: string) => void;
}

export const OAuthConnectButton: React.FC<OAuthConnectButtonProps> = ({ provider, connected, onConnect }) => {
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
      className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
        connected
          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
          : defaultClass
      }`}
    >
      <span>{connected ? `${label} Connected ✓` : `Connect with ${label}`}</span>
    </button>
  );
};
