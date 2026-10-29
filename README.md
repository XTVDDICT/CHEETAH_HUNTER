# CHEETAH HUNTER v1.0.5

CHEETAH HUNTER is an ESP32 CYD wallet display for Cheetahcoin with optional SHA-256
Stratum mining. This release adds the higher-throughput HELIOS pipelined-v2
engine, EUR valuation, and touch-to-dismiss wallet alerts on both screen types.

## What's New

- Pipelined-v2 hardware SHA-256d engine and assembly software helper
- Buffered Stratum messages, verified candidates, and SHA recovery
- USD, GBP, CAD, and EUR wallet values, including saved EUR selection
- Tap anywhere on the screen to dismiss a visible BLOCK FOUND notification
- Web clear-notification button removed
- Total, main-core, and helper rates displayed in kH/s, including above 1,000
- Cooperative display/network handling and expanded mining diagnostics
- CHTA Electrum balance fallback and a persistent IP/status footer

Hashrate varies by chip, pool, and network activity. No fixed sustained rate
or mining reward is guaranteed. The BLOCK FOUND wallet popup is a balance/receipt
notification, not proof that this ESP32 mined those coins.

## Download the Correct Screen Version

[Open the v1.0.5 release](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/tag/v1.0.5).

| Screen | Fresh Install: Clears Settings | Update: Keeps Settings | Advanced Layout Upgrade |
| --- | --- | --- | --- |
| ILI9341 | [Full install](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.5/CHEETAH_HUNTER_v1_0_5_ILI9341.ino.merged.bin) | [App-only update](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.5/CHEETAH_HUNTER_v1_0_5_ILI9341.ino.bin) | [Partition table](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.5/CHEETAH_HUNTER_v1_0_5_ILI9341.ino.partitions.bin) |
| ST7789 | [Full install](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.5/CHEETAH_HUNTER_v1_0_5_ST7789.ino.merged.bin) | [App-only update](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.5/CHEETAH_HUNTER_v1_0_5_ST7789.ino.bin) | [Partition table](https://github.com/XTVDDICT/CHEETAH_HUNTER/releases/download/v1.0.5/CHEETAH_HUNTER_v1_0_5_ST7789.ino.partitions.bin) |

Use the controller fitted to your CYD: ILI9341 or ST7789. All files for one
operation must match that screen and version. Check downloads against the
release's SHA256SUMS.txt. Earlier releases remain available in release history.

## Choose Your Installation Method

| Situation | File and Address | Settings |
| --- | --- | --- |
| Blank board, clean reinstall, or unknown/custom firmware | `.ino.merged.bin` at `0x0` | Cleared |
| Existing CHEETAH HUNTER with compatible Huge APP layout | `.ino.bin` at `0x10000` | Retained if whole-chip erase stays off |
| Older official layout needing a larger app slot | Matching partition table at `0x8000` plus app at `0x10000` | See the advanced upgrade warning below |

**Do not use `0x1000`. That is the bootloader address, not an app-update address.**
A merged image replaces all 4 MB, including settings, even if a separate
Erase All option is disabled. Use app-only files when retaining settings.

## Fresh Install or Clean Reinstall

1. Download the matching `CHEETAH_HUNTER_v1_0_5_<screen>.ino.merged.bin`.
2. Connect the CYD using a data-capable USB cable.
3. Close Arduino Serial Monitor and any other application using its COM port.
4. Open [Espressif ESP Web Tool](https://espressif.github.io/esptool-js/) in
   Chrome or Edge, click Connect, and select the ESP32 USB serial port.
5. Select only the merged file and enter address **`0x0`**.
6. Leave flash mode/frequency/size at Keep when offered. These are 4 MB images.
7. Click Program and wait until writing/verification completes, then reset
   or power-cycle the board.

An explicit full erase is optional for a clean install; either way the merged
image replaces saved WiFi, wallet, currency, rotation, and mining settings.

After resetting, join `CHEETAH_HUNTER_SETUP` with password `solohunter`.
Open `http://192.168.4.1` if the portal does not open automatically.
Configure your 2.4 GHz WiFi, reconnect your phone/computer to that network,
and open the device's local IP. Configure the wallet/currency in Display
and optional pool credentials in Mining.

## Update an Existing Installation and Keep Settings

Official v1.0.3/v1.0.4 installations using the released Huge APP layout can
use this app-only procedure. Other layouts must be checked before updating.

1. Note your wallet, pool login, and other settings before updating.
2. Download the matching `CHEETAH_HUNTER_v1_0_5_<screen>.ino.bin`, **not** the merged file.
3. Connect with ESP Web Tool as described above.
4. **Disable Erase All / whole-chip erase.**
5. Select only the app file and set its address to **`0x10000`**.
6. Program, wait for verification, then reset the board.
7. Open the existing IP address and refresh the browser. Confirm the page shows
   **v1.0.5 / HELIOS-PIPELINED-V2** and your saved settings remain present.

For this procedure, do not flash the bootloader, boot_app0, or merged image.
The update writes the app region and leaves settings storage untouched.
These instructions apply to upgrades within CHEETAH HUNTER, not switching products.

## Older Layouts: Advanced Settings-Preserving Upgrade

The release layout uses app0 at `0x10000` with a 3 MB slot and NVS settings
at `0x9000` with size `0x5000`. If your old official installation has the
same NVS location but a smaller app slot, the partition table must be updated.

1. Turn off Erase All / whole-chip erase.
2. Add the matching `.ino.partitions.bin` at **`0x8000`**.
3. Add the matching app-only `.ino.bin` at **`0x10000`**.
4. Program both rows together, wait for verification, and reset.

Do not guess a custom partition layout. If its settings location or bootloader
is incompatible, use a clean merged install and configure settings again.
Changing the layout can invalidate old filesystem contents; the settings-
preserving claim applies to NVS preferences and WiFi, not arbitrary stored files.
Keep a record of settings; the upgrade path still requires device validation.

[Espressif's flash documentation](https://docs.espressif.com/projects/esptool/en/latest/esp32/esptool/basic-commands.html)
explains that normal writes erase affected sectors, while Erase All clears
the whole chip. Keeping writes outside NVS is what retains saved settings.

## Using the Device

The Web UI has Display and Mining tabs. Enter pool host, port, wallet/username,
optional worker, and the password required by your compatible SHA-256 pool.
A worker is appended as `username.worker`.

Tap anywhere while a BLOCK FOUND popup is visible to dismiss it. A held finger
must be released before another alert can be dismissed. No Web clear button
is shown. The `BLK` counter records verified network-target hashes; ordinary
accepted pool shares are not automatically blocks.

All speeds stay in kH/s. Open `http://<device-ip>/status` for SHA timing,
clocks, recoveries, and main/helper rates. Do not expose the Web UI publicly.

## Troubleshooting

- Cannot connect: close other serial tools, try another USB data cable, lower
  baud rate to 115200, or hold BOOT while connecting.
- Blank or distorted screen: check the screen-controller choice.
- Settings disappeared: a merged flash or full erase clears settings.
- Popup does not dismiss: check the correct CYD touch hardware and rebuilds'
  XPT2046_Touchscreen dependency.
- Old page or clear button still visible: refresh the browser after updating.
- Unknown layout or failed update: use a clean merged install, then configure
  WiFi and wallet settings again.

## Source and Build

Open `CHEETAH_HUNTER_v1_0_5_ILI9341` or `CHEETAH_HUNTER_v1_0_5_ST7789` and keep every .cpp, .h, and
.S dependency beside its .ino, including both assembly files. Retain
THIRD_PARTY_NOTICES.md. Install WiFiManager, LovyanGFX, ArduinoJson, and
XPT2046_Touchscreen. Use classic ESP32 CYD, 240 MHz CPU / 80 MHz APB, 4 MB
flash, and Huge APP (3MB No OTA/1MB SPIFFS). Match the ESP32 core used for the
release exports. Huge APP has no OTA slot; updates use USB.

The owner compiles and exports the firmware. Publishing uses those existing
exports without rebuilding or merging firmware. Hardware validation includes
touch, settings retention, accepted shares, sustained speed, and stability.

## Screenshots

<img width="2083" height="1358" alt="chta hunter pic" src="https://github.com/user-attachments/assets/8434dfed-93ae-4e49-8359-28f076b3dc92" />

<img width="1080" height="1920" alt="chta block found" src="https://github.com/user-attachments/assets/053c2df5-f206-4133-8da3-0502924b7530" />

<img width="2048" height="1536" alt="chta mining dashboard" src="https://github.com/user-attachments/assets/c1fbad37-468c-4fdb-9731-5c7f771a90b9" />

<img width="2048" height="1536" alt="CHTA dashboard" src="https://github.com/user-attachments/assets/21c988c8-975f-48de-86e5-4e7e9ffdd89c" />

This is hobby firmware. Flashing and cryptocurrency mining are at your own risk.
