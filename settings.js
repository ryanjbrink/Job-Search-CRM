// Load saved settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        emailNotifications: true,
        reminderNotifications: true,
        theme: 'dark',
        defaultSort: 'date',
        defaultStatus: 'Cold',
        defaultPriority: 'Medium'
    };

    // Apply saved settings to form
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('reminderNotifications').checked = settings.reminderNotifications;
    document.getElementById('themeSelect').value = settings.theme;
    document.getElementById('defaultSort').value = settings.defaultSort;
    document.getElementById('defaultStatus').value = settings.defaultStatus;
    document.getElementById('defaultPriority').value = settings.defaultPriority;
}

// Save settings
function saveSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        reminderNotifications: document.getElementById('reminderNotifications').checked,
        theme: document.getElementById('themeSelect').value,
        defaultSort: document.getElementById('defaultSort').value,
        defaultStatus: document.getElementById('defaultStatus').value,
        defaultPriority: document.getElementById('defaultPriority').value
    };

    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Show success message
    alert('Settings saved successfully!');
}

// Export data
function exportData() {
    const data = localStorage.getItem('jobData');
    if (!data) {
        alert('No data to export');
        return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-search-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('jobData', JSON.stringify(data));
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Apply theme
function applyTheme(theme) {
    document.body.className = theme;
}

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // Apply saved theme
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    if (settings.theme) {
        applyTheme(settings.theme);
    }
}); 