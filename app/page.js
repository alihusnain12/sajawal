"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.push("first")
    }, 3000);
  }, [router])  // Adding router to the dependency array to avoid missing updates
  
  return (
    <div className="bg-gradient-to-r from-black  to-gray-500 flex justify-center items-center h-screen">
      <p className="text-white text-6xl font-extrabold text-center animate-bounce">
        Afzal & Co
      </p>
    </div>
  )
}

export default Page
