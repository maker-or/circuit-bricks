import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, tool } from 'ai';
import { z } from 'zod';
// Import LLM functions directly to avoid client-side bundling issues
import {
  listAvailableComponents,
  getAllComponentSchemas
} from '@sphere-labs/circuit-bricks/llm';
import { registerComponent } from '@sphere-labs/circuit-bricks';

// Configure OpenRouter
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});




export async function POST(req: Request) {
  try {
    console.log("🔥 API route called - POST /api/chat");
    const { messages } = await req.json();
    console.log("📨 Received messages:", messages?.length, "messages");



    // Check for correct environment variable name
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Missing OPENROUTER_API_KEY in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing API key' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate messages format
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }


    // Parse user request and call circuit-bricks functions directly
    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content?.toLowerCase() || '';



// getting the components required for a circuit for the user question
    const decisionPrompt = `
        Analyze this given question: "${userContent}"

        and clearly define the circuit components needed to build this electrical circuit
        only return the component names in CAPITAL LETTERS and separated by comma
      `;

    console.log("🔍 Getting required components...");
    const reqResult = await streamText({
      model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
      prompt: decisionPrompt,
      temperature: 0,
    });

    let requiredComponentsText = '';
    for await (const chunk of reqResult.textStream) {
      requiredComponentsText += chunk;
    }

    console.log("📋 Required components:", requiredComponentsText);

    // now check all the available components in the registry and make list of components that are not in the registry
    const available = listAvailableComponents();
    console.log("📦 Available components:", available);

    const analysisPrompt = `Analyze this carefully: Required components: "${requiredComponentsText}" and Available components: "${available}".

    Give me a list of components that are part of the required components but not part of the available components.
    If there are no such components, just return "GO AHEAD".
    If there are components that are not in available but required, then return the name of those components in CAPITAL LETTERS and separated by comma.`;

    console.log("🔍 Checking missing components...");
    const ansResult = await streamText({
      model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
      prompt: analysisPrompt,
      temperature: 0,
    });

    let missingComponentsText = '';
    for await (const chunk of ansResult.textStream) {
      missingComponentsText += chunk;
    }

    console.log("❌ Missing components:", missingComponentsText);

    // If we have missing components, create them first
    if (!missingComponentsText.includes("GO AHEAD")) {
      console.log("🏗️ Creating missing components...");
      const schemas = getAllComponentSchemas();
      const createComponentsPrompt = `First go through the entire schemas: ${JSON.stringify(schemas)} and understand everything about how components are created and how they are connected with each other.

      Now your job is to create component schemas for these missing components: ${missingComponentsText}

      Return a valid JSON array of component schemas. Each schema should follow the exact format of the examples.`;

      const createResult = await streamText({
        model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
        prompt: createComponentsPrompt,
        temperature: 0,
        system: `You are an expert circuit designer. Your job is to create component schemas based on the provided format.

        Here is an example component schema for a battery:
        {
          "id": "battery",
          "name": "Battery",
          "category": "sources",
          "description": "A source of electrical energy that can be used to power circuits",
          "defaultWidth": 60,
          "defaultHeight": 40,
          "ports": [
            {
              "id": "positive",
              "x": 60,
              "y": 20,
              "type": "output"
            },
            {
              "id": "negative",
              "x": 0,
              "y": 20,
              "type": "output"
            }
          ],
          "properties": [
            {
              "key": "voltage",
              "label": "Voltage",
              "type": "number",
              "unit": "V",
              "default": 9,
              "min": 0
            }
          ],
          "svgPath": "M10,20 h10 M20,5 v30 M30,10 v20 M40,5 v30 M40,20 h10"
        }

        IMPORTANT: Return ONLY a valid JSON array of component schemas. Do NOT wrap the response in markdown code blocks or any other formatting. The response should start with [ and end with ].`
      });

      let newComponentSchemas = '';
      for await (const chunk of createResult.textStream) {
        newComponentSchemas += chunk;
      }

      console.log("🔧 New component schemas:", newComponentSchemas);

      // Helper function to extract JSON from markdown code blocks
      function extractJsonFromMarkdown(text: string): string {
        // Remove markdown code block markers
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          return jsonMatch[1].trim();
        }
        // If no code blocks found, return the original text (might be raw JSON)
        return text.trim();
      }

      // Try to parse and register the new components
      try {
        const cleanedSchemas = extractJsonFromMarkdown(newComponentSchemas);
        console.log("🧹 Cleaned schemas:", cleanedSchemas);
        const parsedSchemas = JSON.parse(cleanedSchemas);
        if (Array.isArray(parsedSchemas)) {
          for (const schema of parsedSchemas) {
            try {
              registerComponent(schema);
              console.log(`✅ Registered component: ${schema.id}`);
            } catch (regError) {
              console.error(`❌ Failed to register component ${schema.id}:`, regError);
            }
          }
        }
      } catch (parseError) {
        console.error("❌ Failed to parse component schemas:", parseError);
      }
    }

    // Now create the complete circuit with all required components
    console.log("🎯 Creating complete circuit...");
    const circuitPrompt = `Create a complete circuit design for the user's request: "${userContent}"

    Use these required components: ${requiredComponentsText}
    All components are now available in the registry.

    Create a comprehensive circuit that fulfills the user's requirements. Include:
    1. Circuit description and explanation
    2. Component selection and values
    3. Circuit diagram in the proper format
    4. How the circuit works

    Make sure to use the \`\`\`circuit format for the circuit diagram as specified in your system prompt.`;

    try {
      console.log("🚀 Starting streamText call...");

      const result = streamText({
        model: openrouter('mistralai/devstral-small:free'),
        prompt: circuitPrompt,
        maxTokens: 2000,
        temperature: 0.7,
        system: `You are an expert circuit design assistant with access to the circuit-bricks component library.

## CIRCUIT DIAGRAM RENDERING

IMPORTANT: When creating circuit diagrams, you MUST use markdown code blocks with the language identifier "circuit" (not "json"). This is critical for proper rendering. Use this exact format:

\`\`\`circuit
{
  "name": "Circuit Name (optional)",
  "description": "Circuit description (optional)",
  "components": [
    {
      "id": "unique-component-id",
      "type": "component-type",
      "position": { "x": 100, "y": 100 },
      "props": { "key": "value" }
    }
  ],
  "wires": [
    {
      "id": "unique-wire-id",
      "from": { "componentId": "component1", "portId": "port-name" },
      "to": { "componentId": "component2", "portId": "port-name" }
    }
  ]
}
\`\`\`

## REQUIRED FIELDS
- Each component MUST have: id, type, position (x,y), props (can be empty {})
- Circuit MUST have: components array, wires array (can be empty [])
- Each wire MUST have: id, from (componentId, portId), to (componentId, portId)

## AVAILABLE COMPONENTS
Use the components that were identified as required: ${requiredComponentsText}
Common component types: resistor, capacitor, battery, led, ground, switch, voltage-source, diode, transistor-npn, ic

## COMMON PORT NAMES
- Resistor: "left", "right"
- LED: "anode", "cathode"
- Battery: "positive", "negative"
- Ground: "terminal"
- Capacitor: "left", "right"
- Switch: "left", "right"

## YOUR CAPABILITIES
🔧 Component information and discovery
⚡ Circuit design and analysis
🔍 Component specifications and details
📊 Circuit validation and descriptions
🎨 Interactive circuit diagram generation

Always provide circuit diagrams when designing or explaining circuits. Explain the circuit's operation, component values, and design principles. Use proper electrical engineering terminology and safety considerations.

REMEMBER: Always use \`\`\`circuit (not \`\`\`json) for circuit diagrams to ensure proper visual rendering!`,
      });

      console.log("✅ streamText call successful, result:", typeof result);
      console.log("📊 Stream result properties:", Object.keys(result));

      // Add timeout handling
      const response = result.toDataStreamResponse();
      console.log("📤 Returning data stream response");
      return response;
    } catch (llmError) {
      console.error('❌ LLM Error details:', {
        message: llmError instanceof Error ? llmError.message : 'Unknown error',
        stack: llmError instanceof Error ? llmError.stack : undefined,
        type: typeof llmError
      });
      return new Response('I apologize, but I am having trouble connecting to the AI service right now. Please try again later.', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  } catch (error) {
    console.error('Error in circuit design assistant:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}