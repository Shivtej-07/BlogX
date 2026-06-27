import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Tag, Sparkles } from 'lucide-react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config"

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [filteredPosts, setFilteredPosts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    const categories = ['All', 'SaaS', 'Design', 'React', 'Development', 'General']

    useEffect(() => {
        appwriteService.getPosts([]).then((res) => {
            if (res && res.documents) {
                setPosts(res.documents)
                setFilteredPosts(res.documents)
            }
            setLoading(false)
        })
    }, [])

    // Filter logic
    useEffect(() => {
        let updated = [...posts];

        // Search text filter
        if (searchQuery.trim()) {
            updated = updated.filter(p => 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            updated = updated.filter(p => (p.category || 'General').toLowerCase() === selectedCategory.toLowerCase());
        }

        setFilteredPosts(updated);
    }, [searchQuery, selectedCategory, posts]);

    return (
        <div className="w-full relative py-8 min-h-[calc(100vh-8rem)]">
            <Container>
                <div className="w-full space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
                        <div>
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Reader Lounge
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-display">
                                All Published Articles
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)] mt-1.5">Browse technical tutorials, SaaS metrics, and UX code designs.</p>
                        </div>

                        {/* Search Bar Input */}
                        <div className="relative w-full md:w-80 shrink-0">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--text-muted)] pointer-events-none">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter by keywords..."
                                className="w-full input-field pl-10 text-xs py-2.5"
                            />
                        </div>
                    </div>

                    {/* Category Filter Badges */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4">
                        <span className="text-xxs font-bold text-[var(--text-muted)] uppercase tracking-wider mr-2 flex items-center gap-1">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                            Filter:
                        </span>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/10'
                                        : 'bg-[var(--bg-glass)] text-[var(--text-secondary)] border-[var(--border)] hover:border-slate-500 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Posts Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="glass-card p-4 space-y-4">
                                    <div className="aspect-[16/10] w-full skeleton animate-pulse"></div>
                                    <div className="h-4 w-[60%] skeleton"></div>
                                    <div className="h-3 w-full skeleton opacity-50"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-16 glass-card p-8 border border-white/5 max-w-md mx-auto">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">No articles match your search</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">
                                Try adjusting your keywords or selecting a different category badge filter.
                            </p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="btn-secondary mt-4 text-xs"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredPosts.map((post) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        key={post.$id}
                                        className="h-full"
                                    >
                                        <PostCard {...post} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default AllPosts