import { useState, useEffect } from 'react';

/**
 * useViewport Custom Hook
 * Provides reactive screen dimensions and device categorization.
 */
export const useViewport = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      // Debounce slightly for smooth performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { width, height } = dimensions;

  const isSmallMobile = width < 375;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1440;

  let breakpoint = 'xs (<375px)';
  if (width >= 1440) breakpoint = '2xl (>=1440px)';
  else if (width >= 1280) breakpoint = 'xl (>=1280px)';
  else if (width >= 1024) breakpoint = 'lg (>=1024px)';
  else if (width >= 768) breakpoint = 'md (>=768px)';
  else if (width >= 640) breakpoint = 'sm (>=640px)';
  else if (width >= 375) breakpoint = 'xs (>=375px)';

  return {
    width,
    height,
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint,
  };
};

