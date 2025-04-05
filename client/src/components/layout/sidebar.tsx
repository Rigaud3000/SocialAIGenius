import { useLocation } from "wouter";
import { Dispatch, SetStateAction, useState } from "react";
import { cn } from "@/lib/utils";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

// Define the account type to resolve the type error
interface SocialAccount {
  id: number;
  userId: number;
  platformId: number;
  accountName: string;
  connected: boolean;
  stats: any;
  platform?: {
    id: number;
    name: string;
    slug: string;
    iconUrl?: string;
  };
}

// Props for the Sidebar component
interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  // Query to get connected accounts
  const { data: accounts } = useQuery<SocialAccount[]>({
    queryKey: ["/api/accounts"],
    staleTime: 60000, // 1 minute
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <aside className={cn(
      "w-64 flex-shrink-0 md:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm",
      open ? "fixed inset-y-0 z-50 flex" : "hidden"
    )}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">SocialAI</h1>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </div>
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/content-creator" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/content-creator"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Content Creator
        </div>
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/content-editor" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/content-editor"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Multi-Platform Editor
        </div>
        
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/scheduler" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/scheduler"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Scheduler
        </div>
        
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/analytics" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/analytics"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics
        </div>
        
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/ai-assistant" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/ai-assistant"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          AI Assistant
        </div>
        
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/competitive-analysis" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/competitive-analysis"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Competitive Analysis
        </div>

        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
            location === "/web3-integration" 
              ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          )}
          onClick={() => window.location.href = "/web3-integration"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Web3 Integration
        </div>

        {/* Platform Connections */}
        <div className="pt-2 space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Platform Connections
          </h3>
          
          <div
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
              location === "/connect-accounts" 
                ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary" 
                : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            )}
            onClick={() => window.location.href = "/connect-accounts"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Accounts
          </div>
          
          {accounts && accounts.map((account: SocialAccount) => (
            <div 
              key={account.id}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                {account.platform?.slug === 'facebook' && <FaFacebook className="h-5 w-5 text-blue-500" />}
                {account.platform?.slug === 'instagram' && <FaInstagram className="h-5 w-5 text-pink-500" />}
                {account.platform?.slug === 'twitter' && <FaTwitter className="h-5 w-5 text-blue-400" />}
                {account.platform?.slug === 'linkedin' && <FaLinkedin className="h-5 w-5 text-blue-700" />}
                {account.platform?.slug === 'youtube' && <FaYoutube className="h-5 w-5 text-red-600" />}
              </div>
              {account.platform?.name || account.accountName}
            </div>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="dark-mode-toggle" 
                type="checkbox" 
                className="sr-only" 
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <div className="block w-10 h-6 bg-gray-300 rounded-full"></div>
              <div className={cn(
                "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all",
                darkMode && "transform translate-x-4"
              )}></div>
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
}
