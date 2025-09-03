import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import axios from 'axios';

const useAuthCheck = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/user/me', {
                    withCredentials: true
                });
                
                if (res.data.success) {
                    dispatch(setAuthUser(res.data.user));
                }
            } catch (error) {
                // User is not authenticated, clear the auth state
                dispatch(setAuthUser(null));
                console.log('Authentication check failed:', error.response?.data?.message || error.message);
            }
        };
        
        checkAuth();
    }, [dispatch]);
};

export default useAuthCheck;
