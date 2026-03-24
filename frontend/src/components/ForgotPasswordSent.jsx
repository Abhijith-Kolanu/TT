import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, Mountain, Compass } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const ForgotPasswordSent = () => {
    const location = useLocation();
    const email = location.state?.email;

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
                </div>

                <div className='bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-6 text-center space-y-4'>
                    <div className='mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center'>
                        <MailCheck className='w-6 h-6 text-green-600 dark:text-green-300' />
                    </div>

                    <h2 className='text-lg font-bold text-gray-800 dark:text-white'>Check your email</h2>

                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                        If an account exists for this email, we sent a password reset link.
                    </p>

                    {email ? (
                        <p className='text-xs text-gray-500 dark:text-gray-400 break-all'>
                            Sent to: {email}
                        </p>
                    ) : null}

                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Please check your inbox and spam folder.
                    </p>

                    <div className='pt-1 flex flex-col gap-2'>
                        <Link
                            to='/login'
                            className='w-full py-2.5 px-4 font-bold text-sm tracking-wide rounded-md bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 transition-colors'
                        >
                            Back to Sign In
                        </Link>

                        <Link
                            to='/forgot-password'
                            className='text-xs font-semibold text-red-500 dark:text-cyan-400 hover:underline'
                        >
                            Try another email
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordSent;
