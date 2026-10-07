# CHEETAH HUNTER v1.0.4

CHEETAH HUNTER is a SOLO HUNTER spin-off for the ESP32 CYD, combining a CHTA
wallet display with optional SHA-256 mining. This release brings the HELIOS
mining engine to both ILI9341 and ST7789 screen versions.

## Changes

- Hardware SHA-256d pipeline and second-core software mining helper
- Candidate verification, SHA recovery, and Stratum reconnect handling
- Explicit 240 MHz CPU / 80 MHz APB clocks
- Suggested share difficulty of `0.001`, matching SOLO HUNTER
- Reliable CHTA balance lookups through Electrum servers with fallback
- Two-minute balance polling and 30-second retry after failure
- IP address stays visible beside screen status and errors
- Network work shares CPU time with the software helper
- Expanded clock, SHA, per-core hashrate, recovery, and balance diagnostics
- Existing responsive Web UI and immediate save confirmations retained

## Installation

Use [Espressif ESP Web Tool](https://espressif.github.io/esptool-js/) in Chrome
or Edge and select the firmware for your screen.

- Fresh install: flash `.ino.merged.bin` at `0x0`.
- App-only update on a compatible Huge APP installation: flash `.ino.bin`
  at `0x10000`, without a full erase.
- Do not use `0x1000`; that address is for the bootloader alone.

Merged binaries are complete 4 MB images and replace saved device settings.
They contain blank saved-settings storage. After a merged flash, join
`CHEETAH_HUNTER_SETUP` with password `solohunter`, configure WiFi, and open
the device IP to configure the wallet and mining pool.

The repository owner exported both binaries with ESP32 core `3.3.12` and
Huge APP. The exported images were checked against the cached source,
bootloader, partition table, app offsets, and SHA-256 checksums. No firmware
was compiled or re-exported as part of publishing this release.

Hashrate and stability still depend on the device and pool. The higher share
difficulty reduces submission traffic, but a sustained speed improvement is
not guaranteed. Wallet price quotes may differ from other wallet apps.

See [README.md](README.md) for complete flashing, setup, and pool instructions.
