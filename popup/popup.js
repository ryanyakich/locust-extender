// === CONFIG ===
// Shift statuses that indicate need for volunteers
const NEED_VOLUNTEER_STATUSES = ['empty', 'open', 'urgent'];

// Global locations variable (will be populated from API)
let locations = [];
let isMultiSelectOpen = false;

// === HELPERS ===
function formatDate(d) {
  // Handle both Date objects and YYYY-MM-DD strings
  let date;
  if (typeof d === 'string') {
    // Parse date string as local time to avoid timezone offset issues
    const [year, month, day] = d.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = d;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateString(dateStr) {
  // Handle YYYY-MM-DD string format directly
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return dateStr;
}

function updateProgress(current, total) {
  const percent = Math.floor((current / total) * 100);
  
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (progressFill && progressText) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}% (${current}/${total})`;
  }
}

function generateEmail(shiftsByLocation, dateRange) {
  let listEmail = "Volunteer Shift Needs - Please Help!\n\n";
  listEmail += `We need volunteers for the following shifts (${dateRange}):\n\n`;

  Object.keys(shiftsByLocation).forEach(locationLabel => {
    const shifts = shiftsByLocation[locationLabel];
    if (shifts.length > 0) {
      listEmail += `${locationLabel}:\n`;
      shifts.forEach(shift => {
        const listDate = formatDateString(shift.date); // shift.date is a string in YYYY-MM-DD format
        const listTime = shift.shift_name.split('(')[0].trim();
        const listNeeds = shift.available_slots;
        const listFillPercentage = getFillPercentage(shift.volunteer_count, shift.max_slots);
        const listStatusIcon = getStatusIcon(listFillPercentage);
        const listKeymanStatus = shift.has_keyman ? '✓ Keyman assigned' : '✗ Keyman needed';
        listEmail += `  ${listStatusIcon} ${listDate} - ${listTime}: (${shift.volunteer_count}/${shift.max_slots}) Needs ${listNeeds} volunteer(s) [${listKeymanStatus}]\n`;
      });
      listEmail += "\n";
    }
  });

  listEmail += "Please sign up at locustspw.org to help cover these shifts.\n";
  listEmail += "Thank you for your support!";

  return listEmail;
}

function generateEmailHTML(shiftsByLocation, dateRange) {
  let listHTML = "<p><strong>Volunteer Shift Needs - Please Help!</strong></p>";
  listHTML += `<p>We need volunteers for the following shifts (${dateRange}):</p>`;

  Object.keys(shiftsByLocation).forEach(locationLabel => {
    const shifts = shiftsByLocation[locationLabel];
    if (shifts.length > 0) {
      listHTML += `<p><strong>${locationLabel}:</strong></p>`;
      listHTML += "<ul>";
      shifts.forEach(shift => {
        const listDate = formatDateString(shift.date);
        const listTime = shift.shift_name.split('(')[0].trim();
        const listNeeds = shift.available_slots;
        const listFillPercentage = getFillPercentage(shift.volunteer_count, shift.max_slots);
        const listStatusIcon = getStatusIcon(listFillPercentage);
        const listKeymanStatus = shift.has_keyman ? '✓ Keyman assigned' : '✗ Keyman needed';
        listHTML += `<li>${listStatusIcon} ${listDate} - ${listTime}: (${shift.volunteer_count}/${shift.max_slots}) Needs ${listNeeds} volunteer(s) [${listKeymanStatus}]</li>`;
      });
      listHTML += "</ul>";
    }
  });

  listHTML += "<p>Please sign up at <a href='https://locustspw.org'>locustspw.org</a> to help cover these shifts.</p>";
  listHTML += "<p>Thank you for your support!</p>";

  return listHTML;
}

function generateEmailTable(shiftsByLocation, dateRange) {
  let tableEmail = "Volunteer Shift Needs - Please Help!\n\n";
  tableEmail += `We need volunteers for the following shifts (${dateRange}):\n\n`;

  Object.keys(shiftsByLocation).forEach(locationLabel => {
    const shifts = shiftsByLocation[locationLabel];
    if (shifts.length > 0) {
      tableEmail += `${locationLabel}:\n`;
      tableEmail += "┌─────────────────────┬──────────────┬──────────┬─────────────┬──────────────────┐\n";
      tableEmail += "│ Date                │ Time         │ Filled   │ Needs       │ Keyman    │\n";
      tableEmail += "├─────────────────────┼──────────────┼──────────┼─────────────┼──────────────────┤\n";
      
      shifts.forEach(shift => {
        const tableDate = formatDateString(shift.date);
        const tableTime = shift.shift_name.split('(')[0].trim();
        const tableNeeds = shift.available_slots;
        const tableFillPercentage = getFillPercentage(shift.volunteer_count, shift.max_slots);
        const tableStatusIcon = getStatusIcon(tableFillPercentage);
        const tableKeymanStatus = shift.has_keyman ? '✓' : '✗';
        const tableFilledStatus = `${shift.volunteer_count}/${shift.max_slots}`;

        tableEmail += `│ ${tableStatusIcon} ${tableDate.padEnd(18)} │ ${tableTime.padEnd(12)} │ ${tableFilledStatus.padEnd(8)} │ ${String(tableNeeds).padEnd(11)} │ ${tableKeymanStatus.padEnd(16)} │\n`;
      });

      tableEmail += "└─────────────────────┴──────────────┴──────────┴─────────────┴──────────────────┘\n\n";
    }
  });

  tableEmail += "Please sign up at locustspw.org to help cover these shifts.\n";
  tableEmail += "Thank you for your support!";

  return tableEmail;
}

function generateEmailTableHTML(shiftsByLocation, dateRange) {
  let tableHTML = "<p><strong>Volunteer Shift Needs - Please Help!</strong></p>";
  tableHTML += `<p>We need volunteers for the following shifts (${dateRange}):</p>`;

  Object.keys(shiftsByLocation).forEach(locationLabel => {
    const shifts = shiftsByLocation[locationLabel];
    if (shifts.length > 0) {
      tableHTML += `<p><strong>${locationLabel}:</strong></p>`;
      tableHTML += "<table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse; width: 100%; margin-bottom: 16px;'>";
      tableHTML += "<thead><tr style='background-color: #f8f9fa;'>";
      tableHTML += "<th style='padding: 8px; text-align: left; border: 1px solid #dee2e6;'>Date</th>";
      tableHTML += "<th style='padding: 8px; text-align: left; border: 1px solid #dee2e6;'>Time</th>";
      tableHTML += "<th style='padding: 8px; text-align: left; border: 1px solid #dee2e6;'>Filled</th>";
      tableHTML += "<th style='padding: 8px; text-align: left; border: 1px solid #dee2e6;'>Needs</th>";
      tableHTML += "<th style='padding: 8px; text-align: left; border: 1px solid #dee2e6;'>Keyman</th>";
      tableHTML += "</tr></thead><tbody>";
      
      shifts.forEach(shift => {
        const tableDate = formatDateString(shift.date);
        const tableTime = shift.shift_name.split('(')[0].trim();
        const tableNeeds = shift.available_slots;
        const tableFillPercentage = getFillPercentage(shift.volunteer_count, shift.max_slots);
        const tableStatusIcon = getStatusIcon(tableFillPercentage);
        const tableKeymanStatus = shift.has_keyman ? '✓' : '✗';
        const tableFilledStatus = `${shift.volunteer_count}/${shift.max_slots}`;

        tableHTML += "<tr>";
        tableHTML += `<td style='padding: 8px; border: 1px solid #dee2e6;'>${tableStatusIcon} ${tableDate}</td>`;
        tableHTML += `<td style='padding: 8px; border: 1px solid #dee2e6;'>${tableTime}</td>`;
        tableHTML += `<td style='padding: 8px; border: 1px solid #dee2e6;'>${tableFilledStatus}</td>`;
        tableHTML += `<td style='padding: 8px; border: 1px solid #dee2e6;'>${tableNeeds}</td>`;
        tableHTML += `<td style='padding: 8px; border: 1px solid #dee2e6;'>${tableKeymanStatus}</td>`;
        tableHTML += "</tr>";
      });
      
      tableHTML += "</tbody></table>";
    }
  });

  tableHTML += "<p>Please sign up at <a href='https://locustspw.org'>locustspw.org</a> to help cover these shifts.</p>";
  tableHTML += "<p>Thank you for your support!</p>";

  return tableHTML;
}

function copyToClipboard(text, html = null) {
  if (html) {
    // Copy both plain text and HTML formatting
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' })
    });
    navigator.clipboard.write([clipboardItem]).then(() => {
      console.log('Email copied to clipboard with formatting');
    }).catch(err => {
      console.error('Failed to copy email with formatting: ', err);
      // Fallback to plain text
      navigator.clipboard.writeText(text).then(() => {
        console.log('Email copied to clipboard (plain text fallback)');
      }).catch(err2 => {
        console.error('Failed to copy email: ', err2);
      });
    });
  } else {
    // Copy plain text only
    navigator.clipboard.writeText(text).then(() => {
      console.log('Email copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy email: ', err);
    });
  }
}

function getStatusIcon(fillPercentage) {
  if (fillPercentage === 0) return '🔴';
  if (fillPercentage < 100) return '🟡';
  return '🟢';
}

function getFillPercentage(volunteerCount, maxSlots) {
  if (maxSlots === 0) return 0;
  return Math.round((volunteerCount / maxSlots) * 100);
}

function getThisWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate Monday of this week
  const monday = new Date(today);
  const diff = day === 0 ? 6 : day - 1; // If Sunday (0), go back 6 days, otherwise go back (day - 1) days
  monday.setDate(today.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

function getNextWeekRange() {
  const thisWeek = getThisWeekRange();
  
  // Next week starts on Monday after this week's Sunday
  const nextMonday = new Date(thisWeek.end);
  nextMonday.setDate(thisWeek.end.getDate() + 1);
  nextMonday.setHours(0, 0, 0, 0);
  
  // Next week ends on Sunday
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);
  
  return { start: nextMonday, end: nextSunday };
}

function getNextTwoWeeksRange() {
  const nextWeek = getNextWeekRange();
  
  // Next two weeks starts on Monday of next week
  const start = new Date(nextWeek.start);
  
  // Next two weeks ends on Sunday of the week after next week
  const end = new Date(nextWeek.end);
  end.setDate(nextWeek.end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

function getNextThreeWeeksRange() {
  const nextWeek = getNextWeekRange();
  
  // Next three weeks starts on Monday of next week
  const start = new Date(nextWeek.start);
  
  // Next three weeks ends on Sunday of the week after next two weeks
  const end = new Date(nextWeek.end);
  end.setDate(nextWeek.end.getDate() + 14);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

function validateCustomDateRange() {
  const startDateStr = document.getElementById('customStartDate').value;
  const endDateStr = document.getElementById('customEndDate').value;
  const errorDiv = document.getElementById('customDateError');

  if (!startDateStr || !endDateStr) {
    errorDiv.textContent = 'Please select both start and end dates';
    errorDiv.style.display = 'block';
    return false;
  }

  // Parse date strings as local time to avoid timezone offset issues
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

  const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
  const endDate = new Date(endYear, endMonth - 1, endDay, 0, 0, 0, 0);

  if (startDate > endDate) {
    errorDiv.textContent = 'Start date must be before end date';
    errorDiv.style.display = 'block';
    return false;
  }

  // Calculate the difference in days (include both start and end day)
  const diffTime = endDate - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Maximum 4 weeks (28 days)
  if (diffDays > 28) {
    errorDiv.textContent = 'Date range cannot exceed 4 weeks (28 days)';
    errorDiv.style.display = 'block';
    return false;
  }

  errorDiv.style.display = 'none';
  return true;
}

function getDateRange(selectedOption) {
  const today = new Date();
  
  switch (selectedOption) {
    case 'this_week':
      return getThisWeekRange();
    case 'next_week':
      return getNextWeekRange();
    case 'next_two_weeks':
      return getNextTwoWeeksRange();
    case 'next_three_weeks':
      return getNextThreeWeeksRange();
    case '3':
    case '5':
    case '7':
      const days = parseInt(selectedOption);
      const daysStart = new Date(today);
      daysStart.setHours(0, 0, 0, 0);
      const daysEnd = new Date(today);
      daysEnd.setDate(today.getDate() + days - 1); // Include the last day
      daysEnd.setHours(23, 59, 59, 999);
      return { start: daysStart, end: daysEnd };
    case 'custom':
      const customStartDateStr = document.getElementById('customStartDate').value;
      const customEndDateStr = document.getElementById('customEndDate').value;
      if (customStartDateStr && customEndDateStr) {
        // Parse date strings as local time to avoid timezone offset issues
        const [startYear, startMonth, startDay] = customStartDateStr.split('-').map(Number);
        const [endYear, endMonth, endDay] = customEndDateStr.split('-').map(Number);

        const customStart = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const customEnd = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
        return { start: customStart, end: customEnd };
      }
      // Fall through to default if custom dates not set
    default:
      // Default to 7 days
      const defaultStart = new Date(today);
      defaultStart.setHours(0, 0, 0, 0);
      const defaultEnd = new Date(today);
      defaultEnd.setDate(today.getDate() + 7 - 1); // Include the last day
      defaultEnd.setHours(23, 59, 59, 999);
      return { start: defaultStart, end: defaultEnd };
  }
}

async function fetchFavoriteLocations() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'fetchData',
      url: 'https://locustspw.org/api/user/favorite-locations'
    });

    if (response && response.data && response.data.success && response.data.favorite_locations) {
      // Transform the API response to our expected format
      const favoriteLocations = response.data.favorite_locations.map(loc => ({
        id: loc.location_id,
        label: `${loc.zone_name}: ${loc.name}`,
        name: loc.name,
        zone_name: loc.zone_name,
        open: loc.open
      }));
      
      // Filter for only open locations and sort alphabetically
      return favoriteLocations
        .filter(loc => loc.open)
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch favorite locations:', error);
    return [];
  }
}

// Storage functions for persisting selected locations
async function saveSelectedLocations(selectedIds) {
  try {
    await chrome.storage.local.set({ selectedLocationIds: selectedIds });
  } catch (error) {
    console.error('Failed to save selected locations:', error);
  }
}

async function loadSelectedLocations() {
  try {
    const result = await chrome.storage.local.get(['selectedLocationIds']);
    return result.selectedLocationIds || [];
  } catch (error) {
    console.error('Failed to load selected locations:', error);
    return [];
  }
}

async function saveDateRange(dayRange) {
  try {
    await chrome.storage.local.set({ dayRange: dayRange });
  } catch (error) {
    console.error('Failed to save date range:', error);
  }
}

async function loadDateRange() {
  try {
    const result = await chrome.storage.local.get(['dayRange']);
    return result.dayRange || '3'; // Default to 3 days
  } catch (error) {
    console.error('Failed to load date range:', error);
    return '3';
  }
}

async function saveCustomDates(startDate, endDate) {
  try {
    await chrome.storage.local.set({ customStartDate: startDate, customEndDate: endDate });
  } catch (error) {
    console.error('Failed to save custom dates:', error);
  }
}

async function loadCustomDates() {
  try {
    const result = await chrome.storage.local.get(['customStartDate', 'customEndDate']);
    return {
      startDate: result.customStartDate || '',
      endDate: result.customEndDate || ''
    };
  } catch (error) {
    console.error('Failed to load custom dates:', error);
    return { startDate: '', endDate: '' };
  }
}

async function saveEmailFormat(selectedFormat) {
  try {
    await chrome.storage.local.set({ emailFormat: selectedFormat });
  } catch (error) {
    console.error('Failed to save email format:', error);
  }
}

async function loadEmailFormat() {
  try {
    const result = await chrome.storage.local.get(['emailFormat']);
    return result.emailFormat || 'list'; // Default to list format
  } catch (error) {
    console.error('Failed to load email format:', error);
    return 'list';
  }
}

function updateMultiSelectTrigger() {
  const checkboxes = document.querySelectorAll('.multi-select-option input[type="checkbox"]');
  const total = checkboxes.length;
  const selected = document.querySelectorAll('.multi-select-option input[type="checkbox"]:checked').length;
  const trigger = document.getElementById('locationMultiSelectTrigger');
  const placeholder = trigger.querySelector('.placeholder');
  const selectedCount = trigger.querySelector('.selected-count');
  
  if (total === 0) {
    placeholder.textContent = 'No locations available';
    placeholder.style.display = 'block';
    if (selectedCount) selectedCount.style.display = 'none';
  } else if (selected === 0) {
    placeholder.textContent = 'Select locations...';
    placeholder.style.display = 'block';
    if (selectedCount) selectedCount.style.display = 'none';
  } else {
    placeholder.style.display = 'none';
    if (!selectedCount) {
      const countSpan = document.createElement('span');
      countSpan.className = 'selected-count';
      trigger.insertBefore(countSpan, trigger.querySelector('.arrow'));
    }
    const countElement = trigger.querySelector('.selected-count');
    countElement.textContent = `${selected} of ${total} selected`;
    countElement.style.display = 'block';
  }
}

// === MAIN ===
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const fetchButton = document.getElementById('fetchButton');
  const dataDisplay = document.getElementById('dataDisplay');
  const statusDiv = document.getElementById('status');
  const locationMultiSelectTrigger = document.getElementById('locationMultiSelectTrigger');
  const locationMultiSelectDropdown = document.getElementById('locationMultiSelectDropdown');
  const locationOptionsContainer = document.getElementById('locationOptionsContainer');
  const selectAllLocations = document.getElementById('selectAllLocations');
  const clearAllLocations = document.getElementById('clearAllLocations');
  const dayRangeSelect = document.getElementById('dayRange');
  const customDateInputsDiv = document.getElementById('customDateInputs');
  const customStartDateInput = document.getElementById('customStartDate');
  const customEndDateInput = document.getElementById('customEndDate');
  const emailFormatTabs = document.getElementById('emailFormatTabs');
  const tabButtons = emailFormatTabs.querySelectorAll('.tab-button');
  
  // Email format variables (accessible in nested functions)
  let currentEmailFormat = 'list';
  let generatedListEmail = '';
  let generatedListEmailHTML = '';
  let generatedTableEmail = '';
  let generatedTableEmailHTML = '';

  // Hide status div by default
  statusDiv.style.display = 'none';
  
  // Load saved date range
  const savedDayRange = await loadDateRange();
  if (savedDayRange) {
    dayRangeSelect.value = savedDayRange;
  }
  
  // Initialize custom date inputs visibility
  if (dayRangeSelect.value === 'custom') {
    customDateInputsDiv.style.display = 'block';
  } else {
    customDateInputsDiv.style.display = 'none';
  }
  
  // Load saved custom dates
  const savedCustomDates = await loadCustomDates();
  if (savedCustomDates.startDate) {
    customStartDateInput.value = savedCustomDates.startDate;
  }
  if (savedCustomDates.endDate) {
    customEndDateInput.value = savedCustomDates.endDate;
  }
  
  // Validate custom dates if they are set
  if (savedCustomDates.startDate && savedCustomDates.endDate) {
    validateCustomDateRange();
  }

  // Load saved email format preference
  const savedEmailFormat = await loadEmailFormat();
  currentEmailFormat = savedEmailFormat;
  
  // Set active tab based on saved preference
  tabButtons.forEach(button => {
    if (button.dataset.format === savedEmailFormat) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Clear badge when popup opens
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTab) {
      chrome.action.setBadgeText({ text: '', tabId: currentTab.id });
    }
  } catch (error) {
    console.log('Could not clear badge:', error);
  }

  // Check for update notification
  const updateResult = await chrome.storage.local.get(['updateAvailable', 'latestVersion', 'downloadUrl', 'releaseNotes']);
  const updateNotification = document.getElementById('updateNotification');
  
  if (updateResult.updateAvailable) {
    console.log('Update available:', updateResult.latestVersion);
    
    // Show update notification
    updateNotification.style.display = 'block';
    document.getElementById('latestVersion').textContent = updateResult.latestVersion;
    
    if (updateResult.releaseNotes) {
      document.getElementById('releaseNotes').textContent = updateResult.releaseNotes;
    } else {
      document.getElementById('releaseNotes').textContent = 'No release notes available.';
    }
    
    // Set up download button
    const downloadButton = document.getElementById('downloadUpdate');
    downloadButton.addEventListener('click', () => {
      if (updateResult.downloadUrl) {
        chrome.tabs.create({ url: updateResult.downloadUrl });
      } else {
        alert('Download URL not available. Please contact your administrator.');
      }
    });
    
    // Set up dismiss button
    const dismissButton = document.getElementById('dismissUpdate');
    dismissButton.addEventListener('click', async () => {
      // Dismiss the update notification
      await chrome.runtime.sendMessage({ action: 'dismissUpdate' });
      updateNotification.style.display = 'none';
    });
  } else {
    updateNotification.style.display = 'none';
  }

  // Set up manual update check button
  const checkUpdatesButton = document.getElementById('checkUpdatesButton');
  checkUpdatesButton.addEventListener('click', async () => {
    checkUpdatesButton.textContent = 'Checking...';
    checkUpdatesButton.disabled = true;
    
    try {
      await chrome.runtime.sendMessage({ action: 'checkForUpdates' });
      
      // Wait a moment for the background script to process and update storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if update is now available
      const updatedResult = await chrome.storage.local.get(['updateAvailable', 'latestVersion', 'downloadUrl', 'releaseNotes']);
      
      if (updatedResult.updateAvailable) {
        // Show update notification
        updateNotification.style.display = 'block';
        document.getElementById('latestVersion').textContent = updatedResult.latestVersion;
        
        if (updatedResult.releaseNotes) {
          document.getElementById('releaseNotes').textContent = updatedResult.releaseNotes;
        } else {
          document.getElementById('releaseNotes').textContent = 'No release notes available.';
        }
        
        // Update download button handler
        const downloadButton = document.getElementById('downloadUpdate');
        downloadButton.onclick = () => {
          if (updatedResult.downloadUrl) {
            chrome.tabs.create({ url: updatedResult.downloadUrl });
          } else {
            alert('Download URL not available. Please contact your administrator.');
          }
        };
        
        alert('An update is available!');
      } else {
        alert('You are already using the latest version.');
      }
    } catch (error) {
      console.error('Update check failed:', error);
      alert('Failed to check for updates. Please try again later.');
    } finally {
      checkUpdatesButton.textContent = 'Check for updates';
      checkUpdatesButton.disabled = false;
    }
  });

  // Settings modal functionality
  const settingsButton = document.getElementById('settingsButton');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsButton = document.getElementById('closeSettings');
  const saveSettingsButton = document.getElementById('saveSettings');
  const autoUpdateEnabledCheckbox = document.getElementById('autoUpdateEnabled');

  // Load current settings
  const settings = await chrome.storage.local.get(['autoUpdateEnabled']);
  autoUpdateEnabledCheckbox.checked = settings.autoUpdateEnabled !== false; // Default to true

  // Open settings modal
  settingsButton.addEventListener('click', () => {
    settingsModal.classList.add('open');
  });

  // Close settings modal
  closeSettingsButton.addEventListener('click', () => {
    settingsModal.classList.remove('open');
  });

  // Save settings
  saveSettingsButton.addEventListener('click', async () => {
    await chrome.storage.local.set({
      autoUpdateEnabled: autoUpdateEnabledCheckbox.checked
    });
    settingsModal.classList.remove('open');
  });

  // Close modal when clicking outside
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('open');
    }
  });

  // Listen for navigation complete messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'navigationComplete') {
      console.log('Navigation complete received, refreshing popup');
      // Reinitialize the popup as if opened for the first time
      initializePopup();
    }
  });

  // Function to initialize/reinitialize the popup
  async function initializePopup() {
    // Reset state
    locations = [];
    dataDisplay.textContent = '';
    dataDisplay.style.display = 'none';
    statusDiv.style.display = 'none';
    
    // Hide email format tabs and preview
    if (emailFormatTabs) emailFormatTabs.style.display = 'none';
    
    const emailPreview = document.getElementById('emailPreview');
    if (emailPreview) {
      emailPreview.style.display = 'none';
      emailPreview.innerHTML = '';
    }
    
    // Hide email button
    const emailButton = document.getElementById('emailButton');
    if (emailButton) emailButton.style.display = 'none';
    
    // Clear generated emails
    generatedListEmail = '';
    generatedListEmailHTML = '';
    generatedTableEmail = '';
    generatedTableEmailHTML = '';
    
    // Hide progress bar
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'none';
    
    // Show loading state
    locationOptionsContainer.innerHTML = '<div class="loading-favorites">Loading favorite locations...</div>';
    updateMultiSelectTrigger();
    
    // Check if we're on locustspw.org
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      if (currentTab.url && currentTab.url.includes('locustspw.org')) {
        // Fetch favorite locations
        locations = await fetchFavoriteLocations();
        
        // Load saved selected locations
        const savedSelectedIds = await loadSelectedLocations();
        
        // Populate multi-select dropdown
        if (locations.length === 0) {
          locationOptionsContainer.innerHTML = '<div class="no-favorites">No favorite locations found. Please add locations to your favorites on <span class="link" data-url="https://locustspw.org/v2/schedules" style="color: #0066cc; text-decoration: underline; cursor: pointer;">locustspw.org</span></div>';
          statusDiv.innerHTML = 'No favorite locations found. Please add locations to your favorites on <span class="link" data-url="https://locustspw.org/v2/schedules" style="color: #0066cc; text-decoration: underline; cursor: pointer;">locustspw.org</span>';
          statusDiv.className = 'status disconnected';
          fetchButton.disabled = true;
          updateMultiSelectTrigger();
          
          // Add click handlers for links
          document.querySelectorAll('.link').forEach(link => {
            link.addEventListener('click', async () => {
              console.log('Link clicked, navigating to:', link.dataset.url);
              // Get current tab to track navigation
              const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
              console.log('Current tab ID:', currentTab.id);
              
              // Tell background script to wait for navigation (no response callback needed)
              chrome.runtime.sendMessage({
                action: 'waitForNavigation',
                tabId: currentTab.id
              });
              
              // Navigate to the URL
              chrome.tabs.update({ url: link.dataset.url });
            });
          });
        } else {
          locationOptionsContainer.innerHTML = '';
          
          locations.forEach((loc, index) => {
            const option = document.createElement('div');
            option.className = 'multi-select-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `location-${index}`;
            checkbox.value = loc.id;
            // Check if this location was previously selected
            checkbox.checked = savedSelectedIds.length === 0 || savedSelectedIds.includes(loc.id);
            
            // Add change listener to update trigger and save selections
            checkbox.addEventListener('change', () => {
              updateMultiSelectTrigger();
              const selectedIds = [];
              document.querySelectorAll('.multi-select-option input[type="checkbox"]:checked').forEach(cb => {
                selectedIds.push(cb.value);
              });
              saveSelectedLocations(selectedIds);
            });
            
            const label = document.createElement('label');
            label.htmlFor = `location-${index}`;
            label.textContent = loc.label;
            label.title = loc.label; // Show full text on hover for truncated items
            
            option.appendChild(checkbox);
            option.appendChild(label);
            locationOptionsContainer.appendChild(option);
          });
          
          // Connected successfully - keep status hidden and enable button
          fetchButton.disabled = false;
          updateMultiSelectTrigger();
        }
      } else {
        statusDiv.innerHTML = 'Please navigate to <span class="link" data-url="https://locustspw.org" style="color: #0066cc; text-decoration: underline; cursor: pointer;">locustspw.org</span> first';
        statusDiv.className = 'status disconnected';
        statusDiv.style.display = 'block';
        fetchButton.disabled = true;
        updateMultiSelectTrigger();
        
        // Add click handler for link
        statusDiv.querySelector('.link').addEventListener('click', async () => {
          console.log('Link clicked, navigating to: https://locustspw.org');
          // Get current tab to track navigation
          const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('Current tab ID:', currentTab.id);
          
          // Tell background script to wait for navigation (no response callback needed)
          chrome.runtime.sendMessage({
            action: 'waitForNavigation',
            tabId: currentTab.id
          });
          
          // Navigate to the URL
          chrome.tabs.update({ url: 'https://locustspw.org' });
        });
      }
    });
  }

  // Initial popup initialization
  await initializePopup();

  // Save date range when changed
  dayRangeSelect.addEventListener('change', () => {
    saveDateRange(dayRangeSelect.value);
    
    // Show/hide custom date inputs based on selection
    const errorDiv = document.getElementById('customDateError');
    
    if (dayRangeSelect.value === 'custom') {
      customDateInputsDiv.style.display = 'block';
      // Validate when switching to custom range
      validateCustomDateRange();
    } else {
      customDateInputsDiv.style.display = 'none';
      errorDiv.style.display = 'none';
    }
  });
  
  // Add validation for custom date inputs
  customStartDateInput.addEventListener('change', () => {
    validateCustomDateRange();
    saveCustomDates(customStartDateInput.value, customEndDateInput.value);
  });
  
  customEndDateInput.addEventListener('change', () => {
    validateCustomDateRange();
    saveCustomDates(customStartDateInput.value, customEndDateInput.value);
  });
  
  // Email format tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      // Update current format
      currentEmailFormat = button.dataset.format;
      // Save preference
      saveEmailFormat(currentEmailFormat);
      
      // Update email preview if data has been generated
      const emailPreview = document.getElementById('emailPreview');
      if (emailPreview.style.display !== 'none' && generatedListEmail) {
        if (currentEmailFormat === 'table') {
          emailPreview.innerHTML = generatedTableEmailHTML;
        } else {
          emailPreview.innerHTML = generatedListEmailHTML;
        }
      }
    });
  });

  // Multi-select dropdown functionality
  locationMultiSelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    isMultiSelectOpen = !isMultiSelectOpen;
    locationMultiSelectTrigger.classList.toggle('open');
    locationMultiSelectDropdown.classList.toggle('open');
    
    // Position dropdown below the trigger
    if (isMultiSelectOpen) {
      const triggerRect = locationMultiSelectTrigger.getBoundingClientRect();
      locationMultiSelectDropdown.style.top = `${triggerRect.bottom + 4}px`;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (isMultiSelectOpen && !locationMultiSelectTrigger.contains(e.target) && !locationMultiSelectDropdown.contains(e.target)) {
      isMultiSelectOpen = false;
      locationMultiSelectTrigger.classList.remove('open');
      locationMultiSelectDropdown.classList.remove('open');
    }
  });

  // Select all functionality
  selectAllLocations.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.multi-select-option input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);
    updateMultiSelectTrigger();
    const selectedIds = [];
    checkboxes.forEach(cb => selectedIds.push(cb.value));
    saveSelectedLocations(selectedIds);
  });

  // Clear all functionality
  clearAllLocations.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.multi-select-option input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    updateMultiSelectTrigger();
    saveSelectedLocations([]);
  });

  fetchButton.addEventListener('click', async () => {
    // Check if we have locations loaded
    if (locations.length === 0) {
      statusDiv.innerHTML = 'No favorite locations found. Please add locations to your favorites on <span class="link" data-url="https://locustspw.org/v2/schedules" style="color: #0066cc; text-decoration: underline; cursor: pointer;">locustspw.org</span>';
      statusDiv.className = 'status disconnected';
      statusDiv.style.display = 'block';
      
      // Add click handler for link
      statusDiv.querySelector('.link').addEventListener('click', async () => {
        console.log('Link clicked, navigating to: https://locustspw.org/v2/schedules');
        // Get current tab to track navigation
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab ID:', currentTab.id);
        
        // Tell background script to wait for navigation (no response callback needed)
        chrome.runtime.sendMessage({
          action: 'waitForNavigation',
          tabId: currentTab.id
        });
        
        // Navigate to the URL
        chrome.tabs.update({ url: 'https://locustspw.org/v2/schedules' });
      });
      return;
    }

    // Get selected locations
    const selectedLocationIds = [];
    const checkboxes = document.querySelectorAll('.multi-select-option input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      selectedLocationIds.push(checkbox.value);
    });

    if (selectedLocationIds.length === 0) {
      statusDiv.textContent = 'Please select at least one location to check';
      statusDiv.className = 'status disconnected';
      statusDiv.style.display = 'block';
      return;
    }

    // Filter locations to only selected ones
    const selectedLocations = locations.filter(loc => selectedLocationIds.includes(loc.id));

    // Check if connected to locustspw.org
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab.url || !currentTab.url.includes('locustspw.org')) {
        statusDiv.innerHTML = 'Please navigate to <span class="link" data-url="https://locustspw.org" style="color: #0066cc; text-decoration: underline; cursor: pointer;">locustspw.org</span> first';
        statusDiv.className = 'status disconnected';
        statusDiv.style.display = 'block';
        
        // Add click handler for link
        statusDiv.querySelector('.link').addEventListener('click', async () => {
          console.log('Link clicked, navigating to: https://locustspw.org');
          // Get current tab to track navigation
          const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('Current tab ID:', currentTab.id);
          
          // Tell background script to wait for navigation (no response callback needed)
          chrome.runtime.sendMessage({
            action: 'waitForNavigation',
            tabId: currentTab.id
          });
          
          // Navigate to the URL
          chrome.tabs.update({ url: 'https://locustspw.org' });
        });
        return;
      }

      const dayRangeOption = dayRangeSelect.value;
      
      // Validate custom date range if selected
      if (dayRangeOption === 'custom' && !validateCustomDateRange()) {
        return;
      }
      
      const { start, end } = getDateRange(dayRangeOption);
      const displayStartDateStr = formatDate(start);
      const displayEndDateStr = formatDate(end);

      const totalTasks = selectedLocations.length;
      let completed = 0;

      const shiftsByLocation = {};
      selectedLocations.forEach(loc => {
        shiftsByLocation[loc.label] = [];
      });

      dataDisplay.textContent = `Checking shift availability (${displayStartDateStr} - ${displayEndDateStr})...`;
      fetchButton.disabled = true;
      
      // Show progress bar
      const progressContainer = document.getElementById('progressContainer');
      progressContainer.style.display = 'block';
      updateProgress(0, totalTasks);

      try {
        for (const loc of selectedLocations) {
          const apiStartDateStr = start.toISOString().split('T')[0];
          const apiEndDateStr = end.toISOString().split('T')[0];
          const url = `https://locustspw.org/api/schedules/weekStatus?locationId=${loc.id}&start=${apiStartDateStr}&end=${apiEndDateStr}&detailed=true`;

          // Send message to background script to make authenticated request
          const response = await chrome.runtime.sendMessage({
            action: 'fetchData',
            url: url
          });

          if (response && response.data && response.data.detailed) {
            Object.keys(response.data.detailed).forEach(date => {
              const shifts = response.data.detailed[date];
              shifts.forEach(shift => {
                // Filter shifts that need volunteers (not full, not canceled)
                if (NEED_VOLUNTEER_STATUSES.includes(shift.status) && !shift.canceled && shift.available_slots > 0) {
                  // Calculate effective slots accounting for keyman
                  // Keyman slot is always counted as a slot that needs to be filled
                  const effectiveMaxSlots = shift.max_slots + 1; // Always add 1 for keyman slot
                  const effectiveVolunteerCount = shift.volunteer_count + (shift.has_keyman ? 1 : 0); // Only count keyman if assigned
                  const effectiveAvailableSlots = effectiveMaxSlots - effectiveVolunteerCount;

                  shiftsByLocation[loc.label].push({
                    date: date, // Keep as string in YYYY-MM-DD format
                    shift_name: shift.shift_name,
                    available_slots: effectiveAvailableSlots,
                    status: shift.status,
                    volunteer_count: effectiveVolunteerCount,
                    max_slots: effectiveMaxSlots,
                    has_keyman: shift.has_keyman,
                    original_volunteer_count: shift.volunteer_count,
                    original_max_slots: shift.max_slots
                  });
                }
              });
            });
          }

          completed++;
          updateProgress(completed, totalTasks);

          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
        }

        // Generate and display results
        let resultHTML = '';
        let totalNeeds = 0;

        Object.keys(shiftsByLocation).forEach(locationLabel => {
          const shifts = shiftsByLocation[locationLabel];
          if (shifts.length > 0) {
            resultHTML += `<div style="font-weight: bold; color: #333; margin-bottom: 4px;">${locationLabel}</div>`;
            shifts.forEach(shift => {
              const formattedDate = formatDateString(shift.date);
              const timeRange = shift.shift_name.split('(')[0].trim();
              const needs = shift.available_slots;
              totalNeeds += needs;
              const fillPercentage = getFillPercentage(shift.volunteer_count, shift.max_slots);
              const statusIcon = getStatusIcon(fillPercentage);
              const keymanStatus = shift.has_keyman ? '✓ Keyman' : '✗ No Keyman';
              
              resultHTML += `<div style="margin-left: 8px; margin-bottom: 2px;">${statusIcon} ${formattedDate} - ${timeRange}: (${shift.volunteer_count}/${shift.max_slots}) Needs ${needs} volunteer(s) [${keymanStatus}]</div>`;
            });
            resultHTML += '<div style="margin-bottom: 8px;"></div>';
          }
        });

        if (resultHTML === '') {
          resultHTML = '<div>All shifts are full for the selected time period!</div>';
        } else {
          // resultHTML = `<div style="font-weight: bold; color: #333; margin-bottom: 8px;">Total volunteer needs from ${selectedLocations.length} location(s) (${displayStartDateStr} - ${displayEndDateStr}): ${totalNeeds}</div>${resultHTML}`;
        }

        // Don't show the old dataDisplay format - we'll use the email preview instead
        dataDisplay.innerHTML = resultHTML;
        dataDisplay.style.display = 'none';

        // Generate both email formats
        const dateRangeText = `${displayStartDateStr} - ${displayEndDateStr}`;
        generatedListEmail = generateEmail(shiftsByLocation, dateRangeText);
        generatedListEmailHTML = generateEmailHTML(shiftsByLocation, dateRangeText);
        generatedTableEmail = generateEmailTable(shiftsByLocation, dateRangeText);
        generatedTableEmailHTML = generateEmailTableHTML(shiftsByLocation, dateRangeText);

        // Show and configure email button
        const emailButton = document.getElementById('emailButton');
        emailButton.style.display = 'block';
        emailButton.textContent = 'Copy Email Draft';
        
        // Remove existing event listeners by cloning
        const newEmailButton = emailButton.cloneNode(true);
        emailButton.parentNode.replaceChild(newEmailButton, emailButton);
        
        // Add click handler
        newEmailButton.addEventListener('click', () => {
          // Use the currently selected format (copy both plain text and HTML)
          if (currentEmailFormat === 'table') {
            copyToClipboard(generatedTableEmail, generatedTableEmailHTML);
          } else {
            copyToClipboard(generatedListEmail, generatedListEmailHTML);
          }
          newEmailButton.textContent = 'Email Copied!';
          setTimeout(() => {
            newEmailButton.textContent = 'Copy Email Draft';
          }, 2000);
        });

        // Show email format tabs
        emailFormatTabs.style.display = 'flex';
        
        // Show email preview in current format
        const emailPreview = document.getElementById('emailPreview');
        emailPreview.style.display = 'block';
        if (currentEmailFormat === 'table') {
          emailPreview.innerHTML = generatedTableEmailHTML;
        } else {
          emailPreview.innerHTML = generatedListEmailHTML;
        }

        // Check complete - keep status hidden
        
        // Hide progress bar
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.style.display = 'none';

      } catch (error) {
        dataDisplay.textContent = `Error: ${error.message}`;
        statusDiv.textContent = '✗ Check failed';
        statusDiv.className = 'status disconnected';
        statusDiv.style.display = 'block';
        
        // Hide progress bar
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.style.display = 'none';
      } finally {
        fetchButton.disabled = false;
      }
    });
  });
});
