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
  
  // Create settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'molabel-settings-btn';
  settingsBtn.innerHTML = '⚙️';
  settingsBtn.title = 'Settings';
  
  header.appendChild(status);
  header.appendChild(settingsBtn);
  
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
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'molabel-modal';
  modal.style.display = 'none';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'molabel-modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'molabel-modal-header';
  modalHeader.innerHTML = '<h3>Settings</h3>';
  
  const modalCloseBtn = document.createElement('button');
  modalCloseBtn.className = 'molabel-modal-close';
  modalCloseBtn.innerHTML = '×';
  modalHeader.appendChild(modalCloseBtn);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'molabel-modal-body';
  
  // Create shortcuts display section
  const shortcutsSection = document.createElement('div');
  shortcutsSection.innerHTML = '<h4>Keyboard Shortcuts</h4>';
  
  const shortcutsList = document.createElement('div');
  shortcutsList.className = 'molabel-shortcuts-list';
  
  // Store for managing shortcut edits
  let tempShortcuts = {};
  
  function updateModalShortcuts() {
    const shortcuts = model.get('shortcuts');
    tempShortcuts = {...shortcuts}; // Copy for editing
    
    const actionLabels = {
      'prev': 'Previous',
      'yes': 'Yes',
      'no': 'No', 
      'skip': 'Skip',
      'focus_notes': 'Focus Notes'
    };
    
    const actions = ['prev', 'yes', 'no', 'skip', 'focus_notes'];
    shortcutsList.innerHTML = '';
    
    actions.forEach(action => {
      // Find current shortcut for this action
      const currentShortcut = Object.keys(tempShortcuts).find(key => tempShortcuts[key] === action) || '';
      
      // Parse current shortcut to extract modifiers and key
      const parts = currentShortcut.split('+');
      const currentModifiers = parts.slice(0, -1);
      const currentKey = parts[parts.length - 1] || '';
      
      const shortcutItem = document.createElement('div');
      shortcutItem.className = 'molabel-shortcut-row';
      
      const actionLabel = document.createElement('span');
      actionLabel.className = 'molabel-shortcut-action';
      actionLabel.textContent = actionLabels[action];
      
      // Create modifier checkboxes
      const modifiersContainer = document.createElement('div');
      modifiersContainer.className = 'molabel-modifiers';
      
      ['Ctrl', 'Alt', 'Shift'].forEach(modifier => {
        const label = document.createElement('label');
        label.className = 'molabel-modifier-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = currentModifiers.includes(modifier);
        checkbox.dataset.modifier = modifier;
        checkbox.dataset.action = action;
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(modifier));
        modifiersContainer.appendChild(label);
      });
      
      // Add "+" symbol
      const plusSpan = document.createElement('span');
      plusSpan.textContent = '+';
      plusSpan.className = 'molabel-plus';
      
      // Create key dropdown
      const keySelect = document.createElement('select');
      keySelect.className = 'molabel-key-select';
      keySelect.dataset.action = action;
      
      // Common keys
      const keys = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 
                   'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                   'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter'];
      
      keys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key || '(none)';
        if (key === currentKey) option.selected = true;
        keySelect.appendChild(option);
      });
      
      // Create preview span
      const preview = document.createElement('span');
      preview.className = 'molabel-shortcut-preview';
      
      function updateShortcut() {
        const modifiers = [];
        shortcutItem.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          modifiers.push(cb.dataset.modifier);
        });
        
        const key = keySelect.value;
        
        // Remove old mapping for this action
        Object.keys(tempShortcuts).forEach(shortcutKey => {
          if (tempShortcuts[shortcutKey] === action) {
            delete tempShortcuts[shortcutKey];
          }
        });
        
        // Create new shortcut string
        let shortcutString = '';
        if (modifiers.length > 0 && key) {
          shortcutString = modifiers.join('+') + '+' + key;
        } else if (key) {
          shortcutString = key;
        }
        
        // Update preview to show the actual shortcut format
        if (shortcutString) {
          preview.textContent = shortcutString;
        } else if (key && modifiers.length === 0) {
          preview.textContent = key;
        } else {
          preview.textContent = '(none)';
        }
        
        // Add to temp shortcuts and immediately update model
        if (shortcutString) {
          tempShortcuts[shortcutString] = action;
        }
        
        // Apply changes immediately
        model.set('shortcuts', {...tempShortcuts});
        model.save_changes();
      }
      
      // Add event listeners
      modifiersContainer.addEventListener('change', updateShortcut);
      keySelect.addEventListener('change', updateShortcut);
      
      shortcutItem.appendChild(actionLabel);
      shortcutItem.appendChild(modifiersContainer);
      shortcutItem.appendChild(plusSpan);
      shortcutItem.appendChild(keySelect);
      shortcutItem.appendChild(preview);
      shortcutsList.appendChild(shortcutItem);
      
      // Initial update - call after DOM is assembled
      updateShortcut();
    });
  }
  
  shortcutsSection.appendChild(shortcutsList);
  
  modalBody.appendChild(shortcutsSection);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);
  
  // Assemble the widget
  container.appendChild(header);
  container.appendChild(progressContainer);
  container.appendChild(exampleContainer);
  container.appendChild(controls);
  container.appendChild(notesContainer);
  container.appendChild(shortcutsInfo);
  el.appendChild(container);
  el.appendChild(modal);
  
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
    
    // Update shortcuts display
    const shortcutsList = Object.entries(shortcuts)
      .map(([key, action]) => `${key}: ${action}`)
      .join(', ');
    shortcutsInfo.innerHTML = shortcuts && Object.keys(shortcuts).length > 0
      ? `<strong>Keyboard shortcuts:</strong> ${shortcutsList}`
      : '';
    
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
      model.set('current_index', currentIndex - 1);
      model.save_changes();
    }
  }
  
  // Button event listeners
  prevBtn.addEventListener('click', () => navigate('prev'));
  yesBtn.addEventListener('click', () => annotate('yes'));
  noBtn.addEventListener('click', () => annotate('no'));
  skipBtn.addEventListener('click', () => annotate('skip'));
  
  // Modal event listeners
  settingsBtn.addEventListener('click', () => {
    updateModalShortcuts();
    modal.style.display = 'flex';
  });
  
  modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
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
    
    console.log('Key pressed:', shortcutString, 'event.key:', e.key, 'event.code:', e.code);
    console.log('Available shortcuts:', shortcuts);
    console.log('Looking for shortcut:', shortcutString, 'Found:', shortcuts[shortcutString]);
    
    if (shortcuts[shortcutString]) {
      console.log('Executing action:', shortcuts[shortcutString]);
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
  
  // Initial display
  updateDisplay();
  
  // Focus container initially to enable keyboard shortcuts
  container.focus();
}

export default { render };