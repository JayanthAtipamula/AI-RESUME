/**
 * Test script for PDF generation
 * 
 * This can be used in the browser console to test PDF generation:
 * 
 * import { testPdfGeneration } from './lib/testPdf';
 * testPdfGeneration();
 */

import { generateResumePDF } from './pdfService';

export const testPdfGeneration = async () => {
  try {
    console.log('Testing PDF generation...');
    
    const testData = {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/johndoe'
      },
      summary: 'Experienced software engineer with a passion for building web applications.',
      workExperience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Company',
          startDate: 'Jan 2020',
          endDate: 'Present',
          location: 'New York, NY',
          description: 'Led development of web applications using React and Node.js.',
          achievements: [
            'Increased performance by 30%',
            'Led team of 5 developers'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University Name',
          startDate: 'Sep 2016',
          endDate: 'May 2020',
          location: 'City, State',
          description: 'Graduated with honors'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      projects: [
        {
          name: 'Project Name',
          url: 'https://project-url.com',
          description: 'A web application that helps users create resumes.'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          date: 'Jan 2022'
        }
      ]
    };
    
    console.log('Generating PDF with test data...');
    await generateResumePDF(testData);
    console.log('PDF generation successful!');
    
    return true;
  } catch (error) {
    console.error('Error testing PDF generation:', error);
    return false;
  }
}; 