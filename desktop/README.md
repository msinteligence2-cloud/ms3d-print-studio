# MS3DPRINTING Desktop (Windows)

The desktop client is planned as an Electron host around the shared React renderer. This directory documents the boundary; it is not yet a distributable installer.

## Planned responsibilities
- Discover printers on the user's local network.
- Keep LAN credentials inside Windows Credential Manager/DPAPI.
- Run model-specific printer adapters in a restricted main-process service.
- Expose typed, capability-gated IPC to the renderer.
- Work locally during internet outages and synchronize metadata when online.

## Security rules
- Never expose raw Node APIs to renderer pages.
- Never send printer access codes to the web API.
- Require explicit confirmation for cancel, movement, calibration, and other disruptive commands.
- Verify command outcomes by reading telemetry after sending a command.
- Default to read-only telemetry until the model and firmware are qualified.

## Build status
No Electron runtime, Windows signing certificate, auto-updater, or installer is included yet. The first hardware validation requires the exact Bambu model and firmware plus a test printer on the same LAN.
