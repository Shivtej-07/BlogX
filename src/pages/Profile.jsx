import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  User, Mail, FileText, Bookmark, Calendar, Heart, 
  Edit3, Save, X, Eye 
} from 'lucide-react';
import { Github, Linkedin, Twitter } from '../components/BrandIcons';
import appwriteService from '../appwrite/config';
import authService from '../appwrite/auth';
import { login as authLogin } from '../store/authSlice';
import { toast } from 'react-hot-toast';
import PostCard from '../components/PostCard';

export default function Profile() {
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editTwitter, setEditTwitter] = useState('');

  useEffect(() => {
    if (userData) {
      setEditName(userData.name || '');
      setEditBio(userData.bio || 'Lead SaaS Developer & Tech Blogger. Writing about React, Framer Motion, and building premium interfaces.');
      setEditGithub(userData.socials?.github || 'https://github.com');
      setEditLinkedin(userData.socials?.linkedin || 'https://linkedin.com');
      setEditTwitter(userData.socials?.twitter || 'https://twitter.com');
    }
  }, [userData]);

  useEffect(() => {
    if (!userData) return;
    
    // Get posts
    appwriteService.getPosts([]).then((res) => {
      if (res && res.documents) {
        // user's posts
        const myPosts = res.documents.filter(post => post.userId === userData.$id || post.userId === 'mock-user-123');
        setPosts(myPosts);

        // find bookmarks
        const bookmarks = res.documents.filter(post => {
          return localStorage.getItem(`blogx_bookmarked_${post.$id}`) === "true";
        });
        setBookmarkedPosts(bookmarks);
      }
      setLoading(false);
    });
  }, [userData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await authService.updateProfile({
        name: editName,
        bio: editBio,
        socials: {
          github: editGithub,
          linkedin: editLinkedin,
          twitter: editTwitter
        }
      });
      if (updatedUser) {
        dispatch(authLogin({ userData: updatedUser }));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      toast.error("Profile update failed.");
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);

  if (!userData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {loading ? (
        <div className="space-y-6">
          <div className="h-64 skeleton"></div>
          <div className="h-32 skeleton mt-6"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Cover & Avatar Header */}
          <div className="glass-card overflow-hidden border border-[var(--border)] rounded-3xl relative">
            {/* Cover Banner */}
            <div className="h-44 w-full relative">
              <img 
                src={userData.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"} 
                alt="Profile Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
            </div>

            {/* Profile Meta Section */}
            <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
              {/* Profile Avatar overlay */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:-mt-12 z-10 text-center md:text-left">
                <div className="w-24 h-24 rounded-2xl border-4 border-[#0f172a] shadow-xl overflow-hidden bg-slate-800 shrink-0">
                  <img 
                    src={userData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center justify-center md:justify-start gap-2">
                    {userData.name}
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-semibold mt-1 flex items-center justify-center md:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {userData.email}
                  </p>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="flex justify-center md:justify-end">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center gap-2 px-5 py-2.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2.5 rounded-full hover:bg-white/5 border border-[var(--border)] text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Bio Form Card */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4">Edit Profile Metadata</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Display Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field" 
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Github URL</label>
                    <input 
                      type="url" 
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label className="input-label">LinkedIn URL</label>
                    <input 
                      type="url" 
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label className="input-label">Twitter/X URL</label>
                    <input 
                      type="url" 
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      className="input-field" 
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Professional Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="input-field h-24 resize-none" 
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* User Biography & Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left bio card */}
            <div className="glass-card p-6 flex flex-col justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold mb-3">About Me</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {userData.bio || 'Lead SaaS Developer & Tech Blogger. Writing about React, Framer Motion, and building premium interfaces.'}
                </p>
              </div>

              {/* Social icons */}
              <div className="border-t border-[var(--border)] pt-4">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Social Connect</h4>
                <div className="flex gap-3">
                  <a 
                    href={userData.socials?.github || "https://github.com"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-white/3 border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a 
                    href={userData.socials?.linkedin || "https://linkedin.com"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-white/3 border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href={userData.socials?.twitter || "https://twitter.com"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-white/3 border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right statistics cards & activity */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Statistics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Published', val: posts.length, icon: FileText, color: 'text-indigo-400' },
                  { label: 'Views', val: totalViews, icon: Eye, color: 'text-cyan-400' },
                  { label: 'Likes Gained', val: totalLikes, icon: Heart, color: 'text-rose-400' }
                ].map((stat, i) => (
                  <div key={i} className="stat-card text-center p-5">
                    <div className={`mx-auto w-8 h-8 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center ${stat.color} mb-2.5`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xxs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{stat.val}</h3>
                  </div>
                ))}
              </div>

              {/* Tabs for Articles & Bookmarks */}
              <div className="glass-card p-6">
                <div className="flex border-b border-[var(--border)] pb-4 mb-6">
                  <button 
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'posts' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Posts ({posts.length})</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'bookmarks' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmarks ({bookmarkedPosts.length})</span>
                  </button>
                </div>

                {/* Tab: My Posts Grid */}
                {activeTab === 'posts' && (
                  posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">No posts published yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {posts.map((post) => (
                        <div key={post.$id} className="p-1 hover:scale-102 transition-transform duration-200">
                          <PostCard {...post} />
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Tab: Bookmarks Grid */}
                {activeTab === 'bookmarks' && (
                  bookmarkedPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">No posts bookmarked yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bookmarkedPosts.map((post) => (
                        <div key={post.$id} className="p-1 hover:scale-102 transition-transform duration-200">
                          <PostCard {...post} />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
