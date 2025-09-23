"use client"

import { useState } from 'react'

export default function AnunciarPageTest() {
  const [test, setTest] = useState("")

  const handleTest = () => {
    console.log("test")
  }

  return (
    <div className="min-h-screen bg-background">
      <h1>Test Page</h1>
    </div>
  )
}
