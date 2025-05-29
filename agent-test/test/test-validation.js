// Test script to validate the circuit schema from the screenshot
import { validateCircuit } from './src/schemas/circuitSchema.js';

// This is the approximate JSON structure from the screenshot
const testCircuit = {
  "name": "Single Line Power System",
  "description": "A simple single line power system with a generator, transformer, transmission line, circuit breaker, fuse, and load (resistor).",
  "components": [
    {
      "id": "generator1",
      "type": "generator",
      "position": { "x": 100, "y": 100 },
      "props": { "voltage": 1000, "frequency": 50 }
    },
    {
      "id": "transformer1",
      "type": "transformer",
      "position": { "x": 300, "y": 100 },
      "props": { "turnRatio": 10 }
    },
    {
      "id": "transmissionLine1",
      "type": "transmissionLine",
      "position": { "x": 500, "y": 100 },
      "props": { "impedance": 0.1 }
    },
    {
      "id": "circuitBreaker1",
      "type": "circuitBreaker",
      "position": { "x": 700, "y": 100 },
      "props": { "currentRating": 100 }
    },
    {
      "id": "fuse1",
      "type": "fuse",
      "position": { "x": 900, "y": 100 },
      "props": { "currentRating": 50 }
    },
    {
      "id": "resistor1",
      "type": "resistor",
      "position": { "x": 1100, "y": 100 },
      "props": { "resistance": 50 }
    },
    {
      "id": "ground1",
      "type": "ground",
      "position": { "x": 1300, "y": 100 },
      "props": {}
    }
  ],
  "wires": [
    {
      "id": "wire1",
      "from": { "componentId": "generator1", "portId": "positive" },
      "to": { "componentId": "transformer1", "portId": "primaryPositive" }
    },
    {
      "id": "wire2",
      "from": { "componentId": "transformer1", "portId": "secondaryPositive" },
      "to": { "componentId": "transmissionLine1", "portId": "input" }
    },
    {
      "id": "wire3",
      "from": { "componentId": "transmissionLine1", "portId": "output" },
      "to": { "componentId": "circuitBreaker1", "portId": "input" }
    },
    {
      "id": "wire4",
      "from": { "componentId": "circuitBreaker1", "portId": "output" },
      "to": { "componentId": "fuse1", "portId": "input" }
    },
    {
      "id": "wire5",
      "from": { "componentId": "fuse1", "portId": "output" },
      "to": { "componentId": "resistor1", "portId": "left" }
    },
    {
      "id": "wire6",
      "from": { "componentId": "resistor1", "portId": "right" },
      "to": { "componentId": "ground1", "portId": "input" }
    }
  ]
};

console.log('🧪 Testing circuit validation...');
console.log('📋 Test circuit:', JSON.stringify(testCircuit, null, 2));

const result = validateCircuit(testCircuit);
console.log('🎯 Validation result:', result);

if (!result.success) {
  console.error('❌ Validation failed:', result.error);
} else {
  console.log('✅ Validation passed!');
}
