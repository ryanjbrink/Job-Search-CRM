# Job Search CRM

A simple, static web-based CRM for tracking job applications. This application runs entirely in the browser and uses CSV files for data storage.

## Features

- View all job applications in a sortable and filterable table
- Sort by:
  - Application Date
  - Company Name
  - Position
  - Status
  - Location
  - Priority
- Filter by:
  - Status (Applied, Interview Scheduled, Rejected, Offer)
  - Location (Remote, Office, Hybrid)
  - Priority (High, Medium, Low)
- Mobile-responsive design
- No backend required - runs entirely in the browser

## How to Use

1. The application reads data from `data.csv` in the root directory
2. To add or update entries:
   - Edit the `data.csv` file
   - Commit and push the changes to the repository
   - GitHub Pages will automatically update the website

### CSV File Format

The `data.csv` file should have the following columns:
```csv
Company,Position,Application Date,Status,Location,Salary Range,Application URL,Notes,Next Steps,Priority
```

- **Application Date**: Use YYYY-MM-DD format
- **Status**: Must be one of: Applied, Interview Scheduled, Rejected, Offer
- **Location**: Must be one of: Remote, Office, Hybrid
- **Priority**: Must be one of: High, Medium, Low

## Local Development

To run the application locally:

1. Clone the repository
2. Open `index.html` in your web browser
   - Note: You'll need to run it through a local web server due to CORS restrictions when loading the CSV file
   - You can use Python's built-in server: `python -m http.server`
   - Or use VS Code's Live Server extension

## Deployment

This application is designed to be hosted on GitHub Pages:

1. Go to your repository settings
2. Navigate to the "Pages" section
3. Select the branch you want to deploy (usually `main`)
4. Save the changes

The application will be available at `https://[your-username].github.io/[repository-name]/`