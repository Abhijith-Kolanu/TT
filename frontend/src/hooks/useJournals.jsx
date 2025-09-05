import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

function useGetAllJournals() {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:8000/api/v1/journal', {
                    withCredentials: true
                });
                
                if (res.data.success) {
                    setJournals(res.data.journals || []);
                } else {
                    setError(res.data.message || 'Failed to fetch journals');
                }
            } catch (error) {
                console.error('Error fetching journals:', error);
                setError(error.response?.data?.message || 'Failed to fetch journals');
                // Don't show error toast for empty journal list
                if (error.response?.status !== 404) {
                    toast.error(error.response?.data?.message || 'Failed to fetch journals');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, []);

    const refetch = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/v1/journal', {
                withCredentials: true
            });
            
            if (res.data.success) {
                setJournals(res.data.journals || []);
            } else {
                setError(res.data.message || 'Failed to fetch journals');
            }
        } catch (error) {
            console.error('Error refetching journals:', error);
            setError(error.response?.data?.message || 'Failed to fetch journals');
        } finally {
            setLoading(false);
        }
    };

    return { journals, loading, error, setJournals, refetch };
}

export default useGetAllJournals;
