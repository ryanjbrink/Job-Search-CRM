// Get job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

// Load job data
async function loadJobDetails() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const job = data.jobs.find(j => j.id === jobId);
        
        if (job) {
            displayJobDetails(job);
        } else {
            document.querySelector('.job-details-card').innerHTML = '<div class="error">Job not found</div>';
        }
    } catch (error) {
        console.error('Error loading job data:', error);
        document.querySelector('.job-details-card').innerHTML = '<div class="error">Error loading job details</div>';
    }
}

// Get status icon
function getStatusIcon(status) {
    switch(status) {
        case 'Cold':
            return '❄️';
        case 'Potential':
            return '🤔';
        case 'Hot':
            return '🔥';
        case 'Interviewing':
            return '🎤';
        case 'Offer':
            return '💰';
        default:
            return '';
    }
}

// Display job details
function displayJobDetails(job) {
    // Update header information
    document.getElementById('companyName').textContent = job.company;
    document.getElementById('jobTitle').textContent = job.title;
    document.getElementById('dateEntered').textContent = job.dateEntered;
    document.getElementById('location').textContent = job.location;
    document.getElementById('salary').textContent = job.salary;
    document.getElementById('about').textContent = job.about;
    document.getElementById('connection').textContent = job.connection;
    document.getElementById('applicationLink').href = job.applicationLink;
    
    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = `${getStatusIcon(job.status)} ${job.status}`;
    statusBadge.className = `status status-${job.status.toLowerCase().replace(/\s+/g, '')}`;
    
    // Display actions
    displayActions(job.actions || []);
}

// Display actions
function displayActions(actions) {
    const actionList = document.getElementById('actionList');
    actionList.innerHTML = '';

    if (actions.length === 0) {
        actionList.innerHTML = '<div class="no-actions">No actions yet</div>';
        return;
    }

    actions.forEach(action => {
        const actionElement = document.createElement('div');
        actionElement.className = 'action';
        actionElement.innerHTML = `
            <div class="action-header">
                <span>${action.date}</span>
            </div>
            <div class="action-text">${action.text}</div>
        `;
        actionList.appendChild(actionElement);
    });
}

// Toggle actions
function toggleActions() {
    const actionList = document.getElementById('actionList');
    const actionForm = document.querySelector('.action-form');
    
    if (actionList.style.display === 'none') {
        actionList.style.display = 'flex';
        actionForm.style.display = 'flex';
    } else {
        actionList.style.display = 'none';
        actionForm.style.display = 'none';
    }
}

// Add new action
async function addAction() {
    const actionInput = document.getElementById('newAction');
    const actionText = actionInput.value.trim();
    
    if (actionText) {
        const newAction = {
            date: new Date().toLocaleDateString(),
            text: actionText
        };

        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');
        
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            const job = data.jobs.find(j => j.id === jobId);
            
            if (job) {
                if (!job.actions) {
                    job.actions = [];
                }
                job.actions.push(newAction);
                
                // Update the display
                displayActions(job.actions);
                actionInput.value = '';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Handle Enter key in action input
document.getElementById('newAction').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addAction();
    }
});

// Load job details when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (jobId) {
        loadJobDetails();
    } else {
        document.querySelector('main').innerHTML = '<p>No job ID provided</p>';
    }
}); 