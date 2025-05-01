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
    jobList.innerHTML = data.map(job => `
        <div class="job-card" data-job-id="${job.id}" onclick="window.location.href='job-details.html?id=${job.id}'">
            <div class="job-card-header">
                <div class="job-info">
                    <div class="company-name">${job.company}</div>
                    <div class="position-title">${job.position}</div>
                    <div class="job-meta">
                        ${formatDate(job.applicationDate)} · ${job.location} · ${job.salaryRange}
                        ${job.applicationUrl ? ` · <a href="${job.applicationUrl}" target="_blank" onclick="event.stopPropagation()">View Application</a>` : ''}
                    </div>
                </div>
                <span class="status status-${job.status.toLowerCase().replace(/\s+/g, '')}">${getStatusIcon(job.status)} ${job.status}</span>
            </div>
            
            <div class="comments-section">
                <div class="comments-header">
                    <button class="comments-toggle" onclick="event.stopPropagation(); toggleComments('${job.id}')">
                        💬 ${job.comments.length} Comments
                    </button>
                </div>
                <div class="comment-list" id="comments-${job.id}" style="display: none;">
                    ${formatComments(job.comments)}
                    <div class="comment-form">
                        <input type="text" class="comment-input" id="comment-input-${job.id}" placeholder="Add a comment..." onclick="event.stopPropagation()">
                        <button class="add-comment-btn" onclick="event.stopPropagation(); handleAddComment('${job.id}')">Add</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle comments visibility
function toggleComments(jobId) {
    const commentsSection = document.getElementById(`comments-${jobId}`);
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

// Handle adding a new comment
function handleAddComment(jobId) {
    const input = document.getElementById(`comment-input-${jobId}`);
    const commentText = input.value.trim();
    
    if (commentText) {
        addComment(jobId, commentText);
        input.value = '';
    }
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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