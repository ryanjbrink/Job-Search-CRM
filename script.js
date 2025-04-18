// Global variables
let jobData = [];
let currentSort = { column: 'applicationdate', ascending: false };
let applicationChart = null;

// Fetch and parse CSV data
async function loadJobData() {
    try {
        const response = await fetch('data.csv');
        const csvText = await response.text();
        jobData = parseCSV(csvText);
        updateStats();
        updateChart();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error loading job data:', error);
        document.getElementById('jobList').innerHTML = '<div class="job-card">Error loading data. Please ensure data.csv exists in the repository.</div>';
    }
}

// Parse CSV text into array of objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            const values = line.split(',').map(value => value.trim());
            const entry = {};
            headers.forEach((header, index) => {
                entry[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
            });
            return entry;
        });
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
        const date = job.applicationdate.split('T')[0];
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
        if (currentSort.column === 'applicationdate') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    
    renderJobCards(filteredData);
}

// Render job cards
function renderJobCards(data) {
    const jobList = document.getElementById('jobList');
    jobList.innerHTML = data.map(job => `
        <div class="job-card">
            <div class="job-info">
                <div class="company-name">${job.company}</div>
                <div class="position-title">${job.position}</div>
                <div class="job-meta">
                    ${formatDate(job.applicationdate)} · ${job.location} · ${job.salary}
                    ${job.applicationurl ? ` · <a href="${job.applicationurl}" target="_blank">View Application</a>` : ''}
                </div>
            </div>
            <span class="status status-${job.status.toLowerCase().replace(/\s+/g, '')}">${job.status}</span>
            <span class="priority priority-${job.priority.toLowerCase()}">${job.priority}</span>
        </div>
    `).join('');
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