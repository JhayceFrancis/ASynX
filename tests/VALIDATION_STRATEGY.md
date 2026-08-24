# ASynX Validation & Testing Strategy

This document outlines the strict validation protocols introduced to safeguard the ASynX persistence layer, specifically targeting the Plex, Karakeep, Simkl, AniList, and MyAnimeList (MAL) handshakes.

## 1. Architecture Validation Overview

The persistence desync was resolved by shifting from an optimistic frontend state (where the React UI assumed success) to a **Backend-Authoritative Strict Validation** model. 

### Core Safeguards Implemented:
* **Active Handshake Probing:** The Express backend now issues lightweight, active network probes (e.g., fetching the GraphQL Viewer for AniList) to validate the \`accessToken\` *before* the AES-256-GCM filesystem write operation is authorised.
* **Synchronous UI Blocking:** The \`SettingsView.tsx\` component explicitly awaits the \`res.ok\` status from the backend \`/api/settings\` transaction.
* **Error Propagation:** HTTP \`401 Unauthorised\` and \`500 Internal Server Error\` responses are explicitly trapped and rendered inline, rather than being silently swallowed by generic \`try/catch\` blocks.

## 2. Executing the Integration Tests

The project has been configured with **Vitest**, **Supertest**, and **React Testing Library** to facilitate enterprise-grade integration testing within the Vite module architecture. 

The test files have been physically provisioned in the following directories:
* \`tests/backend/settings.integration.test.ts\`
* \`tests/frontend/SettingsView.test.tsx\`

### Running the Suite

You can execute the validation suite via the terminal using Vitest:

\`\`\`bash
# Run the complete test suite headlessly
npx vitest run

# Run tests in watch mode for active debugging
npx vitest
\`\`\`

## 3. Debug Logging Protocols

To manually validate the persistence state in a live environment, the **System Log Overlay** (accessible via the terminal icon on the Windows 11 Status Bar) intercepts and renders the exact authentication state.

### Debugging Workflow:
1. Open the **System Log Overlay**.
2. Connect a MAL, AniList, or Simkl account via the Settings panel.
3. Observe the overlay for the following strict sequence:
   - \`[INFO]\` *Validating MyAnimeList API credentials...*
   - \`[SUCCESS]\` *MyAnimeList credentials validated successfully.*
4. If an invalid token is intercepted, the transaction will definitively halt with:
   - \`[ERROR]\` *MyAnimeList credentials rejected (401 Unauthorized).*

By combining the active integration tests and real-time System Logger, the application maintains a strict, transparent audit trail of all third-party handshake operations, ensuring the persistence desync issue is permanently resolved.
