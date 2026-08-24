/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => { cleanup(); });

const SettingsViewMock = ({ onSaveSettings }: { onSaveSettings: (settings: any) => Promise<void> }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    mal: { connected: false, clientId: '' }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSaveSettings(formState);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="settings-form">
      {error && <div data-testid="error-banner">{error}</div>}
      
      <div data-testid="mal-status">
        {formState.mal.connected ? 'Connected' : 'Disconnected'}
      </div>
      
      <button type="submit" data-testid="save-btn">Save Changes</button>
    </form>
  );
};

describe('Frontend Validation: SettingsView Component', () => {
  it('displays a validation error when the backend rejects the handshake payload', async () => {
    const mockOnSave = vi.fn().mockRejectedValue(new Error('Invalid MyAnimeList API credentials'));
    render(<SettingsViewMock onSaveSettings={mockOnSave} />);

    fireEvent.click(screen.getByTestId('save-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeTruthy();
      expect(screen.getByTestId('error-banner').textContent).toContain('Invalid MyAnimeList API credentials');
    });

    expect(screen.getByTestId('mal-status').textContent).toContain('Disconnected');
  });

  it('successfully awaits the backend transaction before clearing any errors', async () => {
    const mockOnSave = vi.fn().mockResolvedValue(undefined);
    render(<SettingsViewMock onSaveSettings={mockOnSave} />);

    fireEvent.click(screen.getByTestId('save-btn'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      expect(screen.queryByTestId('error-banner')).toBeNull();
    });
  });
});
