// Load environment variables
require('dotenv').config();

const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// PDF Generation endpoint
app.post("/api/generate-pdf", (req, res) => {
  try {
    console.log('Received request to generate PDF');
    console.log('Request body keys:', Object.keys(req.body));
    
    // Extract resume data from request body
    const { 
      personalInfo, 
      workExperience, 
      education, 
      skills, 
      projects, 
      certifications,
      summary,
      content,
      role
    } = req.body;

    console.log('Content present:', !!content);
    console.log('Role:', role);
    console.log('Personal info present:', !!personalInfo);
    
    // Create a new PDF document
    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      info: {
        Title: `Resume - ${personalInfo?.name || role || 'Untitled'}`,
        Author: personalInfo?.name || 'Resume Builder',
        Subject: 'Resume',
        Keywords: 'resume, cv, job application'
      }
    });
    
    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=resume.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Define colors and styles
    const primaryColor = '#000000';
    const secondaryColor = '#333333';
    const lineColor = '#000000';
    
    // Helper function to draw a horizontal line
    const drawHorizontalLine = (y) => {
      doc.strokeColor(lineColor)
         .lineWidth(0.5)
         .moveTo(40, y)
         .lineTo(doc.page.width - 40, y)
         .stroke();
      return y + 5;
    };

    // Helper function to add a section header
    const addSectionHeader = (text) => {
      doc.moveDown(0.5);
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(text.toUpperCase(), { underline: false });
      
      // Draw line under the header
      const y = doc.y;
      drawHorizontalLine(y);
      doc.moveDown(0.4);
      
      return doc.y;
    };

    // If we have raw content, use that instead of structured data
    if (content) {
      console.log('Using raw content for PDF generation');
      
      // Try to extract name and contact info from the content
      const lines = content.split('\n');
      let name = role || 'Resume';
      let contactInfo = '';
      
      if (lines.length > 0) {
        name = lines[0].trim();
        if (lines.length > 1) {
          contactInfo = lines[1].trim();
        }
      }
      
      // Header
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(name, { align: 'center' });
      
      if (contactInfo) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(secondaryColor)
           .text(contactInfo, { align: 'center' });
      }
      
      doc.moveDown(0.8);
      
      // Format and add the content
      const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s(.*?)(\n|$)/g, '$1\n');
      
      // Skip the first two lines (name and contact) if they exist
      const contentLines = formattedContent.split('\n');
      let currentSection = '';
      let inSection = false;
      
      for (let i = 2; i < contentLines.length; i++) {
        const line = contentLines[i].trim();
        
        // Check if this is a section header (all caps)
        if (line === line.toUpperCase() && line.length > 0 && !/[a-z]/.test(line)) {
          currentSection = line;
          addSectionHeader(line);
          inSection = true;
        } else if (line.length > 0) {
          // Regular content
          if (inSection) {
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text(line, { align: 'left', lineGap: 2 });
          } else {
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text(line, { align: 'left', lineGap: 2 });
          }
        } else if (line.length === 0 && inSection) {
          // Empty line in a section
          doc.moveDown(0.4);
        }
      }
    } 
    // Otherwise use the structured data
    else {
      console.log('Using structured data for PDF generation');
      
      // Header with personal info
      if (personalInfo?.name) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text(personalInfo.name, { align: 'center' });
        
        // Contact info line
        const contactInfo = [];
        if (personalInfo.location) contactInfo.push(personalInfo.location);
        if (personalInfo.phone) contactInfo.push(personalInfo.phone);
        if (personalInfo.email) contactInfo.push(personalInfo.email);
        
        if (contactInfo.length > 0) {
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(secondaryColor)
             .text(contactInfo.join(' | '), { align: 'center' });
        }
        
        doc.moveDown(0.8);
      }

      // Summary
      if (summary) {
        addSectionHeader('SUMMARY');
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(primaryColor)
           .text(summary, { lineGap: 2 });
        doc.moveDown(0.7);
      }

      // Work Experience
      if (workExperience && workExperience.length > 0) {
        addSectionHeader('EXPERIENCE');
        
        workExperience.forEach((job, index) => {
          // Company and location
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor(primaryColor)
             .text(`${job.company}, ${job.location || ''}`);
          
          // Job title and dates
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(primaryColor)
             .text(`${job.title}, ${job.startDate} - ${job.endDate || 'Present'}`);
          
          doc.moveDown(0.4);
          
          if (job.description) {
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text(job.description, { lineGap: 2 });
            doc.moveDown(0.4);
          }
          
          if (job.achievements && job.achievements.length > 0) {
            job.achievements.forEach(achievement => {
              doc.fontSize(9)
                 .font('Helvetica')
                 .fillColor(primaryColor)
                 .text(`• ${achievement}`, { indent: 10, lineGap: 2 });
            });
          }
          
          if (index < workExperience.length - 1) {
            doc.moveDown(0.7);
          }
        });
        
        doc.moveDown(0.7);
      }

      // Projects
      if (projects && projects.length > 0) {
        addSectionHeader('PROJECTS');
        
        projects.forEach((project, index) => {
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor(primaryColor)
             .text(project.name);
          
          if (project.url) {
            doc.fontSize(8)
               .font('Helvetica-Oblique')
               .fillColor(secondaryColor)
               .text(project.url);
          }
          
          doc.moveDown(0.4);
          
          if (project.description) {
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text(project.description, { lineGap: 2 });
          }
          
          if (index < projects.length - 1) {
            doc.moveDown(0.7);
          }
        });
        
        doc.moveDown(0.7);
      }

      // Education
      if (education && education.length > 0) {
        addSectionHeader('EDUCATION');
        
        education.forEach((edu, index) => {
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor(primaryColor)
             .text(edu.institution);
          
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(primaryColor)
             .text(`${edu.degree}, ${edu.startDate} - ${edu.endDate || 'Present'}`);
          
          if (edu.description) {
            doc.moveDown(0.4);
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text(edu.description, { lineGap: 2 });
          }
          
          if (index < education.length - 1) {
            doc.moveDown(0.7);
          }
        });
        
        doc.moveDown(0.7);
      }

      // Skills
      if (skills && skills.length > 0) {
        addSectionHeader('SKILLS');
        
        // Group skills into categories if possible
        if (typeof skills === 'object' && !Array.isArray(skills)) {
          // If skills is an object with categories
          Object.entries(skills).forEach(([category, categorySkills], index) => {
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text(`${category}:`);
            
            const skillsText = Array.isArray(categorySkills) 
              ? categorySkills.join(', ') 
              : categorySkills;
            
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(primaryColor)
               .text(skillsText, { lineGap: 2 });
            
            if (index < Object.entries(skills).length - 1) {
              doc.moveDown(0.4);
            }
          });
        } else {
          // If skills is just an array
          const skillsText = Array.isArray(skills) ? skills.join(', ') : skills;
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(primaryColor)
             .text(skillsText, { lineGap: 2 });
        }
        
        doc.moveDown(0.7);
      }

      // Certifications
      if (certifications && certifications.length > 0) {
        addSectionHeader('CERTIFICATIONS');
        
        certifications.forEach((cert, index) => {
          const certText = `${cert.name}${cert.issuer ? `, ${cert.issuer}` : ''}${cert.date ? `, ${cert.date}` : ''}`;
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(primaryColor)
             .text(certText, { lineGap: 2 });
          
          if (index < certifications.length - 1) {
            doc.moveDown(0.4);
          }
        });
      }
    }

    console.log('Finalizing PDF generation');
    // Finalize the PDF
    doc.end();
    console.log('PDF generation completed');
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message, stack: error.stack });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("Resume Builder API is running");
});

// Test PDF endpoint
app.get("/api/test-pdf", (req, res) => {
  try {
    console.log('Generating test PDF');
    
    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4'
    });
    
    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=test.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Define colors
    const primaryColor = '#000000';
    const secondaryColor = '#333333';
    const lineColor = '#000000';
    
    // Helper function to draw a horizontal line
    const drawHorizontalLine = (y) => {
      doc.strokeColor(lineColor)
         .lineWidth(0.5)
         .moveTo(40, y)
         .lineTo(doc.page.width - 40, y)
         .stroke();
      return y + 5;
    };
    
    // Helper function to add a section header
    const addSectionHeader = (text) => {
      doc.moveDown(0.5);
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(text.toUpperCase(), { underline: false });
      
      // Draw line under the header
      const y = doc.y;
      drawHorizontalLine(y);
      doc.moveDown(0.4);
      
      return doc.y;
    };
    
    // Add header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('John Developer', { align: 'center' });
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(secondaryColor)
       .text('San Francisco, CA | (555) 123-4567 | johndoe@example.com', { align: 'center' });
    
    doc.moveDown(0.8);
    
    // Add summary section
    addSectionHeader('SUMMARY');
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('Highly skilled Software Developer with a strong background in designing, developing, and maintaining software applications, leveraging expertise in programming languages, cloud platforms, and collaborative team environments. Proven ability to deliver high-quality solutions, with a focus on efficiency, scalability, and maintainability.', { lineGap: 2 });
    
    doc.moveDown(0.7);
    
    // Add experience section
    addSectionHeader('EXPERIENCE');
    
    // First job
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Tech Giants Inc., San Francisco, CA');
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('Senior Software Engineer, Jan 2020 - Present');
    
    doc.moveDown(0.4);
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('• Led development of cloud-native applications using React, Node.js, and AWS, resulting in a 40% improvement in system performance through optimization initiatives.', { lineGap: 2 });
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('• Collaborated with cross-functional teams to design, develop, and deploy software applications, ensuring high-quality solutions that meet business requirements.', { lineGap: 2 });
    
    doc.moveDown(0.7);
    
    // Second job
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('StartupHub, San Francisco, CA');
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('Full Stack Developer, Mar 2018 - Dec 2019');
    
    doc.moveDown(0.4);
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('• Developed and maintained multiple client projects using React, TypeScript, and Firebase.', { lineGap: 2 });
    
    doc.moveDown(0.7);
    
    // Add projects section
    addSectionHeader('PROJECTS');
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('E-commerce Platform');
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('• Built a scalable e-commerce platform handling 10k+ daily users, utilizing React, Node.js, MongoDB, and Stripe to implement real-time inventory management and payment processing.', { lineGap: 2 });
    
    doc.moveDown(0.7);
    
    // Add education section
    addSectionHeader('EDUCATION');
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Stanford University');
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('M.S. Computer Science, 2018, GPA: 3.92', { lineGap: 2 });
    
    doc.moveDown(0.7);
    
    // Add skills section
    addSectionHeader('SKILLS');
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('Technical Skills: React, Node.js, AWS, MongoDB, Stripe, Python, OpenAI API, FastAPI', { lineGap: 2 });
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(primaryColor)
       .text('Other Skills: Agile Development, CI/CD Pipelines, Cloud Computing, Team Leadership', { lineGap: 2 });
    
    // Finalize the PDF
    doc.end();
    console.log('Test PDF generated successfully');
  } catch (error) {
    console.error('Error generating test PDF:', error);
    res.status(500).json({ error: 'Failed to generate test PDF', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}).on('error', (err) => {
  console.error('Server error:', err);
});

// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 