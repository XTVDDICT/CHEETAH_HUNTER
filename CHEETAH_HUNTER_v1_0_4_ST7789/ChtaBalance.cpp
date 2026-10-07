#include "ChtaBalance.h"

#include <ArduinoJson.h>
#include <WiFiClient.h>
#include <math.h>
#include <mbedtls/sha256.h>
#include <string.h>

namespace {

constexpr uint32_t ELECTRUM_TIMEOUT_MS = 6000;
constexpr size_t MAX_RESPONSE_BYTES = 512;
struct ElectrumServer {
  const char* host;
  uint16_t port;
};
constexpr ElectrumServer SERVERS[] = {
    {"electrum.blastinvest.com", 10007},
    {"electrum2.mooo.com", 10007},
    {"electrum.shorelinecrypto.com", 10007}};
size_t preferredServer = 0;

// Address validation and script hashing follow HELIOS Hunter's CHTA reader.
bool sha256Bytes(const uint8_t* data, size_t length, uint8_t output[32]) {
  mbedtls_sha256_context context;
  mbedtls_sha256_init(&context);
  bool ok = mbedtls_sha256_starts(&context, 0) == 0 &&
            mbedtls_sha256_update(&context, data, length) == 0 &&
            mbedtls_sha256_finish(&context, output) == 0;
  mbedtls_sha256_free(&context);
  return ok;
}

bool decodeBase58Address(const String& address, uint8_t& version,
                         uint8_t hash[20]) {
  static constexpr char ALPHABET[] =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  if (address.isEmpty() || address.length() > 64) return false;
  size_t zeroCount = 0;
  while (zeroCount < address.length() && address[zeroCount] == '1') {
    ++zeroCount;
  }
  uint8_t littleEndian[40] = {};
  size_t littleLength = 0;
  for (size_t i = zeroCount; i < address.length(); ++i) {
    const char* digit = strchr(ALPHABET, address[i]);
    if (!digit) return false;
    uint32_t carry = static_cast<uint32_t>(digit - ALPHABET);
    for (size_t j = 0; j < littleLength; ++j) {
      carry += static_cast<uint32_t>(littleEndian[j]) * 58U;
      littleEndian[j] = static_cast<uint8_t>(carry & 0xffU);
      carry >>= 8;
    }
    while (carry != 0) {
      if (littleLength >= sizeof(littleEndian)) return false;
      littleEndian[littleLength++] = static_cast<uint8_t>(carry & 0xffU);
      carry >>= 8;
    }
  }
  if (zeroCount + littleLength != 25) return false;
  uint8_t decoded[25] = {};
  for (size_t i = 0; i < littleLength; ++i) {
    decoded[zeroCount + i] = littleEndian[littleLength - 1U - i];
  }
  uint8_t firstHash[32];
  uint8_t checksum[32];
  if (!sha256Bytes(decoded, 21, firstHash) ||
      !sha256Bytes(firstHash, sizeof(firstHash), checksum) ||
      memcmp(checksum, decoded + 21, 4) != 0) {
    return false;
  }
  version = decoded[0];
  memcpy(hash, decoded + 1, 20);
  return true;
}

bool addressToScriptHash(const String& wallet, String& scriptHash) {
  uint8_t version;
  uint8_t hash[20];
  if (!decodeBase58Address(wallet, version, hash)) return false;
  uint8_t script[25];
  size_t length;
  if (version == 28) {
    script[0] = 0x76;
    script[1] = 0xa9;
    script[2] = 0x14;
    memcpy(script + 3, hash, 20);
    script[23] = 0x88;
    script[24] = 0xac;
    length = 25;
  } else if (version == 5) {
    script[0] = 0xa9;
    script[1] = 0x14;
    memcpy(script + 2, hash, 20);
    script[22] = 0x87;
    length = 23;
  } else {
    return false;
  }
  uint8_t digest[32];
  if (!sha256Bytes(script, length, digest)) return false;
  static constexpr char HEX_DIGITS[] = "0123456789abcdef";
  scriptHash = "";
  scriptHash.reserve(64);
  for (int i = 31; i >= 0; --i) {
    scriptHash += HEX_DIGITS[digest[i] >> 4];
    scriptHash += HEX_DIGITS[digest[i] & 0x0f];
  }
  return true;
}

bool queryServer(const ElectrumServer& server, const String& scriptHash,
                 double& balance, String& error) {
  WiFiClient client;
  client.setTimeout(ELECTRUM_TIMEOUT_MS);
  if (!client.connect(server.host, server.port, ELECTRUM_TIMEOUT_MS)) {
    error = "BAL OFFLINE";
    return false;
  }
  client.setNoDelay(true);
  String request =
      "{\"id\":1,\"method\":\"server.version\",\"params\":[\"CHEETAH_HUNTER\",\"1.4\"]}\n";
  request += "{\"id\":2,\"method\":\"blockchain.scripthash.get_balance\",\"params\":[\"";
  request += scriptHash + "\"]}\n";
  if (client.print(request) != request.length()) {
    client.stop();
    error = "BAL SEND FAIL";
    return false;
  }

  String line;
  line.reserve(MAX_RESPONSE_BYTES);
  uint32_t startedAt = millis();
  error = "BAL TIMEOUT";
  while ((uint32_t)(millis() - startedAt) < ELECTRUM_TIMEOUT_MS) {
    while (client.available() &&
           (uint32_t)(millis() - startedAt) < ELECTRUM_TIMEOUT_MS) {
      char ch = static_cast<char>(client.read());
      if (ch == '\r') continue;
      if (ch != '\n') {
        if (line.length() >= MAX_RESPONSE_BYTES) {
          client.stop();
          error = "BAL RESPONSE LARGE";
          return false;
        }
        line += ch;
        continue;
      }
      JsonDocument document;
      DeserializationError parsed = deserializeJson(document, line);
      line = "";
      if (parsed || document["id"] != 2) continue;
      JsonObject result = document["result"];
      if (result.isNull() || !result["confirmed"].is<int64_t>() ||
          !result["unconfirmed"].is<int64_t>()) {
        client.stop();
        error = "BAL BAD RESPONSE";
        return false;
      }
      double value = (static_cast<double>(result["confirmed"].as<int64_t>()) +
                      static_cast<double>(result["unconfirmed"].as<int64_t>())) /
                     100000000.0;
      client.stop();
      if (!isfinite(value) || value < 0.0) {
        error = "BAL BAD RESPONSE";
        return false;
      }
      balance = value;
      error = "";
      return true;
    }
    if (!client.connected()) break;
    vTaskDelay(pdMS_TO_TICKS(5));
  }
  client.stop();
  return false;
}

}  // namespace

bool chtaFetchElectrumBalance(const String& wallet, double& balance,
                             String& source, String& error) {
  String scriptHash;
  if (!addressToScriptHash(wallet, scriptHash)) {
    error = "BAL INVALID WALLET";
    return false;
  }
  const size_t count = sizeof(SERVERS) / sizeof(SERVERS[0]);
  for (size_t attempt = 0; attempt < count; ++attempt) {
    size_t index = (preferredServer + attempt) % count;
    if (queryServer(SERVERS[index], scriptHash, balance, error)) {
      preferredServer = index;
      source = SERVERS[index].host;
      return true;
    }
    if (attempt + 1 < count) vTaskDelay(pdMS_TO_TICKS(100));
  }
  return false;
}
