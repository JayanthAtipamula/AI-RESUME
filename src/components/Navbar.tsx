import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, UserCircle, LogOut, BrainCircuit, Menu, X } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { auth } from '../lib/firebase';
import { UserCredits } from './UserCredits';

export default function Navbar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isLoginPage || isMobileMenuOpen ? 'py-2 bg-black/80 backdrop-blur-md border-b border-white/10' : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neon-blue to-[#0099ff] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="text-white font-bold text-lg">AI Resume Builder</span>
                {isLoginPage && <div className="text-xs text-gray-400">Powered by Advanced AI</div>}
              </div>
            </div>
          </Link>

          {/* Mobile Credits Display */}
          {user && !isLoginPage && (
            <div className="sm:hidden">
              <UserCredits />
            </div>
          )}

          {/* Mobile menu button */}
          {!isLoginPage && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden glass-button p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4">
            {isHomePage && (
              <div className="flex items-center gap-6 mr-4">
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-white hover:text-neon-blue transition-colors"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')} 
                  className="text-white hover:text-neon-blue transition-colors"
                >
                  Testimonials
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')} 
                  className="text-white hover:text-neon-blue transition-colors"
                >
                  Pricing
                </button>
              </div>
            )}
            
            {!isLoginPage && (
              user ? (
                <>
                  <UserCredits className="px-4 py-2 bg-white/10 rounded-lg" />
                  <Link
                    to="/dashboard"
                    className="glass-button px-4 py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="glass-button px-4 py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="glass-button px-4 py-2 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                !isLoginPage && (
                  <Link
                    to="/login"
                    className="glass-button px-6 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )
              )
            )}
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && !isLoginPage && (
            <div className="sm:hidden">
              <div className="pt-4 pb-3 border-t border-white/10">
                {isHomePage && (
                  <div className="flex flex-col gap-4 mb-4">
                    <button 
                      onClick={() => scrollToSection('how-it-works')} 
                      className="text-white hover:text-neon-blue transition-colors"
                    >
                      How It Works
                    </button>
                    <button 
                      onClick={() => scrollToSection('testimonials')} 
                      className="text-white hover:text-neon-blue transition-colors"
                    >
                      Testimonials
                    </button>
                    <button 
                      onClick={() => scrollToSection('pricing')} 
                      className="text-white hover:text-neon-blue transition-colors"
                    >
                      Pricing
                    </button>
                  </div>
                )}
                
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/dashboard" 
                      className={`glass-button py-2 text-center ${
                        location.pathname === '/dashboard' ? 'bg-neon-blue/20' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`glass-button py-2 text-center ${
                        location.pathname === '/profile' ? 'bg-neon-blue/20' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="glass-button py-2 w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="signin-button w-full text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}