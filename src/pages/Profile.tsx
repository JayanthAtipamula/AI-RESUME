import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { Save, Plus, Trash2, Wand2, ArrowLeft } from 'lucide-react';
import ReferralSystem from '../components/ReferralSystem';

interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  year: string;
  cgpa: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

interface SkillCategory {
  name: string;
  skills: string[];
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  certifications: Certification[];
  projects: Project[];
  hobbies: string[];
  languages: string[];
}

const initialProfile: Profile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  hobbies: [],
  languages: []
};

// Helper function to safely format skills data
const formatSkills = (skills: any): string => {
  if (Array.isArray(skills)) {
    // If it's an array of strings (old format)
    if (skills.length > 0 && typeof skills[0] === 'string') {
      return skills.join(', ');
    }
    // If it's an array of skill categories (new format)
    if (skills.length > 0 && typeof skills[0] === 'object') {
      return skills.map(category => 
        `${category.name}: ${category.skills.join(', ')}`
      ).join('\n');
    }
  } else if (typeof skills === 'string') {
    return skills;
  } else if (typeof skills === 'object' && skills !== null) {
    // Handle case where skills is an object with categories
    return Object.entries(skills)
      .map(([category, categorySkills]) => 
        `${category}: ${Array.isArray(categorySkills) ? categorySkills.join(', ') : categorySkills}`
      )
      .join('\n');
  }
  return '';
};

function Profile() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<Profile>(initialProfile);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as Profile;
          
          // Ensure skills is always an array of SkillCategory objects
          const skills = Array.isArray(profileData.skills) 
            ? profileData.skills 
            : [];
          
          // Convert old format (array of strings) to new format if needed
          const formattedSkills = skills.length > 0 && typeof skills[0] === 'string'
            ? [{ name: 'Skills', skills: skills as unknown as string[] }]
            : skills;
          
          setProfile({ 
            ...initialProfile, 
            ...profileData,
            skills: formattedSkills
          });
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (user) {
      await setDoc(doc(db, 'profiles', user.uid), profile);
      navigate('/dashboard');
    }
  };

  const populateFakeData = () => {
    setProfile({
      name: 'John Developer',
      email: user?.email || 'john@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      workExperience: [
        {
          company: 'Tech Giants Inc.',
          position: 'Senior Software Engineer',
          duration: 'Jan 2020 - Present',
          description: 'Led development of cloud-native applications using React, Node.js, and AWS. Improved system performance by 40% through optimization initiatives.',
        },
        {
          company: 'StartupHub',
          position: 'Full Stack Developer',
          duration: 'Mar 2018 - Dec 2019',
          description: 'Developed and maintained multiple client projects using React, TypeScript, and Firebase. Implemented CI/CD pipelines reducing deployment time by 60%.',
        }
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'M.S. Computer Science',
          year: '2018',
          cgpa: '3.92'
        },
        {
          institution: 'UC Berkeley',
          degree: 'B.S. Computer Science',
          year: '2016',
          cgpa: '3.85'
        }
      ],
      skills: [
        {
          name: 'Technical Skills',
          skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes']
        },
        {
          name: 'Soft Skills',
          skills: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration']
        },
        {
          name: 'Tools',
          skills: ['Git', 'JIRA', 'Figma', 'VS Code', 'Jenkins']
        }
      ],
      certifications: [
        {
          name: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          year: '2023'
        },
        {
          name: 'Google Cloud Professional',
          issuer: 'Google',
          year: '2022'
        }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a scalable e-commerce platform handling 10k+ daily users. Implemented real-time inventory management and payment processing.',
          technologies: 'React, Node.js, MongoDB, Stripe',
          link: 'https://github.com/johndoe/ecommerce'
        },
        {
          name: 'AI Content Generator',
          description: 'Developed an AI-powered content generation tool using GPT-3. Increased content creation efficiency by 300%.',
          technologies: 'Python, OpenAI API, FastAPI, React',
          link: 'https://github.com/johndoe/ai-content'
        }
      ],
      hobbies: [
        'Photography',
        'Hiking',
        'Chess',
        'Playing Guitar'
      ],
      languages: [
        'English (Native)',
        'Spanish (Fluent)',
        'French (Intermediate)'
      ]
    });
  };

  const addWorkExperience = () => {
    setProfile({
      ...profile,
      workExperience: [
        ...profile.workExperience,
        { company: '', position: '', duration: '', description: '' },
      ],
    });
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const newWorkExperience = [...profile.workExperience];
    newWorkExperience[index] = { ...newWorkExperience[index], [field]: value };
    setProfile({ ...profile, workExperience: newWorkExperience });
  };

  const removeWorkExperience = (index: number) => {
    setProfile({
      ...profile,
      workExperience: profile.workExperience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, { institution: '', degree: '', year: '', cgpa: '' }],
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...profile.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setProfile({ ...profile, education: newEducation });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index),
    });
  };

  const addSkillCategory = () => {
    setProfile({
      ...profile,
      skills: [...profile.skills, { name: '', skills: [] }],
    });
  };

  const updateSkillCategoryName = (index: number, value: string) => {
    const newSkills = [...profile.skills];
    newSkills[index] = { ...newSkills[index], name: value };
    setProfile({ ...profile, skills: newSkills });
  };

  const updateSkillsInCategory = (categoryIndex: number, value: string) => {
    const newSkills = [...profile.skills];
    // Split by comma and trim each skill
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
    newSkills[categoryIndex] = { ...newSkills[categoryIndex], skills: skillsArray };
    setProfile({ ...profile, skills: newSkills });
  };

  const removeSkillCategory = (index: number) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    setProfile({
      ...profile,
      certifications: [
        ...profile.certifications,
        { name: '', issuer: '', year: '' },
      ],
    });
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const newCertifications = [...profile.certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setProfile({ ...profile, certifications: newCertifications });
  };

  const removeCertification = (index: number) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_, i) => i !== index),
    });
  };

  const addProject = () => {
    setProfile({
      ...profile,
      projects: [
        ...profile.projects,
        { name: '', description: '', technologies: '', link: '' },
      ],
    });
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...profile.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProfile({ ...profile, projects: newProjects });
  };

  const removeProject = (index: number) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index),
    });
  };

  const addHobby = () => {
    setProfile({
      ...profile,
      hobbies: [...profile.hobbies, ''],
    });
  };

  const updateHobby = (index: number, value: string) => {
    const newHobbies = [...profile.hobbies];
    newHobbies[index] = value;
    setProfile({ ...profile, hobbies: newHobbies });
  };

  const removeHobby = (index: number) => {
    setProfile({
      ...profile,
      hobbies: profile.hobbies.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    setProfile({
      ...profile,
      languages: [...profile.languages, ''],
    });
  };

  const updateLanguage = (index: number, value: string) => {
    const newLanguages = [...profile.languages];
    newLanguages[index] = value;
    setProfile({ ...profile, languages: newLanguages });
  };

  const removeLanguage = (index: number) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen px-4 pt-28 pb-12 bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="glass-button">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={populateFakeData} className="glass-button flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              <span>Sample Data</span>
            </button>
            <button onClick={handleSave} className="glass-button flex items-center gap-2">
              <Save className="w-5 h-5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="glass p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="glass-input w-full"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="glass-input w-full"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="glass-input w-full"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="glass-input w-full"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Work Experience</h2>
            <button
              onClick={() => addWorkExperience()}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Experience</span>
            </button>
          </div>
          <div className="space-y-4">
            {profile.workExperience.map((exp, index) => (
              <div key={index} className="glass p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">{exp.position || 'New Position'}</h3>
                  <button
                    onClick={() => removeWorkExperience(index)}
                    className="glass-button p-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                      className="glass-input w-full"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                      className="glass-input w-full"
                      placeholder="Job Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateWorkExperience(index, 'duration', e.target.value)}
                      className="glass-input w-full"
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                      className="glass-input w-full h-24"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Education</h2>
            <button
              onClick={() => addEducation()}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Education</span>
            </button>
          </div>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="glass p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">{edu.degree || 'New Degree'}</h3>
                  <button
                    onClick={() => removeEducation(index)}
                    className="glass-button p-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="glass-input w-full"
                      placeholder="University Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="glass-input w-full"
                      placeholder="Bachelor of Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      className="glass-input w-full"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">CGPA</label>
                    <input
                      type="text"
                      value={edu.cgpa}
                      onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                      className="glass-input w-full"
                      placeholder="3.8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Skills</h2>
            <button
              onClick={addSkillCategory}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Skill Category</span>
            </button>
          </div>
          <div className="space-y-6">
            {Array.isArray(profile.skills) && profile.skills.map((category, categoryIndex) => (
              <div key={categoryIndex} className="glass p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category Name</label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateSkillCategoryName(categoryIndex, e.target.value)}
                      className="glass-input w-full"
                      placeholder="Technical Skills, Soft Skills, Tools, etc."
                    />
                  </div>
                  <button
                    onClick={() => removeSkillCategory(categoryIndex)}
                    className="glass-button p-2 ml-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(category.skills) ? category.skills.join(', ') : ''}
                    onChange={(e) => updateSkillsInCategory(categoryIndex, e.target.value)}
                    className="glass-input w-full"
                    placeholder="React, TypeScript, Node.js, Python, AWS, Docker, etc."
                  />
                </div>
              </div>
            ))}
            {(!Array.isArray(profile.skills) || profile.skills.length === 0) && (
              <p className="text-gray-400 text-sm">Add skill categories and skills to showcase your expertise.</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Certifications</h2>
            <button
              onClick={() => addCertification()}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Certification</span>
            </button>
          </div>
          <div className="space-y-4">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="glass p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">{cert.name || 'New Certification'}</h3>
                  <button
                    onClick={() => removeCertification(index)}
                    className="glass-button p-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="glass-input w-full"
                      placeholder="AWS Solutions Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      className="glass-input w-full"
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                    <input
                      type="text"
                      value={cert.year}
                      onChange={(e) => updateCertification(index, 'year', e.target.value)}
                      className="glass-input w-full"
                      placeholder="2023"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Projects</h2>
            <button
              onClick={() => addProject()}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Project</span>
            </button>
          </div>
          <div className="space-y-4">
            {profile.projects.map((project, index) => (
              <div key={index} className="glass p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">{project.name || 'New Project'}</h3>
                  <button
                    onClick={() => removeProject(index)}
                    className="glass-button p-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      className="glass-input w-full"
                      placeholder="Project Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Technologies</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                      className="glass-input w-full"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Link (Optional)</label>
                    <input
                      type="text"
                      value={project.link}
                      onChange={(e) => updateProject(index, 'link', e.target.value)}
                      className="glass-input w-full"
                      placeholder="https://github.com/yourusername/project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="glass-input w-full h-24"
                      placeholder="Describe your project..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hobbies */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Hobbies & Interests</h2>
            <button
              onClick={() => addHobby()}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Hobby</span>
            </button>
          </div>
          <div className="space-y-4">
            {profile.hobbies.map((hobby, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={hobby}
                  onChange={(e) => updateHobby(index, e.target.value)}
                  className="glass-input flex-grow"
                  placeholder="Photography, Hiking, etc."
                />
                <button
                  onClick={() => removeHobby(index)}
                  className="glass-button p-2"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
            {profile.hobbies.length === 0 && (
              <p className="text-gray-400 text-sm">Add your hobbies and interests to make your resume more personable.</p>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Languages</h2>
            <button
              onClick={() => addLanguage()}
              className="glass-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Language</span>
            </button>
          </div>
          <div className="space-y-4">
            {profile.languages.map((language, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={language}
                  onChange={(e) => updateLanguage(index, e.target.value)}
                  className="glass-input flex-grow"
                  placeholder="English (Native), Spanish (Fluent), etc."
                />
                <button
                  onClick={() => removeLanguage(index)}
                  className="glass-button p-2"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
            {profile.languages.length === 0 && (
              <p className="text-gray-400 text-sm">Add languages you speak and your proficiency level.</p>
            )}
          </div>
        </div>

        {/* Add the referral system */}
        <div className="mt-8">
          <ReferralSystem />
        </div>
      </div>
    </div>
  );
}

export default Profile;