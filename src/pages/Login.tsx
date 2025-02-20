import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase';
import { 
  Sparkles, 
  FileText, 
  FileEdit, 
  Bot, 
  CheckCircle2, 
  Rocket,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const setUserData = useAuthStore(state => state.setUserData);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleGoogleSignIn = async () => {
    try {
      const { user, userData, isNewUser } = await signInWithGoogle();
      
      // Update user data in store
      if (userData) {
        setUserData(userData);
      }

      // If new user, show welcome toast
      if (isNewUser) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-semibold">Welcome to Resume Builder!</span>
            <span className="text-sm">You've received 30 free credits</span>
          </div>,
          {
            duration: 5000,
            position: 'top-center'
          }
        );
      }

      navigate(from);
    } catch (error: any) {
      console.error('Auth error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      text: "AI-Powered Resume Builder",
      subtext: "100% ATS Friendly",
      gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      text: "Smart Job Description Matching",
      subtext: "Perfect Resume Match",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <FileEdit className="w-6 h-6" />,
      text: "AI Cover Letter Generator",
      subtext: "Tailored to Your Profile",
      gradient: "from-pink-500/20 to-blue-500/20"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      {/* Background SVG Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#0099ff]/10 rounded-full blur-3xl" />
      </div>

      {/* Add top margin to account for navbar */}
      <div className="glass w-full max-w-5xl grid md:grid-cols-2 gap-8 p-8 relative mt-20">
        {/* Left Section - Features */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-neon-blue to-[#0099ff] flex items-center justify-center">
              <BrainCircuit className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Resume Builder</h1>
              <p className="text-gray-400">Powered by Advanced AI</p>
            </div>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-gradient-to-r border border-white/5 hover:border-neon-blue/30 transition-all duration-300"
                style={{ backgroundImage: `linear-gradient(to right, rgba(0,255,255,0.05), rgba(0,153,255,0.05))` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">{feature.text}</div>
                    <div className="text-neon-blue text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {feature.subtext}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Zap className="w-4 h-4 text-neon-blue" />
            <span>Trusted by thousands of job seekers worldwide</span>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex flex-col justify-center space-y-8 md:border-l border-white/10 md:pl-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-neon-blue" />
              Welcome Back
              <Sparkles className="w-6 h-6 text-neon-blue" />
            </h2>
            <p className="text-gray-400">
              Sign in to access your AI-powered resume builder
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-md">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="signin-button group w-full flex items-center justify-center space-x-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
            <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}