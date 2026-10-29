const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const screens = ['ST7789', 'ILI9341'];
const folder = screen => path.join(root, `CHEETAH_HUNTER_v1_0_5_${screen}`);
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const sketch = screen => read(path.join(folder(screen), `CHEETAH_HUNTER_v1_0_5_${screen}.ino`));
const engineFiles = [
  'SoloHunterMiner.cpp', 'SoloHunterMiner.h', 'SoloHunterSha256.cpp',
  'SoloHunterSha256.h', 'HeliosPipelinedSha.S', 'HeliosSoftwareShaPrefilter.S',
  'HeliosNetworkMemory.cpp', 'HeliosNetworkMemory.h', 'HeliosCooperativeTls.h',
];

test('both panels keep identical behavior except controller and SPI speed', () => {
  assert.equal(sketch('ST7789').replaceAll('ST7789', 'ILI9341')
    .replace('freq_write = 40000000', 'freq_write = 27000000'), sketch('ILI9341'));
  for (const file of [...engineFiles, 'ChtaBalance.cpp', 'ChtaBalance.h', 'THIRD_PARTY_NOTICES.md']) {
    assert.equal(read(path.join(folder('ST7789'), file)), read(path.join(folder('ILI9341'), file)), file);
  }
});

const donor = path.resolve(root, '..', '..', 'SOLO_HUNTER_v1_0_7_ST7789');
test('ported mining sources match SOLO v1.0.7 except pool client identity',
  { skip: !fs.existsSync(donor) }, () => {
    for (const file of engineFiles) {
      const expected = read(path.join(donor, file))
        .replace('SOLO_HUNTER/1.0.7', 'CHEETAH_HUNTER/1.0.5');
      assert.equal(read(path.join(folder('ST7789'), file)), expected, file);
    }
  });

function embeddedScript(source) {
  const start = source.indexOf('  page += "<script>";');
  const end = source.indexOf('  page += "</script>', start);
  assert.ok(start >= 0 && end > start);
  return [...source.slice(start + '  page += "<script>";'.length, end)
    .matchAll(/^  page \+= (".*");$/gm)]
    .map(match => JSON.parse(match[1])).join('\n');
}

function browserContext(data) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', value: '', hidden: true, checked: false, dataset: {},
      addEventListener() {}, classList: { toggle() {} },
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => [] },
    location: { hash: '', search: '', pathname: '/' },
    history: { replaceState() {} }, AbortController,
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1,
    fetch: async () => ({ ok: true, json: async () => ({ ...data }) }),
  });
  return { context, element };
}

for (const screen of screens) {
  test(`${screen}: sketch, Web UI, status and pool client identify v1.0.5`, () => {
    const source = sketch(screen);
    assert.match(source, /CHEETAH HUNTER v1\.0\.5/);
    assert.match(source, /firmware_version[^\n]+1\.0\.5/);
    assert.doesNotMatch(source, /1\.0\.4/);
    const miner = read(path.join(folder(screen), 'SoloHunterMiner.cpp'));
    assert.match(miner, /CHEETAH_HUNTER\/1\.0\.5/);
    assert.doesNotMatch(miner, /CHEETAH_HUNTER\/1\.0\.4/);
  });

  test(`${screen}: EUR is wired through persistence, API, quotes and device glyph`, () => {
    const source = sketch(screen);
    assert.match(source, /currency == "EUR"/);
    assert.match(source, /currencyCode == "EUR"\) return chtaPriceEur/);
    assert.match(source, /prefs\.getFloat\("lasteur", 0\.0f\)/);
    assert.equal((source.match(/prefs\.putFloat\("lasteur", chtaPriceEur\)/g) || []).length, 2);
    assert.match(source, /currencyChoiceHtml\("EUR", "Euro"/);
    assert.ok(source.includes('"\\"chta_eur\\":" + String(chtaPriceEur, 8)'));
    assert.match(source, /euroGlyph\[8\]/);
    assert.match(source, /drawCurrencyGlyph2x\(currencyCode, poundX/);
    assert.ok(source.includes('document["quotes"]["EUR"]["price"]'));
    assert.match(source, /isfinite\(eur\) && eur > 0\.0f/);
    assert.match(source, /haveFiatData = \(currentChtaFiatPrice\(\) > 0\.0f\)/);
    assert.match(source, /const char\* PREFS_NS = "chta"/);
  });

  test(`${screen}: requests respect CoinPaprika's three-quote limit`, () => {
    const source = sketch(screen);
    const match = source.match(/currencyCode == "EUR" \? "([A-Z,]+)" : "([A-Z,]+)"/);
    assert.ok(match);
    assert.deepEqual(match[1].split(','), ['USD', 'EUR']);
    for (const list of match.slice(1)) assert.ok(list.split(',').length <= 3);
    assert.ok(source.includes('coinpaprikaTickerUrl(currentCurrencyCode())'));
  });

  test(`${screen}: bounded helper scheduling and cooperative foreground hooks`, () => {
    const source = sketch(screen);
    assert.match(source, /heliosNetworkMemoryBegin\(\);[\s\S]*soloHunterMinerBegin\(/);
    assert.equal((source.match(/HeliosNetworkMemoryGuard networkWork\(portMAX_DELAY, true\)/g) || []).length, 2);
    assert.equal((source.match(/HeliosCooperativeTls client\(20000\)/g) || []).length, 2);
    for (const name of ['drawCurrencyGlyph2x', 'drawMiningStats', 'drawBorder',
      'drawStaticLayout', 'drawValues', 'drawConnectionStatus', 'drawBlockPopup']) {
      assert.match(source, new RegExp(`void ${name}\\([^\\n]*\\) \\{\\n  HeliosDisplayWorkGuard displayWork;`));
    }
    assert.match(source, /if \(webWork\) server\.handleClient\(\)/);
    assert.match(source, /HELIOS-PIPELINED-V2/);
    assert.doesNotMatch(source, /MH\/s|KH\/s|extractCoinpaprikaQuotePrice/);
    const miner = read(path.join(folder(screen), 'SoloHunterMiner.cpp'));
    assert.match(miner, /StratumMessageWriter writer\(client, profile\)/);
    assert.match(miner, /written != used_/);
    assert.match(miner, /heliosBalanceNetworkBusy\(\)/);
    assert.match(miner, /SUGGESTED_DIFFICULTY = 0\.001/);
  });

  test(`${screen}: web dashboard runs with all currencies and four-digit kH/s`, async () => {
    const data = {
      ip: '10.0.0.248', currency: 'EUR', currency_name: 'Euro',
      have_wallet_data: true, have_fiat_data: true, wallet_configured: true,
      wallet_fiat: 20, chta_fiat: 0.25, balance_chta: 80,
      mining_enabled: true, mining_hashrate_kh: 1234,
      mining_primary_hashrate_kh: 1000, mining_auxiliary_hashrate_kh: 234,
    };
    const { context, element } = browserContext(data);
    new vm.Script(embeddedScript(sketch(screen))).runInContext(context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element('mh').textContent, '1234 kH/s');
    assert.equal(element('mhr').textContent, 'Primary: 1000 kH/s | Helper: 234 kH/s');
    assert.equal(element('mv').textContent, 'v1.0.5 / HELIOS-PIPELINED-V2');
    for (const [currency, prefix] of [['EUR', '\u20ac'], ['GBP', '\u00a3'], ['CAD', 'CAD$'], ['USD', '$']]) {
      data.currency = currency;
      await context.refreshStatus();
      assert.equal(element('wf').textContent, `${prefix}20.00`);
    }
    data.currency = 'EUR';
    data.have_fiat_data = false;
    await context.refreshStatus();
    assert.equal(element('wf').textContent, 'EUR WAIT');
    assert.equal(element('pf').textContent, 'EUR WAIT');
    assert.equal(vm.runInContext('hashFmt(1000)', context), '1000 kH/s');
    assert.equal(vm.runInContext('hashFmt(1050.6)', context), '1051 kH/s');
  });
}
