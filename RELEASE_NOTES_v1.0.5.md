# CHEETAH HUNTER v1.0.5

Both ILI9341 and ST7789 versions now use the HELIOS pipelined-v2 mining
engine, assembly helper, and buffered Stratum messages. This release also
adds EUR valuation and touch-to-dismiss wallet alerts. The Web clear-alert
button is removed. Speeds remain in kH/s, including above 1,000.

## Fresh Install: Clears Settings

Use the matching `.ino.merged.bin` at **0x0** in
[Espressif ESP Web Tool](https://espressif.github.io/esptool-js/).
The complete 4 MB image replaces saved settings even without a separate full
erase. After reset, join CHEETAH_HUNTER_SETUP with password `solohunter`,
configure WiFi, and open the device IP to configure wallet and mining settings.

## Update: Retains Settings on a Compatible Installation

For official v1.0.3/v1.0.4 Huge APP installations, use the matching
`.ino.bin` at **0x10000**, with **Erase All disabled**. Do not use a merged
image for a settings-preserving update. Refresh the browser after reboot.

For an older compatible layout with NVS at 0x9000/size 0x5000 but a smaller
app slot, write `.ino.partitions.bin` at **0x8000** and `.ino.bin` at
**0x10000** together, again without a whole-chip erase. Unknown/custom layouts
should use a clean install rather than an unverified settings-preserving update.

**0x1000 is for the bootloader, not the merged or app-only release image.**

## Included Files

- Complete merged images for both screens
- App-only updates for both screens
- Exported partition tables for both screens
- SHA256SUMS.txt and the complete current source with required notices

The owner's exported binaries were checked against the current source and
Arduino build cache, merged offsets, partition layout, and blank NVS storage.
No firmware was compiled or re-exported during publication. Source/browser
checks pass; hardware testing and measured sustained speed remain device-specific.

Tap anywhere on a visible BLOCK FOUND notification to clear it. A wallet
receipt notification does not prove that this ESP32 found a mining block.
[Full installation and update instructions](https://github.com/XTVDDICT/CHEETAH_HUNTER/blob/v1.0.5/README.md).
Verify downloads with SHA256SUMS.txt.
