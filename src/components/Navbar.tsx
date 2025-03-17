import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, UserCircle, LogOut, BrainCircuit, Menu, X, Share2 } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { auth } from '../lib/firebase';
import UserCredits from './UserCredits';

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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: 'Referrals', href: '/referrals', current: location.pathname === '/referrals' },
    { name: 'My Plan', href: '/dashboard?tab=myplan', current: location.pathname === '/dashboard?tab=myplan' },
    { name: 'Profile', href: '/profile', current: location.pathname === '/profile' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isLoginPage || isMobileMenuOpen ? 'py-2 bg-black/80 backdrop-blur-md border-b border-white/10' : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                <UserCredits className="px-3 py-1.5 bg-white/10 rounded-lg" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Credits Display */}
            {user && !isLoginPage && (
              <div className="hidden sm:block">
                <UserCredits className="px-4 py-2 bg-white/10 rounded-lg" />
              </div>
            )}

            {/* Mobile menu button */}
            {!isLoginPage && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden text-white hover:text-neon-blue transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
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
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname === '/dashboard' ? 'text-neon-blue' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/referrals"
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname === '/referrals' ? 'text-neon-blue' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Referrals
                    </Link>
                    <Link
                      to="/dashboard?tab=myplan"
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname === '/dashboard?tab=myplan' ? 'text-neon-blue' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      My Plan
                    </Link>
                    <Link
                      to="/profile"
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname === '/profile' ? 'text-neon-blue' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Profile
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
          </div>
        </div>

        {/* Mobile Navigation - Overlay Style */}
        {isMobileMenuOpen && !isLoginPage && (
          <div className="sm:hidden fixed inset-0 top-[60px] bg-black/95 backdrop-blur-xl">
            <div className="flex flex-col p-4 h-[calc(100vh-60px)] overflow-y-auto bg-gradient-to-b from-zinc-900/90 to-black/90 border-t border-white/10">
              {/* Navigation Links */}
              <div className="flex flex-col gap-4">
                {isHomePage && (
                  <>
                    <button 
                      onClick={() => scrollToSection('how-it-works')} 
                      className="glass-button p-3 text-left w-full hover:bg-white/10 transition-colors"
                    >
                      How It Works
                    </button>
                    <button 
                      onClick={() => scrollToSection('testimonials')} 
                      className="glass-button p-3 text-left w-full hover:bg-white/10 transition-colors"
                    >
                      Testimonials
                    </button>
                    <button 
                      onClick={() => scrollToSection('pricing')} 
                      className="glass-button p-3 text-left w-full hover:bg-white/10 transition-colors"
                    >
                      Pricing
                    </button>
                  </>
                )}
                
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`glass-button p-3 w-full flex items-center gap-2 ${
                        location.pathname === '/dashboard' ? 'bg-white/10' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FileText className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/referrals" 
                      className={`glass-button p-3 w-full flex items-center gap-2 ${
                        location.pathname === '/referrals' ? 'bg-white/10' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Share2 className="w-5 h-5" />
                      Referrals
                    </Link>
                    <Link 
                      to="/dashboard?tab=myplan"
                      className={`glass-button p-3 w-full flex items-center gap-2 ${
                        location.pathname === '/dashboard?tab=myplan' ? 'bg-white/10' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Plan
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`glass-button p-3 w-full flex items-center gap-2 ${
                        location.pathname === '/profile' ? 'bg-white/10' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircle className="w-5 h-5" />
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="glass-button p-3 w-full flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="glass-button p-3 w-full text-center hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}