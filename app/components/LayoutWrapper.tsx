"use client"

import type React from "react"

import { Navbar } from "./Navbar"
import { BottomNavigation } from "./BottomNavigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <Navbar />
      <div className="px-4 py-5">{children}</div>
      <BottomNavigation />
    </div>
  )
}