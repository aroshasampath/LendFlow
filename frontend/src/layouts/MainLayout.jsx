import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { fetchSystemHealth } from '../services/api';

export const MainLayout = ({ children }) => {
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const response = await fetchSystemHealth();
        if (isMounted && response?.status === 'healthy') {
          setIsLiveConnected(true);
        }
      } catch (err) {
        if (isMounted) setIsLiveConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Periodic polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-slate-800">
      <Navbar isLiveConnected={isLiveConnected} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

