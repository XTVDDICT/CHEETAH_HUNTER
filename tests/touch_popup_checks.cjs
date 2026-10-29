const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const screens = ['ST7789', 'ILI9341'];
const sources = screens.flatMap(screen => [
  { name: `CHTA ${screen}`, foreground: 'serviceChtaForeground',
    file: path.join(root, `CHEETAH_HUNTER_v1_0_5_${screen}`, `CHEETAH_HUNTER_v1_0_5_${screen}.ino`) },
  { name: `SOLO ${screen}`, foreground: 'serviceSoloForeground',
    file: path.resolve(root, '..', '..', `SOLO_HUNTER_v1_0_7_${screen}`, `SOLO_HUNTER_v1_0_7_${screen}.ino`) },
]);
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

function body(source, name) {
  const match = source.match(new RegExp(`void ${name}\\([^\\n]*\\) \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, name);
  return match[1];
}

// Run just the simple touch-control flow as JS, not a compiled firmware test.
// Hardware I/O and the display guard are checked separately in source below.
function controlFlow(source, state) {
  const statics = [];
  let code = body(source, 'serviceBlockPopupTouch')
    .replace(/  static (?:uint32_t|bool) (\w+) = ([^;]+);\n/g, (_, name, value) => {
      statics.push(`let ${name} = ${value};`);
      return '';
    })
    .replace('(uint32_t)(now - lastPollAt)', '((now - lastPollAt) >>> 0)')
    .replace('uint32_t now', 'let now')
    .replace('bool pressed', 'let pressed')
    .replace('TS_Point point', 'const point')
    .replace('  HeliosDisplayWorkGuard touchWork;', '');
  assert.equal(statics.length, 2);
  const context = vm.createContext({
    millis: () => state.time,
    isBlockPopupVisible: () => state.popup,
    clearBlockPopup: () => { state.clears++; state.popup = false; },
    touch: {
      touched: () => { state.reads++; return state.pressed; },
      getPoint: () => ({ z: state.pressure }),
    },
  });
  return vm.runInContext(`(() => { ${statics.join('\n')} return () => { ${code} }; })()`, context);
}

for (const item of sources) {
  const options = { skip: !fs.existsSync(item.file) };
  test(`${item.name}: HELIOS touch wiring and Web button removal`, options, () => {
    const source = read(item.file);
    assert.match(source, /#include <XPT2046_Touchscreen\.h>/);
    assert.match(source, /SPIClass touchSpi\(VSPI\)/);
    assert.match(source, /XPT2046_Touchscreen touch\(33\)/);
    const setup = body(source, 'setup');
    assert.match(setup, /touchSpi\.begin\(25, 39, 32, 33\)/);
    assert.ok(setup.indexOf('touch.begin(touchSpi)') < setup.indexOf('applyRotation()'));
    assert.match(body(source, 'applyRotation'), /touch\.setRotation\(cfgFlip \? 3 : 1\)/);
    const foreground = body(source, item.foreground);
    assert.ok(foreground.indexOf('serviceBlockPopupTouch();') >= 0);
    assert.ok(foreground.indexOf('serviceBlockPopupTouch();') < foreground.indexOf('WiFi.status()'));
    assert.match(foreground, /delay\(isBlockPopupVisible\(\) \? 20 : 100\)/);
    assert.match(body(source, 'serviceBlockPopupTouch'), /HeliosDisplayWorkGuard touchWork/);
    assert.match(body(source, 'clearBlockPopup'), /drawStaticLayout\(\);\n  drawValues\(\)/);
    assert.doesNotMatch(source, /action='\/clear-popup'|<h2>Block Alert<\/h2>/);
  });

  test(`${item.name}: tap, pressure, hold, idle and timer-wrap behavior`, options, () => {
    const state = { time: 100, popup: false, pressed: false, pressure: 0, reads: 0, clears: 0 };
    const tick = controlFlow(read(item.file), state);
    tick();
    assert.equal(state.reads, 0, 'no idle touch polling');
    state.popup = true;
    tick();
    state.time = 110;
    state.pressed = true;
    state.pressure = 400;
    tick();
    assert.equal(state.reads, 1, '20 ms polling interval');
    state.time = 120;
    state.pressure = 399;
    tick();
    assert.equal(state.clears, 0, 'reject weak pressure');
    state.time = 140;
    state.pressure = 400;
    tick();
    assert.equal(state.clears, 1, 'tap anywhere clears popup');
    state.popup = true;
    state.time = 160;
    tick();
    assert.equal(state.clears, 1, 'held finger cannot clear next popup');
    state.time = 180;
    state.pressed = false;
    tick();
    state.time = 200;
    state.pressed = true;
    tick();
    assert.equal(state.clears, 2, 'new tap after release clears next popup');
    state.time = 220;
    state.pressed = false;
    tick();
    const idleReads = state.reads;
    state.time = 240;
    tick();
    assert.equal(state.reads, idleReads, 'idle polling stops after release');
    state.popup = true;
    state.time = 0xfffffff0;
    tick();
    const beforeWrap = state.reads;
    state.time = 4;
    tick();
    assert.equal(state.reads, beforeWrap + 1, 'millis rollover remains responsive');
  });
}

test('SOLO panels retain parity outside their controller and SPI speed',
  { skip: sources.some(item => !fs.existsSync(item.file)) }, () => {
    const st = read(sources.find(item => item.name === 'SOLO ST7789').file);
    const ili = read(sources.find(item => item.name === 'SOLO ILI9341').file);
    assert.equal(st.replaceAll('ST7789', 'ILI9341')
      .replace('freq_write = 40000000', 'freq_write = 27000000'), ili);
  });
