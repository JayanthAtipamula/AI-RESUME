import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateResume = async (profile: any, jobDescription: string) => {
  const prompt = `
    Create  a professional, ATS-friendly resume based on the profile and job description below.
    
    Format the resume exactly like this example, maintaining the same structure and style:

    [Full Name]
    [Location]  [Phone]  [Email]

    SUMMARY
    [2-3 sentences highlighting key qualifications matching the job requirements]

    EXPERIENCE
    [Company Name], [Location]
    [Job Title], [Duration]
    - [Achievement/responsibility with metrics]
    - [Achievement/responsibility with metrics]
    - [Achievement/responsibility with metrics]

    PROJECTS
    [Project Name]
    - [Project description with impact and technologies used]
    - [Link if available]

    EDUCATION
    [Institution Name]
    [Degree], [Year], CGPA: [CGPA]

    SKILLS
    [Skill Category 1]: [List relevant skills in this category]
    [Skill Category 2]: [List relevant skills in this category]
    [Skill Category 3]: [List relevant skills in this category]

    CERTIFICATIONS
    [Certification Name], [Issuing Organization], [Year]

    LANGUAGES
    [List languages with proficiency levels]

    HOBBIES & INTERESTS
    [List relevant hobbies and interests]

    Use the following profile information:
    ${JSON.stringify(profile, null, 2)}
    
    Target this job description:
    ${jobDescription}

    IMPORTANT:
    1. Focus on achievements and metrics
    2. Use strong action verbs
    3. Match keywords from the job description
    4. Keep formatting clean and consistent
    5. Prioritize relevant experience and projects
    6. Include only the most relevant skills
    7. Use bullet points for experience and projects
    8. Keep sections clearly separated with headers
    9. Maintain professional formatting
    10. Ensure all dates and contact info are properly formatted
    11. For education entries, place CGPA on the same line as degree and year
    12. Include languages section with proficiency levels if available in profile
    13. Include a brief hobbies section if it adds value to the application
    14. Maintain the skill categories exactly as provided in the profile
    15. For each skill category, list the most relevant skills for the job
    16 .Use More Measurable Achievements
        Include quantifiable metrics (e.g., "Reduced cloud costs by 20%" instead of "Optimized cloud costs").
        Highlight performance improvements with specific percentages, time reductions, or cost savings.
    17 .Extract relevant keywords from job descriptions and ensure they appear naturally in the resume.
  `;
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  return chatCompletion.choices[0]?.message?.content || '';
};

export const generateCoverLetter = async (profile: any, jobDescription: string) => {
  const prompt = `
    Create a professional cover letter based on the profile and job description below.
    The cover letter should be personalized, engaging, and highlight relevant experience.
    
    Format the cover letter like this:

    [Full Name]
    [Location]
    [Phone]
    [Email]

    [Date]

    Dear Hiring Manager,

    [Opening paragraph: Express enthusiasm for the role and company]

    [Body paragraph 1: Highlight relevant experience and achievements]

    [Body paragraph 2: Connect skills to job requirements]

    [Closing paragraph: Reiterate interest and call to action]

    Sincerely,
    [Full Name]

    Use the following profile information:
    ${JSON.stringify(profile, null, 2)}
    
    Target this job description:
    ${jobDescription}

    IMPORTANT:
    1. Be concise but compelling
    2. Show enthusiasm and personality
    3. Match tone to company culture
    4. Highlight relevant achievements
    5. Use specific examples
    6. Address key job requirements
    7. Maintain professional tone
    8. Keep to one page
    9. Use active voice
    10. Proofread for clarity and flow
    11. If relevant, briefly mention language skills or personal interests that align with the company culture
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  return chatCompletion.choices[0]?.message?.content || '';
};