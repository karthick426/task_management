import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export const Layout = ({ children, activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-text">
      {/* Sidebar navigation panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main workspace frame */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        {/* Dynamic header pane */}
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {/* Main scrolling viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pt-20 md:pt-8 bg-brand-bg relative">
          {/* Animated blurred floating background accent blobs */}
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none -z-10 animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none -z-10 animate-blob [animation-delay:4s]" />
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-brand-accent/5 blur-[90px] pointer-events-none -z-10 animate-blob [animation-delay:2s]" />
          
          {children}
        </main>
      </div>
    </div>
  );
};
