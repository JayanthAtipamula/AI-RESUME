import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateResume = async (profile: any, jobDescription: string) => {
  const prompt = `
    Create a professional, ATS-friendly resume based on the profile and job description below.
    
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
    [Technical Skills]: [List relevant skills]
    [Other Skills]: [List relevant skills]

    CERTIFICATIONS
    [Certification Name], [Issuing Organization], [Year]

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