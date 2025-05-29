import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import {
  getAllComponentSchemas
} from 'circuit-bricks/llm';


const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});




export async function POST(req: Request) {
  try {
    // console.log("🔥 API route called - POST /api/chat");
     const { messages } = await req.json();
    // console.log("📨 Received messages:", messages?.length, "messages");

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


      console.log("🏗️ Creating missing components...");
      const schemas = getAllComponentSchemas();
      const createComponentsPrompt = `First go through the entire schemas: ${schemas} and understand everything about how components are created and how they are connected with each other.

      Now your job is to create component schemas for these mising components: ${requiredComponentsText}



        IMPORTANT:
        1. Return ONLY a valid JSON array of component schemas
        2. Do NOT wrap the response in markdown code blocks or any other formatting
        3. The response should start with [ and end with ]
        4. Use ONLY double quotes for strings and property names
        5. Do NOT use single quotes or unquoted property names
        6. Do NOT include trailing commas
        7. Ensure all JSON syntax is strictly valid

      Return a valid JSON array of component schemas. Each schema should follow the exact format
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
        }.`;

      const createResult = await streamText({
        model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
        prompt: userContent,
        temperature: 0,
        system: `you are PHD in electrical engineering and you are an expert in creating electrical circuits. and your jobis to explain the stuents about electrical engineering in a easy and simple way so that they can easily understand the core concepts
        and here is the schems it will be rendered as the  circuit diagram ${createComponentsPrompt} make sure that this circuit schema is rendered in bwtween "circuit".

        IMPORTANT:
        -> these students will be the backbone of economy of our country so you have to be very careful while explaining the concepts to them.
        -> And if you fail to explain them propely it can lead to a catastrophe.


        `
      });

      // Directly stream the createResult response
      console.log("� Returning direct stream response from createResult");
      return createResult.toDataStreamResponse();
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