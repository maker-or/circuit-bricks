'use client';

import React, { useState } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import CircuitCanvas from '@/components/CircuitCanvas';

// Define Circuit type inline
interface Circuit {
  name?: string;
  description?: string;
  components: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    props: Record<string, any>;
    size?: { width: number; height: number };
    rotation?: number;
  }>;
  wires: Array<{
    id: string;
    from: { componentId: string; portId: string };
    to: { componentId: string; portId: string };
  }>;
}

const testMarkdown = `# Test Circuit

Here's a simple LED circuit:

\`\`\`circuit
{
  "name": "Simple LED Circuit",
  "description": "Basic LED circuit with current limiting resistor",
  "components": [
    {
      "id": "battery1",
      "type": "battery",
      "position": { "x": 50, "y": 100 },
      "props": { "voltage": 9 }
    },
    {
      "id": "resistor1",
      "type": "resistor",
      "position": { "x": 150, "y": 100 },
      "props": { "resistance": 220 }
    },
    {
      "id": "led1",
      "type": "led",
      "position": { "x": 250, "y": 100 },
      "props": { "color": "red" }
    },
    {
      "id": "ground1",
      "type": "ground",
      "position": { "x": 150, "y": 200 },
      "props": {}
    }
  ],
  "wires": [
    {
      "id": "wire1",
      "from": { "componentId": "battery1", "portId": "positive" },
      "to": { "componentId": "resistor1", "portId": "left" }
    },
    {
      "id": "wire2",
      "from": { "componentId": "resistor1", "portId": "right" },
      "to": { "componentId": "led1", "portId": "anode" }
    },
    {
      "id": "wire3",
      "from": { "componentId": "led1", "portId": "cathode" },
      "to": { "componentId": "ground1", "portId": "terminal" }
    },
    {
      "id": "wire4",
      "from": { "componentId": "battery1", "portId": "negative" },
      "to": { "componentId": "ground1", "portId": "terminal" }
    }
  ]
}
\`\`\`

This is a basic LED circuit with a battery, resistor, LED, and ground connection.`;
export default function TestPage() {
  const [currentCircuit, setCurrentCircuit] = useState<Circuit | null>(null);

  const handleCircuitGenerated = (circuit: Circuit) => {
    console.log('🧪 Test page received circuit:', circuit);
    setCurrentCircuit(circuit);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex">
      <div className="w-1/2 p-4 border-r border-gray-800">
        <h1 className="text-white text-xl mb-4">Test Circuit Markdown</h1>
        <MarkdownRenderer
          content={testMarkdown}
          onCircuitGenerated={handleCircuitGenerated}
        />
      </div>
      <div className="w-1/2">
        <CircuitCanvas circuit={currentCircuit} />
      </div>
    </div>
  );
}

