import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { z } from 'zod';
import {
  listAvailableComponents,
  getAllComponentSchemas
} from 'circuit-bricks/llm';
import { registerServerComponent } from 'circuit-bricks/registry-server';

// Configure OpenRouter
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Zod schema for component validation
const componentSchemaValidation = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  defaultWidth: z.number(),
  defaultHeight: z.number(),
  ports: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    type: z.string(),
    label: z.string().optional()
  })),
  properties: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.string(),
    unit: z.string().optional(),
    default: z.any(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.object({
      value: z.any(),
      label: z.string()
    })).optional()
  })),
  svgPath: z.string()
});

// Helper function to extract and validate component JSON with Zod
function extractAndValidateComponentJson(text: string): any[] | null {
  console.log("🔍 Extracting component JSON from text...");
  
  try {
    // Try to find JSON in markdown code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();
    
    // Try to find JSON array in the text
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonText = arrayMatch[0];
    }
    
    // Clean up common issues
    jsonText = jsonText
      .replace(/'/g, '"')  // Fix single quotes
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');  // Quote property names
    
    console.log("🧹 Cleaned JSON:", jsonText.substring(0, 200) + '...');
    
    // Parse the JSON
    const parsed = JSON.parse(jsonText);
    
    if (!Array.isArray(parsed)) {
      console.error("❌ Parsed JSON is not an array");
      return null;
    }
    
    // Validate each component schema with Zod
    const validatedComponents = [];
    for (const component of parsed) {
      try {
        const validated = componentSchemaValidation.parse(component);
        validatedComponents.push(validated);
        console.log(`✅ Component ${validated.id} passed validation`);
      } catch (validationError) {
        console.error(`❌ Component validation failed:`, validationError);
        console.log("📝 Failed component:", JSON.stringify(component, null, 2));
      }
    }
    
    console.log(`✅ Successfully validated ${validatedComponents.length}/${parsed.length} component schemas`);
    return validatedComponents.length > 0 ? validatedComponents : null;
    
  } catch (error) {
    console.error("❌ Failed to extract/parse component JSON:", error);
    console.log("📝 Raw text that failed:", text.substring(0, 500) + '...');
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { components } = await request.json();
    
    if (!components || !Array.isArray(components)) {
      return new Response(JSON.stringify({ 
        error: 'Missing or invalid components array' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("🧪 Testing component generation for:", components);

    // Get existing schemas for reference
    const existingSchemas = getAllComponentSchemas();
    console.log("📚 Found existing schema definitions:", Object.keys(existingSchemas).length);

    // Get current available components
    const availableComponents = listAvailableComponents();
    console.log("📋 Currently available components:", availableComponents.map(c => c.id));

    // Create structured component generation prompt
    const componentGenerationPrompt = `You are an expert electrical engineer creating component schemas for circuit-bricks.

REQUIRED COMPONENTS TO CREATE:
${components.map(c => `- ${c}`).join('\n')}

EXISTING COMPONENT EXAMPLES:
Here are some existing component schemas to understand the format:

BATTERY EXAMPLE:
{
  "id": "battery",
  "name": "Battery",
  "category": "sources",
  "description": "A source of electrical energy",
  "defaultWidth": 60,
  "defaultHeight": 40,
  "ports": [
    {"id": "positive", "x": 60, "y": 20, "type": "output"},
    {"id": "negative", "x": 0, "y": 20, "type": "output"}
  ],
  "properties": [
    {"key": "voltage", "label": "Voltage", "type": "number", "unit": "V", "default": 9, "min": 0}
  ],
  "svgPath": "M10,20 h10 M20,5 v30 M30,10 v20 M40,5 v30 M40,20 h10"
}

RESISTOR EXAMPLE:
{
  "id": "resistor",
  "name": "Resistor", 
  "category": "passive",
  "description": "A passive component that resists current flow",
  "defaultWidth": 40,
  "defaultHeight": 20,
  "ports": [
    {"id": "left", "x": 0, "y": 10, "type": "inout"},
    {"id": "right", "x": 40, "y": 10, "type": "inout"}
  ],
  "properties": [
    {"key": "resistance", "label": "Resistance", "type": "number", "unit": "Ω", "default": 1000, "min": 0}
  ],
  "svgPath": "M0,10 h10 l5,-5 l10,10 l10,-10 l10,10 l5,-5 h10"
}

INSTRUCTIONS:
1. Create component schemas for the missing components listed above
2. Return ONLY a valid JSON array of component schemas
3. Use the exact format shown in the examples
4. Ensure all required fields are present
5. Make realistic port positions and SVG paths for each component
6. Use appropriate categories: "sources", "passive", "active", "digital", "connectors", etc.

Return the JSON array starting with [ and ending with ].`;

    console.log("🚀 Starting component generation...");

    const componentResult = await streamText({
      model: openrouter('mistralai/devstral-small:free'),
      prompt: componentGenerationPrompt,
      temperature: 0.3,
      maxTokens: 2000,
      system: `You are an expert electrical engineer creating component schemas.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON array format
- No markdown code blocks or extra text
- Start with [ and end with ]
- Use double quotes for all strings
- Include all required fields for each component
- Make realistic electrical component designs

Your response should be pure JSON that can be parsed directly.`
    });

    let componentSchemasText = '';
    for await (const chunk of componentResult.textStream) {
      componentSchemasText += chunk;
    }

    console.log("🔧 Generated component schemas:", componentSchemasText);

    // Extract and validate the JSON
    const extractedJson = extractAndValidateComponentJson(componentSchemasText);
    
    if (extractedJson) {
      // Try to register the new components
      const registrationResults = [];
      for (const schema of extractedJson) {
        try {
          registerServerComponent(schema);
          registrationResults.push({ 
            id: schema.id, 
            status: 'success', 
            message: `Successfully registered ${schema.id}` 
          });
          console.log(`✅ Successfully registered component: ${schema.id}`);
        } catch (regError) {
          registrationResults.push({ 
            id: schema.id, 
            status: 'error', 
            message: regError instanceof Error ? regError.message : 'Unknown error' 
          });
          console.error(`❌ Failed to register component ${schema.id}:`, regError);
        }
      }

      // Get updated component list
      const updatedComponents = listAvailableComponents();
      
      return new Response(JSON.stringify({
        success: true,
        message: `Generated and processed ${extractedJson.length} component schemas`,
        generatedSchemas: extractedJson,
        registrationResults,
        totalComponentsAfter: updatedComponents.length,
        rawResponse: componentSchemasText
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to generate valid component schemas',
        rawResponse: componentSchemasText
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Component generation test error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
