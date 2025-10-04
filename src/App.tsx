import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/common/Header';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { LoginPage } from '@/components/auth/LoginPage';
import { cn } from '@/lib/utils';

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}

function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'border-r bg-background transition-all duration-300 relative',
            'lg:translate-x-0',
            !isMobile && isSidebarCollapsed ? 'w-16' : 'w-80',
            isMobile && (isSidebarOpen ? 'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)]' : 'fixed -translate-x-full')
          )}
        >
          <ConversationSidebar 
            onClose={() => setIsSidebarOpen(false)} 
            isCollapsed={!isMobile && isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SessionProvider>
            <ConversationProvider>
              <AuthenticatedApp />
            </ConversationProvider>
          </SessionProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;