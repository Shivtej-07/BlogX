import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../Button";
import Input from "../Input";
import RTE from "../RTE";
import Select from "../Select";

import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Save, UploadCloud, Eye, Check, RefreshCw, FileText, Layout } from "lucide-react";
import parse from "html-react-parser";

export default function PostForm({ post }) {
    const [livePreview, setLivePreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState("Saved"); // Saved, Saving, draft

    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
            category: post?.category || "General",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const watchTitle = watch("title");
    const watchContent = watch("content");
    const watchCategory = watch("category");
    const watchStatus = watch("status");
    const watchSlug = watch("slug");

    // Auto-save simulation
    useEffect(() => {
        if (!watchTitle && !watchContent) return;

        setAutoSaveStatus("Saving...");
        const timer = setTimeout(() => {
            setAutoSaveStatus("Draft saved locally");
            // Store draft locally
            localStorage.setItem("blogx_draft", JSON.stringify({
                title: watchTitle,
                content: watchContent,
                category: watchCategory,
                status: watchStatus,
                slug: watchSlug
            }));
        }, 1500);

        return () => clearTimeout(timer);
    }, [watchTitle, watchContent, watchCategory, watchStatus, watchSlug]);

    const submit = async (data) => {
        setSaving(true);
        const submitToast = toast.loading(post ? "Updating article..." : "Publishing article...");
        try {
            let fileId = post?.featuredimage || "";
            if (data.image && data.image[0]) {
                const file = await appwriteService.uploadFile(data.image[0]);
                if (file) {
                    fileId = file.$id;
                    if (post?.featuredimage) {
                        appwriteService.deleteFile(post.featuredimage);
                    }
                }
            }

            const postData = {
                title: data.title,
                content: data.content,
                status: data.status,
                featuredimage: fileId,
                category: data.category,
                userId: userData?.$id || "mock-user-123",
            };

            let dbPost;
            if (post) {
                dbPost = await appwriteService.updatePost(post.$id, postData);
            } else {
                dbPost = await appwriteService.createPost({
                    ...postData,
                    slug: data.slug,
                });
            }

            if (dbPost) {
                toast.success(post ? "Article updated!" : "Article published successfully!", { id: submitToast });
                localStorage.removeItem("blogx_draft");
                navigate(`/post/${dbPost.$id}`);
            }
        } catch (err) {
            toast.error(err.message || "Operation failed", { id: submitToast });
        } finally {
            setSaving(false);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto px-4 py-6">
            {/* Left Main Editor Area */}
            <div className="flex-grow space-y-6">
                <div className="glass-card p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                Editor Workspace
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            </span>
                        </div>
                        {/* Auto-save Status Indicator */}
                        <span className="text-xxs text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            {autoSaveStatus}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Title Input */}
                        <div className="space-y-1">
                            <label className="input-label font-bold text-xs uppercase tracking-wider">Article Title</label>
                            <input
                                placeholder="Enter a descriptive, captivating title..."
                                className="input-field py-3.5 text-lg font-bold"
                                {...register("title", { required: true })}
                            />
                        </div>

                        {/* Slug Input */}
                        <div className="space-y-1">
                            <label className="input-label font-bold text-xs uppercase tracking-wider">URL Slug (Auto-generated)</label>
                            <input
                                placeholder="article-url-slug"
                                className="input-field font-mono text-xs bg-slate-950/20"
                                {...register("slug", { required: true })}
                                onInput={(e) => {
                                    setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                                }}
                            />
                        </div>

                        {/* Editor and Preview Split Grid */}
                        <div className="grid grid-cols-1 gap-6 pt-2">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setLivePreview(!livePreview)}
                                    className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>{livePreview ? "Hide Preview" : "Split Live Preview"}</span>
                                </button>
                            </div>

                            <div className={`grid grid-cols-1 ${livePreview ? 'lg:grid-cols-2' : ''} gap-6`}>
                                {/* TinyMCE Editor */}
                                <div className="space-y-1.5">
                                    <label className="input-label font-bold text-xs uppercase tracking-wider">Content Body</label>
                                    <RTE name="content" control={control} defaultValue={getValues("content")} />
                                </div>

                                {/* Preview Pane */}
                                {livePreview && (
                                    <div className="glass-card p-6 border border-indigo-500/20 overflow-y-auto max-h-[580px] prose-blogx">
                                        <div className="flex items-center gap-1.5 text-xxs font-bold text-indigo-400 uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border)]">
                                            <Layout className="w-3.5 h-3.5" />
                                            Live Document Render
                                        </div>
                                        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight leading-tight">
                                            {watchTitle || "Untitled Draft"}
                                        </h1>
                                        <div className="text-xxs text-[var(--text-muted)] mt-2 mb-6 uppercase tracking-wider font-semibold">
                                            Category: {watchCategory || 'General'}
                                        </div>
                                        <div className="prose-body-render text-sm leading-relaxed text-[var(--text-secondary)]">
                                            {watchContent ? parse(watchContent) : <p className="italic text-[var(--text-muted)]">Write some content in the editor to preview it here.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sticky Action Sidebar */}
            <div className="w-full lg:w-80 shrink-0">
                <div className="glass-card p-6 space-y-6 sticky top-24">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-3">
                        Publish Options
                    </h3>

                    {/* Drag and Drop Image Uploader */}
                    <div className="space-y-2">
                        <label className="input-label font-bold text-xs uppercase tracking-wider">Featured Image</label>
                        <div
                            className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${dragActive
                                    ? 'border-indigo-500 bg-indigo-500/5'
                                    : 'border-[var(--border)] hover:border-indigo-500/30 hover:bg-white/1'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                        >
                            <input
                                id="image-upload-input"
                                type="file"
                                accept="image/png, image/jpg, image/jpeg, image/gif"
                                className="hidden"
                                {...register("image", { required: !post })}
                                onChange={(e) => {
                                    register("image").onChange(e);
                                    handleFileChange(e);
                                }}
                            />
                            <label htmlFor="image-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
                                <UploadCloud className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-[var(--text-primary)]">Upload Image</span>
                                <span className="text-[10px] text-[var(--text-muted)] mt-1">PNG, JPG, GIF (Max 5MB)</span>
                            </label>
                        </div>

                        {/* Image Preview Box */}
                        {(imagePreview || post?.featuredimage) && (
                            <div className="w-full relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] shadow-md mt-3 group">
                                <img
                                    src={imagePreview || appwriteService.getFilePreview(post?.featuredimage)}
                                    alt="Preview"
                                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-xxs text-white font-bold bg-slate-900/80 px-2 py-1 rounded-md border border-white/10">Image Selected</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <label className="input-label font-bold text-xs uppercase tracking-wider">Category Tag</label>
                        <select
                            className="input-field py-2 text-xs"
                            {...register("category", { required: true })}
                        >
                            {["General", "Design", "SaaS", "React", "Development"].map(opt => (
                                <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Selector */}
                    <div className="space-y-2">
                        <label className="input-label font-bold text-xs uppercase tracking-wider">Visibility Status</label>
                        <Select
                            options={["active", "inactive"]}
                            className="py-2 text-xs"
                            {...register("status", { required: true })}
                        />
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full justify-center py-3 text-xs"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4" />
                                    {post ? "Apply Edits" : "Publish Article"}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                toast.success("Draft saved to cache successfully!");
                                navigate("/dashboard");
                            }}
                            className="btn-secondary w-full justify-center py-2.5 text-xs text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)]"
                        >
                            <span className="flex items-center gap-1.5">
                                <Save className="w-3.5 h-3.5" />
                                Save Draft
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}