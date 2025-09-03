import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
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
                navigate("/");
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
        }
    },[])
    return (
        <div className='flex items-center w-screen h-screen justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
            {/* Theme Toggle */}
            <div className='absolute top-4 right-4'>
                <ThemeToggle />
            </div>
            
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700'>
                <div className='my-4'>
                    <h1 className='text-center font-bold text-xl text-gray-900 dark:text-white'>TrekTales</h1>
                    <p className='text-sm text-center text-gray-600 dark:text-gray-400'>Login to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                </div>
                <div>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit'>Login</Button>
                    )
                }

                <span className='text-center text-gray-600 dark:text-gray-400'>Don't have an account? <Link to="/signup" className='text-blue-600 dark:text-blue-400'>Signup</Link></span>
            </form>
        </div>
    )
}

export default Login