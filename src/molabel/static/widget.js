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
  modalBody.innerHTML = '<p>Settings configuration will go here...</p>';
  
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
  
  // Keyboard shortcuts - attach to container instead of document
  container.addEventListener('keydown', (e) => {
    const shortcuts = model.get('shortcuts');
    const key = e.key.toLowerCase();
    
    // Don't process shortcuts when typing in notes field
    if (e.target === notesField) return;
    
    if (shortcuts[key]) {
      e.preventDefault();
      e.stopPropagation();
      const action = shortcuts[key];
      if (action === 'prev') navigate('prev');
      else if (['yes', 'no', 'skip'].includes(action)) annotate(action);
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