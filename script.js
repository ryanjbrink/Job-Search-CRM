// Global variables
let jobData = [];
let currentSort = { column: 'applicationDate', ascending: false };
let applicationChart = null;

// Fetch and parse JSON data
async function loadJobData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        jobData = data.jobs;
        updateStats();
        updateChart();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error loading job data:', error);
        document.getElementById('jobList').innerHTML = '<div class="job-card">Error loading data. Please ensure data.json exists in the repository.</div>';
    }
}

// Update statistics
function updateStats() {
    const stats = {
        total: jobData.length,
        active: jobData.filter(job => job.status === 'Applied').length,
        interviews: jobData.filter(job => job.status === 'Interview Scheduled').length,
        offers: jobData.filter(job => job.status === 'Offer').length
    };

    document.getElementById('totalApplications').textContent = stats.total;
    document.getElementById('activeApplications').textContent = stats.active;
    document.getElementById('interviewsScheduled').textContent = stats.interviews;
    document.getElementById('offers').textContent = stats.offers;
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('applicationChart').getContext('2d');
    
    // Group applications by date
    const applicationsByDate = {};
    jobData.forEach(job => {
        const date = job.applicationDate;
        applicationsByDate[date] = (applicationsByDate[date] || 0) + 1;
    });

    // Sort dates and prepare data
    const dates = Object.keys(applicationsByDate).sort();
    const counts = dates.map(date => applicationsByDate[date]);

    // Calculate cumulative applications
    const cumulativeData = counts.reduce((acc, count, i) => {
        const prev = i > 0 ? acc[i - 1] : 0;
        acc.push(prev + count);
        return acc;
    }, []);

    // Destroy existing chart if it exists
    if (applicationChart) {
        applicationChart.destroy();
    }

    // Create new chart
    applicationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: [{
                label: 'Total Applications',
                data: cumulativeData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#888'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#888'
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
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    if (statusFilter) {
        filteredData = filteredData.filter(job => job.status === statusFilter);
    }
    if (locationFilter) {
        filteredData = filteredData.filter(job => job.location === locationFilter);
    }
    if (priorityFilter) {
        filteredData = filteredData.filter(job => job.priority === priorityFilter);
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

// Render job cards
function renderJobCards(data) {
    const jobList = document.getElementById('jobList');
    jobList.innerHTML = data.map(job => `
        <div class="job-card" data-job-id="${job.id}">
            <div class="job-card-header">
                <div class="job-info">
                    <div class="company-name">${job.company}</div>
                    <div class="position-title">${job.position}</div>
                    <div class="job-meta">
                        ${formatDate(job.applicationDate)} · ${job.location} · ${job.salaryRange}
                        ${job.applicationUrl ? ` · <a href="${job.applicationUrl}" target="_blank">View Application</a>` : ''}
                    </div>
                </div>
                <span class="status status-${job.status.toLowerCase().replace(/\s+/g, '')}">${job.status}</span>
                <span class="priority priority-${job.priority.toLowerCase()}">${job.priority}</span>
            </div>
            
            <div class="comments-section">
                <div class="comments-header">
                    <button class="comments-toggle" onclick="toggleComments('${job.id}')">
                        💬 ${job.comments.length} Comments
                    </button>
                </div>
                <div class="comment-list" id="comments-${job.id}" style="display: none;">
                    ${formatComments(job.comments)}
                    <div class="comment-form">
                        <input type="text" class="comment-input" id="comment-input-${job.id}" placeholder="Add a comment...">
                        <button class="add-comment-btn" onclick="handleAddComment('${job.id}')">Add</button>
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

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadJobData();
    
    // Set up filter listeners
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', applyFiltersAndSort);
    });
}); 