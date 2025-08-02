// Options page script for TickTick Pinned extension
const SIDEBAR_TOGGLE_COMMAND = "_execute_action";

// DOM elements
let shortcutInput;
let updateButton;
let resetButton;
let statusMessage;

/**
 * Shows a status message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success', 'error', 'info')
 */
function showStatus(message, type = 'info') {
  if (!statusMessage) {
    statusMessage = document.createElement('div');
    statusMessage.id = 'status-message';
    statusMessage.style.cssText = `
      margin-top: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
      text-align: center;
      font-size: 0.875rem;
    `;
    document.querySelector('form').appendChild(statusMessage);
  }

  statusMessage.textContent = message;
  statusMessage.className = `status-${type}`;

  // Style based on type
  switch (type) {
    case 'success':
      statusMessage.style.backgroundColor = '#d4edda';
      statusMessage.style.color = '#155724';
      statusMessage.style.border = '1px solid #c3e6cb';
      break;
    case 'error':
      statusMessage.style.backgroundColor = '#f8d7da';
      statusMessage.style.color = '#721c24';
      statusMessage.style.border = '1px solid #f5c6cb';
      break;
    default:
      statusMessage.style.backgroundColor = '#d1ecf1';
      statusMessage.style.color = '#0c5460';
      statusMessage.style.border = '1px solid #bee5eb';
  }

  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (statusMessage) {
      statusMessage.style.display = 'none';
    }
  }, 3000);
}

/**
 * Updates the UI with the current keyboard shortcut
 */
async function updateUI() {
  try {
    const commands = await browser.commands.getAll();
    const sidebarCommand = commands.find(command => command.name === SIDEBAR_TOGGLE_COMMAND);

    if (sidebarCommand && shortcutInput) {
      shortcutInput.value = sidebarCommand.shortcut || '';
    }
  } catch (error) {
    console.error('Failed to get commands:', error);
    showStatus('Failed to load current shortcut settings', 'error');
  }
}

/**
 * Updates the keyboard shortcut
 */
async function updateShortcut() {
  if (!shortcutInput) return;

  const shortcutValue = shortcutInput.value.trim();

  try {
    await browser.commands.update({
      name: SIDEBAR_TOGGLE_COMMAND,
      shortcut: shortcutValue,
    });

    showStatus('Keyboard shortcut updated successfully!', 'success');
  } catch (error) {
    console.error('Failed to update shortcut:', error);
    showStatus('Failed to update shortcut', 'error');
  }
}

/**
 * Resets the keyboard shortcut to default and updates the UI
 */
async function resetShortcut() {
  try {
    await browser.commands.reset(SIDEBAR_TOGGLE_COMMAND);
    await updateUI();
    showStatus('Keyboard shortcut reset to default', 'success');
  } catch (error) {
    console.error('Failed to reset shortcut:', error);
    showStatus('Failed to reset shortcut', 'error');
  }
}

/**
 * Initializes the options page
 */
function initializeOptions() {
  // Get DOM elements
  shortcutInput = document.querySelector("#shortcut");
  updateButton = document.querySelector("#update");
  resetButton = document.querySelector("#reset");

  if (!shortcutInput || !updateButton || !resetButton) {
    console.error('Required DOM elements not found');
    return;
  }

  // Add event listeners
  updateButton.addEventListener("click", updateShortcut);
  resetButton.addEventListener("click", resetShortcut);

  // Load initial UI state
  updateUI();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeOptions);
