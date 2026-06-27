import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

const INITIAL_MOCK_POSTS = [
  {
    $id: "building-premium-saas-dashboards-in-2026",
    title: "Building Premium SaaS Dashboards in 2026",
    content: `<p>Creating a premium SaaS user experience requires a meticulous balance of visual aesthetics, fast transitions, and absolute clarity. Modern tools like <strong>React</strong>, <strong>Tailwind CSS</strong>, and <strong>Framer Motion</strong> allow developers to build interfaces that feel smooth and responsive.</p><h2>The Core Design Rules</h2><ul><li>Use curated color palettes instead of plain primaries (indigo, violet, slate)</li><li>Apply layout spacing that breathes (use 16px to 24px grid alignments)</li><li>Inject subtle micro-animations for clicks and hover actions</li></ul><p>Let's look at how we can implement responsive layouts that wow your clients instantly. Good design isn't just how it looks, but how it feels to interact with it.</p>`,
    featuredimage: "mock-img-1",
    status: "active",
    userId: "mock-user-123",
    category: "SaaS",
    createdAt: "2026-06-25T12:00:00.000Z",
    likes: 42,
    views: 189,
    readingTime: "4 min"
  },
  {
    $id: "framer-motion-secret-to-high-end-animations",
    title: "Framer Motion: The Secret to High-End Animations",
    content: `<p>Why do sites like Vercel and Linear feel so magical? The secret lies in their easing functions and micro-interactions. Framer Motion makes it incredibly simple to orchestrate complex element animations in React.</p><blockquote>"Animations shouldn't be intrusive. They should guide the user's attention and make actions feel physical."</blockquote><p>Using springs instead of basic linear easings transforms the experience from digital to tactile. Try adding hover-lifts and scale transitions to your cards to see the difference.</p>`,
    featuredimage: "mock-img-2",
    status: "active",
    userId: "mock-user-123",
    category: "Design",
    createdAt: "2026-06-24T15:30:00.000Z",
    likes: 28,
    views: 94,
    readingTime: "3 min"
  },
  {
    $id: "evolution-of-react-state-management",
    title: "The Evolution of React State Management",
    content: `<p>State management in React has come a long way. From class component state to Redux, Context API, and now lightweight atomic states, the community has continuously refined how components share data.</p><p>For complex applications, Redux Toolkit remains a solid choice, providing structured slices, actions, and predictable updates. When coupled with local component hooks, you get a powerful, scalable architecture suitable for any production app.</p>`,
    featuredimage: "mock-img-3",
    status: "active",
    userId: "mock-user-other",
    category: "Development",
    createdAt: "2026-06-22T09:15:00.000Z",
    likes: 19,
    views: 56,
    readingTime: "5 min"
  }
];

export class Service {
    client = new Client();
    databases;
    bucket;
    useMock = false;

    constructor() {
        try {
            if (conf.appwriteUrl && conf.appwriteProjectId && !conf.appwriteProjectId.includes("VITE_")) {
                this.client
                    .setEndpoint(conf.appwriteUrl)
                    .setProject(conf.appwriteProjectId);
                this.databases = new Databases(this.client);
                this.bucket = new Storage(this.client);
            } else {
                this.useMock = true;
            }
        } catch (e) {
            console.warn("Appwrite databases/storage setup failed. Switching to Mock Mode.", e);
            this.useMock = true;
        }

        // Initialize localStorage mock DB
        if (!localStorage.getItem("blogx_posts")) {
            localStorage.setItem("blogx_posts", JSON.stringify(INITIAL_MOCK_POSTS));
        }
    }

    // LocalStorage helper methods
    _getMockPosts() {
        const posts = localStorage.getItem("blogx_posts");
        return posts ? JSON.parse(posts) : [];
    }

    _saveMockPosts(posts) {
        localStorage.setItem("blogx_posts", JSON.stringify(posts));
    }

    async createPost({ title, slug, content, featuredimage, status, userId, category = "General" }) {
        const estimateReadingTime = (text) => {
            const words = text ? text.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
            return `${Math.max(1, Math.round(words / 200))} min`;
        };

        if (this.useMock) {
            const newPost = {
                $id: slug,
                title,
                content,
                featuredimage,
                status,
                userId: userId || "mock-user-123",
                category,
                createdAt: new Date().toISOString(),
                likes: 0,
                views: 1,
                readingTime: estimateReadingTime(content)
            };
            const posts = this._getMockPosts();
            // remove duplicates just in case
            const filtered = posts.filter(p => p.$id !== slug);
            filtered.unshift(newPost);
            this._saveMockPosts(filtered);
            return newPost;
        }

        try {
            // Attempt to write document, passing standard fields.
            // If the schema requires userId or userid, we try to pass it.
            const payload = {
                title,
                content,
                featuredimage,
                status,
            };
            
            // To prevent strict schema errors on Appwrite database, we try writing with userId first
            try {
                return await this.databases.createDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionId,
                    slug,
                    { ...payload, userId }
                );
            } catch (schemaErr) {
                // If it fails due to attribute mismatch, retry with userid
                try {
                    return await this.databases.createDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteCollectionId,
                        slug,
                        { ...payload, userid: userId }
                    );
                } catch (retryErr) {
                    // Retry with just basic payload
                    return await this.databases.createDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteCollectionId,
                        slug,
                        payload
                    );
                }
            }
        } catch (error) {
            console.warn("Appwrite createPost failed. Switching to Local Storage.", error);
            this.useMock = true;
            return this.createPost({ title, slug, content, featuredimage, status, userId, category });
        }
    }

    async updatePost(slug, { title, content, featuredimage, status, category }) {
        if (this.useMock) {
            const posts = this._getMockPosts();
            const postIdx = posts.findIndex(p => p.$id === slug);
            if (postIdx > -1) {
                posts[postIdx] = {
                    ...posts[postIdx],
                    title: title !== undefined ? title : posts[postIdx].title,
                    content: content !== undefined ? content : posts[postIdx].content,
                    featuredimage: featuredimage !== undefined ? featuredimage : posts[postIdx].featuredimage,
                    status: status !== undefined ? status : posts[postIdx].status,
                    category: category !== undefined ? category : (posts[postIdx].category || "General"),
                };
                this._saveMockPosts(posts);
                return posts[postIdx];
            }
            return false;
        }

        try {
            const payload = {
                title,
                content,
                featuredimage,
                status,
            };
            if (category) payload.category = category;
            
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                payload
            );
        } catch (error) {
            console.warn("Appwrite updatePost failed. Switching to Local Storage.", error);
            this.useMock = true;
            return this.updatePost(slug, { title, content, featuredimage, status, category });
        }
    }

    async deletePost(slug) {
        if (this.useMock) {
            const posts = this._getMockPosts();
            const filtered = posts.filter(p => p.$id !== slug);
            this._saveMockPosts(filtered);
            return true;
        }

        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true;
        } catch (error) {
            console.warn("Appwrite deletePost failed. Falling back to local state.", error);
            this.useMock = true;
            return this.deletePost(slug);
        }
    }

    async getPost(slug) {
        if (this.useMock) {
            const posts = this._getMockPosts();
            const post = posts.find(p => p.$id === slug);
            if (post) {
                // increment view count
                post.views = (post.views || 0) + 1;
                this._saveMockPosts(posts);
                return post;
            }
            return null;
        }

        try {
            const doc = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            // standard Appwrite normalizer
            if (doc && !doc.userId && doc.userid) doc.userId = doc.userid;
            return doc;
        } catch (error) {
            console.warn("Appwrite getPost failed. Checking Local Storage.", error);
            const posts = this._getMockPosts();
            return posts.find(p => p.$id === slug) || null;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        if (this.useMock) {
            const posts = this._getMockPosts();
            // Filter by active status in queries if present
            const isActiveFilter = queries.some(q => q && q.includes && q.includes("active"));
            if (isActiveFilter) {
                return { documents: posts.filter(p => p.status === "active") };
            }
            return { documents: posts };
        }

        try {
            const res = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
            if (res && res.documents) {
                res.documents.forEach(doc => {
                    if (!doc.userId && doc.userid) doc.userId = doc.userid;
                });
            }
            return res;
        } catch (error) {
            console.warn("Appwrite getPosts failed. Falling back to Local Storage.", error);
            const posts = this._getMockPosts();
            return { documents: posts.filter(p => p.status === "active") };
        }
    }

    // Interaction togglers (Like/Bookmark) saved in localStorage
    async toggleLike(slug) {
        const posts = this._getMockPosts();
        const post = posts.find(p => p.$id === slug);
        if (post) {
            const likedKey = `blogx_liked_${slug}`;
            const isLiked = localStorage.getItem(likedKey) === "true";
            if (isLiked) {
                post.likes = Math.max(0, (post.likes || 0) - 1);
                localStorage.removeItem(likedKey);
            } else {
                post.likes = (post.likes || 0) + 1;
                localStorage.setItem(likedKey, "true");
            }
            this._saveMockPosts(posts);
            return post;
        }
        return null;
    }

    // file upload service
    async uploadFile(file) {
        if (this.useMock) {
            // Read file as base64 string to store locally or return mock URL
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const mockFileId = `mock-file-${Date.now()}`;
                    localStorage.setItem(`blogx_file_${mockFileId}`, reader.result);
                    resolve({ $id: mockFileId });
                };
                reader.readAsDataURL(file);
            });
        }

        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.warn("Appwrite uploadFile failed. Converting to local base64 store.", error);
            this.useMock = true;
            return this.uploadFile(file);
        }
    }

    async deleteFile(fileId) {
        if (this.useMock || (fileId && fileId.startsWith("mock-file-"))) {
            localStorage.removeItem(`blogx_file_${fileId}`);
            return true;
        }

        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.warn("Appwrite deleteFile failed.", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        if (!fileId) return "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800";
        
        if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("data:image")) {
            return fileId;
        }
        if (fileId === "mock-img-1") return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800";
        if (fileId === "mock-img-2") return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";
        if (fileId === "mock-img-3") return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800";
        
        // Check if stored in localStorage as base64
        const localBase64 = localStorage.getItem(`blogx_file_${fileId}`);
        if (localBase64) return localBase64;

        try {
            if (this.bucket) {
                return this.bucket.getFileView(
                    conf.appwriteBucketId,
                    fileId
                ).toString();
            }
        } catch (e) {
            // Silently absorb and return fallback
        }
        return `https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800`;
    }
}

const service = new Service();
export default service;