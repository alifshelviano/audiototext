'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, CornerDownLeft, BrainCircuit } from 'lucide-react';

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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const chatLimit = 5;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (chatCount >= chatLimit) {
        // Maybe show a specific message that limit is reached
        return;
    }

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setChatCount(prev => prev + 1);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: input, 
                context: `Transcript: ${transcript}\n\nSummary: ${summary}`
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get response from AI');
        }

        const data = await response.json();
        const aiMessage: Message = { text: data.response, isUser: false };
        setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: Message = { text: 'Sorry, I had trouble getting a response. Please try again.', isUser: false };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex flex-col h-[600px]">
      <div className="flex items-center gap-3 mb-4 border-b pb-3">
        <BrainCircuit className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="font-semibold text-lg">Meeting AI Assistant</h3>
          <p className="text-sm text-gray-500">Ask me anything about this meeting</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : ''}`}>
                {!msg.isUser && <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">🤖</div>}
                <div className={`max-w-md p-3 rounded-xl ${msg.isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
                {msg.isUser && <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">👤</div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">🤖</div>
                <div className="max-w-md p-3 rounded-xl bg-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4 pt-4 border-t">
        {chatCount >= chatLimit ? (
            <div className="text-center text-sm text-gray-500">
                You have reached the chat limit of {chatLimit} questions.
            </div>
        ) : (
            <div className="relative">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Ask a question... (${chatLimit - chatCount} left)`}
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                    className="pr-12"
                />
                <Button 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleSend}
                    disabled={isLoading}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
