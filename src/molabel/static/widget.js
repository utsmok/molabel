function render({ model, el }) {
  // Create the main container
  const container = document.createElement('div');
  container.className = 'molabel-container';
  container.tabIndex = 0; // Make container focusable for keyboard events
  
  // Create header with status and settings
  const header = document.createElement('div');
  header.className = 'molabel-header';
  
  const status = document.createElement('div');
  status.className = 'molabel-status';
  
  header.appendChild(status);
  
  // Create example display
  const exampleContainer = document.createElement('div');
  exampleContainer.className = 'molabel-example';
  
  // Create controls
  const controls = document.createElement('div');
  controls.className = 'molabel-controls';
  
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.className = 'molabel-btn molabel-btn-prev';
  
  const yesBtn = document.createElement('button');
  yesBtn.textContent = 'Yes';
  yesBtn.className = 'molabel-btn molabel-btn-yes';
  
  const noBtn = document.createElement('button');
  noBtn.textContent = 'No';
  noBtn.className = 'molabel-btn molabel-btn-no';
  
  const skipBtn = document.createElement('button');
  skipBtn.textContent = 'Skip';
  skipBtn.className = 'molabel-btn molabel-btn-skip';
  
  controls.appendChild(prevBtn);
  controls.appendChild(yesBtn);
  controls.appendChild(noBtn);
  controls.appendChild(skipBtn);
  
  // Create notes field
  const notesContainer = document.createElement('div');
  notesContainer.className = 'molabel-notes-container';
  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'Notes:';
  const notesField = document.createElement('textarea');
  notesField.className = 'molabel-notes';
  notesField.rows = 3;
  notesField.placeholder = 'Add any notes about this example...';
  notesContainer.appendChild(notesLabel);
  notesContainer.appendChild(notesField);
  
  // Create progress bar
  const progressContainer = document.createElement('div');
  progressContainer.className = 'molabel-progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'molabel-progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'molabel-progress-fill';
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);
  
  // Create shortcuts display
  const shortcutsInfo = document.createElement('div');
  shortcutsInfo.className = 'molabel-shortcuts';
  
  // Create gamepad display
  const gamepadInfo = document.createElement('div');
  gamepadInfo.className = 'molabel-gamepad';
  gamepadInfo.style.display = 'none'; // Hidden by default
  
  // Gamepad state variables (declare early)
  let gamepadConnected = false;
  let lastGamepadEvent = '';
  let gamepadIndex = -1;
  let currentlyPressedButtons = new Set(); // Track all currently pressed buttons
  
  
  // Assemble the widget
  container.appendChild(header);
  container.appendChild(progressContainer);
  container.appendChild(exampleContainer);
  container.appendChild(controls);
  container.appendChild(notesContainer);
  container.appendChild(shortcutsInfo);
  el.appendChild(container);
  
  // Helper function to render examples
  function renderExample(example) {
    // Default rendering
    if (typeof example === 'object') {
      return JSON.stringify(example, null, 2);
    }
    return String(example);
  }
  
  // Update display function
  function updateDisplay() {
    const examples = model.get('examples');
    const currentIndex = model.get('current_index');
    const showNotes = model.get('notes');
    const shortcuts = model.get('shortcuts');
    
    // Update status
    status.textContent = `Example ${currentIndex + 1} of ${examples.length}`;
    
    // Update example display
    if (examples.length > 0 && currentIndex < examples.length) {
      const currentExample = examples[currentIndex];
      // Use _html key if available, otherwise use default rendering
      if (currentExample._html) {
        exampleContainer.innerHTML = currentExample._html;
      } else {
        const rendered = renderExample(currentExample);
        exampleContainer.textContent = rendered;
      }
    } else {
      exampleContainer.textContent = 'No examples to display';
    }
    
    // Update notes field with existing annotation if available
    const annotations = model.get('annotations');
    const existingAnnotation = annotations.find(ann => ann.index === currentIndex);
    notesField.value = existingAnnotation ? existingAnnotation._notes || '' : '';
    
    // Show/hide notes
    notesContainer.style.display = showNotes ? 'block' : 'none';
    
    // Update progress bar based on current position
    const progress = examples.length > 0 ? (currentIndex / examples.length) * 100 : 0;
    progressFill.style.width = `${progress}%`;
    
    // Shortcuts display with table
    const gamepadShortcuts = model.get('gamepad_shortcuts');
    const hasShortcuts = (shortcuts && Object.keys(shortcuts).length > 0) || 
                        (gamepadShortcuts && Object.keys(gamepadShortcuts).length > 0);
    
    let shortcutsText = '';
    if (hasShortcuts) {
      shortcutsText = `
        <details class="shortcuts-details">
          <summary>Shortcuts</summary>
          <table class="shortcuts-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Keyboard</th>
                <th>Gamepad</th>
              </tr>
            </thead>
            <tbody>`;
      
      // Create unified action list
      const allActions = new Set();
      Object.values(shortcuts).forEach(action => allActions.add(action));
      Object.values(gamepadShortcuts || {}).forEach(action => allActions.add(action));
      
      const actionOrder = ['prev', 'yes', 'no', 'skip', 'focus_notes'];
      const sortedActions = actionOrder.filter(action => allActions.has(action));
      
      sortedActions.forEach(action => {
        const keyboardKey = Object.keys(shortcuts).find(key => shortcuts[key] === action) || '';
        const gamepadKey = Object.keys(gamepadShortcuts || {}).find(key => gamepadShortcuts[key] === action) || '';
        
        shortcutsText += `
          <tr>
            <td class="action-name">${action}</td>
            <td>${keyboardKey ? `<span class="shortcut-key">${keyboardKey}</span>` : '-'}</td>
            <td>${gamepadKey ? `<span class="shortcut-key">${gamepadKey}</span>` : '-'}</td>
          </tr>`;
      });
      
      shortcutsText += `
            </tbody>
          </table>
        </details>`;
    }
    
    shortcutsInfo.innerHTML = shortcutsText;
    
    // Disable/enable buttons
    prevBtn.disabled = currentIndex === 0;
    // Check if we're at the last example
    const isLastExample = currentIndex >= examples.length - 1;
    const noMoreExamples = currentIndex >= examples.length;
    
    // Only disable action buttons if we've gone past all examples
    yesBtn.disabled = noMoreExamples;
    noBtn.disabled = noMoreExamples;
    skipBtn.disabled = noMoreExamples;
    
    if (isLastExample && currentIndex < examples.length) {
      // We're on the last example but haven't annotated it yet
      status.textContent = `Example ${currentIndex + 1} of ${examples.length} (Last example)`;
    } else if (noMoreExamples) {
      status.textContent = 'All examples annotated!';
    }
  }
  
  // Annotation function
  function annotate(label) {
    const examples = model.get('examples');
    const currentIndex = model.get('current_index');
    const annotations = model.get('annotations');
    const showNotes = model.get('notes');
    
    if (currentIndex >= examples.length) return;
    
    const annotation = {
      index: currentIndex,
      example: examples[currentIndex],
      _label: label,
      _notes: showNotes ? notesField.value : '',
      _timestamp: new Date().toISOString()
    };
    
    // Add visual feedback to buttons
    const feedbackClass = label === 'yes' ? 'success-feedback' : 
                         label === 'no' ? 'error-feedback' : 
                         'skip-feedback';
    
    const button = label === 'yes' ? yesBtn : 
                  label === 'no' ? noBtn : 
                  skipBtn;
                  
    button.classList.add(feedbackClass);
    
    // Remove feedback class after animation
    setTimeout(() => {
      button.classList.remove(feedbackClass);
    }, 800);
    
    // Add annotation
    const newAnnotations = [...annotations, annotation];
    model.set('annotations', newAnnotations);
    
    // Move to next example (even if it's past the end)
    model.set('current_index', currentIndex + 1);
    model.save_changes();
  }
  
  // Navigation function
  function navigate(direction) {
    const currentIndex = model.get('current_index');
    if (direction === 'prev' && currentIndex > 0) {
      // Add visual feedback to previous button
      prevBtn.classList.add('prev-feedback');
      
      // Remove feedback class after animation
      setTimeout(() => {
        prevBtn.classList.remove('prev-feedback');
      }, 800);
      
      model.set('current_index', currentIndex - 1);
      model.save_changes();
    }
  }
  
  // Button event listeners
  prevBtn.addEventListener('click', () => navigate('prev'));
  yesBtn.addEventListener('click', () => annotate('yes'));
  noBtn.addEventListener('click', () => annotate('no'));
  skipBtn.addEventListener('click', () => annotate('skip'));
  
  
  // Helper function to parse keyboard shortcuts with modifiers
  function parseShortcut(event) {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    
    // Use event.code for consistent key identification
    let key = event.code;
    
    // Filter out modifier keys themselves
    const modifierCodes = ['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 
                          'ShiftLeft', 'ShiftRight', 'MetaLeft', 'MetaRight'];
    if (modifierCodes.includes(key)) {
      return ''; // Don't capture just modifier keys
    }
    
    // Clean up the key code to make it more readable
    key = key.replace('Key', '').replace('Digit', ''); // KeyA → A, Digit1 → 1
    
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
  }
  
  // Helper function to handle shortcut actions
  function handleAction(action) {
    switch(action) {
      case 'prev':
        navigate('prev');
        break;
      case 'yes':
        annotate('yes');
        break;
      case 'no':
        annotate('no');
        break;
      case 'skip':
        annotate('skip');
        break;
      case 'focus_notes':
        notesField.focus();
        break;
    }
  }
  
  // Keyboard shortcuts - attach to container instead of document
  container.addEventListener('keydown', (e) => {
    const shortcuts = model.get('shortcuts');
    const shortcutString = parseShortcut(e);
    
      // Debug logs hidden
    // console.log('Key pressed:', shortcutString, 'event.key:', e.key, 'event.code:', e.code);
    // console.log('Available shortcuts:', shortcuts);
    // console.log('Looking for shortcut:', shortcutString, 'Found:', shortcuts[shortcutString]);
    
    if (shortcuts[shortcutString]) {
      // console.log('Executing action:', shortcuts[shortcutString]);
      e.preventDefault();
      e.stopPropagation();
      handleAction(shortcuts[shortcutString]);
    }
  });
  
  // Focus container on click to enable keyboard shortcuts
  container.addEventListener('click', (e) => {
    // Don't steal focus if clicking on interactive elements
    if (e.target === notesField || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    container.focus();
  });
  
  // Listen for model changes
  model.on('change:current_index', updateDisplay);
  model.on('change:examples', updateDisplay);
  model.on('change:notes', updateDisplay);
  model.on('change:shortcuts', updateDisplay);
  model.on('change:gamepad_shortcuts', updateDisplay);
  
  // Initial display
  updateDisplay();
  
  // Focus container initially to enable keyboard shortcuts
  container.focus();
  
  // Gamepad support (variables already declared above)
  
  function updateGamepadDisplay() {
    if (gamepadConnected) {
      gamepadInfo.style.display = 'block';
      gamepadInfo.innerHTML = `<strong>Gamepad:</strong> ${lastGamepadEvent}`;
    } else {
      gamepadInfo.style.display = 'none';
    }
  }
  
  // Gamepad connection events
  window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad);
    gamepadConnected = true;
    gamepadIndex = e.gamepad.index;
    lastGamepadEvent = 'Connected';
    updateGamepadDisplay();
  });
  
  window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected:', e.gamepad);
    gamepadConnected = false;
    gamepadIndex = -1;
    lastGamepadEvent = 'Disconnected';
    updateGamepadDisplay();
  });
  
  // Gamepad polling for button presses
  let lastButtonStates = {};
  
  function pollGamepad() {
    if (!gamepadConnected) {
      requestAnimationFrame(pollGamepad);
      return;
    }
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];
    
    if (gamepad) {
      // Check for button presses
      gamepad.buttons.forEach((button, index) => {
        const buttonKey = `button_${index}`;
        const wasPressed = lastButtonStates[buttonKey] || false;
        const isPressed = button.pressed;
        
        // Update currently pressed buttons set
        if (isPressed) {
          currentlyPressedButtons.add(index);
        } else {
          currentlyPressedButtons.delete(index);
        }
        
        // Detect button press (transition from not pressed to pressed)
        if (isPressed && !wasPressed) {
          lastGamepadEvent = `Button ${index} pressed`;
          updateGamepadDisplay();
          // console.log(`Gamepad button ${index} pressed`);
          
          // Check for mapped gamepad actions
          const gamepadShortcuts = model.get('gamepad_shortcuts');
          if (gamepadShortcuts[buttonKey]) {
            // console.log(`Executing gamepad action: ${gamepadShortcuts[buttonKey]}`);
            handleAction(gamepadShortcuts[buttonKey]);
          }
        }
        
        lastButtonStates[buttonKey] = isPressed;
      });
      
      // Check for axis movements (significant changes)
      gamepad.axes.forEach((axis, index) => {
        const axisKey = `axis_${index}`;
        const lastValue = lastButtonStates[axisKey] || 0;
        const currentValue = axis;
        
        // Detect significant axis movement (threshold of 0.5)
        if (Math.abs(currentValue - lastValue) > 0.1) {
          lastGamepadEvent = `Axis ${index}: ${currentValue.toFixed(2)}`;
          updateGamepadDisplay();
          // console.log(`Gamepad axis ${index} moved to ${currentValue.toFixed(2)}`);
        }
        
        lastButtonStates[axisKey] = currentValue;
      });
      
      // Update display whenever button states change
      updateDisplay();
    }
    
    // Continue polling
    requestAnimationFrame(pollGamepad);
  }
  
  // Start gamepad polling
  pollGamepad();
  
  // Also check for gamepads that might already be connected
  const existingGamepads = navigator.getGamepads();
  for (let i = 0; i < existingGamepads.length; i++) {
    if (existingGamepads[i]) {
      console.log('Found existing gamepad:', existingGamepads[i]);
      gamepadConnected = true;
      gamepadIndex = i;
      lastGamepadEvent = 'Connected';
      updateGamepadDisplay();
      break;
    }
  }
}

export default { render };