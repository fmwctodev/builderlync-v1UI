import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export const useAutoLogout = () => {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      dispatch(logout());
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dispatch]);
};