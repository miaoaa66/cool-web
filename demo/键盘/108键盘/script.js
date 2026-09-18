(function () {
  const keyDisplay = document.getElementById('keyDisplay');
  const keyboard = document.getElementById('keyboard');

  const codeToKey = {
    Escape: 'Escape',
    F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4',
    F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8',
    F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
    PrintScreen: 'PrintScreen', ScrollLock: 'ScrollLock', Pause: 'Pause',
    Backspace: 'Backspace', Tab: 'Tab', CapsLock: 'CapsLock',
    Enter: 'Enter', ShiftLeft: 'ShiftLeft', ShiftRight: 'ShiftRight',
    ControlLeft: 'ControlLeft', ControlRight: 'ControlRight',
    AltLeft: 'AltLeft', AltRight: 'AltRight',
    MetaLeft: 'MetaLeft', MetaRight: 'MetaRight',
    ContextMenu: 'ContextMenu', Space: 'Space',
    ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
    Insert: 'Insert', Home: 'Home', PageUp: 'PageUp',
    Delete: 'Delete', End: 'End', PageDown: 'PageDown',
    NumLock: 'NumLock',
    NumpadDivide: 'NumpadDivide', NumpadMultiply: 'NumpadMultiply',
    NumpadSubtract: 'NumpadSubtract', NumpadAdd: 'NumpadAdd',
    NumpadEnter: 'NumpadEnter', NumpadDecimal: 'NumpadDecimal',
    Numpad0: 'Numpad0', Numpad1: 'Numpad1', Numpad2: 'Numpad2',
    Numpad3: 'Numpad3', Numpad4: 'Numpad4', Numpad5: 'Numpad5',
    Numpad6: 'Numpad6', Numpad7: 'Numpad7', Numpad8: 'Numpad8',
    Numpad9: 'Numpad9',
    Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
    Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
    Digit0: '0', Minus: '-', Equal: '=',
    BracketLeft: '[', BracketRight: ']', Backslash: '\\',
    Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
    KeyA: 'A', KeyB: 'B', KeyC: 'C', KeyD: 'D', KeyE: 'E',
    KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyI: 'I', KeyJ: 'J',
    KeyK: 'K', KeyL: 'L', KeyM: 'M', KeyN: 'N', KeyO: 'O',
    KeyP: 'P', KeyQ: 'Q', KeyR: 'R', KeyS: 'S', KeyT: 'T',
    KeyU: 'U', KeyV: 'V', KeyW: 'W', KeyX: 'X', KeyY: 'Y', KeyZ: 'Z'
  };

  const displayMap = {
    Escape: 'Esc',
    PrintScreen: 'Print Screen', ScrollLock: 'Scroll Lock', Pause: 'Pause/Break',
    ShiftLeft: 'Shift (L)', ShiftRight: 'Shift (R)',
    ControlLeft: 'Ctrl (L)', ControlRight: 'Ctrl (R)',
    AltLeft: 'Alt (L)', AltRight: 'Alt (R)',
    MetaLeft: 'Win (L)', MetaRight: 'Win (R)',
    ContextMenu: 'Menu', Space: 'Space Bar',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    Insert: 'Insert', PageUp: 'Page Up', PageDown: 'Page Down',
    Delete: 'Delete', Home: 'Home', End: 'End',
    NumLock: 'Num Lock', NumpadEnter: 'Enter (Numpad)',
    NumpadDivide: '/ (Numpad)', NumpadMultiply: '* (Numpad)',
    NumpadSubtract: '- (Numpad)', NumpadAdd: '+ (Numpad)',
    NumpadDecimal: '. (Numpad)'
  };

  function getDisplayText(key) {
    if (displayMap[key]) return displayMap[key];
    if (codeToKey[key]) return codeToKey[key];
    return key;
  }

  function showKey(keyName) {
    const displayText = getDisplayText(keyName);
    keyDisplay.innerHTML =
      '<span class="key-display-label">当前按键</span>' +
      '<span class="key-display-value">' + displayText + '</span>';
  }

  function flashKey(keyName) {
    const selector = '[data-key="' + keyName + '"]';
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('active-blue');
    setTimeout(() => el.classList.remove('active-blue'), 150);
  }

  keyboard.addEventListener('click', function (e) {
    const key = e.target.closest('.key');
    if (!key) return;
    const keyName = key.dataset.key;
    flashKey(keyName);
    showKey(keyName);
  });

  const activeKeys = new Set();

  document.addEventListener('keydown', function (e) {
    const dataKey = codeToKey[e.code];
    if (!dataKey) return;
    if (activeKeys.has(e.code)) return;
    activeKeys.add(e.code);
    flashKey(dataKey);
    showKey(dataKey);

    if (e.code === 'Tab' || e.code === 'Space') {
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', function (e) {
    activeKeys.delete(e.code);
  });

  document.addEventListener('blur', function () {
    activeKeys.clear();
    document.querySelectorAll('.key.active-blue').forEach(function (el) {
      el.classList.remove('active-blue');
    });
  });

  keyDisplay.innerHTML =
    '<span class="key-display-label">提示</span>' +
    '<span class="key-display-value">点击键盘按键</span>';
})();