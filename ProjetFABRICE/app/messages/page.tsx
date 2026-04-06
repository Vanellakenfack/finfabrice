'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function MessagesPage() {

  const searchParams = useSearchParams()
  const vendorId = searchParams.get('vendor')

  const [messages, setMessages] = useState([
    { from: "vendor", text: "Bonjour 👋 comment puis-je vous aider ?" }
  ])
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim()) return

    setMessages([
      ...messages,
      { from: "user", text: newMessage }
    ])

    setNewMessage("")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* HEADER */}
      <div className="bg-white p-4 shadow flex justify-between items-center">
        <h1 className="font-bold text-lg">
          Discussion avec vendeur #{vendorId}
        </h1>
      </div>

      {/* CHAT */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xs p-3 rounded-2xl text-sm ${
              msg.from === "user"
                ? "ml-auto bg-orange-500 text-white"
                : "bg-white border"
            }`}
          >
            {msg.text}
          </div>
        ))}

      </div>

      {/* INPUT */}
      <div className="bg-white p-4 flex gap-2 border-t">

        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          onClick={sendMessage}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          Envoyer
        </button>

      </div>

    </div>
  )
}