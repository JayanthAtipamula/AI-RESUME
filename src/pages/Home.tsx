import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Mail, 
  UserCircle, 
  Lock, 
  Download, 
  Share2, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Star,
  Plus,
  Minus,
  Briefcase,
  GraduationCap,
  Send,
  Clock,
  Target,
  Zap,
  X,
  Check,
  TrendingUp,
  Users,
  Award,
  Timer,
  ArrowRight as RightArrow
} from 'lucide-react';
import { Pricing } from '../components/ui/pricing';
import { TestimonialsSection } from '../components/ui/testimonials-with-marquee';
import { storeReferralCode } from '../lib/utils';

function Home() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const [metricsVisible, setMetricsVisible] = useState(false);

  // Check for referral code when home page loads
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      storeReferralCode(referralCode);
    }
  }, [searchParams]);

  // Intersection Observer for metrics animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMetricsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const metricsSection = document.getElementById('metrics-section');
    if (metricsSection) {
      observer.observe(metricsSection);
    }

    return () => {
      if (metricsSection) {
        observer.unobserve(metricsSection);
      }
    };
  }, []);

  const steps = [
    {
      icon: (
        <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl p-3">
          <GraduationCap className="w-10 h-10 text-purple-400" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
        </div>
      ),
      title: "Set Up Your Profile",
      description: "Create your professional profile with key skills and experience. Our AI remembers it all.",
      color: "from-purple-500/20 to-blue-500/20"
    },
    {
      icon: (
        <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl p-3">
          <Briefcase className="w-10 h-10 text-blue-400" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
        </div>
      ),
      title: "Add Job Description",
      description: "Paste the job details and let our AI analyze the key requirements for you.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: (
        <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-teal-500/30 rounded-2xl p-3">
          <div className="relative">
            <FileText className="w-10 h-10 text-cyan-400" />
            <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
        </div>
      ),
      title: "Generate ATS-Friendly Resume",
      description: "Get an optimized resume that perfectly matches the job requirements instantly.",
      color: "from-cyan-500/20 to-teal-500/20"
    },
    {
      icon: (
        <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-teal-500/30 to-green-500/30 rounded-2xl p-3">
          <div className="relative">
            <Send className="w-10 h-10 text-teal-400" />
            <CheckCircle2 className="w-5 h-5 text-green-400 absolute -top-1 -right-1" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-sm font-bold">4</div>
        </div>
      ),
      title: "Apply with Confidence",
      description: "Download your polished resume or share it directly with recruiters online.",
      color: "from-teal-500/20 to-green-500/20"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-neon-blue" />,
      title: "AI-Powered Resume Generation",
      description: "Create ATS-friendly resumes instantly using advanced AI technology. Tailored to match job descriptions perfectly."
    },
    {
      icon: <Mail className="w-6 h-6 text-neon-blue" />,
      title: "AI Cover Letter Writer",
      description: "Generate customized cover letters that highlight your relevant skills and experience for each job application."
    },
    {
      icon: <UserCircle className="w-6 h-6 text-neon-blue" />,
      title: "Smart Profile Management",
      description: "Set up your profile once and let our AI customize your applications for each job opportunity."
    },
    {
      icon: <Lock className="w-6 h-6 text-neon-blue" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security. Only you control who sees your information."
    },
    {
      icon: <Download className="w-6 h-6 text-neon-blue" />,
      title: "Multiple Export Options",
      description: "Download your resumes and cover letters in PDF or text format, ready to submit to employers."
    },
    {
      icon: <Share2 className="w-6 h-6 text-neon-blue" />,
      title: "Easy Sharing",
      description: "Share your resume with a unique link that displays your resume professionally to recruiters."
    }
  ];

  const pricingPlans = [
    {
      name: "FREE",
      price: "0",
      yearlyPrice: "0",
      period: "forever",
      features: [
        "40 Credits included",
        "Up to 4 Resumes",
        "Up to 4 Cover Letters",
        "Basic ATS optimization",
        "PDF downloads",
        "Email support",
        "Basic templates",
        "10 credits per generation"
      ],
      description: "Perfect for trying out our AI resume builder",
      buttonText: "Get Started",
      href: "/login",
      isPopular: false
    },
    {
      name: "PRO",
      price: "10",
      yearlyPrice: "8",
      period: "per month",
      features: [
        "1000 Credits per month",
        "Up to 100 Resumes",
        "Up to 100 Cover Letters",
        "Advanced ATS optimization",
        "Priority support",
        "Premium templates",
        "Resume sharing",
        "Multiple formats",
        "10 credits per generation"
      ],
      description: "Best for active job seekers",
      buttonText: "Upgrade Now",
      href: "/login",
      isPopular: true
    },
    {
      name: "ENTERPRISE",
      price: "Contact Us",
      yearlyPrice: "Contact Us",
      period: "custom",
      features: [
        "Unlimited Credits",
        "Unlimited Resumes",
        "Unlimited Cover Letters",
        "Custom branding",
        "API access",
        "Dedicated support",
        "Custom templates",
        "Training sessions",
        "Priority features"
      ],
      description: "Perfect for recruiting firms and enterprises",
      buttonText: "Contact Sales",
      href: "mailto:sales@yourcompany.com",
      isPopular: false
    }
  ];

  const faqs = [
    {
      question: "How does the AI analyze job descriptions?",
      answer: "Our AI uses advanced natural language processing to analyze job descriptions, identifying key requirements, skills, and qualifications. It then matches these with your profile to create a perfectly tailored resume that highlights your most relevant experiences and skills for that specific role."
    },
    {
      question: "How does the credit system work?",
      answer: "New users get 30 free credits upon signup. Each resume or cover letter generation costs 10 credits. You can earn 20 bonus credits by referring friends. Pro subscribers receive 1000 credits monthly, while Enterprise users get unlimited credits. Unused credits from the free tier don't expire."
    },
    {
      question: "What makes the resumes ATS-friendly?",
      answer: "Our AI optimizes resumes for Applicant Tracking Systems (ATS) by: 1) Using industry-standard formatting and layouts, 2) Incorporating relevant keywords from the job description, 3) Maintaining proper heading hierarchy, and 4) Ensuring clean, parseable text that ATS systems can easily read. This significantly improves your chances of getting past automated screenings."
    },
    {
      question: "Can I edit the generated content?",
      answer: "Yes! While our AI creates highly optimized content, you have full control to edit any part of your resume or cover letter. You can modify the content, rearrange sections, and fine-tune the wording to match your preferences while maintaining ATS optimization."
    },
    {
      question: "How secure is my data?",
      answer: "We prioritize your data security with: 1) Enterprise-grade encryption for all stored data, 2) Secure Firebase Authentication for user accounts, 3) Regular security audits and updates, and 4) Strict data access controls. Your information is only accessible to you and is never shared without your explicit permission."
    }
  ];

  const testimonials = [
    {
      author: {
        name: "Emma Thompson",
        handle: "@emmaai",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
      },
      text: "Using this AI platform has transformed how I approach job applications. The tailored resumes have significantly improved my interview success rate.",
      href: "https://twitter.com/emmaai"
    },
    {
      author: {
        name: "David Park",
        handle: "@davidtech",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      text: "The ATS optimization is incredible. I've received more callbacks since using this tool, and the cover letter generator saves me hours of work.",
      href: "https://twitter.com/davidtech"
    },
    {
      author: {
        name: "Sofia Rodriguez",
        handle: "@sofiaml",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
      },
      text: "Finally, a resume builder that actually understands my experience and presents it in the best light. The AI suggestions are spot-on!"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/20 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            <Star className="w-5 h-5 fill-neon-blue text-neon-blue" />
            <Star className="w-5 h-5 fill-neon-blue text-neon-blue" />
            <Star className="w-5 h-5 fill-neon-blue text-neon-blue" />
            <Star className="w-5 h-5 fill-neon-blue text-neon-blue" />
            <div className="relative">
              <Star className="w-5 h-5 fill-neon-blue text-neon-blue" />
              <div className="absolute inset-0 bg-black/50 right-[20%]" />
            </div>
            <span className="ml-2 text-lg font-medium">4.6</span>
            <span className="ml-1 text-gray-400">rated by 10,000+ students</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Create Your Perfect Resume & Cover Letter with{' '}
            <span className="text-neon-blue">AI</span> in Seconds! 🚀
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Let our AI technology craft your professional story, perfectly matched to each job description.
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Smart AI that analyzes job requirements and tailors your resume for maximum impact
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dashboard" className="launch-button group">
              <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor" />
              </svg>
              <span>Get Started</span>
            </Link>
            
            <Link to="/dashboard" className="launch-button group">
              <Sparkles className="w-6 h-6" />
              <span>Get AI Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It <span className="text-neon-blue">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group h-full">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[45%] left-[calc(100%-1rem)] w-full h-[2px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/50 to-transparent group-hover:from-neon-blue/80 transition-all duration-300" />
                    <div className="absolute -right-2 -top-1 w-4 h-4">
                      <div className="w-full h-full border-t-2 border-r-2 border-neon-blue/50 group-hover:border-neon-blue/80 transition-all duration-300 rotate-45" />
                    </div>
                  </div>
                )}
                <div className={`relative overflow-hidden p-6 rounded-xl border border-white/10
                  bg-gradient-to-br ${step.color} backdrop-blur-xl h-full
                  hover:border-neon-blue/50 transition-all duration-500 group-hover:scale-[1.02]
                  shadow-[0_0_15px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_25px_rgba(0,255,255,0.1)]
                  flex flex-col`}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white/90 group-hover:text-white transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed flex-grow">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why AI Resume Builder Section */}
      <div className="py-20 px-4 relative bg-gradient-to-b from-zinc-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why <span className="text-neon-blue">AI Resume Builder</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Traditional Method */}
            <div className="relative p-8 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
              <div className="absolute -top-5 left-8 bg-black px-4 py-2 rounded-full border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Traditional Method</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Time Consuming</h3>
                    <p className="text-gray-400">Hours spent manually editing resumes for each job application</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">One Resume Fits All</h3>
                    <p className="text-gray-400">Using the same resume for different jobs reduces your chances</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Missing Key Requirements</h3>
                    <p className="text-gray-400">Often misses job-specific keywords and requirements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Method */}
            <div className="relative p-8 rounded-xl border border-neon-blue/20 bg-gradient-to-br from-neon-blue/5 to-transparent">
              <div className="absolute -top-5 left-8 bg-black px-4 py-2 rounded-full border border-neon-blue/20">
                <div className="flex items-center gap-2 text-neon-blue">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">AI Resume Builder</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Instant Generation</h3>
                    <p className="text-gray-400">Create tailored resumes in seconds, not hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Perfect Job Match</h3>
                    <p className="text-gray-400">AI analyzes and matches your profile to job requirements</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">ATS Optimization</h3>
                    <p className="text-gray-400">Automatically optimized for ATS with relevant keywords</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-neon-blue/10">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-neon-blue/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-neon-blue/30 to-transparent rounded-full"></div>
                    <FileText className="w-8 h-8 text-neon-blue relative" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-neon-blue" />
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-neon-blue/20 rounded-full"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-neon-blue/30 to-transparent rounded-full"></div>
                    <Briefcase className="w-8 h-8 text-neon-blue relative" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-neon-blue" />
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-neon-blue/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-neon-blue/30 to-transparent rounded-full"></div>
                    <Check className="w-8 h-8 text-neon-blue relative" />
                  </div>
                </div>
                <p className="text-center text-gray-400 mt-4">One click to create the perfect resume for any job</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Metrics Section */}
      <div id="metrics-section" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Users' <span className="text-neon-blue">Success</span> Story
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Interview Rate */}
            <div className={`transform transition-all duration-1000 ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative p-6 rounded-xl border border-neon-blue/20 bg-gradient-to-br from-neon-blue/5 to-transparent group hover:border-neon-blue/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 mb-4 relative">
                    <div className="absolute inset-0 bg-neon-blue/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-neon-blue/30 to-transparent flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-neon-blue" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neon-blue">85</span>
                    <span className="text-xl text-neon-blue">%</span>
                  </div>
                  <p className="mt-2 text-lg font-medium text-white">Interview Rate</p>
                  <p className="text-gray-400 text-sm mt-1">Higher callback rate compared to traditional resumes</p>
                </div>
              </div>
            </div>

            {/* Time Saved */}
            <div className={`transform transition-all duration-1000 delay-200 ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative p-6 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent group hover:border-green-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 mb-4 relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-500/30 to-transparent flex items-center justify-center">
                      <Timer className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-green-400">95</span>
                    <span className="text-xl text-green-400">%</span>
                  </div>
                  <p className="mt-2 text-lg font-medium text-white">Time Saved</p>
                  <p className="text-gray-400 text-sm mt-1">Less time spent on resume creation and editing</p>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className={`transform transition-all duration-1000 delay-300 ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative p-6 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent group hover:border-purple-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 mb-4 relative">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-500/30 to-transparent flex items-center justify-center">
                      <Award className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-purple-400">3</span>
                    <span className="text-xl text-purple-400">x</span>
                  </div>
                  <p className="mt-2 text-lg font-medium text-white">Success Rate</p>
                  <p className="text-gray-400 text-sm mt-1">Higher job offer success rate with AI optimization</p>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className={`transform transition-all duration-1000 delay-400 ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative p-6 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent group hover:border-cyan-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 mb-4 relative">
                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-500/30 to-transparent flex items-center justify-center">
                      <Users className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-cyan-400">10</span>
                    <span className="text-xl text-cyan-400">K+</span>
                  </div>
                  <p className="mt-2 text-lg font-medium text-white">Active Users</p>
                  <p className="text-gray-400 text-sm mt-1">Trusted by thousands of job seekers worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Features for Your <span className="text-neon-blue">Success</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass p-6 rounded-lg border border-white/10 hover:border-neon-blue/50 transition-colors duration-200"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials">
        <TestimonialsSection
          title="Trusted by job seekers worldwide"
          description="Join thousands of successful applicants who landed their dream jobs using our AI Resume Builder"
          testimonials={testimonials}
        />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <Pricing 
          plans={pricingPlans}
          title="Choose Your Perfect Plan"
          description="Get started for free or upgrade for unlimited access to all features.
All plans include our core AI-powered resume and cover letter generation."
        />
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked <span className="text-neon-blue">Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="glass border border-white/10"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 text-neon-blue" />
                  ) : (
                    <Plus className="w-5 h-5 text-neon-blue" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-0 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-black to-zinc-900 py-12 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">AI Resume Builder</h3>
            <p className="text-gray-400 mb-4">Create ATS-optimized resumes with the power of AI</p>
            <div className="flex items-center text-gray-400 hover:text-neon-blue transition-colors group">
              <Mail className="w-4 h-4 mr-2 group-hover:text-neon-blue transition-colors" />
              <span className="select-all">support@airesumebuilder.com</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-neon-blue transition-colors duration-200 flex items-center">
                  <RightArrow className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-neon-blue transition-colors duration-200 flex items-center">
                  <RightArrow className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-neon-blue transition-colors duration-200 flex items-center">
                  <RightArrow className="w-4 h-4 mr-2" />
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-neon-blue transition-colors duration-200 flex items-center">
                  <RightArrow className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-neon-blue transition-colors duration-200 flex items-center">
                  <RightArrow className="w-4 h-4 mr-2" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/10 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent" />
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} AI Resume Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;