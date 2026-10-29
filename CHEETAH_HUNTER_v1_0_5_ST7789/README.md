# CHEETAH HUNTER - ST7789 Current Source

Open `CHEETAH_HUNTER_v1_0_5_ST7789.ino` from this existing folder.
The source build is **v1.0.5 / HELIOS-PIPELINED-V2**, distinct from the
previously exported v1.0.4 / HELIOS-ENGINE binaries. Those binaries have not
been rebuilt, replaced, or published again.

## Mining Engine

The mining engine and dependencies match SOLO HUNTER v1.0.7 as of
2026-10-28, except for the pool client identifier `CHEETAH_HUNTER/1.0.5`.
This brings over the pipelined-v2 hardware SHA loops, assembly software
prefilter, buffered Stratum messages, candidate verification and recovery,
and cooperative scheduling for the helper, rendering, and TLS.

The primary miner runs on core 1 at priority 19. The core-0 software helper
uses bounded 20 ms slices with two idle ticks and pauses during display or
balance/price work. The sketch requests 240 MHz CPU / 80 MHz APB clocks.
Suggested share difficulty remains `0.001`; the pool controls the actual value.
Hashrate is shown in kH/s, including rates at or above 1,000.

The same engine is intended to bring the speed improvements seen in SOLO,
but a measured 1,000 kH/s rate is not guaranteed by source inspection.
Check sustained primary/helper rates and accepted shares on the device.

## Currencies and Existing Features

USD, GBP, CAD, and EUR are selectable in the Web UI. EUR selection and its
last valid quote are stored in the existing `chta` settings namespace.
The device draws its own euro/pound glyph; the browser uses the matching
currency symbol. Missing EUR quotes display `EUR WAIT`, not a USD value.

USD retains the Gleec feed with CoinPaprika fallback. Other currencies use
CoinPaprika; EUR requests `USD,EUR` and existing currencies request
`USD,GBP,CAD`, respecting the API's three-quote limit. Valid cached quotes
are retained during outages.

CHTA Electrum balances, automatic server fallback, two-minute balance polling,
30-second failure retry, persistent IP/status footer, wallet-increase popup,
settings save behavior, and panel wiring remain in place.

Tap anywhere on the screen while a BLOCK FOUND notification is visible to
clear it. Touch handling also runs without WiFi. A held finger must be
released before it can clear another notification. The Web clear-alert
button has been removed.

## Required Files and Build Settings

Keep every .cpp, .h, and .S file in this folder beside the sketch.
Both `HeliosPipelinedSha.S` and `HeliosSoftwareShaPrefilter.S` are required,
along with `HeliosNetworkMemory.cpp/.h`, `HeliosCooperativeTls.h`,
`SoloHunterMiner.cpp/.h`, `SoloHunterSha256.cpp/.h`, and `ChtaBalance.cpp/.h`.
Retain `THIRD_PARTY_NOTICES.md` when sharing.

Use the same ESP32 core installation as current SOLO/HELIOS, classic
ESP32 CYD at 240 MHz CPU / 80 MHz APB, and Huge APP (3MB No OTA/1MB SPIFFS).
Libraries: WiFiManager, LovyanGFX, ArduinoJson, XPT2046_Touchscreen.
If Arduino IDE does not pick up
new external source files, reopen the sketch before compiling.

Source and browser-script checks only. The user compiles, exports, and flashes.
Validate accepted/rejected shares, sustained kH/s, SHA timing/recoveries,
watchdog stability, EUR selection across reboot, cached/missing prices,
wallet refreshes, web saves, mining enable/disable, and pool reconnection.
