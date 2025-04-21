// Load profile data from localStorage
function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('profile')) || {
        fullName: '',
        email: '',
        phone: '',
        preferredLocation: '',
        jobTitle: '',
        salaryRange: ''
    };

    // Update form fields
    document.getElementById('fullName').value = profile.fullName;
    document.getElementById('email').value = profile.email;
    document.getElementById('phone').value = profile.phone;
    document.getElementById('preferredLocation').value = profile.preferredLocation;
    document.getElementById('jobTitle').value = profile.jobTitle;
    document.getElementById('salaryRange').value = profile.salaryRange;

    // Update profile header
    document.getElementById('profileName').textContent = profile.fullName || 'Anonymous User';
    document.getElementById('profileEmail').textContent = profile.email || 'No email provided';
}

// Save profile data to localStorage
function saveProfile() {
    const profile = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        preferredLocation: document.getElementById('preferredLocation').value,
        jobTitle: document.getElementById('jobTitle').value,
        salaryRange: document.getElementById('salaryRange').value
    };

    // Save to localStorage
    localStorage.setItem('profile', JSON.stringify(profile));

    // Update profile header
    document.getElementById('profileName').textContent = profile.fullName || 'Anonymous User';
    document.getElementById('profileEmail').textContent = profile.email || 'No email provided';

    // Show success message
    alert('Profile saved successfully!');
}

// Handle password change
function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    // In a real application, you would send this to your backend
    // For now, we'll just clear the fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    alert('Password changed successfully!');
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    // Load existing profile data
    loadProfile();

    // Add event listener for save button
    document.getElementById('saveProfile').addEventListener('click', () => {
        saveProfile();
        handlePasswordChange();
    });
}); 