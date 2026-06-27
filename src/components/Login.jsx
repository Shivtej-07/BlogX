import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Chrome, Github } from './BrandIcons';
import { login as authLogin } from '../store/authSlice';
import authService from "../appwrite/auth";
import { toast } from 'react-hot-toast';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        setError("");
        setLoading(true);
        const loginToast = toast.loading("Verifying credentials...");
        try {
            const session = await authService.login(data);
            if (session) {
                const userData = await authService.getCurrentUser();
                if (userData) {
                    dispatch(authLogin({ userData }));
                    toast.success(`Welcome back, ${userData.name}!`, { id: loginToast });
                    navigate("/dashboard");
                }
            }
        } catch (err) {
            setError(err.message || "Failed to log in.");
            toast.error(err.message || "Login failed.", { id: loginToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row bg-[var(--bg-primary)] transition-colors duration-300">
            {/* Left Screen: SaaS Illustration / Feature Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#090d16] relative overflow-hidden flex-col justify-between p-12 border-r border-[var(--border)]">
                {/* Background decorative circles */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

                <Link to="/" className="flex items-center gap-2 w-fit z-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                        B
                    </div>
                    <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Blogx
                    </span>
                </Link>

                <div className="my-auto space-y-6 z-10 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Explore Next-Gen Blogging
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-extrabold tracking-tight text-white leading-tight font-display"
                    >
                        Where developers write, read, and connect.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 text-sm leading-relaxed"
                    >
                        Publish articles using our modern dashboard, upload custom featured images, and track insights in real-time. Join the tech writing revolution today.
                    </motion.p>
                </div>

                <div className="border-t border-white/5 pt-6 flex justify-between items-center z-10 text-xs text-slate-500 font-semibold">
                    <span>Powered by React & Appwrite</span>
                    <span className="flex items-center gap-1">
                        Explore <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </div>

            {/* Right Screen: Glass Card Form */}
            <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative">
                {/* Mobile floating blobs */}
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none lg:hidden"></div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md glass-card p-8 md:p-10 border border-[var(--border)] relative"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-display">
                            Welcome Back
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                            New here?{' '}
                            <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="input-label">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    placeholder="sarah@connor.io"
                                    className={`input-field pl-10 ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                            message: "Please enter a valid email address"
                                        }
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-400 text-xxs mt-1 font-semibold">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="input-label mb-0">Password</label>
                                <a href="#forgot" className="text-xxs text-indigo-400 hover:underline font-semibold" onClick={(e) => {
                                    e.preventDefault();
                                    toast("Mock password recovery trigger", { icon: '🔑' });
                                }}>
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xxs mt-1 font-semibold">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white/5 border-white/10"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-[var(--text-secondary)]">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Social Login Placeholders */}
                    <div className="mt-8">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-full border-t border-[var(--border)]"></div>
                            <span className="relative px-3 text-xxs text-[var(--text-muted)] uppercase tracking-wider bg-[#10141f] rounded font-bold">
                                Or connect with
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button 
                                onClick={() => toast.success("Google integration triggered (Mock)")}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[var(--border)] hover:border-slate-500 bg-white/3 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                <Chrome className="w-4 h-4" />
                                Google
                            </button>
                            <button 
                                onClick={() => toast.success("GitHub integration triggered (Mock)")}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[var(--border)] hover:border-slate-500 bg-white/3 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                <Github className="w-4 h-4" />
                                GitHub
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;