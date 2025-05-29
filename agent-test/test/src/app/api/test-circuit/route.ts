export async function GET() {
  const testCircuit = {
    name: "Test Circuit",
    description: "A simple test circuit with basic components",
    components: [
      {
        id: "battery1",
        type: "battery",
        position: { x: 100, y: 100 },
        props: { voltage: 9 }
      },
      {
        id: "resistor1", 
        type: "resistor",
        position: { x: 200, y: 100 },
        props: { resistance: 1000 }
      },
      {
        id: "ground1",
        type: "ground",
        position: { x: 300, y: 150 },
        props: {}
      }
    ],
    wires: [
      {
        id: "wire1",
        from: { componentId: "battery1", portId: "positive" },
        to: { componentId: "resistor1", portId: "left" },
        style: {}
      },
      {
        id: "wire2", 
        from: { componentId: "resistor1", portId: "right" },
        to: { componentId: "ground1", portId: "terminal" },
        style: {}
      }
    ]
  };

  const response = `# Test Circuit

Here's a test circuit to verify rendering:

\`\`\`circuit
${JSON.stringify(testCircuit, null, 2)}
\`\`\`

This should render as a visual circuit diagram.`;

  return new Response(response, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
