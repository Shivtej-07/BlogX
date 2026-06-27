import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { motion, useScroll } from "framer-motion";
import {
    Heart, Bookmark, Calendar, Clock, Share2, ArrowLeft,
    ArrowUp, MessageSquare, Send, Link2, User
} from "lucide-react";
import { Twitter, Linkedin } from "../components/BrandIcons";
import { toast } from "react-hot-toast";

export default function Post() {
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [comments, setComments] = useState([
        { id: 1, name: "Alexander Wright", text: "Exceptional breakdown of layout spacing. Spring values in Framer Motion really change the UI quality.", date: "1 day ago" },
        { id: 2, name: "Marcus Aurelius", text: "This is a great SaaS design example. Simple, clean, and distraction-free.", date: "12 hours ago" }
    ]);
    const [newCommentName, setNewCommentName] = useState("");
    const [newCommentText, setNewCommentText] = useState("");
    const [headings, setHeadings] = useState([]);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const { slug } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    // Scroll progress handler
    const [scrollProgress, setScrollProgress] = useState(0);
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                setScrollProgress((window.scrollY / totalScroll) * 100);
            }
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPost(post);

                    // Extract Headings for Table of Contents
                    const extracted = [];
                    const matches = post.content ? post.content.match(/<h2>(.*?)<\/h2>/g) : null;
                    if (matches) {
                        matches.forEach(m => {
                            const text = m.replace(/<\/?h2>/g, '').replace(/<[^>]*>/g, '');
                            extracted.push(text);
                        });
                    }
                    setHeadings(extracted);

                    // Fetch related posts
                    appwriteService.getPosts([]).then((res) => {
                        if (res && res.documents) {
                            const other = res.documents.filter(p => p.$id !== post.$id).slice(0, 2);
                            setRelatedPosts(other);
                        }
                    });
                }
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            appwriteService.deletePost(post.$id).then((status) => {
                if (status) {
                    appwriteService.deleteFile(post.featuredimage);
                    toast.success("Article deleted successfully");
                    navigate("/");
                }
            });
        }
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } else {
            toast.success(`Shared to ${platform}!`);
        }
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newCommentName.trim() || !newCommentText.trim()) return;

        const newComment = {
            id: Date.now(),
            name: newCommentName.trim(),
            text: newCommentText.trim(),
            date: "Just now"
        };

        setComments(prev => [...prev, newComment]);
        setNewCommentName("");
        setNewCommentText("");
        toast.success("Comment added successfully!");
    };

    const formattedDate = post?.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'June 26, 2026';

    return post ? (
        <div className="relative w-full pb-16">
            {/* Horizontal Scroll Progress Bar */}
            <div
                className="fixed top-16 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 z-50 transition-all duration-100"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <Container>
                <div className="w-full space-y-6 pt-4">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back to articles
                    </button>

                    {/* Main Layout Grid */}
                    <div className="flex flex-col lg:flex-row gap-12 relative items-start">

                        {/* LEFT CONTENT: Reading Column */}
                        <article className="flex-grow max-w-3xl space-y-8">
                            {/* Headline Meta */}
                            <div className="space-y-4">
                                <span className={`category-badge tag-${(post.category || "SaaS").toLowerCase().trim()}`}>
                                    {post.category || "SaaS"}
                                </span>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15] font-display">
                                    {post.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] border-b border-[var(--border)] pb-6 pt-2 font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-bold text-slate-300">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-semibold text-[var(--text-primary)]">Sarah Connor</span>
                                    </div>
                                    <span className="text-[var(--text-muted)]">&bull;</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formattedDate}
                                    </span>
                                    <span className="text-[var(--text-muted)]">&bull;</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {post.readingTime || "3 min read"}
                                    </span>

                                    {/* Author Operations (Edit/Delete) */}
                                    {isAuthor && (
                                        <div className="ml-auto flex gap-2">
                                            <Link to={`/edit-post/${post.$id}`}>
                                                <button className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xxs font-bold transition-all">
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={deletePost}
                                                className="px-3.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xxs font-bold transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Large Featured Image */}
                            {post.featuredimage && (
                                <div className="w-full relative aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg bg-slate-950">
                                    <img
                                        src={appwriteService.getFilePreview(post.featuredimage)}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Document Body (Prose Layout) */}
                            <div className="prose-blogx text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] border-b border-[var(--border)] pb-8">
                                {parse(post.content)}
                            </div>

                            {/* COMMENT SECTION UI */}
                            <div className="space-y-6 pt-4">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                                    Discussion ({comments.length})
                                </h3>

                                {/* Comment Submission Form */}
                                <form onSubmit={handleCommentSubmit} className="glass-card p-5 border border-[var(--border)] rounded-2xl space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label text-xxs font-bold uppercase tracking-wider">Your Name</label>
                                            <input
                                                type="text"
                                                placeholder="Marcus Aurelius"
                                                value={newCommentName}
                                                onChange={(e) => setNewCommentName(e.target.value)}
                                                className="input-field py-2 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label text-xxs font-bold uppercase tracking-wider">Comment Message</label>
                                        <textarea
                                            placeholder="Write your constructive thoughts here..."
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            className="input-field h-20 text-xs resize-none"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 self-end">
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Post Comment</span>
                                    </button>
                                </form>

                                {/* Comments List */}
                                <div className="space-y-4">
                                    {comments.map((c) => (
                                        <div key={c.id} className="p-4 border border-[var(--border)] bg-[var(--bg-glass)] rounded-xl flex gap-3.5">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 shrink-0 flex items-center justify-center font-bold text-slate-300 text-xs">
                                                {c.name[0].toUpperCase()}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-[var(--text-primary)]">{c.name}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)] font-medium">&bull; {c.date}</span>
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>

                        {/* RIGHT COLUMN: Sticky Sidebar */}
                        <aside className="w-full lg:w-72 shrink-0 space-y-8 lg:sticky lg:top-24">

                            {/* Table of Contents */}
                            {headings.length > 0 && (
                                <div className="glass-card p-5">
                                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border)]">
                                        Table of Contents
                                    </h4>
                                    <ul className="space-y-2.5 text-xs font-medium text-[var(--text-secondary)]">
                                        {headings.map((h, i) => (
                                            <li key={i} className="hover:text-indigo-400 transition-colors flex gap-2">
                                                <span className="text-indigo-400">#</span>
                                                <span>{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Share widgets */}
                            <div className="glass-card p-5 space-y-4">
                                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--border)]">
                                    Share Article
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleShare('Twitter')}
                                        className="p-2.5 rounded-lg border border-[var(--border)] hover:border-indigo-500/30 hover:bg-white/3 flex flex-col items-center justify-center gap-1.5 text-[var(--text-muted)] hover:text-indigo-400 transition-all cursor-pointer"
                                    >
                                        <Twitter className="w-4 h-4" />
                                        <span className="text-[10px] font-bold">Twitter</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('LinkedIn')}
                                        className="p-2.5 rounded-lg border border-[var(--border)] hover:border-indigo-500/30 hover:bg-white/3 flex flex-col items-center justify-center gap-1.5 text-[var(--text-muted)] hover:text-indigo-400 transition-all cursor-pointer"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        <span className="text-[10px] font-bold">LinkedIn</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="p-2.5 rounded-lg border border-[var(--border)] hover:border-indigo-500/30 hover:bg-white/3 flex flex-col items-center justify-center gap-1.5 text-[var(--text-muted)] hover:text-indigo-400 transition-all cursor-pointer"
                                    >
                                        <Link2 className="w-4 h-4" />
                                        <span className="text-[10px] font-bold">Copy Link</span>
                                    </button>
                                </div>
                            </div>

                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--border)]">
                                        Related Reading
                                    </h4>
                                    <div className="space-y-4">
                                        {relatedPosts.map((rp) => (
                                            <Link key={rp.$id} to={`/post/${rp.$id}`} className="flex gap-3 group">
                                                <div className="w-16 h-12 rounded-lg bg-slate-900 border border-[var(--border)] overflow-hidden shrink-0 relative">
                                                    <img
                                                        src={appwriteService.getFilePreview(rp.featuredimage)}
                                                        alt={rp.title}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h5 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                                                        {rp.title}
                                                    </h5>
                                                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">{rp.category || 'General'}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </Container>

            {/* Back to top float button */}
            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 z-30 p-3 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400 hover:scale-105 transition-transform cursor-pointer"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    ) : null;
}