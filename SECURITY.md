# Security

The app processes structure and project files locally. The desktop renderer is sandboxed and has no direct Node.js access; native file operations are exposed through a narrow preload bridge and use user-selected paths.

If you find a vulnerability, use GitHub's private vulnerability reporting for this repository when available. If that feature has not been enabled, open a minimal issue requesting a private reporting channel without publishing exploit details, credentials, private structures, or personal data.

Only the current beta development line is maintained. Dependency and signing improvements may arrive in frequent updates. The initial desktop packages are unsigned and are not a substitute for signed, notarized production releases.
