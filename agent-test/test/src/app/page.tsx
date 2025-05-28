'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ChatInterface from '@/components/ChatInterface';
import { type Circuit } from '@/schemas/circuitSchema';

export default function Home() {
  const [currentCircuit, setCurrentCircuit] = useState<Circuit | null>(null);
  const [circuitProcessingStatus, setCircuitProcessingStatus] = useState<string>('No circuit');

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      console.log('✅ Message completed, checking for circuits...', {
        messageLength: message.content.length,
        hasCircuitBlock: message.content.includes('```circuit'),
        preview: message.content.substring(0, 200) + '...'
      });

      // Check for circuit generation in tool calls
      if (message.parts) {
        for (const part of message.parts) {
          if (part.type === 'tool-invocation' &&
              part.toolInvocation.toolName === 'generateCircuit' &&
              part.toolInvocation.state === 'result' &&
              part.toolInvocation.result?.circuit) {
            setCurrentCircuit(part.toolInvocation.result.circuit);
            break;
          }
        }
      }

      // Also check for circuit blocks in the completed message content
      if (message.content.includes('```circuit')) {
        console.log('🔍 Found circuit block in completed message, attempting to extract...');
        console.log('📄 Full message content:', message.content);
        
        // Extract circuit blocks from the completed content
        const circuitBlockRegex = /```circuit\s*\n([\s\S]*?)\n```/g;
        let match;
        
        while ((match = circuitBlockRegex.exec(message.content)) !== null) {
          const circuitJson = match[1].trim();
          console.log('📝 Extracted circuit JSON:', circuitJson);
          
          try {
            const parsedCircuit = JSON.parse(circuitJson);
            console.log('✅ Circuit parsed successfully:', parsedCircuit);
            
            // Import and validate the circuit using our schema
            import('../schemas/circuitSchema').then(({ validateCircuit }) => {
              const validation = validateCircuit(parsedCircuit);
              if (validation.success) {
                console.log('✅ Circuit validation successful in onFinish:', validation.data);
                console.log('🎯 Setting current circuit in main page...');
                setCurrentCircuit(validation.data);
                setCircuitProcessingStatus(`Circuit loaded: ${validation.data.name || 'Unnamed'}`);
              } else {
                console.error('❌ Circuit validation failed in onFinish:', validation.error);
                setCircuitProcessingStatus(`Validation failed: ${validation.error}`);
              }
            }).catch(error => {
              console.error('❌ Failed to import validation schema:', error);
            });
            
            break; // Only process the first circuit found
          } catch (error) {
            console.error('❌ Failed to parse circuit JSON in onFinish:', error);
            console.log('📝 Raw JSON that failed to parse:', circuitJson);
          }
        }
      } else {
        console.log('ℹ️ No circuit block found in completed message');
      }
    },
  });

  // Handle circuit generation from markdown
  const handleCircuitGenerated = (circuit: Circuit) => {
    console.log('🏠 Main page received circuit from markdown:', circuit);
    console.log('🏠 Circuit details:', {
      name: circuit.name,
      components: circuit.components?.length || 0,
      wires: circuit.wires?.length || 0
    });
    setCurrentCircuit(circuit);
    setCircuitProcessingStatus(`Circuit from markdown: ${circuit.name || 'Unnamed'}`);
    console.log('🏠 Circuit state updated, currentCircuit set to:', circuit);
  };

  return (
    <div className="h-screen bg-[#0c0c0c] flex">
      {/* Debug Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900 text-xs text-gray-400 px-4 py-1 z-10">
        Status: {circuitProcessingStatus} | Messages: {messages.length} | Chat Status: {status}
      </div>
      
      {/* Main Chat Interface - Full Width */}
      <div className="w-full pt-6">
        <ChatInterface
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          status={status}
          onCircuitGenerated={handleCircuitGenerated}
        />
      </div>
    </div>
  );
}
