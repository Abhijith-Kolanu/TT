import React, { useState } from 'react';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mountain, Compass, Mail } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const apiBaseUrl = import.meta.env.VITE_API_URL;
            if (!apiBaseUrl) {
                toast.error('API URL is not configured. Please contact support.');
                return;
            }

            const res = await axios.post(
                `${apiBaseUrl}/api/v1/user/forgot-password`,
                { email },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                    timeout: 15000
                }
            );

            toast.success(res.data.message || 'Password reset request submitted');
            const submittedEmail = email;
            setEmail('');
            navigate('/forgot-password/sent', {
                state: { email: submittedEmail }
            });
        } catch (error) {
            console.log(error);
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please check backend URL and try again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to submit request');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 transition-colors duration-200'>
            <div className='absolute top-6 right-6'>
                <ThemeToggle />
            </div>

            <div className='max-w-sm w-full space-y-5'>
                <div className='text-center'>
                    <div className='flex items-center justify-center gap-4 mb-4'>
                        <div className='relative'>
                            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 via-green-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-12'>
                                <div className='relative'>
                                    <Mountain className='w-8 h-8 text-white' />
                                    <Compass className='absolute -top-1 -right-1 w-4 h-4 text-orange-200' />
                                </div>
                            </div>
                        </div>
                        <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent'>TrekTales</h1>
                    </div>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>Enter your email to request a password reset</p>
                </div>

                <form onSubmit={handleSubmit} className='bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-5 space-y-4'>
                    <div>
                        <label htmlFor='email' className='flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-200'>
                            <Mail className='w-3 h-3 text-gray-500 dark:text-gray-300' />
                            Email Address
                        </label>
                        <Input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter your email'
                            className='w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
                            required
                        />
                    </div>

                    {loading ? (
                        <button
                            disabled
                            className='w-full py-2.5 px-4 font-bold text-sm tracking-wide flex items-center justify-center rounded-md bg-gray-300 text-gray-700 cursor-not-allowed'
                        >
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Submitting...
                        </button>
                    ) : (
                        <button
                            type='submit'
                            className='w-full py-2.5 px-4 font-bold text-sm tracking-wide rounded-md bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 transition-colors'
                        >
                            Send Reset Link
                        </button>
                    )}

                    <div className='text-center'>
                        <Link to='/login' className='text-xs font-semibold text-red-500 dark:text-cyan-400 hover:underline'>
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
