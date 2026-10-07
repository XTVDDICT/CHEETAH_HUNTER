# CHEETAH HUNTER v1.0.4

CHEETAH HUNTER is a spin-off of SOLO HUNTER for the ESP32 CYD
(Cheap Yellow Display). It displays your Cheetahcoin wallet balance and
USD/GBP/CAD value, and can also mine CHTA using the HELIOS SHA-256 engine.
Settings and live mining statistics are available through its local Web UI.

## What's New in v1.0.4

- HELIOS hardware SHA-256d engine, matching the engine integrated into SOLO HUNTER
- Second-core software mining helper, verified candidates, and SHA recovery
- Explicit 240 MHz CPU / 80 MHz APB operation on classic ESP32 CYDs
- Suggested share difficulty of `0.001`, matching SOLO to reduce submission traffic
- CHTA Electrum balance servers with address validation and automatic fallback
- Balance checks every two minutes; failures retry after 30 seconds
- Last good balance retained when a balance server is unavailable
- Screen IP remains visible beside status and error messages
- Network requests share CPU time with the helper miner
- Expanded `/status` diagnostics for clocks, SHA timing, recoveries, and both cores

The responsive Web UI and immediate save confirmations from v1.0.3 are retained.
Saving settings does not normally reboot the device. The mining pool controls
the actual share difficulty; fewer submitted shares do not mean fewer hashes.

## Download

Get the firmware for your screen from the
[v1.0.4 release](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/tag/v1.0.4).

| Screen | Complete Firmware for ESP Web Tool |
| --- | --- |
| ILI9341 | [CHEETAH_HUNTER_v1_0_4_ILI9341.ino.merged.bin](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.4/CHEETAH_HUNTER_v1_0_4_ILI9341.ino.merged.bin) |
| ST7789 | [CHEETAH_HUNTER_v1_0_4_ST7789.ino.merged.bin](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.4/CHEETAH_HUNTER_v1_0_4_ST7789.ino.merged.bin) |

Choose the screen controller fitted to your CYD. A wrong screen build can
cause a blank screen, incorrect colors, or a distorted display. Earlier
firmware versions remain available in the repository and release history.

## Install With ESP Web Tool

No Arduino IDE is needed to install a merged binary.

1. Download the `.ino.merged.bin` file for your screen.
2. Connect the CYD to your computer with a data-capable USB cable.
3. Close Arduino Serial Monitor and other programs using the COM port.
4. Open [Espressif ESP Web Tool](https://espressif.github.io/esptool-js/)
   in Google Chrome or Microsoft Edge.
5. Click `Connect` and select the ESP32 USB serial port.
6. Select the downloaded merged binary and set its flash address to `0x0`.
7. Leave flash mode, frequency, and size at `Keep` if offered. These exports
   target a 4 MB CYD with 80 MHz flash; do not select a smaller flash size.
8. Click `Program` and wait for flashing to finish.
9. Reset or power-cycle the CYD.

**Merged image: `0x0`. App-only image: `0x10000`.**
`0x1000` is the bootloader address, not the address for either release image.

The merged binaries are complete 4 MB images. Flashing one replaces the full
flash, including saved WiFi, wallet, display, and mining settings, even without
a separate erase step. An explicit full erase also clears those settings.
The exported merged images contain blank saved-settings storage.

If connection fails, use baud rate `115200`, close other serial applications,
try another USB data cable, or hold `BOOT` while connecting. Safari is not
supported by ESP Web Tool.

## First-Time Setup

1. Connect your phone or computer to WiFi network `CHEETAH_HUNTER_SETUP`.
2. Use password `solohunter`.
3. Open `http://192.168.4.1` if the setup page does not appear automatically.
4. Enter the credentials for your 2.4 GHz home WiFi network and save.
5. Reconnect your phone or computer to that same home network.
6. Open the local IP address shown on the Cheetah Hunter screen.
7. In the Display tab, enter your CHTA wallet, select USD/GBP/CAD, and save.
8. In the Mining tab, enter your pool settings and enable mining if desired.

The setup network may time out after three minutes; reset the CYD to retry.
The Web UI is local to your network. Do not expose it directly to the internet.

## Mining on Helios Pool

Use the Mining tab to configure a CHTA-compatible SHA-256 Stratum pool.
The CHTA endpoint used during testing is:

| Setting | Value |
| --- | --- |
| Pool host | `chta.heliospool.com` |
| Port | `3336` |
| Wallet / Username | Your CHTA wallet address |
| Worker | Optional name, for example `CHTA1` |
| Password | `x`, unless the pool specifies otherwise |

Verify the pool's current connection settings before use. Other compatible
pools can be configured through the same form. With a worker set, the login
is sent as `username.worker`.

Saving confirms on the page immediately. Mining configuration changes
reconnect the miner; wallet and price lookups run after the save response.
Open the Mining tab to check connection status, hashrate, accepted/rejected
shares, best difficulty, pool difficulty, total hashes, and uptime.

The engine label distinguishes `HW SHA FAST`, `HW SHA SAFE`, and
`CPU FALLBACK`. For troubleshooting, open `http://<device-ip>/status`.
Diagnostics include CPU/APB clocks, main/helper hashrates, chip revision,
SHA timing and validation, recovery count, balance source, and freshness.

Hashrate depends on the chip, network activity, and pool configuration.
This is a small ESP32 lottery miner, not an ASIC; mining rewards are not
guaranteed. Do not treat peak hashrate as a guaranteed sustained rate.

## Screen and Wallet Alerts

The screen shows `HASH`, `ACC`, `REJ`, `BEST`, and `BLK`.
Accepted shares are not automatically blocks. `BLK` counts verified hashes
that also meet the network target supplied in the pool job.

The persistent `BLOCK FOUND` popup is a separate wallet-balance-increase
notification. It is not proof that this ESP32 mined the received coins.
Clear it using the Web UI.

USD pricing uses Gleec when available, with CoinPaprika fallback; GBP/CAD use
CoinPaprika quotes. Prices refresh every ten minutes and may be retained
during provider outages. Wallet valuations can differ from other wallets
because providers, cached quotes, and rounding differ.

## App-Only Update

For an already configured CYD with the compatible bootloader and Huge APP
partition layout, app-only binaries are also included in the release:

| Screen | App-Only Binary |
| --- | --- |
| ILI9341 | [CHEETAH_HUNTER_v1_0_4_ILI9341.ino.bin](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.4/CHEETAH_HUNTER_v1_0_4_ILI9341.ino.bin) |
| ST7789 | [CHEETAH_HUNTER_v1_0_4_ST7789.ino.bin](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.4/CHEETAH_HUNTER_v1_0_4_ST7789.ino.bin) |

Flash only the matching `.ino.bin` at `0x10000`, without erasing the full
flash. This leaves settings storage untouched. Do not use an app-only binary
for a blank board or an incompatible partition layout; use the merged image
at `0x0` instead.

## Build From Source

The repository owner exported the release binaries with ESP32 core
`3.3.12`, board `ESP32-2432S028R CYD`, 240 MHz CPU, 80 MHz flash, 4 MB
flash size, and Huge APP partition scheme.

1. Install the Espressif ESP32 board package in Arduino IDE.
2. Install `WiFiManager`, `LovyanGFX`, and `ArduinoJson`.
3. Open `CHEETAH_HUNTER_v1_0_4_ILI9341` or
   `CHEETAH_HUNTER_v1_0_4_ST7789` for your screen.
4. Keep the matching `.ino` and all six support files together:
   `SoloHunterMiner.cpp/.h`, `SoloHunterSha256.cpp/.h`, and `ChtaBalance.cpp/.h`.
5. Select the CYD board, 240 MHz CPU, and the correct COM port.
6. Set `Tools > Partition Scheme > Huge APP (3MB No OTA/1MB SPIFFS)`.
7. Compile and upload, or use `Sketch > Export Compiled Binary` to export.

The default 1.2 MB application partition is too small. Huge APP has no OTA
partition; updates use USB flashing. If the IDE still shows an older source
file after an external edit, reopen the sketch before compiling.

Release identity: `v1.0.4 / HELIOS-ENGINE`.
Pool client identifier: `CHEETAH_HUNTER/1.0.4`.
SHA-256 download checksums are in [SHA256SUMS.txt](SHA256SUMS.txt).

## Screenshots

<img width="2083" height="1358" alt="chta hunter pic" src="https://github.com/user-attachments/assets/8434dfed-93ae-4e49-8359-28f076b3dc92" />

<img width="1080" height="1920" alt="chta block found" src="https://github.com/user-attachments/assets/053c2df5-f206-4133-8da3-0502924b7530" />

<img width="2048" height="1536" alt="chta mining dashboard" src="https://github.com/user-attachments/assets/c1fbad37-468c-4fdb-9731-5c7f771a90b9" />

<img width="2048" height="1536" alt="CHTA dashboard" src="https://github.com/user-attachments/assets/21c988c8-975f-48de-86e5-4e7e9ffdd89c" />

## Notes

- Settings use the separate `chta` namespace, not SOLO HUNTER's wallet settings.
- Mining counters reset after rebooting or reconfiguring mining.
- Firmware image/source checks do not replace hardware stability testing.
- Flashing and cryptocurrency mining are performed at your own risk.
