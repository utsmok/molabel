function render({ model, el }) {
  // Use a more robust method to load external CSS via @import.
  function loadExternalStyles() {
    const styleId = 'molabel-external-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url("https://cdn.jsdelivr.net/npm/gamepad.css@latest/styles.min.css");
      @import url("https://unpkg.com/keyboard-css@1.2.4/dist/css/main.min.css");
    `;
    document.head.appendChild(style);
  }
  loadExternalStyles();

  // --- 1. DOM Element Creation ---
  const container = document.createElement('div');
  container.className = 'molabel-container';
  container.tabIndex = 0;

  const header = document.createElement('div');
  header.className = 'molabel-header';

  const statusContainer = document.createElement('div');
  statusContainer.className = 'molabel-header-center';
  const status = document.createElement('div');
  status.className = 'molabel-status';
  statusContainer.appendChild(status);

  const helpIcon = document.createElement('div');
  helpIcon.className = 'molabel-help-icon';
  helpIcon.innerHTML = '❓';
  helpIcon.title = "Show shortcuts (hold Alt+i)";

  header.appendChild(document.createElement('div')); // Left spacer
  header.appendChild(statusContainer);
  header.appendChild(helpIcon);

  const exampleContainer = document.createElement('div');
  exampleContainer.className = 'molabel-example';
  const lastChoiceDisplay = document.createElement('div');
  lastChoiceDisplay.className = 'molabel-last-choice';
  const controls = document.createElement('div');
  controls.className = 'molabel-controls';

  const btnMap = {
    prev: document.createElement('button'),
    yes: document.createElement('button'),
    no: document.createElement('button'),
    skip: document.createElement('button'),
  };
  btnMap.prev.textContent = 'Previous';
  btnMap.yes.textContent = 'Yes';
  btnMap.no.textContent = 'No';
  btnMap.skip.textContent = 'Skip';
  Object.entries(btnMap).forEach(([key, btn]) => {
    btn.className = `molabel-btn molabel-btn-${key}`;
    controls.appendChild(btn);
  });

  const notesContainer = document.createElement('div');
  notesContainer.className = 'molabel-notes-container';
  const notesLabelContainer = document.createElement('div');
  notesLabelContainer.className = 'molabel-notes-label-container';
  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'Notes:';

  const micButton = document.createElement('button');
  micButton.className = 'molabel-mic-btn';
  micButton.innerHTML = '🎤';
  micButton.title = 'Record notes with speech';
  micButton.type = 'button';

  const speechSelectionBtn = document.createElement('button');
  speechSelectionBtn.className = 'molabel-speech-select-btn';
  speechSelectionBtn.innerHTML = '🗣️';
  speechSelectionBtn.title = 'Toggle Speech Command mode';
  speechSelectionBtn.type = 'button';

  const gamepadIndicator = document.createElement('span');
  gamepadIndicator.className = 'molabel-gamepad-indicator';
  gamepadIndicator.innerHTML = '🎮';
  gamepadIndicator.style.display = 'none';
  gamepadIndicator.title = 'Gamepad detected';

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'molabel-button-container';
  buttonContainer.appendChild(gamepadIndicator);
  buttonContainer.appendChild(speechSelectionBtn);
  buttonContainer.appendChild(micButton);

  notesLabelContainer.appendChild(notesLabel);
  notesLabelContainer.appendChild(buttonContainer);

  const notesField = document.createElement('textarea');
  notesField.className = 'molabel-notes';
  notesField.rows = 3;
  notesField.placeholder = 'Add any notes...';

  notesContainer.appendChild(notesLabelContainer);
  notesContainer.appendChild(notesField);

  const progressContainer = document.createElement('div');
  progressContainer.className = 'molabel-progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'molabel-progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'molabel-progress-fill';
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);

  const shortcutsInfo = document.createElement('div');
  shortcutsInfo.className = 'molabel-shortcuts';

  const helpOverlay = document.createElement('div');
  helpOverlay.className = 'molabel-help-overlay';

  container.appendChild(header);
  container.appendChild(progressContainer);
  container.appendChild(exampleContainer);
  container.appendChild(lastChoiceDisplay);
  container.appendChild(controls);
  container.appendChild(notesContainer);
  container.appendChild(shortcutsInfo);
  container.appendChild(helpOverlay);
  el.appendChild(container);

  // --- 2. State Variables ---
  let gamepadConnected = false, gamepadIndex = -1;
  let speechRecognition = null, speechAvailable = false, isRecording = false, speechGamepadPressed = false, originalNotesText = '';
  let isSpeechSelectionMode = false, speechSelectionToggledOn = false, speechSelectionHotkeyDown = false;
  let lastButtonStates = {};

  // --- 3. Helper Functions ---
  const GAMEPAD_BUTTON_MAP = {
    button_0: { xbox: 'a', ps: 'cross' }, button_1: { xbox: 'b', ps: 'circle' },
    button_2: { xbox: 'x', ps: 'square' }, button_3: { xbox: 'y', ps: 'triangle' },
    button_4: { xbox: 'lb', ps: 'l1' }, button_5: { xbox: 'rb', ps: 'r1' },
    button_6: { xbox: 'lt', ps: 'l2' }, button_7: { xbox: 'rt', ps: 'r2' },
    button_8: { xbox: 'back', ps: 'share' }, button_9: { xbox: 'start', ps: 'options' },
  };

  function formatKeyboardShortcut(shortcut) {
    return shortcut.split('+').map(key => `<kbd class="kbc-button">${key}</kbd>`).join(' + ');
  }

  function formatGamepadShortcut(buttonKey) {
      const map = GAMEPAD_BUTTON_MAP[buttonKey];
      if (!map) return '';
      return `<div class="gamepad-button-wrapper"><i class="gamepad-button gamepad-button-xbox gamepad-button-xbox--${map.xbox}"></i> / <i class="gamepad-button gamepad-button-playstation gamepad-button-playstation--${map.ps}"></i></div>`;
  }

  function createShortcutOverlays() {
    helpOverlay.innerHTML = '';
    const actionToKeys = {};

    for (const [key, action] of Object.entries(model.get('shortcuts'))) {
        if (!actionToKeys[action]) actionToKeys[action] = {};
        actionToKeys[action].keyboard = key;
    }
    for (const [key, action] of Object.entries(model.get('gamepad_shortcuts'))) {
        if (!actionToKeys[action]) actionToKeys[action] = {};
        actionToKeys[action].gamepad = key;
    }

    const containerRect = container.getBoundingClientRect();
    for (const [action, keys] of Object.entries(actionToKeys)) {
        const targetButton = btnMap[action] || (action === 'focus_notes' ? notesField : null);
        if (!targetButton) continue;

        const rect = targetButton.getBoundingClientRect();
        const badge = document.createElement('div');
        badge.className = 'shortcut-badge';
        badge.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
        badge.style.top = `${rect.top - containerRect.top + rect.height / 2}px`;

        let content = '';
        if (keys.keyboard) content += `<div class="keyboard-shortcut">${formatKeyboardShortcut(keys.keyboard)}</div>`;
        if (keys.gamepad) content += `<div class="gamepad-shortcut">${formatGamepadShortcut(keys.gamepad)}</div>`;

        if (content) {
            badge.innerHTML = content;
            helpOverlay.appendChild(badge);
        }
    }
  }

  function showHelp(visible) { helpOverlay.classList.toggle('visible', visible); }
  function renderExample(example) { return typeof example === 'object' ? JSON.stringify(example, null, 2) : String(example); }

  function updateDisplay() {
    const examples = model.get('examples');
    const currentIndex = model.get('current_index');
    status.textContent = `Example ${currentIndex + 1} of ${examples.length}`;
    if (examples.length > 0 && currentIndex < examples.length) {
      exampleContainer.innerHTML = examples[currentIndex]._html || renderExample(examples[currentIndex]);
    } else {
      exampleContainer.textContent = 'No examples to display';
    }
    const annotations = model.get('annotations');
    const existingAnnotation = annotations.find(ann => ann.index === currentIndex);
    if (!isRecording) notesField.value = existingAnnotation?._notes || '';
    notesContainer.style.display = model.get('notes') ? 'block' : 'none';
    progressFill.style.width = `${examples.length > 0 ? (currentIndex / examples.length) * 100 : 0}%`;
    btnMap.prev.disabled = currentIndex === 0;
    const noMoreExamples = currentIndex >= examples.length;
    btnMap.yes.disabled = noMoreExamples;
    btnMap.no.disabled = noMoreExamples;
    btnMap.skip.disabled = noMoreExamples;
  }

  function annotate(label) {
    const currentIndex = model.get('current_index');
    if (currentIndex >= model.get('examples').length) return;
    const annotation = { index: currentIndex, example: model.get('examples')[currentIndex], _label: label, _notes: model.get('notes') ? notesField.value : '', _timestamp: new Date().toISOString() };
    const feedbackClass = label === 'yes' ? 'success-feedback' : label === 'no' ? 'error-feedback' : 'skip-feedback';
    btnMap[label].classList.add(feedbackClass);
    setTimeout(() => { btnMap[label].classList.remove(feedbackClass); }, 300);
    const newAnnotations = model.get('annotations').filter(ann => ann.index !== currentIndex);
    newAnnotations.push(annotation);
    model.set('annotations', newAnnotations);
    model.set('current_index', currentIndex + 1);
    model.save_changes();
  }

  function navigate(direction) {
    const currentIndex = model.get('current_index');
    if (direction === 'prev' && currentIndex > 0) {
      btnMap.prev.classList.add('prev-feedback');
      setTimeout(() => { btnMap.prev.classList.remove('prev-feedback'); }, 300);
      model.set('current_index', currentIndex - 1);
      model.save_changes();
    }
  }

  function handleAction(action) {
    switch(action) {
      case 'prev': navigate('prev'); break;
      case 'yes': annotate('yes'); break;
      case 'no': annotate('no'); break;
      case 'skip': annotate('skip'); break;
      case 'focus_notes': notesField.focus(); break;
      case 'speech_notes':
        if (isSpeechSelectionMode) return;
        if (isRecording) stopSpeechRecognition(); else startSpeechRecognition();
        break;
    }
  }

  function parseShortcut(event) {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    const key = event.code.replace('Key', '').replace('Digit', '');
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
  }

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition = new SpeechRecognition();
      speechRecognition.lang = 'en-US';
      speechRecognition.onresult = (event) => {
        if (isSpeechSelectionMode) {
          const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase().split(' ')[0];
          lastChoiceDisplay.textContent = `Heard: "${command}"`;
          let actionFound = true;
          switch(command) {
            case 'yes': handleAction('yes'); break;
            case 'no': handleAction('no'); break;
            case 'skip': handleAction('skip'); break;
            case 'previous': handleAction('prev'); break;
            case 'stop': if (speechSelectionToggledOn) stopSpeechSelectionMode(); break;
            default: actionFound = false; lastChoiceDisplay.textContent += ' (not valid)'; break;
          }
          if (!actionFound) setTimeout(() => { if (lastChoiceDisplay.textContent.includes('(not valid)')) lastChoiceDisplay.textContent = ''; }, 2000);
        } else {
          let newFinalTranscript = '', newInterimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) newFinalTranscript += transcript; else newInterimTranscript += transcript;
          }
          if (newFinalTranscript) originalNotesText += (originalNotesText ? ' ' : '') + newFinalTranscript;
          notesField.value = originalNotesText + (originalNotesText ? ' ' : '') + newInterimTranscript;
        }
      };
      speechRecognition.onend = () => {
        if (isSpeechSelectionMode) {
          if (speechSelectionToggledOn && isSpeechSelectionMode) { try { speechRecognition.start(); } catch(e) { stopSpeechSelectionMode(true); } }
          else if (!speechSelectionToggledOn) { stopSpeechSelectionMode(); }
        } else { isRecording = false; notesField.value = originalNotesText; updateRecordingUI(); }
      };
      speechRecognition.onerror = (event) => {
        if (isSpeechSelectionMode) { lastChoiceDisplay.textContent = `Error: ${event.error}`; stopSpeechSelectionMode(true); }
        else { isRecording = false; notesField.value = originalNotesText; updateRecordingUI(); }
      };
      speechAvailable = true;
    }
    updateMicButtonState();
  }

  function startSpeechSelectionMode() {
    if (isSpeechSelectionMode || !speechAvailable) return;
    isSpeechSelectionMode = true;
    if (isRecording) stopSpeechRecognition();
    micButton.disabled = true;
    container.classList.add('speech-selection-active');
    speechSelectionBtn.classList.add('active');
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString('#JSGF V1.0; grammar commands; public <command> = yes | no | skip | previous | stop;', 1);
    speechRecognition.grammars = speechRecognitionList;
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    try { speechRecognition.start(); } catch(e) { stopSpeechSelectionMode(true); }
  }

  function stopSpeechSelectionMode(force = false) {
    if (!isSpeechSelectionMode && !force) return;
    isSpeechSelectionMode = false;
    speechSelectionToggledOn = false;
    speechSelectionHotkeyDown = false;
    container.classList.remove('speech-selection-active');
    speechSelectionBtn.classList.remove('active');
    lastChoiceDisplay.textContent = '';
    micButton.disabled = !speechAvailable;
    if (speechRecognition) {
      speechRecognition.stop();
      const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
      speechRecognition.grammars = new SpeechGrammarList();
    }
  }

  function updateRecordingUI() {
    micButton.classList.toggle('recording', isRecording);
    notesField.classList.toggle('recording', isRecording);
    micButton.innerHTML = isRecording ? '🔴' : (speechAvailable ? '🎤' : '❌');
  }

  function updateMicButtonState() {
    const disabled = !speechAvailable;
    micButton.disabled = disabled;
    speechSelectionBtn.disabled = disabled;
    updateRecordingUI();
  }

  function startSpeechRecognition() {
    if (speechAvailable && !isRecording && !isSpeechSelectionMode) {
      isRecording = true;
      originalNotesText = notesField.value;
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      try { speechRecognition.start(); updateRecordingUI(); } catch (error) { isRecording = false; }
    }
  }

  function stopSpeechRecognition() { if (speechAvailable && isRecording) speechRecognition.stop(); }

  function pollGamepad() {
    if (gamepadConnected) {
      const gamepad = navigator.getGamepads()[gamepadIndex];
      if (gamepad) {
        const gamepadShortcuts = model.get('gamepad_shortcuts');
        gamepad.buttons.forEach((button, index) => {
          const buttonKey = `button_${index}`;
          const isPressed = button.pressed, wasPressed = lastButtonStates[buttonKey] || false;
          if (isPressed && !wasPressed) {
            if (index === 8) { showHelp(true); return; }
            const action = gamepadShortcuts[buttonKey];
            if (action === 'speech_selection') {
              if (speechSelectionToggledOn) { speechSelectionToggledOn = false; stopSpeechSelectionMode(); }
              else if (!isSpeechSelectionMode) { speechSelectionHotkeyDown = true; startSpeechSelectionMode(); }
            } else if (action === 'speech_notes') {
              if (isSpeechSelectionMode) return;
              speechGamepadPressed = true;
              startSpeechRecognition();
            } else if (action) { handleAction(action); }
          }
          if (!isPressed && wasPressed) {
            if (index === 8) { showHelp(false); return; }
            const action = gamepadShortcuts[buttonKey];
            if (action === 'speech_selection' && speechSelectionHotkeyDown) { speechSelectionHotkeyDown = false; stopSpeechSelectionMode(); }
            else if (action === 'speech_notes' && speechGamepadPressed) { speechGamepadPressed = false; stopSpeechRecognition(); }
          }
          lastButtonStates[buttonKey] = isPressed;
        });
      }
    }
    requestAnimationFrame(pollGamepad);
  }

  // --- 4. Event Listeners ---
  Object.entries(btnMap).forEach(([action, btn]) => btn.addEventListener('click', () => action === 'prev' ? navigate('prev') : annotate(action)));
  micButton.addEventListener('click', () => isRecording ? stopSpeechRecognition() : startSpeechRecognition());
  speechSelectionBtn.addEventListener('click', () => {
    speechSelectionToggledOn = !speechSelectionToggledOn;
    if (speechSelectionToggledOn) startSpeechSelectionMode(); else stopSpeechSelectionMode();
  });
  helpIcon.addEventListener('mouseenter', () => showHelp(true));
  helpIcon.addEventListener('mouseleave', () => showHelp(false));

  container.addEventListener('keydown', (e) => {
    const modifierCodes = ['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight'];
    if (modifierCodes.includes(e.code)) return;
    if (e.altKey && e.key.toLowerCase() === 'i') { e.preventDefault(); showHelp(true); return; }

    const shortcutString = parseShortcut(e);
    const action = model.get('shortcuts')[shortcutString];
    if (action === 'speech_selection') {
      e.preventDefault();
      if (speechSelectionToggledOn) { speechSelectionToggledOn = false; stopSpeechSelectionMode(); }
      else if (!isSpeechSelectionMode) { speechSelectionHotkeyDown = true; startSpeechSelectionMode(); }
    } else if (action) { e.preventDefault(); handleAction(action); }
  });

  container.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'i') { e.preventDefault(); showHelp(false); return; }
    const shortcutString = parseShortcut(e);
    if (model.get('shortcuts')[shortcutString] === 'speech_selection' && speechSelectionHotkeyDown) {
      e.preventDefault();
      speechSelectionHotkeyDown = false;
      stopSpeechSelectionMode();
    }
  });

  model.on('change:current_index', updateDisplay);
  model.on('change:examples', updateDisplay);
  model.on('change:notes', updateDisplay);
  model.on('change:shortcuts', createShortcutOverlays);
  model.on('change:gamepad_shortcuts', createShortcutOverlays);

  window.addEventListener('gamepadconnected', (e) => {
    gamepadConnected = true; gamepadIndex = e.gamepad.index; gamepadIndicator.style.display = 'inline';
  });
  window.addEventListener('gamepaddisconnected', (e) => {
    gamepadConnected = false; gamepadIndex = -1; gamepadIndicator.style.display = 'none';
  });

  // --- 5. Initialization ---
  initSpeechRecognition();
  updateDisplay();
  createShortcutOverlays();
  pollGamepad();

  const existingGamepads = navigator.getGamepads();
  for (let i = 0; i < existingGamepads.length; i++) {
    if (existingGamepads[i]) {
      gamepadConnected = true;
      gamepadIndex = i;
      gamepadIndicator.style.display = 'inline';
      break;
    }
  }
}

export default { render };
