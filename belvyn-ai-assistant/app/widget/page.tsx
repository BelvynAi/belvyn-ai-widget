"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const WEBHOOK_URL = "https://n8n.srv896614.hstgr.cloud/webhook/c469aedf-7307-4f41-a472-f991fdaf90a5/chat"

const STARTER_PROMPTS = [
  "What are AI Agents?",
  "How can Belvyn help my team?",
  "What kind of AI solutions do you offer?",
]

// Utility function to generate session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

// Utility function to extract text from response
const extractTextFromResponse = (response: any): string => {
  if (typeof response === "string") {
    return response
  }

  if (typeof response === "object" && response !== null) {
    // Try common JSON response patterns
    if (response.reply) return response.reply
    if (response.output) return response.output
    if (response.message) return response.message
    if (response.text) return response.text

    // If it's an object but no recognized pattern, stringify it
    return JSON.stringify(response)
  }

  return String(response)
}

// Icons as inline SVGs
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
)

export default function BelvynWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showStarterPrompts, setShowStarterPrompts] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem("belvyn-session-id")
    if (!storedSessionId) {
      storedSessionId = generateSessionId()
      localStorage.setItem("belvyn-session-id", storedSessionId)
    }
    setSessionId(storedSessionId)

    // Optionally restore transcript
    const storedMessages = localStorage.getItem("belvyn-transcript")
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages)
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        )
        setShowStarterPrompts(parsed.length === 0)
      } catch (e) {
        console.error("Failed to restore transcript:", e)
      }
    }
  }, [])

  // Save transcript to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("belvyn-transcript", JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && transcriptRef.current) {
      const transcript = transcriptRef.current
      const isNearBottom = transcript.scrollTop + transcript.clientHeight >= transcript.scrollHeight - 100

      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Prevent scroll propagation
  useEffect(() => {
    const transcript = transcriptRef.current
    if (!transcript) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()

      const { scrollTop, scrollHeight, clientHeight } = transcript
      const isAtTop = scrollTop === 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight

      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation()
    }

    transcript.addEventListener("wheel", handleWheel, { passive: false })
    transcript.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      transcript.removeEventListener("wheel", handleWheel)
      transcript.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !sessionId) return

    // Handle /clear command
    if (messageText.trim() === "/clear") {
      setMessages([])
      setShowStarterPrompts(true)
      localStorage.removeItem("belvyn-transcript")
      setInput("")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    setShowStarterPrompts(false)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: messageText.trim(),
          sessionId: sessionId,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.text()
      let assistantText: string

      try {
        // Try to parse as JSON first
        const jsonData = JSON.parse(responseData)
        assistantText = extractTextFromResponse(jsonData)
      } catch {
        // If not JSON, use as plain text
        assistantText = responseData
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Error sending message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleStarterPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  const retryLastMessage = () => {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Simple markdown renderer for basic formatting
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 py-0.5 rounded text-sm">$1</code>')
  }

  return (
    <div className="relative flex flex-col h-screen bg-belvyn-0 text-belvyn-0 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-belvyn-0 to-belvyn-0 bg-gradient-to-b from-belvyn-0 via-belvyn-0 to-purple-900/10 belvyn-shadow">
        <h1 className="text-lg font-semibold text-belvyn-0">Belvyn AI Assistant</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([])
              setShowStarterPrompts(true)
              localStorage.removeItem("belvyn-transcript")
              setInput("")
              setError(null)
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-belvyn-1 transition-colors duration-200"
            aria-label="Reset chat"
            title="Reset chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
          <button
            onClick={() => window.parent.postMessage({ type: "CLOSE_BELVYN_CHAT" }, "*")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-belvyn-1 transition-colors duration-200"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-28"
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {showStarterPrompts && messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-belvyn-1 text-center mb-6">How can I help you today?</p>
            <div className="flex flex-col gap-2">
              {STARTER_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="bg-belvyn-1 border-belvyn hover:bg-user text-belvyn-1 hover:text-belvyn-0 text-left justify-start h-auto p-3 rounded-2xl transition-all duration-200"
                  onClick={() => handleStarterPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%] space-y-1">
              <div
                className={`p-3 rounded-2xl ${
                  message.role === "user" ? "bg-user text-belvyn-0" : "bg-assistant text-white"
                } belvyn-shadow transition-all duration-200`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(message.content),
                  }}
                  className="whitespace-pre-wrap break-words"
                />
              </div>
              <div className={`text-xs text-belvyn-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] space-y-1">
              <div className="bg-assistant text-white p-3 rounded-2xl belvyn-shadow">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">typing</span>
                  <div className="flex space-x-1">
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-2xl max-w-md text-center">
              <p className="text-sm mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                onClick={retryLastMessage}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-belvyn-0 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full bg-belvyn-1 border-0 text-belvyn-0 placeholder-belvyn-2 rounded-2xl px-4 py-3 pr-12 resize-none min-h-[48px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all duration-200 belvyn-shadow"
              rows={1}
              style={{
                height: "auto",
                minHeight: "48px",
                maxHeight: "120px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = Math.min(target.scrollHeight, 120) + "px"
              }}
            />
            {input.length > 900 && (
              <div className="absolute -top-6 right-0 text-xs text-yellow-400">
                {input.length > 1000 ? "Message too long" : `${1000 - input.length} chars left`}
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || input.length > 1000}
            className="bg-brand hover:bg-brand-2 text-white rounded-2xl px-4 py-3 h-12 transition-all duration-200 belvyn-glow"
          >
            <SendIcon />
          </Button>
        </form>
        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-3 text-xs text-belvyn-2">
          <a
            href="https://belvynai.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-belvyn-1 transition-colors duration-200"
          >
            Privacy
          </a>
          <span>
            Powered by <span style={{ color: "#4015b1" }}>Belvyn</span>
          </span>
        </div>
      </div>
    </div>
  )
}
