import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mountain, Compass, Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import ThemeToggle from './ThemeToggle';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/login`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                
                // Redirect to the page user was trying to access, or home page
                const redirectPath = location.state?.from || "/";
                navigate(redirectPath);
                
                toast.success(res.data.message);
                setInput({
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[user])
    return (
        <div className='min-h-screen overflow-y-auto flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 transition-colors duration-200'>
            <style>{`
                @keyframes rainbow-spin {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .rainbow-border-anim {
                    background: linear-gradient(270deg, #ff0000, #ff8800, #ffff00, #00cc00, #0088ff, #8800ff, #ff0088, #ff0000);
                    background-size: 400% 400%;
                    animation: rainbow-spin 8s linear infinite;
                }
                .login-card {
                    background: #ffffff;
                }
                .dark .login-card {
                    background: #374151;
                }
                .login-input {
                    background: #ffffff;
                    color: #1f2937;
                    border: 1.5px solid #e5e7eb;
                }
                .dark .login-input {
                    background: #4b5563;
                    color: #f9fafb;
                    border: 1.5px solid #6b7280;
                }
                .login-input::placeholder { color: #9ca3af; }
                .dark .login-input::placeholder { color: #d1d5db; }
                .login-btn {
                    background: linear-gradient(90deg, #ffffff, #fca5a5, #ef4444);
                    border: 1.5px solid #fca5a5;
                    color: #b91c1c;
                    box-shadow: 0 4px 16px rgba(239,68,68,0.25);
                }
                .login-btn:hover {
                    box-shadow: 0 6px 24px rgba(239,68,68,0.45);
                }
                .dark .login-btn {
                    background: linear-gradient(90deg, #ffffff, #67e8f9, #06b6d4);
                    border: 1.5px solid #67e8f9;
                    color: #0e7490;
                    box-shadow: 0 4px 16px rgba(6,182,212,0.25);
                }
                .dark .login-btn:hover {
                    box-shadow: 0 6px 24px rgba(6,182,212,0.5);
                }
            `}</style>

            {/* Theme Toggle */}
            <div className='absolute top-6 right-6'>
                <ThemeToggle />
            </div>
            
            <div className='max-w-sm w-full space-y-5'>
                <div className='text-center'>
                    <div className='flex items-center justify-center gap-4 mb-4'>
                        {/* Enhanced Logo */}
                        <div className='relative'>
                            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 via-green-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-all duration-500 group'>
                                <div className='relative'>
                                    <Mountain className='w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300' />
                                    <Compass className='absolute -top-1 -right-1 w-4 h-4 text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin' style={{ animationDuration: '3s' }} />
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-60 blur-sm animate-pulse'></div>
                            <div className='absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-70 blur-sm'></div>
                        </div>
                        <div className='flex flex-col items-start'>
                            <h1 className='text-5xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent'>TrekTales</h1>
                            <div className='flex items-center gap-2 mt-1'>
                                <span className='text-sm font-medium text-gray-500 dark:text-gray-400'>Your story continues</span>
                                <div className='flex gap-1'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                                    <div className='w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-100'></div>
                                    <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className='text-lg text-gray-600 dark:text-gray-400'>The world is waiting. Your stories are too.</p>
                </div>
                
                {/* Rainbow animated border wrapper */}
                <div className='rainbow-border-anim mt-6 rounded-2xl shadow-2xl' style={{ padding: '3px' }}>
                <form onSubmit={signupHandler} className='login-card rounded-2xl'>

                    <div className='p-5 space-y-4'>

                        {/* Card heading */}
                        <div className='mb-2'>
                            <h2 className='text-lg font-bold text-gray-800 dark:text-white tracking-wide'>Welcome Back</h2>
                            <p className='text-xs text-gray-500 dark:text-gray-300 mt-0.5'>Sign in to continue your journey</p>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className='flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-200'>
                                <Mail className='w-3 h-3 text-gray-500 dark:text-gray-300' />
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                placeholder="Enter your email"
                                className="login-input w-full px-3 py-2.5 focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition-colors text-sm"
                                style={{ borderRadius: '0px 8px 0px 8px' }}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className='flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-200'>
                                <Lock className='w-3 h-3 text-gray-500 dark:text-gray-300' />
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={changeEventHandler}
                                placeholder="Enter your password"
                                className="login-input w-full px-3 py-2.5 focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition-colors text-sm"
                                style={{ borderRadius: '0px 8px 0px 8px' }}
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <div className='pt-1'>
                            {loading ? (
                                <button
                                    disabled
                                    className='login-btn w-full py-2.5 px-4 font-bold text-sm tracking-wide flex items-center justify-center transition-all duration-300'
                                    style={{
                                        borderRadius: '0px 10px 0px 10px',
                                        opacity: 0.75,
                                        cursor: 'not-allowed',
                                    }}
                                >
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Signing in...
                                </button>
                            ) : (
                                <button
                                    type='submit'
                                    className='login-btn w-full py-2.5 px-4 font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                                    style={{
                                        borderRadius: '0px 10px 0px 10px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className='flex items-center gap-3'>
                            <div className='flex-1 h-px bg-gray-200 dark:bg-gray-600' />
                            <span className='text-xs font-medium text-gray-400 dark:text-gray-400'>OR</span>
                            <div className='flex-1 h-px bg-gray-200 dark:bg-gray-600' />
                        </div>

                        {/* Sign Up Link */}
                        <div className='text-center'>
                            <span className='text-xs text-gray-500 dark:text-gray-300'>
                                Don't have an account?{' '}
                                <Link to="/signup" state={location.state} className='font-bold text-red-500 dark:text-cyan-400 hover:text-red-600 dark:hover:text-cyan-300 transition-colors hover:underline'>
                                    Create one now
                                </Link>
                            </span>
                        </div>

                    </div>
                </form>
                </div>
            </div>
        </div>
    )
}

export default Login