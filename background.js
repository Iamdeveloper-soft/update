// background.js

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed and background script running.');
    // Set up periodic update check
    chrome.alarms.create('updateCheck', { periodInMinutes: 60 }); // Check every hour
    chrome.alarms.create('messageCheck', { periodInMinutes: 30 }); // Check messages every 30 minutes
});

// Function to download and save updated file
async function updateFile(fileName, fileUrl) {
    try {
        const response = await fetch(fileUrl);
        const content = await response.text();
        
        // Save the updated file content to local storage
        await chrome.storage.local.set({ 
            [`file_${fileName}`]: content,
            [`file_${fileName}_timestamp`]: Date.now()
        });
        
        return true;
    } catch (error) {
        console.error(`Failed to update ${fileName}:`, error);
        return false;
    }
}

// Function to check for updates
async function checkForUpdates() {
    try {
        const response = await fetch('https://yourdomain.com/version.json');
        const data = await response.json();
        const currentVersion = chrome.runtime.getManifest().version;
        
        let updatesAvailable = false;
        let updatedFiles = [];

        // Check each file for updates
        for (const [fileName, fileInfo] of Object.entries(data.files)) {
            const storedVersion = await chrome.storage.local.get(`version_${fileName}`);
            if (!storedVersion[`version_${fileName}`] || storedVersion[`version_${fileName}`] < fileInfo.version) {
                updatesAvailable = true;
                updatedFiles.push(fileName);
            }
        }

        if (updatesAvailable) {
            // Create notification for update
            chrome.notifications.create('update-notification', {
                type: 'basic',
                iconUrl: 'icon128.png',
                title: 'Update Available',
                message: `Updates available for: ${updatedFiles.join(', ')}. Click to update.`,
                buttons: [{ title: 'Update Now' }],
                priority: 2
            });
        }
    } catch (error) {
        console.log('Update check failed:', error);
    }
}

// Function to check and display messages
async function checkMessages() {
    try {
        const response = await fetch('https://yourdomain.com/version.json');
        const data = await response.json();
        
        if (data.message) {
            const message = data.message;
            const showUntil = new Date(message.show_until);
            const now = new Date();
            
            if (now <= showUntil) {
                // Check if message was already shown
                const shownMessages = await chrome.storage.local.get('shown_messages');
                const messageId = btoa(message.title + message.content); // Create unique ID
                
                if (!shownMessages.shown_messages || !shownMessages.shown_messages.includes(messageId)) {
                    // Show message notification
                    chrome.notifications.create(`message-${messageId}`, {
                        type: 'basic',
                        iconUrl: 'icon128.png',
                        title: message.title,
                        message: message.content,
                        priority: message.type === 'urgent' ? 2 : 1
                    });
                    
                    // Mark message as shown
                    const shown = shownMessages.shown_messages || [];
                    shown.push(messageId);
                    await chrome.storage.local.set({ shown_messages: shown });
                }
            }
        }
    } catch (error) {
        console.log('Message check failed:', error);
    }
}

// Handle notification clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    if (notificationId === 'update-notification' && buttonIndex === 0) {
        // Fetch latest version info
        const response = await fetch('https://yourdomain.com/version.json');
        const data = await response.json();
        
        // Update each file
        for (const [fileName, fileInfo] of Object.entries(data.files)) {
            const success = await updateFile(fileName, fileInfo.url);
            if (success) {
                await chrome.storage.local.set({ [`version_${fileName}`]: fileInfo.version });
            }
        }
        
        // Notify user to reload extension
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Update Complete',
            message: 'Please reload the extension to apply updates.',
            priority: 2
        });
    }
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateCheck') {
        checkForUpdates();
    } else if (alarm.name === 'messageCheck') {
        checkMessages();
    }
});

// Check for updates and messages when extension starts
checkForUpdates();
checkMessages();
