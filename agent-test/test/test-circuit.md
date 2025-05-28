# Test Circuit

Here's a simple test circuit:

```circuit
{
  "name": "Simple LED Circuit",
  "description": "A basic LED circuit with a resistor",
  "components": [
    {
      "id": "led1",
      "type": "led",
      "position": { "x": 200, "y": 100 },
      "props": { "color": "red" }
    },
    {
      "id": "resistor1",
      "type": "resistor", 
      "position": { "x": 100, "y": 100 },
      "props": { "resistance": 220 }
    },
    {
      "id": "battery1",
      "type": "battery",
      "position": { "x": 50, "y": 150 },
      "props": { "voltage": 9 }
    },
    {
      "id": "ground1",
      "type": "ground",
      "position": { "x": 200, "y": 200 },
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
```

This circuit should show a simple LED with current limiting resistor.
