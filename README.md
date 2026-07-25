[README.md](https://github.com/user-attachments/files/30372836/README.md)
# CHEETAH_HUNTER v1.0.1

<img width="2048" height="1279" alt="CHTA Dashboard" src="https://github.com/user-attachments/assets/fa935d83-582f-427a-86e6-0e16c28fc639" />

<img width="2048" height="1354" alt="CHTA Hunter" src="https://github.com/user-attachments/assets/2866cf8e-944a-42a7-9775-d935cb943bee" />

Cheetah Hunter is an ESP32 CYD wallet monitor designed specifically for **Cheetahcoin (CHTA)**.

It displays your live CHTA wallet balance, estimated fiat value, current CHTA price, and shows a **BLOCK FOUND** popup whenever your monitored wallet balance increases. It also includes a built-in web dashboard for quick configuration and live status.

---

# Features

- Live CHTA wallet balance from the Cheetahcoin explorer
- Wallet value in USD, GBP, or CAD
- CHTA price feed using Gleec when available, with CoinPaprika fallback
- BLOCK FOUND popup when the monitored wallet balance increases
- Built-in WiFi setup portal
- Local web dashboard for wallet configuration, currency selection, display flip, and live status
- Separate firmware builds for ILI9341 and ST7789 displays

---

# Hardware

- ESP32-2432S028 ("Cheap Yellow Display" / CYD)
- USB cable for programming
- WiFi connection with Internet access

---

# Included Builds

Two firmware versions are included.

**ILI9341**

```
CHEETAH_HUNTER_v1_0_1_ILI9341/
CHEETAH_HUNTER_v1_0_1_ILI9341.ino
```

**ST7789**

```
CHEETAH_HUNTER_v1_0_1_ST7789/
CHEETAH_HUNTER_v1_0_1_ST7789.ino
```

If your display is blank, mirrored, or garbled, simply flash the other display version.

---

# Install Using ESP Web Flasher

The easiest way to install Cheetah Hunter is by flashing one of the compiled **merged** firmware files.

Use the correct file for your display:

**ILI9341**
```
CHEETAH_HUNTER_v1_0_1_ILI9341.ino.merged.bin
```

**ST7789**
```
CHEETAH_HUNTER_v1_0_1_ST7789.ino.merged.bin
```

1. Connect your ESP32 CYD using USB.
2. Open the Cheetah Hunter ESP Web Flasher.
3. Select the firmware that matches your display.
4. Click **Install** or **Flash**.
5. If prompted, choose **Erase Device** for a clean installation.
6. Wait for flashing to finish.
7. Reboot the ESP32.

**Important**

The merged firmware must be flashed at **offset 0x0**.

Do **NOT** flash the merged binary at **0x10000**.

ESP Web Flasher works best in **Google Chrome** or **Microsoft Edge** because Web Serial support is required.

---

# Build From Source

Arduino IDE is only required if you want to modify or compile the project yourself.

Install:

- Arduino IDE
- ESP32 Board Package by Espressif

Required libraries:

- WiFiManager
- LovyanGFX

Then:

1. Open the sketch for your display.
2. Select your ESP32 board.
3. Select the correct COM port.
4. Upload normally or export a compiled binary.

---

# First Boot Setup

On first boot the device creates a WiFi setup network.

**SSID**

```
CHEETAH_HUNTER_SETUP
```

**Password**

```
solohunter
```

Connect to the WiFi network.

If the setup portal does not automatically appear, open:

```
http://192.168.4.1
```

Enter your home WiFi credentials and save.

Once connected to WiFi, the device displays its local IP address.

Open that address in your browser to access the web dashboard.

---

# Web Dashboard

From the dashboard you can:

- Enter or update your CHTA wallet address
- Select USD, GBP, or CAD
- Flip the display orientation
- View live wallet balance
- View wallet value
- View current CHTA price
- Clear the BLOCK FOUND popup
- Reopen WiFi setup

The dashboard is hosted directly by the ESP32.

---

# Important Notes

Cheetah Hunter stores wallet and display settings separately from Solo Hunter using the **chta** preferences namespace.

The ESP32 remembers WiFi credentials across firmware updates, so your device may reconnect automatically after flashing.

If Arduino IDE already has an older sketch open, close and reopen the updated sketch before uploading to avoid flashing an older editor buffer.

---

# Price and Balance Data

Wallet balances come directly from the Cheetahcoin explorer.

Price data uses:

- Gleec Wallet ticker (preferred)
- CoinPaprika (fallback)

Wallet value is calculated as:

```
Wallet Balance × Selected Currency Price
```

---

# Troubleshooting

### Wallet value looks incorrect

Re-enter your wallet address in the web dashboard and save.

Refresh the page.

Verify you are running the latest firmware using:

```
PREFS_NS = "chta"
```

---

### Device reconnects to WiFi automatically

This is normal.

The ESP32 stores WiFi credentials independently of the firmware.

---

### Screen is upside down

Use the **Flip Display** option in the web dashboard.

---

### Display is blank or garbled

Flash the other display driver version.

---

### Setup portal does not appear

Restart the device and manually connect to:

```
CHEETAH_HUNTER_SETUP
```
