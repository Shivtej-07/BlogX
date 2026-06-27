import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight, Feather, Sparkles, LayoutGrid, Heart } from 'lucide-react'
import appwriteService from "../appwrite/config"
import Container from '../components/container/Container'
import PostCard from '../components/PostCard'


function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const authStatus = useSelector((state) => state.auth.status)
    const navigate = useNavigate()

    useEffect(() => {
        appwriteService.getPosts([]).then((res) => {
            if (res) {
                setPosts(res.documents)
            }
            setLoading(false);
        })
    }, [])

    return (
        <div className="w-full relative overflow-hidden pb-16">
            {/* HERO SECTION */}
            <div className="relative pt-20 pb-20 md:pt-32 md:pb-24 border-b border-[var(--border)] bg-gradient-to-b from-slate-950/20 to-transparent">
                {/* Background decorative circles */}
                <div className="absolute top-1/4 left-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <Container>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
                        {/* Hero Text */}
                        <div className="flex-grow max-w-xl text-center lg:text-left space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold w-fit"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Premium Blogging Experience
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1] font-display"
                            >
                                Write. Publish. <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Inspire.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto lg:mx-0"
                            >
                                Create beautiful articles with a modern blogging platform powered by React and Appwrite. Seamlessly track views, configure layouts, and share clean reading spaces.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
                            >
                                <Link to={authStatus ? "/add-post" : "/signup"}>
                                    <button className="btn-primary flex items-center gap-2 group py-3 px-6 text-sm font-bold">
                                        <Feather className="w-4 h-4" />
                                        <span>Start Writing</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link to="/all-posts">
                                    <button className="btn-secondary py-3 px-6 text-sm font-bold flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4" />
                                        <span>Explore Articles</span>
                                    </button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Hero Illustration (Interactive floating SVG) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full max-w-md lg:w-1/2 flex justify-center z-10 shrink-0"
                        >
                            <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center">
                                {/* Rotating Rings */}
                                <div className="absolute inset-0 border border-dashed border-indigo-500/20 rounded-full animate-[spin-slow_20s_linear_infinite]"></div>
                                <div className="absolute inset-4 border border-dashed border-purple-500/25 rounded-full animate-[spin-slow_15s_linear_infinite_reverse]"></div>
                                <div className="absolute inset-10 border border-white/5 rounded-full"></div>

                                {/* Floating SaaS-style mockup cards */}
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute top-6 left-2 glass-card p-4 border border-[var(--border)] rounded-2xl w-48 shadow-lg backdrop-blur-md flex flex-col gap-2.5 z-10"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-white font-extrabold text-[10px]">R</div>
                                        <div className="h-2 w-16 bg-[var(--text-muted)]/20 rounded"></div>
                                    </div>
                                    <div className="h-1.5 w-full bg-[var(--text-muted)]/10 rounded"></div>
                                    <div className="h-1.5 w-[80%] bg-[var(--text-muted)]/10 rounded"></div>
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute bottom-10 right-2 glass-card p-4 border border-[var(--border)] rounded-2xl w-40 shadow-lg backdrop-blur-md flex flex-col gap-2 z-10"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-indigo-400">ENGAGEMENT</span>
                                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                    </div>
                                    <div className="text-xl font-extrabold text-[var(--text-primary)]">98.4%</div>
                                    <div className="h-1 w-full bg-[var(--text-muted)]/15 rounded overflow-hidden">
                                        <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                    </div>
                                </motion.div>

                                {/* Glowing Orb */}
                                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 blur-[20px] absolute"></div>
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-400 to-cyan-400 shadow-lg flex items-center justify-center font-black text-white relative text-lg hover:rotate-12 transition-transform">
                                    B
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* FEATURED POSTS */}
            <div className="pt-16">
                <Container>
                    <div className="w-full space-y-8">
                        <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-display">
                                    Featured Articles
                                </h2>
                                <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">Hand-picked engineering and SaaS insights</p>
                            </div>
                            <Link to="/all-posts" className="text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1">
                                View all articles
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="glass-card p-4 space-y-4">
                                        <div className="aspect-[16/10] w-full skeleton"></div>
                                        <div className="h-4 w-[60%] skeleton"></div>
                                        <div className="h-3 w-[80%] skeleton"></div>
                                        <div className="h-3 w-full skeleton opacity-50"></div>
                                    </div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 glass-card p-8 border border-white/5">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">No posts found</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                                    Create a free writer account to begin submitting articles to the stream.
                                </p>
                                <div className="mt-4">
                                    <Link to={authStatus ? "/add-post" : "/login"}>
                                        <button className="btn-primary py-2 px-5 text-xs font-semibold">Write First Post</button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {posts.map((post) => (
                                    <div key={post.$id} className="h-full">
                                        <PostCard {...post} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </div>
    )
}

export default Home