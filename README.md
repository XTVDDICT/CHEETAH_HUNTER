# CHEETAH HUNTER v1.0.3

CHEETAH HUNTER repurposes the familiar SOLO HUNTER ESP32 CYD firmware for
Cheetahcoin. It is a live CHTA wallet display with optional SHA-256 Stratum
mining, on-screen mining statistics, and a local Web UI for setup and status.

Version 1.0.3 polishes the local Web UI with fast nonblocking saves, clear
confirmation and validation, responsive phone/desktop layouts, and improved
price precision. It keeps the physical display layout and SHA-256 mining
engine from v1.0.2.

<img width="2083" height="1358" alt="chta hunter pic" src="https://github.com/user-attachments/assets/8434dfed-93ae-4e49-8359-28f076b3dc92" />

<img width="1080" height="1920" alt="chta block found" src="https://github.com/user-attachments/assets/053c2df5-f206-4133-8da3-0502924b7530" />

<img width="2048" height="1536" alt="CHTA dashboard" src="https://github.com/user-attachments/assets/07302980-42b2-495c-8ab6-1ad1b30fe470" />

<img width="2048" height="1536" alt="chta mining dashboard" src="https://github.com/user-attachments/assets/733f7f75-5258-4f64-8b44-83bfbb1d76bb" />


## What's New in v1.0.3

- Settings save immediately without waiting for explorer or price lookups
- Clear on-page success and error messages without leaving the dashboard
- Pool host, port, and mining username validation
- Direct visits or refreshes of `/save` return safely to the dashboard
- Cleaner responsive layout for desktop and mobile browsers
- Adaptive CHTA price precision so very small prices do not display as zero
- No changes to the physical display layout or SHA-256 mining engine

## Highlights

- Live CHTA wallet balance from the Cheetahcoin explorer
- CHTA wallet value in USD, GBP, or CAD
- Gleec price feed with CoinPaprika fallback
- Optional SHA-256 Stratum v1 mining
- ESP32 hardware SHA acceleration with automatic CPU fallback
- Live mining dashboard in the Web UI
- On-screen hashrate, accepted/rejected shares, best difficulty, and blocks
- Persistent `BLOCK FOUND` popup when the configured wallet balance increases
- Separate ILI9341 and ST7789 firmware
- Firmware: `v1.0.3 / CHTA-HW-SHA-1`
- Pool client identifier: `CHEETAH_HUNTER/1.0.3`

## Choose Your Firmware

Use the merged binary that matches the screen controller in your CYD.

| Screen | Download |
| --- | --- |
| ILI9341 | [CHEETAH_HUNTER_v1_0_3_ILI9341.ino.merged.bin](https://raw.githubusercontent.com/XTVDDICT/CHEETAH_HUNTER/main/CHEETAH_HUNTER_v1_0_3_ILI9341.ino.merged.bin) |
| ST7789 | [CHEETAH_HUNTER_v1_0_3_ST7789.ino.merged.bin](https://raw.githubusercontent.com/XTVDDICT/CHEETAH_HUNTER/main/CHEETAH_HUNTER_v1_0_3_ST7789.ino.merged.bin) |

The wrong screen build can produce a black screen, incorrect colors, or a
distorted display. If that happens, flash the other version.

## Flash With ESP Web Tool

Arduino IDE is not required for the merged binaries. Use Google Chrome or
Microsoft Edge and open the
[Espressif ESP Web Tool](https://espressif.github.io/esptool-js/).

1. Download the merged `.bin` file for your screen.
2. Connect the ESP32 CYD with a data-capable USB cable.
3. Close Arduino Serial Monitor or any other program using the COM port.
4. Click `Connect` and select the ESP32 USB serial port.
5. Select the downloaded Cheetah Hunter merged `.bin` file.
6. Set the flash address to `0x0`.
7. Use `DIO`, `80 MHz`, and `4 MB` when those options are shown.
8. Enable erase flash for a clean installation, then click `Program`.
9. Wait for flashing and verification to finish before resetting the board.

These are complete 4 MB flash images. Do not flash a merged binary at
`0x10000`. Erasing the full flash clears saved WiFi, wallet, currency, display,
and mining settings.

If the Web Tool cannot connect, close other serial applications, try baud rate
`115200`, or hold the board's `BOOT` button while connecting.

## First-Time Setup

1. Connect to the WiFi network `CHEETAH_HUNTER_SETUP`.
2. Enter password `solohunter`.
3. Open `http://192.168.4.1` if the setup page does not appear automatically.
4. Enter your home WiFi information and save.
5. Open the local IP address shown on the Cheetah Hunter screen.

The ESP32 can remember WiFi credentials across firmware flashes unless the
device is fully erased. Cheetah Hunter stores its own settings under the
separate `chta` namespace so Solo Hunter wallet settings are not reused.

## Web UI

### Display Tab

Configure the CHTA wallet address, USD/GBP/CAD display currency, and screen
rotation. The dashboard shows the live balance, selected fiat value, CHTA
price, device status, and firmware build. Saving stays on the dashboard and
confirms immediately while wallet and price data refresh in the background.

### Mining Tab

Enable mining and enter the values required by your Cheetahcoin-compatible
SHA-256 pool:

- Pool host and Stratum port
- CHTA wallet address or pool username
- Optional worker name
- Pool password, normally `x` unless your pool specifies another value

When a worker is entered, Cheetah Hunter authorizes with
`username.worker`. Use the exact host, port, username, and password format
provided by your pool.

The Web UI validates required mining fields and the Stratum port before saving.
The Mining tab shows the connection state, mining engine, hashrate, total
hashes, submitted/pending/accepted/rejected shares, best difficulty, pool
difficulty, blocks found, and session uptime.

## Mining Statistics

The left side of the physical display shows:

- `HASH` - current hashrate
- `ACC` - accepted shares
- `REJ` - rejected shares
- `BEST` - best share difficulty
- `BLK` - hashes that met the network target during the current session

Accepted shares are not automatically blocks. The `BLK` counter increases only
when a verified hash also meets the network target supplied by the pool job.

The full-screen `BLOCK FOUND` popup is separate. It appears when the configured
CHTA wallet balance increases.

## Build From Source

Arduino IDE is only needed to edit or compile the source.

1. Install the Espressif ESP32 board package.
2. Install `WiFiManager`, `LovyanGFX`, and `ArduinoJson` from Library Manager.
3. Open the folder matching your screen:
   - `CHEETAH_HUNTER_v1_0_3_ILI9341`
   - `CHEETAH_HUNTER_v1_0_3_ST7789`
4. Keep the `.ino` file and all four `SoloHunterMiner`/`SoloHunterSha256`
   support files together in that sketch folder.
5. Select the `ESP32-2432S028R CYD` board and the correct COM port.
6. Select `Tools > Partition Scheme > Huge APP (3MB No OTA/1MB SPIFFS)`.
7. Compile and upload.

The default 1.2 MB application partition is too small for v1.0.3 and causes
`text section exceeds available space in board` during compilation.

## Notes

- Mining mode supports SHA-256 only.
- Cheetah Hunter is a small ESP32 lottery miner, not an ASIC.
- Mining rewards are not guaranteed.
- Mining session counters reset after rebooting or reconfiguring mining.
- Do not expose the device Web UI directly to the public internet.
- SHA-256 checksums are listed in [`SHA256SUMS.txt`](SHA256SUMS.txt).

This is hobby firmware. Flashing and cryptocurrency mining are performed at
your own risk.
