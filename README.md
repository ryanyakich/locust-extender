# Locust Shift Availability Checker

A Chrome extension that helps volunteers check shift availability across multiple locations and generate professional email drafts to find volunteers for locustspw.org.

## Features

### 🎯 Smart Shift Checking
- **Multi-Location Support**: Check shift availability across all your favorite locations at once
- **Flexible Date Ranges**: Choose from predefined ranges (this week, next week, next 2-3 weeks) or set custom dates (up to 4 weeks)
- **Real-Time Status**: See current volunteer counts, available slots, and keyman assignments for each shift
- **Visual Indicators**: Color-coded status icons (🔴🟡🟢) show shift fill status at a glance

### 📧 Email Generation
- **Multiple Formats**: Generate email drafts in either list or table format
- **Professional Templates**: Pre-formatted emails ready to send to find volunteers
- **Rich HTML Support**: Emails maintain formatting when pasted into email clients
- **One-Click Copy**: Instantly copy the generated email to your clipboard

### 🔧 User-Friendly Interface
- **Favorite Locations Integration**: Automatically loads your favorite locations from locustspw.org
- **Persistent Settings**: Your location selections and preferences are saved between uses
- **Progress Tracking**: Visual progress bar shows checking status across multiple locations
- **Intuitive Design**: Clean, simple interface designed for ease of use

### 🔒 Secure & Integrated
- **Authenticated Access**: Uses your existing locustspw.org login for secure data access
- **Privacy Focused**: Only accesses data from locustspw.org with your permission
- **Seamless Navigation**: Smart navigation helpers guide you to the right pages

## Installation

### For Non-Technical Users

#### Step 1: Download the Extension
1. Download this extension as a ZIP file or obtain the extension folder from your administrator
2. Extract/unzip the file to a location on your computer (like your Desktop or Downloads folder)

#### Step 2: Enable Developer Mode in Chrome
1. Open Google Chrome
2. In the address bar, type: `chrome://extensions` and press Enter
3. Look for a toggle switch named **"Developer mode"** in the top-right corner
4. Click the toggle to turn it **ON** (it will turn blue when enabled)

#### Step 3: Load the Extension
1. Click the **"Load unpacked"** button that appears in the top-left corner (after enabling Developer mode)
2. A file selection window will open
3. Navigate to and select the extension folder you extracted in Step 1
4. Click **"Select Folder"** (or "Open")

#### Step 4: Verify Installation
1. You should see "Locust Shift Availability Checker" appear in your extensions list
2. The extension is now installed and ready to use!
3. You can access it by clicking the extension icon in your Chrome toolbar

## Usage

### First-Time Setup
1. **Navigate to locustspw.org**: Click the extension icon and follow the prompt to visit locustspw.org
2. **Log In**: Sign in to your locustspw.org account (if not already logged in)
3. **Add Favorite Locations**: Go to the schedules page and add locations to your favorites
4. **Return to Extension**: Click the extension icon again - your favorite locations will now load

### Checking Shift Availability
1. **Select Date Range**: Choose your preferred time period from the dropdown (this week, next week, etc.)
2. **Choose Locations**: Click the locations dropdown and select which locations to check
3. **Click "Check Shift Availability"**: The extension will check all selected locations
4. **View Results**: See which shifts need volunteers with fill status and keyman information

### Generating Volunteer Emails
1. After checking availability, click **"Copy Email Draft"**
2. Choose between **List Format** or **Table Format** using the tabs
3. The email is automatically copied to your clipboard
4. Paste into your email client and send!

## Updating the Extension

### When Updates Are Available
When you receive a new version of the extension:

#### Method 1: Reload (Quickest)
1. Go to `chrome://extensions` in Chrome
2. Find "Locust Shift Availability Checker" in the list
3. Click the **refresh icon** (🔄) on the extension card
4. The extension will reload with the latest changes

#### Method 2: Reinstall (If Reload Doesn't Work)
1. Go to `chrome://extensions` in Chrome
2. Find "Locust Shift Availability Checker" and click **"Remove"**
3. Confirm removal
4. Click **"Load unpacked"** again
5. Select the new extension folder
6. The updated version is now installed

## Troubleshooting

### Extension Won't Load
- **Ensure Developer Mode is ON**: The "Load unpacked" button only appears in Developer mode
- **Check Folder Structure**: Make sure you're selecting the main extension folder (contains manifest.json)
- **Restart Chrome**: Sometimes Chrome needs a restart after enabling Developer mode

### "Not Connected to locustspw.org" Error
- **Navigate to the Website**: Click the provided link to visit locustspw.org
- **Log In**: Make sure you're logged into your locustspw.org account
- **Refresh Extension**: After logging in, close and reopen the extension popup

### No Favorite Locations Found
- **Add Favorites First**: Go to locustspw.org/schedules and add locations to your favorites
- **Wait for Navigation**: The extension will automatically refresh when you navigate to the schedules page
- **Check Internet Connection**: Ensure you have an active internet connection

### Email Copy Issues
- **Check Clipboard Permissions**: Some browsers may ask for clipboard permission
- **Try Alternative Format**: Switch between list and table format if one doesn't copy properly
- **Manual Copy**: You can also manually select and copy the text from the preview area

## System Requirements

- **Google Chrome** (version 88 or higher recommended)
- **Internet Connection** (for accessing locustspw.org)
- **locustspw.org Account** (with favorite locations configured)

## Privacy & Security

- This extension only works on `locustspw.org` domains
- It uses your existing authentication - no additional login required
- All data is processed locally in your browser
- No personal information is stored or transmitted to third parties
- Extension requires minimal permissions: activeTab, storage, and tabs

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Ensure you have the latest version of the extension


## Version History

**Version 1.0.3 - UI Improvements** 
(Aug 17, 2026 at 9:54AM)

**Summary:**
This update focuses on UI optimization while maintaining all existing functionality including the time-saving navigation auto-reload feature.

**Changes:**
- Removed Clear button to streamline interface
- Tightened UI spacing throughout for more compact layout
- Reorganized button layout - Check Shift Availability and Copy Email Draft now appear side-by-side
- Reduced padding, margins, and font sizes for better space efficiency
- Maintained navigation auto-reload feature for seamless user experience when navigating to locustspw.org

**Benefits:**
- More compact and efficient UI
- Saves vertical space in the popup
- Cleaner interface with unnecessary elements removed
- Improved workflow with automatic popup refresh after navigation

**Version 1.0.2 - Custom Date Fix** 
(Aug 15, 2026 at 8:11AM)

**Fixed:** Custom Date selection now correctly includes the end date. Previously, the range displayed dates only up to, but not including, the selected end date.

**Version 1.0.1 - New date ranges and layout** 
(Aug 15, 2026 at 8:02AM)

**Added:**
- Next 2 Weeks date range
- Next 3 Weeks date range
- Custom date range option (supports up to a 4-week selection)
- New Table View layout for email output

**Version 1.0.0 - Initial Release**
(Aug 15, 2026 at 6:59AM)

Initial release.

---

**Note**: This extension is designed specifically for locustspw.org volunteers and coordinators to streamline the volunteer needs process.