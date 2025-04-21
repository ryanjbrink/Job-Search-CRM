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

// Display job details
function displayJobDetails(job) {
    // Update header information
    document.getElementById('companyName').textContent = job.company;
    document.getElementById('positionTitle').textContent = job.position;
    document.getElementById('applicationDate').textContent = formatDate(job.applicationDate);
    document.getElementById('location').textContent = job.location;
    document.getElementById('salaryRange').textContent = job.salaryRange;
    
    // Update status and priority badges
    document.getElementById('statusBadge').textContent = job.status;
    document.getElementById('statusBadge').className = `status status-${job.status.toLowerCase().replace(/\s+/g, '')}`;
    document.getElementById('priorityBadge').textContent = job.priority;
    document.getElementById('priorityBadge').className = `priority priority-${job.priority.toLowerCase()}`;
    
    // Update details
    document.getElementById('applicationUrl').href = job.applicationUrl;
    document.getElementById('nextSteps').textContent = job.nextSteps;
    document.getElementById('notes').textContent = job.notes;
    
    // Display comments
    displayComments(job.comments);
}

// Display comments
function displayComments(comments) {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span>${formatDate(comment.date)}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// Add new comment
async function addComment() {
    const input = document.getElementById('newComment');
    const commentText = input.value.trim();
    
    if (commentText) {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            const job = data.jobs.find(j => j.id === jobId);
            
            if (job) {
                const newComment = {
                    id: `${jobId}${job.comments.length + 1}`,
                    date: new Date().toISOString(),
                    text: commentText
                };
                
                job.comments.push(newComment);
                displayComments(job.comments);
                input.value = '';
                
                // In a real application, you would save this to the server
                console.log('New comment added:', newComment);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
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

// Handle Enter key in comment input
document.getElementById('newComment').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addComment();
    }
});

// Load job details when page loads
document.addEventListener('DOMContentLoaded', loadJobDetails); 