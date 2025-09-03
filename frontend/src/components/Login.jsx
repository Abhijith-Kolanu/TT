import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
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
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        } else if (location.state?.message) {
            // Show message if user was redirected here
            toast.info(location.state.message);
        }
    },[user, location.state])
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 transition-colors duration-200'>
            {/* Theme Toggle */}
            <div className='absolute top-6 right-6'>
                <ThemeToggle />
            </div>
            
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>TrekTales</h1>
                    <p className='text-lg text-gray-600 dark:text-gray-400'>Share your adventures & discover amazing travel stories</p>
                </div>
                
                <form onSubmit={signupHandler} className='mt-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700'>
                    <div className='space-y-4'>
                        <div>
                            <label htmlFor="email" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={changeEventHandler}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className='pt-4'>
                        {loading ? (
                            <Button disabled className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center'>
                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                Signing in...
                            </Button>
                        ) : (
                            <Button type='submit' className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors'>
                                Sign In
                            </Button>
                        )}
                    </div>

                    <div className='text-center pt-4 border-t border-gray-200 dark:border-gray-700'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Don't have an account?{' '}
                            <Link to="/signup" state={location.state} className='font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors'>
                                Create one now
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login