import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen theme-transition" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden relative">
          {/* Subtle background decoration */}
          <div 
            className="absolute top-0 left-0 w-full h-96 pointer-events-none z-0"
            style={{ 
              background: theme === 'dark' 
                ? 'linear-gradient(to bottom, rgba(2,132,199,0.05), transparent)' 
                : 'linear-gradient(to bottom, rgba(2,132,199,0.03), transparent)' 
            }}
          ></div>
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
