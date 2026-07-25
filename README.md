[README.md](https://github.com/user-attachments/files/30372836/README.md)

Cheetah Hunter is a dedicated Cheetahcoin (CHTA) edition of Solo Hunter. It monitors CHTA wallet balances and alerts users when new coins are detected, using a lightweight ESP32 CYD platform.
<img width="2048" height="1279" alt="CHTA dashboard" src="https://github.com/user-attachments/assets/fa935d83-582f-427a-86e6-0e16c28fc639" />
<img width="2048" height="1354" alt="CHTA HUNTER" src="https://github.com/user-attachments/assets/2866cf8e-944a-42a7-9775-d935cb943bee" />
# CHEETAH_HUNTER v1.0.1

A Cheetahcoin wallet display for the ESP32-2432S028 "Cheap Yellow Display" (CYD).

Cheetah Hunter shows your live CHTA wallet balance, estimated fiat value, CHTA price, and a BLOCK FOUND popup when the wallet balance increases. It also includes a local web dashboard for setup and live status.

## Features

- Live CHTA wallet balance from the Cheetahcoin explorer
- Wallet value in USD, GBP, or CAD
- CHTA price feed using Gleec when available, with CoinPaprika fallback
- BLOCK FOUND popup when the balance increases
- Built-in WiFi setup portal
- Local web dashboard for wallet, currency, display flip, and status
- Separate ILI9341 and ST7789 sketch versions

## Hardware

- ESP32-2432S028 / Cheap Yellow Display
- USB cable for programming
- WiFi network with internet access

There are two sketch versions included:

- `CHEETAH_HUNTER_v1_0_1_ILI9341/CHEETAH_HUNTER_v1_0_1_ILI9341.ino`
- `CHEETAH_HUNTER_v1_0_1_ST7789/CHEETAH_HUNTER_v1_0_1_ST7789.ino`

Use the one that matches your CYD screen driver. If the screen is blank, mirrored, or scrambled, try the other version.

## Arduino Libraries

Install these from the Arduino Library Manager:

- `WiFiManager`
- `LovyanGFX`

You also need the ESP32 board package installed in Arduino IDE.

## Arduino IDE Setup

1. Install Arduino IDE.
2. Install the ESP32 board package from Espressif.
3. Install the required libraries listed above.
4. Open the sketch for your display type.
5. Select your ESP32 CYD-compatible board and the correct COM port.
6. Upload the sketch.

## First Boot Setup

On first boot, the device starts a setup WiFi network:

```text
SSID: CHEETAH_HUNTER_SETUP
Password: solohunter
```

Connect your phone or computer to that WiFi network. The setup portal should open automatically. If it does not, open:

```text
http://192.168.4.1
```

Enter your home WiFi credentials and save.

After the device connects to your WiFi, the screen will show its local IP address. Open that IP address in a browser to access the Cheetah Hunter web dashboard.

## Web Dashboard

From the dashboard you can:

- Enter or update your CHTA wallet address
- Select USD, GBP, or CAD
- Flip the display orientation
- View live balance, wallet value, and price
- Clear the BLOCK FOUND popup
- Reopen WiFi setup

The dashboard is hosted directly by the ESP32 on your local network.

## Important Notes

Cheetah Hunter stores its wallet and display settings separately from Solo Hunter/DGB using the `chta` settings namespace.

WiFi credentials are different. The ESP32 itself remembers WiFi networks across sketches and reflashes, so it may reconnect automatically if you previously set up WiFi on the same board.

If Arduino IDE already has an older sketch open, close and reopen the updated `.ino` file before uploading so you do not flash an old editor buffer.

## Price And Balance Data

- CHTA balance comes from the Cheetahcoin explorer.
- USD price tries the Gleec Wallet ticker feed when CHTA is present.
- USD, GBP, and CAD can fall back to CoinPaprika.

The displayed wallet value is:

```text
wallet balance x selected currency price
```

## Troubleshooting

If the wallet value looks wrong, re-enter and save the wallet address in the web dashboard, then refresh the page. Make sure you are running the updated Cheetah Hunter sketch with `PREFS_NS = "chta"`.

If the device already connects to WiFi, that is normal. ESP32 WiFi credentials are stored by the ESP32, not just by this sketch.

If the screen is upside down, use the flip setting in the web dashboard.

If the display is blank or garbled, upload the other screen-driver version.

If the setup portal does not appear, reset the device and connect manually to `CHEETAH_HUNTER_SETUP`.

