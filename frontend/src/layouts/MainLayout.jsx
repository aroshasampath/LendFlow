import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { fetchSystemHealth } from '../services/api';

/**
 * Universal Full-Width MainLayout
 * Ensures Header, Main Content, and Footer span the full page width
 * with zero awkward margins or empty offsets.
 */
export const MainLayout = ({ children }) => {
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const response = await fetchSystemHealth();
        if (isMounted && response?.status === 'healthy') {
          setIsLiveConnected(true);
        }
      } catch {
        if (isMounted) setIsLiveConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col w-full overflow-x-hidden">
      {/* Slide-out Sidebar Navigation Drawer */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
      />

      {/* Full-width Top Navigation Header (Edge-to-Edge) */}
      <Navbar
        isLiveConnected={isLiveConnected}
        onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)}
      />

      {/* Full-width Centered Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>

      {/* Full-width Footer (Edge-to-Edge) */}
      <Footer />
    </div>
  );
};
