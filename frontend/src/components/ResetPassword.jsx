import React, { useState } from 'react';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [input, setInput] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const changeHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (input.password !== input.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);

            const apiBaseUrl = import.meta.env.VITE_API_URL;
            if (!apiBaseUrl) {
                toast.error('API URL is not configured. Please contact support.');
                return;
            }

            const res = await axios.post(
                `${apiBaseUrl}/api/v1/user/reset-password/${token}`,
                { password: input.password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                    timeout: 60000
                }
            );

            toast.success(res.data.message || 'Password reset successful');
            navigate('/login');
        } catch (error) {
            console.log(error);
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Backend may be waking up. Please try once more.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to reset password');
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
                    <div className='mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl mb-3'>
                        <ShieldCheck className='w-7 h-7 text-white' />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Reset Password</h1>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Choose a new password for your account</p>
                </div>

                <form onSubmit={handleSubmit} className='bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-5 space-y-4'>
                    <div>
                        <label htmlFor='password' className='flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-200'>
                            <Lock className='w-3 h-3 text-gray-500 dark:text-gray-300' />
                            New Password
                        </label>
                        <Input
                            id='password'
                            type='password'
                            name='password'
                            value={input.password}
                            onChange={changeHandler}
                            placeholder='Enter new password'
                            className='w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor='confirmPassword' className='flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-200'>
                            <Lock className='w-3 h-3 text-gray-500 dark:text-gray-300' />
                            Confirm Password
                        </label>
                        <Input
                            id='confirmPassword'
                            type='password'
                            name='confirmPassword'
                            value={input.confirmPassword}
                            onChange={changeHandler}
                            placeholder='Confirm new password'
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
                            Updating...
                        </button>
                    ) : (
                        <button
                            type='submit'
                            className='w-full py-2.5 px-4 font-bold text-sm tracking-wide rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 transition-colors'
                        >
                            Update Password
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

export default ResetPassword;
