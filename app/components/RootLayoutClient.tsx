// app/components/RootLayoutClient.tsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { BottomNavigation } from './BottomNavigation';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export const RootLayoutClient = ({ children }: RootLayoutClientProps) => {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <Navbar time={currentTime} />

      <div className="px-4 py-5 pb-24">
        {children}
      </div>

      <BottomNavigation />
    </div>
  );
};
