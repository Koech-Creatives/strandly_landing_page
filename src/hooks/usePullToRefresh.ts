import { useEffect, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  threshold = 60, 
  disabled = false 
}: UsePullToRefreshOptions) => {
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const isRefreshing = useRef<boolean>(false);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the page
      if (window.scrollY > 0) return;
      
      touchStartY.current = e.touches[0].clientY;
      touchCurrentY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;
      
      touchCurrentY.current = e.touches[0].clientY;
      const pullDistance = touchCurrentY.current - touchStartY.current;
      
      if (pullDistance > threshold && !isRefreshing.current) {
        // Show pull to refresh indicator
        document.documentElement.style.setProperty('--pull-distance', `${Math.min(pullDistance, threshold * 1.5)}px`);
        e.preventDefault();
      }
    };

    const handleTouchEnd = async (_e: TouchEvent) => {
      if (!isPulling.current) return;
      
      const pullDistance = touchCurrentY.current - touchStartY.current;
      
      if (pullDistance >= threshold && !isRefreshing.current) {
        isRefreshing.current = true;
        document.documentElement.style.setProperty('--pull-distance', '60px');
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          isRefreshing.current = false;
        }
      }
      
      // Reset
      document.documentElement.style.setProperty('--pull-distance', '0px');
      touchStartY.current = 0;
      touchCurrentY.current = 0;
      isPulling.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, disabled]);
};

