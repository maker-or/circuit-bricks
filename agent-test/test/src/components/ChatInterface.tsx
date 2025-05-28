'use client';

import { FormEvent } from 'react';
import { Message } from '@ai-sdk/react';
import MarkdownRenderer from './MarkdownRenderer';
import { type Circuit } from '@/schemas/circuitSchema';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  onCircuitGenerated?: (circuit: Circuit) => void;
}

export default function ChatInterface({ messages, input, handleInputChange, handleSubmit, status, onCircuitGenerated }: ChatInterfaceProps) {

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c]">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Circuit-Bricks AI Agent</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">


        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="text-sm font-medium mb-1 opacity-75">
                {message.role === 'user' ? 'You' : 'AI Agent'}
              </div>
              {message.role === 'user' ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div>
                  {(() => {
                    // Debug logging for AI messages
                    console.log('💬 Processing AI message:', {
                      id: message.id,
                      contentLength: message.content.length,
                      hasCircuitBlock: message.content.includes('```circuit'),
                      hasComponents: message.content.includes('"components"'),
                      hasWires: message.content.includes('"wires"'),
                      preview: message.content.substring(0, 100) + '...'
                    });
                    return null;
                  })()}
                  <MarkdownRenderer
                    content={message.content}
                    onCircuitGenerated={onCircuitGenerated}
                  />
                </div>
              )}

              {/* Display tool calls */}
              {message.parts && message.parts.map((part, index) => {
                if (part.type === 'tool-invocation') {
                  return (
                    <div key={index} className="mt-3 p-2 bg-gray-700 rounded text-xs">
                      <div className="font-medium text-yellow-400 mb-1">
                        🔧 {part.toolInvocation.toolName}
                      </div>
                      {part.toolInvocation.state === 'result' && part.toolInvocation.result && (
                        <div className="text-gray-300">
                          <pre className="whitespace-pre-wrap overflow-x-auto">
                            {typeof part.toolInvocation.result === 'string'
                              ? part.toolInvocation.result
                              : JSON.stringify(part.toolInvocation.result, null, 2)
                            }
                          </pre>
                        </div>
                      )}
                      {part.toolInvocation.state === 'call' && (
                        <div className="text-gray-400 text-xs">
                          Executing...
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {(status === 'submitted' || status === 'streaming') && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="text-sm font-medium mb-1 opacity-75">AI Agent</div>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={(e) => {
          console.log('🚀 Form submitted with input:', input);
          handleSubmit(e);
        }} className="flex space-x-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about circuits, components, or request a circuit design..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === 'submitted' || status === 'streaming'}
          />
          <button
            type="submit"
            disabled={status === 'submitted' || status === 'streaming' || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
