"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CornerDownLeft, BrainCircuit, User, Bot, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface Message {
  text: string;
  isUser: boolean;
}

interface MeetingChatProps {
  meetingId: string;
  transcript: string;
  summary: string;
}

export function MeetingChat({ meetingId, transcript, summary }: MeetingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const chatLimit = 100;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim()) return;

    if (chatCount >= chatLimit) {
      return;
    }

    const userMessage: Message = { text: messageToSend, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setChatCount((prev) => prev + 1);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: messageToSend,
          context: `Transcript: ${transcript}\n\nSummary: ${summary}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const aiMessage: Message = { text: data.response, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        text: "**Sorry, I encountered an issue**\n\nPlease try again in a moment. If the problem persists, refresh the page.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    {
      title: "Key Decisions",
      question: "What were the main decisions made in this meeting?",
      description: "Get a summary of important decisions",
      icon: "🎯",
    },
    {
      title: "Action Items",
      question: "Summarize the action items and who is responsible for each",
      description: "See all tasks and owners",
      icon: "✅",
    },
    {
      title: "Meeting Summary",
      question: "Provide a comprehensive summary of the entire meeting",
      description: "Get the full overview",
      icon: "📋",
    },
    {
      title: "Discussion Points",
      question: "What were the most important topics discussed?",
      description: "Review key conversations",
      icon: "💬",
    },
    {
      title: "Timeline & Deadlines",
      question: "What are the key deadlines and timeline discussed?",
      description: "Check important dates",
      icon: "⏰",
    },
    {
      title: "Participant Insights",
      question: "Who said what and what were their main contributions?",
      description: "Understand team input",
      icon: "👥",
    },
  ];

  const MarkdownMessage = ({ text, isUser }: { text: string; isUser: boolean }) => {
    const components: Partial<Components> = {
      h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2 text-blue-600 flex items-center gap-2">{children}</h2>,
      h3: ({ children }) => <h3 className="text-md font-semibold mt-2 mb-1 text-gray-700">{children}</h3>,
      p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
      em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
      blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-2 bg-blue-50 italic text-gray-700 rounded-r">{children}</blockquote>,
      table: ({ children }) => (
        <div className="overflow-x-auto my-2">
          <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">{children}</table>
        </div>
      ),
      th: ({ children }) => <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left">{children}</th>,
      td: ({ children }) => <td className="border border-gray-300 px-3 py-2">{children}</td>,
    };

    return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
  };

  const ChatBubble = ({ message, index }: { message: Message; index: number }) => {
    return (
      <div className={`flex items-start gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
        {!message.isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}

        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.isUser ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md" : "bg-gray-50 border border-gray-100 rounded-bl-md"}`}>
          <div className={message.isUser ? "text-white" : "text-gray-800"}>
            <MarkdownMessage text={message.text} isUser={message.isUser} />
          </div>
          <div className={`text-xs mt-2 ${message.isUser ? "text-blue-100" : "text-gray-500"}`}>{message.isUser ? "You" : "AI Assistant"}</div>
        </div>

        {message.isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  const ExampleQuestionCard = ({ title, question, description, icon }: { title: string; question: string; description: string; icon: string }) => {
    return (
      <button
        onClick={() => handleSend(question)}
        disabled={isLoading}
        className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
            <span className="text-lg">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
              <ArrowRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-t-2xl">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">Meeting AI Assistant</h3>
          <p className="text-sm text-gray-600">Ask me anything about this meeting • {chatLimit - chatCount} questions remaining</p>
        </div>
        {chatCount > 0 && (
          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
            {chatCount}/{chatLimit}
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/30">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Start a conversation</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">Ask questions about decisions, action items, or specific topics discussed in the meeting.</p>

            {/* Example Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
              {exampleQuestions.map((question, index) => (
                <ExampleQuestionCard key={index} title={question.title} question={question.question} description={question.description} icon={question.icon} />
              ))}
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-md mx-auto">
              <p className="text-xs text-gray-600 text-center">
                <strong>Tip:</strong> You can ask follow-up questions or request more details about any response
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} index={index} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="max-w-[85%] rounded-2xl p-4 shadow-sm bg-gray-50 border border-gray-100 rounded-bl-md">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm text-gray-600">Analyzing meeting content...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl">
        {chatCount >= chatLimit ? (
          <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="text-orange-600 font-semibold mb-1">Chat Limit Reached</div>
            <p className="text-sm text-orange-500">You've used all {chatLimit} questions. Refresh the page to start a new chat session.</p>
          </div>
        ) : (
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question about the meeting... (${chatLimit - chatCount} remaining)`}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
              disabled={isLoading}
              className="pr-12 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
