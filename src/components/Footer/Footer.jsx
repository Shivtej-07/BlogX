import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Sparkles } from 'lucide-react'
import { Github, Linkedin, Twitter } from '../BrandIcons'
import Logo from '../Logo'
import { toast } from 'react-hot-toast'

function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed successfully! Welcome to the newsletter.", {
      icon: '🎉',
      style: {
        background: '#10b981',
        color: '#ffffff',
      }
    });
    setEmail('');
  };

  return (
    <footer className="relative bg-[var(--bg-secondary)] border-t border-[var(--border)] py-12 md:py-16 overflow-hidden">
      {/* Decorative Blur Blob */}
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Pitch */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                B
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Blogx
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
              A premium blogging platform built with React and Appwrite. Write articles, share insights, and inspire code developers worldwide.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/3 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500/30 transition-all">
                <Github className="w-4.5 h-4.5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/3 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500/30 transition-all">
                <Linkedin className="w-4.5 h-4.5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/3 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500/30 transition-all">
                <Twitter className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Platform</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)] font-medium">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/all-posts" className="hover:text-indigo-400 transition-colors">All Articles</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-400 transition-colors">User Profile</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)] font-medium">
              <li><a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">React Docs</a></li>
              <li><a href="https://appwrite.io" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Appwrite Cloud</a></li>
              <li><a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Tailwind CSS</a></li>
              <li><a href="https://framer.com/motion" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Framer Motion</a></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Newsletter</span>
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Get the latest technical articles sent directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="input-field pr-12 text-xs"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white p-3 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Lower row */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)] font-semibold">
          <span>&copy; {new Date().getFullYear()} Blogx platform. All Rights Reserved.</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-[var(--text-secondary)] transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-[var(--text-secondary)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer