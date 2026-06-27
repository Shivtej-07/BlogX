import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, CornerDownLeft, Clock, Tag } from 'lucide-react';
import appwriteService from '../appwrite/config';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem('blogx_recent_searches') || '[]');
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const popularTags = ['Design', 'SaaS', 'React', 'Development', 'Framer Motion'];

  // Keyboard shortcut Esc to close, and auto-focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Live filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      appwriteService.getPosts([]).then((res) => {
        if (res && res.documents) {
          const filtered = res.documents.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            (post.content && post.content.toLowerCase().includes(query.toLowerCase())) ||
            (post.category && post.category.toLowerCase().includes(query.toLowerCase()))
          );
          setResults(filtered.slice(0, 5));
        }
      });
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelectPost = (postId) => {
    // Save to recents
    const updated = [query.trim() || 'Quick Search', ...recentSearches.filter(s => s !== query.trim())].slice(0, 4);
    setRecentSearches(updated);
    localStorage.setItem('blogx_recent_searches', JSON.stringify(updated));

    onClose();
    navigate(`/post/${postId}`);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('blogx_recent_searches');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-2xl bg-[var(--bg-glass)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-10"
          >
            {/* Input Bar */}
            <div className="relative flex items-center border-b border-[var(--border)] p-4 bg-[var(--bg-secondary)]/50">
              <Search className="w-5 h-5 text-[var(--accent)] mr-3 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, categories, or keywords..."
                className="w-full bg-transparent text-[var(--text-primary)] border-none outline-none placeholder-[var(--text-muted)] text-base font-medium"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[380px] overflow-y-auto">
              {results.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">Search Results</h4>
                  {results.map((post) => (
                    <div
                      key={post.$id}
                      onClick={() => handleSelectPost(post.$id)}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-[var(--accent)]/10 border border-transparent hover:border-[var(--accent)]/20 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {post.title}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] mt-0.5">
                          In {post.category || 'General'} &bull; {post.readingTime || '2 min read'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--accent)] transition-all" />
                    </div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="text-center py-8">
                  <p className="text-[var(--text-secondary)] font-medium">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Try another search term or browse popular categories.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Popular Tags */}
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center">
                      <Tag className="w-3.5 h-3.5 mr-1.5 text-[var(--accent)]" />
                      Popular Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className="px-3 py-1.5 bg-[var(--bg-glass-hover)] border border-[var(--border)] hover:border-[var(--accent)]/30 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] rounded-full transition-all duration-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Recent Searches */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-[var(--accent)]" />
                        Recent Searches
                      </h4>
                      {recentSearches.length > 0 && (
                        <button onClick={handleClearRecent} className="text-xxs text-red-400 hover:underline">
                          Clear
                        </button>
                      )}
                    </div>
                    {recentSearches.length > 0 ? (
                      <div className="space-y-1.5">
                        {recentSearches.map((term, i) => (
                          <div
                            key={i}
                            onClick={() => setQuery(term)}
                            className="flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer py-1.5 px-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2" />
                            {term}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic">No recent searches.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-black/20 text-xxs text-[var(--text-muted)]">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-sans border border-white/5 text-[var(--text-secondary)]">ESC</kbd> to close</span>
              <span className="flex items-center">
                Select with <CornerDownLeft className="w-3 h-3 mx-1" /> Enter
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
