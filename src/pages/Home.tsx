import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Mail, 
  UserCircle, 
  Lock, 
  Download, 
  Share2, 
  Sparkles, 
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  Star,
  Plus,
  Minus,
  ClipboardEdit,
  FileSearch,
  FileDown,
  ArrowRight,
  Rocket
} from 'lucide-react';
import { Pricing } from '../components/ui/pricing';
import { TestimonialsSection } from '../components/ui/testimonials-with-marquee';

function Home() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const steps = [
    {
      icon: <ClipboardEdit className="w-8 h-8" />,
      title: "Set Up Your Profile",
      description: "Create your profile once with your professional details, experience, and skills. Our AI remembers everything for future use.",
      color: "from-purple-500/20 to-blue-500/20"
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Add Job Description",
      description: "Paste the job description you're interested in. Our AI analyzes requirements and matches them with your profile.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Generate ATS-Friendly Resume",
      description: "Click generate and watch as AI creates a perfectly tailored, ATS-optimized resume that highlights your relevant skills.",
      color: "from-cyan-500/20 to-teal-500/20"
    },
    {
      icon: <FileDown className="w-8 h-8" />,
      title: "Download & Share",
      description: "Download your resume in PDF format or get a unique shareable link to send to recruiters.",
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
      period: "month",
      features: [
        "1 Resume Generation per month",
        "1 Cover Letter per month",
        "Basic ATS Optimization",
        "PDF Downloads",
        "Email Support"
      ],
      description: "Perfect for occasional job seekers",
      buttonText: "Get Started",
      href: "/login",
      isPopular: false
    },
    {
      name: "PRO",
      price: "19",
      yearlyPrice: "15",
      period: "month",
      features: [
        "Unlimited Resume Generations",
        "Unlimited Cover Letters",
        "Advanced ATS Optimization",
        "Multiple Resume Versions",
        "Priority Support",
        "Resume Analytics",
        "Custom Templates"
      ],
      description: "Best for active job seekers",
      buttonText: "Go Pro",
      href: "/login",
      isPopular: true
    },
    {
      name: "TEAM",
      price: "49",
      yearlyPrice: "39",
      period: "month",
      features: [
        "Everything in Pro",
        "Team Management",
        "Collaboration Tools",
        "API Access",
        "Custom Branding",
        "24/7 Priority Support",
        "Training Sessions",
        "Dedicated Account Manager"
      ],
      description: "Perfect for career coaches and teams",
      buttonText: "Contact Sales",
      href: "/contact",
      isPopular: false
    }
  ];

  const faqs = [
    {
      question: "How does the AI resume generator work?",
      answer: "Our AI analyzes your profile and the job description to create a tailored, ATS-friendly resume. It highlights relevant skills and experiences, ensuring your resume matches the job requirements perfectly."
    },
    {
      question: "Are the resumes ATS (Applicant Tracking System) friendly?",
      answer: "Yes! All generated resumes are optimized for ATS systems, using industry-standard formatting and keywords from the job description to ensure your resume gets past automated screening."
    },
    {
      question: "Can I edit the generated content?",
      answer: "Absolutely! While our AI creates great initial content, you have full control to edit, customize, and perfect your resume and cover letter to match your preferences."
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade security with Firebase Authentication and secure cloud storage. Your data is encrypted and only accessible to you."
    },
    {
      question: "How does resume sharing work?",
      answer: "Each resume gets a unique, secure link that you can share with recruiters. The shared version displays your resume professionally in both web and PDF formats."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-1rem)] w-full h-px bg-gradient-to-r from-neon-blue to-transparent z-10" />
                )}
                <div className={`glass p-6 rounded-lg border border-white/10 h-full
                  bg-gradient-to-br ${step.color} backdrop-blur-sm
                  hover:border-neon-blue/50 transition-all duration-300
                  group hover:-translate-y-1`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-4
                      border border-white/10 group-hover:border-neon-blue/50 transition-colors
                      text-neon-blue">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Live Demo Preview */}
      <div className="py-20 px-4 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            See How It <span className="text-neon-blue">Works</span>
          </h2>
          <div className="glass p-8 rounded-lg border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1607968565043-36af90dde238?auto=format&fit=crop&q=80&w=1200" 
              alt="Resume Builder Demo"
              className="rounded-lg shadow-2xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials">
        <TestimonialsSection
          title="Trusted by job seekers worldwide"
          description="Join thousands of successful applicants who landed their dream jobs using our AI Resume Builder"
          testimonials={[
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
          ]}
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
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Resume Builder</h3>
              <p className="text-gray-400">Create professional resumes and cover letters with AI technology.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-neon-blue">Dashboard</Link></li>
                <li><Link to="/profile" className="hover:text-neon-blue">Profile</Link></li>
                <li><a href="#features" className="hover:text-neon-blue">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-blue">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-neon-blue">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-blue">Contact Us</a></li>
                <li><a href="#" className="hover:text-neon-blue">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} AI Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;