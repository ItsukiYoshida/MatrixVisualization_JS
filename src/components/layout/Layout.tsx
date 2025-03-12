import React, { ReactNode, useState } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isControlCollapsed, setIsControlCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-grow flex">
        {/* Control Panel */}
        <div className={`${isControlCollapsed ? 'w-12' : 'w-80'} bg-white dark:bg-gray-800 shadow transition-all duration-300 ease-in-out`}>
          <button
            onClick={() => setIsControlCollapsed(!isControlCollapsed)}
            className="absolute top-20 left-0 bg-gray-200 dark:bg-gray-700 p-2 rounded-r-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          >
            {isControlCollapsed ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
          
          {!isControlCollapsed && (
            <div className="p-4 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {children[0]}
            </div>
          )}
        </div>
        
        {/* Visualization Panel */}
        <div className="flex-grow p-4">
          {children[1]}
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            行列演算可視化ツール 2.0 Web版
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;