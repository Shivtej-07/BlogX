import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Clock, ArrowUpRight, User } from 'lucide-react';
import appwriteService from "../appwrite/config";
import { toast } from 'react-hot-toast';

function PostCard({ $id, title, featuredimage, category = "SaaS", createdAt, readingTime = "3 min", likes: initialLikes = 0 }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);

  useEffect(() => {
    // Load interaction state
    setLiked(localStorage.getItem(`blogx_liked_${$id}`) === "true");
    setBookmarked(localStorage.getItem(`blogx_bookmarked_${$id}`) === "true");
  }, [$id]);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle state
    const nextState = !liked;
    setLiked(nextState);
    localStorage.setItem(`blogx_liked_${$id}`, nextState ? "true" : "false");

    // Call database/mock update
    appwriteService.toggleLike($id);
    setLikesCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    if (nextState) {
      toast.success("Added to Liked Posts!", { icon: '❤️', duration: 1500 });
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !bookmarked;
    setBookmarked(nextState);
    localStorage.setItem(`blogx_bookmarked_${$id}`, nextState ? "true" : "false");

    toast.success(nextState ? "Saved to Bookmarks!" : "Removed from Bookmarks!", {
      icon: nextState ? '🔖' : '🗑️',
      duration: 1500
    });
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Jun 26, 2026';

  const plainExcerpt = "Explore building beautiful scalable platforms with standard guidelines and modular architectures...";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="post-card group"
    >
      <Link to={`/post/${$id}`} className="block h-full">
        {/* Card Image Wrapper */}
        <div className="w-full aspect-[16/10] overflow-hidden relative bg-[var(--bg-secondary)] border-b border-[var(--border)]">
          <img
            src={appwriteService.getFilePreview(featuredimage)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`category-badge tag-${category?.toLowerCase().trim() || 'default'}`}>
              {category}
            </span>
          </div>

          {/* Action Overlay */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${bookmarked
                  ? "bg-indigo-500 text-white border-indigo-400"
                  : "bg-[var(--bg-primary)]/75 text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col justify-between h-[210px]">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {readingTime}
              </span>
              <span>&bull;</span>
              <span>{formattedDate}</span>
            </div>

            <h3 className="text-base font-extrabold text-[var(--text-primary)] leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
              {title}
            </h3>

            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {plainExcerpt}
            </p>
          </div>

          {/* Card Footer: Author and likes */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                <User className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Sarah Connor</span>
            </div>

            {/* Like and Detail Icon */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${liked ? "text-rose-500" : "text-[var(--text-muted)] hover:text-rose-400"
                  }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <div className="text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default PostCard;