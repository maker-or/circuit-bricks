'use client';

import MarkdownRenderer from '../../components/MarkdownRenderer';

export default function SimpleTestPage() {
  const simpleCircuitMarkdown = `# Circuit Test

Here's a simple circuit with ONLY available components:

\`\`\`circuit
{
  "name": "Simple Test Circuit",
  "description": "A basic test circuit using only available components",
  "components": [
    {
      "id": "resistor1",
      "type": "resistor",
      "position": { "x": 100, "y": 100 },
      "props": { "resistance": 1000 }
    },
    {
      "id": "battery1",
      "type": "battery",
      "position": { "x": 200, "y": 100 },
      "props": { "voltage": 9 }
    },
    {
      "id": "ground1",
      "type": "ground",
      "position": { "x": 300, "y": 100 },
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
      "to": { "componentId": "ground1", "portId": "input" }
    }
  ]
}
\`\`\`

And here's some regular text.`;

  console.log('🧪 SimpleTestPage rendering with markdown:', simpleCircuitMarkdown);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple Circuit Test</h1>

        <div className="border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Markdown:</h2>
          <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 mb-6 overflow-x-auto">
            {simpleCircuitMarkdown}
          </pre>

          <h2 className="text-xl font-semibold mb-4">Rendered Output:</h2>
          <div className="border border-gray-600 rounded p-4">
            <MarkdownRenderer content={simpleCircuitMarkdown} />
          </div>
        </div>
      </div>
    </div>
  );
}
