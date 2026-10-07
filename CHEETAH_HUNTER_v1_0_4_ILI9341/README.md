# CHEETAH HUNTER v1.0.4 - ILI9341

Source update using the HELIOS mining engine already integrated into SOLO
HUNTER. Open `CHEETAH_HUNTER_v1_0_4_ILI9341.ino` with all six support files
(`SoloHunterMiner`, `SoloHunterSha256`, and `ChtaBalance` .cpp/.h pairs)
in this folder. Reopen the sketch in Arduino IDE after updating its files.

The engine includes hardware SHA acceleration, a second-core software helper,
candidate verification, hardware recovery, and Stratum reconnect handling.
The primary miner runs on core 1. Display/web work and the software helper run
on core 0, with display/web work taking priority. Wallet and price requests
no longer pause mining.

The sketch explicitly requests the standard 240 MHz CPU / 80 MHz APB clocks.
Balance and price requests temporarily share idle priority with the helper
miner instead of starving it during CPU-bound network work.

Wallet balance now uses the same CHTA Electrum address validation and servers
as HELIOS Hunter, with automatic fallback between servers. The unresponsive
HTTP explorer is no longer polled for balances or mined-transaction alerts.
Wallet increases still trigger the existing popup. Successful balance checks
run every two minutes; failed checks retry after 30 seconds without clearing
the last good balance. The screen footer keeps the IP visible beside status.

`/status` now includes CPU/APB clocks, primary/helper hashrates, chip revision,
SHA timing, fast-path state, self-test/fallback/recovery diagnostics, balance
source, and whether the last balance request succeeded. The Mining tab labels
the engine `HW SHA FAST`, `HW SHA SAFE`, or `CPU FALLBACK`. These diagnostics
are needed to verify full speed on the actual device; no hashrate is guaranteed
by source inspection alone.

- Build label: `v1.0.4 / HELIOS-ENGINE`
- Pool client identifier: `CHEETAH_HUNTER/1.0.4`
- Suggested pool difficulty: `0.001`, matching SOLO HUNTER's HELIOS engine
- Classic ESP32 CYD: 240 MHz CPU / 80 MHz APB
- Partition: Huge APP (3MB No OTA/1MB SPIFFS)
- Libraries: WiFiManager, LovyanGFX, ArduinoJson
- Use the same ESP32 core installation as the SOLO/HELIOS engine.

The higher suggested share difficulty reduces submission traffic versus the
old CHTA default. It does not change the network block target or skip hashes,
and the pool still controls the actual share difficulty. Fewer submitted
shares do not mean fewer mining attempts. After flashing, check the actual
pool difficulty in `/status` and compare sustained hashrate, not just peaks.

The CHTA wallet display, alerts, settings namespace, and v1.0.3 Web UI are
retained. Existing v1.0.3 binaries are still the previous firmware.

The repository owner exported the v1.0.4 release binaries with ESP32 core
`3.3.12` and Huge APP. Sources and exported images were checked against the
Arduino cached build. Full instructions and both binary types are linked in
the repository README. No build or export was run as part of publication.

Merged image: `0x0`, replaces saved settings. App-only image: `0x10000`,
for an existing compatible Huge APP installation without a full erase.
Hardware validation still includes accepted shares, sustained hashrate,
wallet and price refreshes, web saves, enable/disable, and pool reconnection.
