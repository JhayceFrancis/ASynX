# Security Policy for ASynX

## Supported Versions

The following table lists the versions of ASynX that currently receive security updates and patches:

| Version | Supported          |
| ------- | ------------------ |
| 2.4.x   | :white_check_mark: |
| < 2.4   | :x:                |

## Reporting a Vulnerability

We take the security of ASynX seriously. If you discover a security vulnerability or potential token exposure, please report it responsibly instead of opening a public GitHub issue.

### How to Submit a Vulnerability Report
1. Email your report directly to **`f30@outlook.ie`** or open a private security advisory under GitHub's **Security** tab.
2. Provide a detailed description of the vulnerability, reproduction steps, and potential impact.
3. Attach proof-of-concept (PoC) code or logs if applicable without exploiting the issue on external servers.

### Response SLA & Disclosure Process
- **Initial Response**: We aim to acknowledge receipt of security reports within **48 hours**.
- **Assessment**: We will evaluate the severity and work on a targeted patch.
- **Patch & Release**: Confirmed security vulnerabilities will be fixed in a patch release (e.g., `v2.4.1-beta`).

## Security Architecture in ASynX

ASynX is engineered with local privacy and defense-in-depth principles:

- **AES-256-GCM Encrypted Database**: User tokens, API keys, and server secrets saved in `asynx_data.enc` are encrypted locally using AES-256-GCM authenticated encryption.
- **UI Input Masking**: Sensitive authentication fields in the Settings view use password-masked inputs to prevent visual leaks during screen shares or recordings.
- **Server-Side API Proxying**: API requests route through backend endpoints (`/api/*`), keeping API credentials isolated from client-side execution contexts.
- **Environment Overrides**: Credentials can be passed via `.env` or container environment parameters without hardcoding tokens in source code.

Thank you for helping keep ASynX and its community safe!
