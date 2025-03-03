# Resume Builder Backend

This is the backend service for the AI Resume Builder application. It provides PDF generation functionality using PDFKit.

## Features

- Generate ATS-friendly, text-based PDFs from resume data
- RESTful API for frontend integration
- Proper formatting for professional resumes

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Generate PDF
- **URL**: `/api/generate-pdf`
- **Method**: POST
- **Body**: JSON object containing resume data
  ```json
  {
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "location": "New York, NY",
      "linkedin": "linkedin.com/in/johndoe"
    },
    "summary": "Experienced software engineer...",
    "workExperience": [
      {
        "title": "Software Engineer",
        "company": "Tech Company",
        "startDate": "Jan 2020",
        "endDate": "Present",
        "location": "Remote",
        "description": "Developed web applications...",
        "achievements": [
          "Increased performance by 30%",
          "Led team of 5 developers"
        ]
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "University Name",
        "startDate": "Sep 2016",
        "endDate": "May 2020",
        "location": "City, State",
        "description": "Graduated with honors"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "projects": [
      {
        "name": "Project Name",
        "url": "https://project-url.com",
        "description": "A web application that..."
      }
    ],
    "certifications": [
      {
        "name": "AWS Certified Developer",
        "issuer": "Amazon Web Services",
        "date": "Jan 2022"
      }
    ]
  }
  ```
- **Response**: PDF file download

### Health Check
- **URL**: `/api/health`
- **Method**: GET
- **Response**: 
  ```json
  {
    "status": "ok"
  }
  ```

## Deployment

For production deployment:

1. Set the PORT environment variable if needed
2. Ensure CORS is properly configured for your frontend domain
3. Consider using a process manager like PM2 for production

## Integration with Frontend

The frontend should call the `/api/generate-pdf` endpoint with the resume data and handle the PDF blob response for download. 