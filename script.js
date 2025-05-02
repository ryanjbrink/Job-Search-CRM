// Global variables
let jobData = [];
let currentSort = { column: 'applicationDate', ascending: false };
let applicationChart = null;
let totalApplications = 0;

// Register Chart.js plugins
Chart.register(ChartDataLabels);

// Fetch and parse JSON data
async function loadJobData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        jobData = data.jobs;
        updateChart();
        applyFiltersAndSort();
        
        // Update total opportunities
        document.getElementById('totalOpportunities').textContent = jobData.length;
        
        // Load total applications from localStorage
        const savedCount = localStorage.getItem('totalApplications');
        if (savedCount) {
            updateTotalApplications(parseInt(savedCount));
        }
    } catch (error) {
        console.error('Error loading job data:', error);
        document.getElementById('jobList').innerHTML = '<div class="job-card">Error loading data. Please ensure data.json exists in the repository.</div>';
    }
}

// Update statistics
function updateStats() {
    const stats = {
        cold: jobData.filter(job => job.status === 'Cold').length,
        potential: jobData.filter(job => job.status === 'Potential').length,
        hot: jobData.filter(job => job.status === 'Hot').length,
        interviewing: jobData.filter(job => job.status === 'Interviewing').length,
        offers: jobData.filter(job => job.status === 'Offer').length
    };

    document.getElementById('coldApplications').textContent = stats.cold;
    document.getElementById('potentialApplications').textContent = stats.potential;
    document.getElementById('hotApplications').textContent = stats.hot;
    document.getElementById('interviewsScheduled').textContent = stats.interviewing;
    document.getElementById('offers').textContent = stats.offers;
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('applicationChart').getContext('2d');
    
    // Count applications by status
    const statusCounts = {
        '❄️ Cold': jobData.filter(job => job.status === 'Cold').length,
        '🤔 Potential': jobData.filter(job => job.status === 'Potential').length,
        '🔥 Hot': jobData.filter(job => job.status === 'Hot').length,
        '🎤 Interviewing': jobData.filter(job => job.status === 'Interviewing').length,
        '💰 Offer': jobData.filter(job => job.status === 'Offer').length
    };

    // Find the maximum value for scaling
    const maxValue = Math.max(...Object.values(statusCounts));

    // Destroy existing chart if it exists
    if (applicationChart) {
        applicationChart.destroy();
    }

    // Create new chart
    applicationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Number of Opportunities',
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(62, 220, 255, 0.7)',    // Cold - Blue
                    'rgba(245, 255, 62, 0.7)',    // Potential - Yellow
                    'rgba(255, 162, 62, 0.7)',    // Hot - Orange
                    'rgba(255, 62, 252, 0.7)',    // Interviewing - Pink
                    'rgba(164, 254, 86, 0.7)'     // Offer - Green
                ],
                borderColor: [
                    'rgba(62, 220, 255, 1)',
                    'rgba(245, 255, 62, 1)',
                    'rgba(255, 162, 62, 1)',
                    'rgba(255, 62, 252, 1)',
                    'rgba(164, 254, 86, 1)'
                ],
                borderWidth: 2,
                borderRadius: 5,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                datalabels: {
                    color: '#D7E4DD',
                    font: {
                        family: 'IBM Plex Sans',
                        size: 14,
                        weight: 'bold'
                    },
                    anchor: 'end',
                    align: 'top',
                    offset: -5
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxValue + 1,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        color: '#888',
                        font: {
                            family: 'IBM Plex Sans',
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            family: 'IBM Plex Sans',
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Apply filters and sort to the data
function applyFiltersAndSort() {
    let filteredData = [...jobData];
    
    // Apply filters
    const statusFilter = document.getElementById('statusFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    
    if (statusFilter) {
        filteredData = filteredData.filter(job => job.status === statusFilter);
    }
    if (locationFilter) {
        filteredData = filteredData.filter(job => job.location === locationFilter);
    }
    
    // Apply sorting
    filteredData.sort((a, b) => {
        let aVal = a[currentSort.column];
        let bVal = b[currentSort.column];
        
        // Handle date comparison
        if (currentSort.column === 'applicationDate') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    
    renderJobCards(filteredData);
}

// Format comments
function formatComments(comments) {
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span>${formatDate(comment.date)}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// Add new comment
async function addComment(jobId, commentText) {
    const job = jobData.find(j => j.id === jobId);
    if (!job) return;

    const newComment = {
        id: `${jobId}${job.comments.length + 1}`,
        date: new Date().toISOString(),
        text: commentText
    };

    job.comments.push(newComment);
    
    // In a real application, you would save this to the server
    // For now, we'll just update the UI
    applyFiltersAndSort();
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

// Render job cards
function renderJobCards(data) {
    const jobList = document.getElementById('jobList');
    // Clear existing content
    jobList.innerHTML = '';
    
    // Append each job card
    data.forEach(job => {
        const jobCard = createJobCard(job);
        jobList.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    
    jobCard.innerHTML = `
        <div class="job-card-header">
            <div class="job-info">
                <div class="date-entered">${formatDate(job.dateEntered)}</div>
                <div class="title-container">
                    <div class="title-row">
                        <div class="company-title">${job.company} | ${job.jobTitle}</div>
                        <a href="${job.applicationLink}" class="application-link" onclick="event.stopPropagation()">Link</a>
                    </div>
                </div>
            </div>
            <span class="status status-${job.status.toLowerCase()}">${getStatusIcon(job.status)} ${job.status}</span>
        </div>
        
        <div class="detail-row">
            <div class="detail-chip">${job.location || 'Unknown'}</div>
            <div class="detail-chip">${job.salary || 'Unknown'}</div>
        </div>
        
        <div class="detail-row">
            <div class="detail-text">${job.about || 'Not specified'}</div>
        </div>
        
        <div class="detail-row actions-header">
            <div class="actions-count">
                <span>${job.actions ? job.actions.length : 0} Actions</span>
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>

        <div class="actions-content" style="display: none;">
            <div class="action-list">
                ${job.actions ? job.actions.map(action => `
                    <div class="action">
                        <div class="action-header">${formatDate(action.date)}</div>
                        <div class="action-text">${action.text}</div>
                    </div>
                `).join('') : '<div class="no-actions">No actions yet</div>'}
            </div>
            <div class="action-form">
                <input type="text" class="action-input" placeholder="Add an action...">
                <button class="add-action-btn" onclick="addAction(event, '${job.id}')">Add</button>
            </div>
        </div>
    `;

    // Add click handler for expanding/collapsing
    const actionsHeader = jobCard.querySelector('.actions-header');
    const actionsContent = jobCard.querySelector('.actions-content');
    
    actionsHeader.addEventListener('click', () => {
        const isExpanded = actionsContent.style.display !== 'none';
        actionsContent.style.display = isExpanded ? 'none' : 'block';
        const icon = actionsHeader.querySelector('i');
        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    return jobCard;
}

// Add new action
async function addAction(event, jobId) {
    event.stopPropagation(); // Prevent card from collapsing when clicking the button
    const card = event.target.closest('.job-card');
    const input = card.querySelector('.action-input');
    const actionText = input.value.trim();
    
    if (actionText) {
        const newAction = {
            date: new Date().toISOString(),
            text: actionText
        };

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
                const actionList = card.querySelector('.action-list');
                const actionsCount = card.querySelector('.actions-count span');
                
                actionList.innerHTML = job.actions.map(action => `
                    <div class="action">
                        <div class="action-header">${formatDate(action.date)}</div>
                        <div class="action-text">${action.text}</div>
                    </div>
                `).join('');
                
                actionsCount.textContent = `${job.actions.length} Actions`;
                input.value = '';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
    });
}

// Function to update total applications
function updateTotalApplications(count) {
    totalApplications = count;
    document.getElementById('totalApplications').textContent = count;
    localStorage.setItem('totalApplications', count);
}

// Show update form
function showUpdateForm() {
    const form = document.getElementById('updateForm');
    const input = document.getElementById('newApplicationCount');
    form.style.display = 'flex';
    input.value = totalApplications;
    input.focus();
}

// Hide update form
function hideUpdateForm() {
    document.getElementById('updateForm').style.display = 'none';
}

// Update application count from form
function updateApplicationCount() {
    const input = document.getElementById('newApplicationCount');
    const newCount = parseInt(input.value);
    
    if (!isNaN(newCount) && newCount >= 0) {
        updateTotalApplications(newCount);
        hideUpdateForm();
    } else {
        alert('Please enter a valid number');
    }
}

// Handle Enter key in input
document.getElementById('newApplicationCount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        updateApplicationCount();
    }
});

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadJobData();
    
    // Set up filter listeners
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', applyFiltersAndSort);
    });
});

// Take screenshot of the current page
function takeScreenshot() {
    // Show loading indicator
    const button = document.querySelector('.header-button:nth-child(2)');
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Capturing...</span>';
    
    // Take screenshot
    html2canvas(document.querySelector('.container')).then(canvas => {
        // Convert to image
        const image = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = `job-search-report-${new Date().toISOString().split('T')[0]}.png`;
        link.href = image;
        link.click();
        
        // Restore button
        button.innerHTML = originalIcon;
    }).catch(error => {
        console.error('Error taking screenshot:', error);
        alert('Error taking screenshot. Please try again.');
        button.innerHTML = originalIcon;
    });
} 