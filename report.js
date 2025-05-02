// Load and process job data
function loadReportData() {
    const jobData = JSON.parse(localStorage.getItem('jobData')) || { jobs: [] };
    const jobs = jobData.jobs;

    // Update statistics
    updateStatistics(jobs);
    
    // Create charts
    createStatusChart(jobs);
    createTimelineChart(jobs);
}

// Update statistics
function updateStatistics(jobs) {
    const totalApplications = jobs.length;
    const interviews = jobs.filter(job => job.status === 'Interviewing').length;
    const offers = jobs.filter(job => job.status === 'Offer').length;

    document.getElementById('totalApplications').textContent = totalApplications;
    document.getElementById('interviewRate').textContent = totalApplications > 0 ? 
        `${Math.round((interviews / totalApplications) * 100)}%` : '0%';
    document.getElementById('offerRate').textContent = totalApplications > 0 ? 
        `${Math.round((offers / totalApplications) * 100)}%` : '0%';
}

// Create status distribution chart
function createStatusChart(jobs) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const statusCounts = {
        'Cold': jobs.filter(job => job.status === 'Cold').length,
        'Potential': jobs.filter(job => job.status === 'Potential').length,
        'Hot': jobs.filter(job => job.status === 'Hot').length,
        'Interviewing': jobs.filter(job => job.status === 'Interviewing').length,
        'Offer': jobs.filter(job => job.status === 'Offer').length
    };

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
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
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#D7E4DD',
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

// Create application timeline chart
function createTimelineChart(jobs) {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    const timelineData = {};
    
    jobs.forEach(job => {
        const date = new Date(job.dateEntered).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        timelineData[date] = (timelineData[date] || 0) + 1;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(timelineData),
            datasets: [{
                label: 'Applications',
                data: Object.values(timelineData),
                borderColor: 'rgba(0, 231, 108, 1)',
                backgroundColor: 'rgba(0, 231, 108, 0.1)',
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
                        color: '#D7E4DD'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#D7E4DD'
                    }
                }
            }
        }
    });
}

// Export report
function exportReport(format) {
    const jobData = JSON.parse(localStorage.getItem('jobData')) || { jobs: [] };
    
    if (format === 'pdf') {
        // In a real application, you would use a PDF generation library
        alert('PDF export would be implemented here');
    } else if (format === 'csv') {
        const headers = ['Company', 'Job Title', 'Status', 'Date Entered', 'Location', 'Salary'];
        const csvContent = [
            headers.join(','),
            ...jobData.jobs.map(job => [
                job.company,
                job.jobTitle,
                job.status,
                job.dateEntered,
                job.location,
                job.salary
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'job-search-report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize report page
document.addEventListener('DOMContentLoaded', loadReportData); 