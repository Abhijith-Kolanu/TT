import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(()=>{
        if(!user){
            // Store the current path to redirect back after login
            const currentPath = location.pathname + location.search;
            navigate("/login", { 
                state: { 
                    from: currentPath,
                    message: "Please login to access this page" 
                }
            });
        }
    },[user, navigate, location])
    
    // Show loading state while checking authentication
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
                </div>
            </div>
        );
    }
    
    return <>{children}</>
}

export default ProtectedRoutes;