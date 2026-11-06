# Bambu Lab compatibility plan

## Strategy
MS3DPRINTING uses one normalized printer interface and a model registry. Each profile records series, model identifier/code, AMS type, camera class and capabilities. Protocol differences remain inside the Windows companion, not in the React dashboard.

## Reference hardware
**Bambu Lab A1 Mini** is the first physical reference target (`A1_MINI`, model code `N1`). The A1 family uses AMS Lite; other series have different capability profiles.

## Planned model coverage
- A1: A1 Mini, A1
- P1: P1P, P1S
- X1: X1, X1 Carbon, X1E
- P2: P2S
- H2: H2D, H2D Pro, H2S, H2C
- X2: X2D

This is the product target list, not proof that every model/firmware combination has been physically validated. New models should be added to the registry without changing shared UI or job types.

## Connection architecture
- Windows companion owns SSDP discovery, local MQTT/TLS and FTPS.
- Browser renderer and hosted web app never open private LAN printer sockets.
- Credentials are referenced by opaque vault identifiers; access codes stay in the companion and Windows Credential Manager/DPAPI.
- Telemetry is normalized with source and observation timestamp.
- Device-side authorization and firmware are checked before any control capability is exposed.
- Unknown models and firmware default to unsupported/read-only.

## Safe rollout
1. A1 Mini: read-only discovery and telemetry on the actual printer.
2. A1 Mini: file transfer and print controls only after hardware tests and explicit confirmation.
3. A1/P1: qualify camera, AMS and firmware differences.
4. X1/X1E, P2, H2 and X2: validate each series and firmware line.
5. Keep capability flags and integration tests per model; never infer support from a similar model.

## Security
Bambu LAN/Developer Mode and features vary by model/firmware. LAN-only mode may disable cloud and Handy features. Explain this trade-off before enabling it. Never expose printers to the public internet or ask users to paste access codes into support chat.

## Current status
The model registry and typed LAN transport boundary are implemented. Concrete MQTT/FTPS transport, Windows credential vault, discovery, telemetry parsing and hardware tests remain pending. No real printer is connected by this code.
