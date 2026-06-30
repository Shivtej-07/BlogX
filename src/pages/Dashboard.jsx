import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, BarChart3, Settings, LogOut,
  Plus, Eye, ThumbsUp, MessageSquare, Edit2, Trash2, Globe, Sparkles
} from 'lucide-react';
import appwriteService from '../appwrite/config';
import authService from '../appwrite/auth';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch posts
    appwriteService.getPosts([]).then((res) => {
      if (res && res.documents) {
        // Filter user posts
        const userPosts = res.documents.filter(post => 
          (userData?.$id && (post.userId === userData.$id || post.$permissions?.some(p => p.includes(`user:${userData.$id}`)))) || 
          post.userId === 'mock-user-123'
        );
        setPosts(userPosts);
      }
      setLoading(false);
    });
  }, [userData]);

  const handleDeletePost = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      appwriteService.deletePost(id).then((success) => {
        if (success) {
          toast.success("Post deleted successfully!");
          setPosts(prev => prev.filter(post => post.$id !== id));
        } else {
          toast.error("Failed to delete post.");
        }
      });
    }
  };

  // Compute stats
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const publishCount = posts.filter(p => p.status === 'active').length;

  const handleLogout = () => {
    authService.logout().then(() => {
      toast.success("Logged out successfully");
      navigate("/");
      window.location.reload();
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Manage Posts', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="glass-card p-6 flex flex-col gap-6 sticky top-24">
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
              {userData?.name ? userData.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--text-primary)] leading-tight">{userData?.name || 'Writer'}</h3>
              <span className="text-xxs text-[var(--text-muted)] font-medium">Content Manager</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === item.id
                      ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border border-transparent'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent transition-all mt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow">
        {loading ? (
          <div className="space-y-6">
            <div className="h-8 w-48 skeleton mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 skeleton"></div>
              <div className="h-32 skeleton"></div>
              <div className="h-32 skeleton"></div>
            </div>
            <div className="h-64 skeleton mt-6"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                  Creator Space
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">Manage articles, monitor traffic, and configure settings.</p>
              </div>
              <Link to="/add-post">
                <button className="btn-primary">
                  <Plus className="w-4 h-4" />
                  <span>Create Post</span>
                </button>
              </Link>
            </div>

            {/* TAB CONTENT: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Published Posts', val: publishCount, suffix: '', icon: FileText, color: 'text-indigo-400', bg: 'from-indigo-500/10' },
                    { label: 'Total Read Views', val: totalViews, suffix: '', icon: Eye, color: 'text-cyan-400', bg: 'from-cyan-500/10' },
                    { label: 'Likes Received', val: totalLikes, suffix: '', icon: ThumbsUp, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
                    { label: 'Engagement Rate', val: posts.length ? Math.round((totalLikes / (totalViews || 1)) * 100) : 0, suffix: '%', icon: MessageSquare, color: 'text-pink-400', bg: 'from-pink-500/10' }
                  ].map((s, idx) => (
                    <div key={idx} className="stat-card flex items-center justify-between overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{s.label}</span>
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1.5">{s.val}{s.suffix}</h2>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-tr ${s.bg} border border-white/5 ${s.color}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid layout for Charts and activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Visual Analytics Preview */}
                  <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Views Traffic</h3>
                        <span className="text-xs text-[var(--text-muted)]">Weekly traffic activity overview</span>
                      </div>
                      <span className="text-xxs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">+14.2%</span>
                    </div>

                    {/* Premium Custom SVG Chart */}
                    <div className="relative h-44 w-full flex items-end">
                      <svg className="w-full h-full" viewBox="0 0 400 120">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                        {/* Area */}
                        <path
                          d="M0 120 Q50 80, 100 95 T200 40 T300 70 T400 30 L400 120 L0 120 Z"
                          fill="url(#chartGradient)"
                        />
                        {/* Stroke Line */}
                        <path
                          d="M0 120 Q50 80, 100 95 T200 40 T300 70 T400 30"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Dots */}
                        <circle cx="100" cy="95" r="4" fill="#06b6d4" stroke="#0f172a" strokeWidth="1" />
                        <circle cx="200" cy="40" r="4" fill="#8b5cf6" stroke="#0f172a" strokeWidth="1" />
                        <circle cx="300" cy="70" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="1" />
                        <circle cx="400" cy="30" r="4" fill="#ec4899" stroke="#0f172a" strokeWidth="1" />
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-xxs text-[var(--text-muted)] font-semibold mt-4 border-t border-[var(--border)] pt-4">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* Quick Actions widget */}
                  <div className="glass-card p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Operations</h3>
                    <div className="flex flex-col gap-3">
                      <Link to="/" className="w-full">
                        <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-indigo-500/30 bg-white/3 hover:bg-indigo-500/5 text-sm font-semibold transition-all">
                          <span className="flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-indigo-400">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            View Public Site
                          </span>
                        </button>
                      </Link>
                      <Link to="/profile" className="w-full">
                        <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-purple-500/30 bg-white/3 hover:bg-purple-500/5 text-sm font-semibold transition-all">
                          <span className="flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-purple-400">
                            <Settings className="w-4 h-4 text-purple-400" />
                            Edit Profile Bio
                          </span>
                        </button>
                      </Link>
                      <Link to="/all-posts" className="w-full">
                        <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-cyan-500/30 bg-white/3 hover:bg-cyan-500/5 text-sm font-semibold transition-all">
                          <span className="flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-cyan-400">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            Explore All Articles
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Posts Table Preview */}
                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent Submissions</h3>
                    <button onClick={() => setActiveTab('posts')} className="text-xs text-indigo-400 hover:underline font-semibold">View All</button>
                  </div>

                  {posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">No posts found. Start sharing your insights!</p>
                      <Link to="/add-post" className="inline-block mt-3 text-sm text-indigo-400 hover:underline font-semibold">Create your first post</Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border)] text-xxs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                            <th className="pb-3">Title</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Views</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] text-sm text-[var(--text-secondary)] font-medium">
                          {posts.slice(0, 3).map((post) => (
                            <tr key={post.$id} className="hover:bg-white/1">
                              <td className="py-4 font-semibold text-[var(--text-primary)]">{post.title}</td>
                              <td className="py-4 text-xs">{post.category || 'General'}</td>
                              <td className="py-4">
                                <span className={`badge ${post.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                  {post.status}
                                </span>
                              </td>
                              <td className="py-4 text-xs">{post.views || 0}</td>
                              <td className="py-4 text-right">
                                <div className="inline-flex gap-2">
                                  <Link to={`/edit-post/${post.$id}`} className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-400 border border-transparent hover:border-indigo-500/20 transition-all">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Link>
                                  <button onClick={() => handleDeletePost(post.$id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 border border-transparent hover:border-red-500/20 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: MANAGE POSTS */}
            {activeTab === 'posts' && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Manage Your Articles</h3>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[var(--text-secondary)]">No articles created yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xxs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          <th className="pb-3">Title</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Views</th>
                          <th className="pb-3">Likes</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] text-sm text-[var(--text-secondary)] font-medium">
                        {posts.map((post) => (
                          <tr key={post.$id} className="hover:bg-white/1">
                            <td className="py-4 font-semibold text-[var(--text-primary)]">
                              <Link to={`/post/${post.$id}`} className="hover:text-indigo-400 transition-colors">
                                {post.title}
                              </Link>
                            </td>
                            <td className="py-4 text-xs">{post.category || 'General'}</td>
                            <td className="py-4">
                              <span className={`badge ${post.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                {post.status}
                              </span>
                            </td>
                            <td className="py-4 text-xs">{post.views || 0}</td>
                            <td className="py-4 text-xs">{post.likes || 0}</td>
                            <td className="py-4 text-right">
                              <div className="inline-flex gap-2">
                                <Link to={`/edit-post/${post.$id}`} className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-400 border border-transparent hover:border-indigo-500/20 transition-all">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Link>
                                <button onClick={() => handleDeletePost(post.$id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 border border-transparent hover:border-red-500/20 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Historical Insights</h3>
                  <p className="text-xs text-[var(--text-muted)] mb-6">Aggregate analytics and metrics tracking.</p>

                  <div className="relative h-64 w-full flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 600 200">
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                      {/* Bar graph representation */}
                      <rect x="50" y="80" width="30" height="120" rx="4" fill="url(#barGradient)" />
                      <rect x="130" y="110" width="30" height="90" rx="4" fill="url(#barGradient)" />
                      <rect x="210" y="50" width="30" height="150" rx="4" fill="url(#barGradient)" />
                      <rect x="290" y="130" width="30" height="70" rx="4" fill="url(#barGradient)" />
                      <rect x="370" y="90" width="30" height="110" rx="4" fill="url(#barGradient)" />
                      <rect x="450" y="60" width="30" height="140" rx="4" fill="url(#barGradient)" />
                      <rect x="530" y="40" width="30" height="160" rx="4" fill="url(#barGradient)" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-xxs text-[var(--text-muted)] font-semibold mt-4 border-t border-[var(--border)] pt-4 px-6">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Workspace Settings</h3>
                <div className="divider"></div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-semibold text-sm">Offline Mock Data</h4>
                    <p className="text-xs text-[var(--text-muted)]">Use local storage database fallback if connection fails.</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Always Enabled</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[var(--border)] pt-4">
                  <div>
                    <h4 className="font-semibold text-sm">Auto-Save Editor drafts</h4>
                    <p className="text-xs text-[var(--text-muted)]">Save working drafts automatically inside the browser cache.</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Active</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
