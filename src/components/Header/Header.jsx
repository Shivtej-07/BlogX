import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Sun, Moon, User, LayoutDashboard, LogOut, 
  Menu, X, ChevronDown, Feather, Plus 
} from "lucide-react";
import { Container, Logo } from "../index";
import { useTheme } from "../../App";
import authService from "../../appwrite/auth";
import SearchModal from "../SearchModal";
import { toast } from "react-hot-toast";

function Header() {
  const authStatus = useSelector(state => state.auth.status);
  const userData = useSelector(state => state.auth.userData);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll for glass navbar state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setAvatarDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout().then(() => {
      toast.success("Successfully logged out");
      navigate("/");
      window.location.reload();
    });
  };

  const navItems = [
    { name: "Home", slug: "/" },
    { name: "All Posts", slug: "/all-posts" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled 
          ? "bg-[var(--bg-glass)] backdrop-blur-md border-b border-[var(--border)] shadow-md" 
          : "bg-transparent"
      }`}>
        <Container>
          <div className="w-full flex items-center justify-between py-3 md:py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md group-hover:rotate-6 transition-transform">
                B
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Blogx
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.slug}
                  className={`nav-link text-sm font-semibold transition-colors ${
                    location.pathname === item.slug 
                      ? "text-[var(--accent)] font-bold" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
 
            {/* Actions (Search, Theme, Profile/Auth) */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search Trigger */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                title="Search (Cmd+K)"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
 
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-[var(--accent)]" />}
              </button>
 
              {/* Auth Status Actions */}
              {authStatus ? (
                <div className="relative">
                  <button 
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--bg-secondary)] border border-[var(--border)] transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <img 
                        src={userData?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>
 
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {avatarDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setAvatarDropdownOpen(false)}></div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 mt-2 w-48 glass-card border border-[var(--border)] rounded-xl py-1.5 shadow-xl z-20 backdrop-blur-lg"
                        >
                          <Link 
                            to="/dashboard" 
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            onClick={() => setAvatarDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-[var(--accent)]" />
                            Dashboard
                          </Link>
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            onClick={() => setAvatarDropdownOpen(false)}
                          >
                            <User className="w-4 h-4 text-purple-400" />
                            My Profile
                          </Link>
                          <Link 
                            to="/add-post" 
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            onClick={() => setAvatarDropdownOpen(false)}
                          >
                            <Feather className="w-4 h-4 text-cyan-400" />
                            Write Post
                          </Link>
                          <div className="h-px bg-[var(--border)] my-1"></div>
                          <button 
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <button className="btn-secondary px-4 py-1.5 text-xs font-semibold">Sign In</button>
                  </Link>
                  <Link to="/signup">
                    <button className="btn-primary px-4 py-1.5 text-xs font-semibold">Register</button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions & Hamburg Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={toggleTheme}
                className="p-1.5 text-[var(--text-secondary)] hover:text-white"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 bg-[var(--bg-primary)] border-b border-[var(--border)] z-30 flex flex-col p-6 shadow-2xl md:hidden gap-4"
          >
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.slug}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[var(--text-secondary)] hover:text-white py-2"
              >
                {item.name}
              </Link>
            ))}

            {authStatus ? (
              <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)]">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 font-semibold text-[var(--text-secondary)] hover:text-white">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 font-semibold text-[var(--text-secondary)] hover:text-white">
                  <User className="w-4 h-4 text-purple-400" /> Profile
                </Link>
                <Link to="/add-post" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 font-semibold text-[var(--text-secondary)] hover:text-white">
                  <Plus className="w-4 h-4 text-cyan-400" /> Add Post
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 py-2 font-semibold text-red-400 mt-2 text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="btn-secondary w-full text-center py-2 text-xs">Sign In</button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="btn-primary w-full text-center py-2 text-xs">Register</button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Header;