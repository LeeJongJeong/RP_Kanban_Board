import * as Actions from './js/actions.js';
import { getCurrentWeek, formatDate } from './js/utils.js';
import { store } from './js/store.js';

// Expose actions to window for inline event handlers
Object.assign(window, Actions);

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('App Initializing...');

  // Initialize Period (Defaults to Current Week)
  Actions.handlePeriodChange('current');

  // Load Data
  await Actions.loadEngineers();
  await Actions.loadTickets(); // Explicitly load tickets after initialization

  // Attach Form Listener
  const form = document.getElementById('newTicketForm');
  if (form) {
    form.addEventListener('submit', Actions.submitNewTicket);
  }
});
