# Circuit-Bricks Agentic AI Demo

This is a Next.js demo application that showcases the **agentic AI capabilities** of the circuit-bricks library. The application demonstrates how AI agents can intelligently analyze circuit requests, discover components, generate missing components, and create complete circuits using an autonomous workflow.

## Features

- **🤖 Agentic Circuit Design**: AI follows a structured workflow to analyze, discover, and generate circuits
- **🔍 Intelligent Component Discovery**: AI automatically identifies required components from natural language
- **⚡ Dynamic Component Generation**: AI creates missing components based on existing schema patterns
- **🎨 Real-time Visualization**: Generated circuits are displayed in real-time using the circuit-bricks canvas
- **📱 Split-Screen Interface**: 60/40 layout with chat interface and circuit visualization
- **🌙 Dark Theme**: Modern dark theme with #0c0c0c background

## Technology Stack

- **Next.js 15**: React framework for the web application
- **Vercel AI SDK**: For AI integration and streaming responses
- **OpenRouter**: AI provider for accessing Claude 3.5 Sonnet
- **Circuit-Bricks**: Component library for circuit visualization and LLM integration
- **Tailwind CSS**: For styling and responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

You can get your API key from [OpenRouter](https://openrouter.ai/keys).

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage Examples

Try asking the agentic AI agent:

### Basic Circuit Requests
- **"Create an LED circuit with a current limiting resistor"**
- **"Generate a simple battery and resistor circuit"**
- **"Build a voltage divider circuit"**

### Component Discovery
- **"Show me all available components"**
- **"What components do I need for a voltage divider?"**
- **"Search for semiconductor components"**

### Advanced Agentic Requests
- **"Create a temperature sensor circuit"** *(AI will generate missing sensor component)*
- **"Build a motor control circuit"** *(AI will create motor and control components)*
- **"Design a custom amplifier circuit"** *(AI will generate op-amp and supporting components)*

### Analysis & Learning
- **"Explain how a transistor works in circuits"**
- **"Validate this circuit design"**
- **"What's wrong with my circuit?"**

## Agentic AI Workflow

The AI agent follows an intelligent, autonomous workflow for circuit design:

### 1. **Request Analysis** 🔍
- `analyzeCircuitRequest(request)` - Analyzes user input to identify required components
- Uses keyword detection and pattern matching to understand circuit requirements

### 2. **Component Discovery** 📋
- `listAvailableComponents()` - Lists all components in the registry
- Cross-references required components with available components

### 3. **Dynamic Component Generation** 🔧
- `generateMissingComponent(type, description)` - Creates missing components using Zod schemas
- Automatically registers new components based on existing patterns
- Supports sensors, actuators, and custom component types

### 4. **Circuit Assembly** ⚡
- `generateCircuit(components, name, description)` - Assembles complete circuits
- Automatically generates appropriate wiring for common circuit patterns
- Creates positioned components with proper connections

### 5. **Validation & Rendering** ✅
- Validates circuit design using circuit-bricks validation
- Renders circuit using CircuitCanvas component
- Provides real-time visual feedback

## Architecture

### Frontend Components

- **`page.tsx`**: Main application with split-screen layout
- **`ChatInterface.tsx`**: Left panel chat interface for AI interaction
- **`CircuitCanvas.tsx`**: Right panel circuit visualization using circuit-bricks

### Backend API

- **`/api/chat/route.ts`**: Agentic AI chat endpoint with intelligent tool orchestration
- Uses OpenRouter with Mistral Devstral Small model (optimized for code generation)
- Implements autonomous workflow with circuit-bricks LLM tools

### Agentic Integration Flow

1. **User Request**: User sends natural language circuit request
2. **Analysis**: AI analyzes request using `analyzeCircuitRequest` tool
3. **Discovery**: AI lists available components using `listAvailableComponents` tool
4. **Gap Analysis**: AI identifies missing components needed for the circuit
5. **Generation**: AI creates missing components using `generateMissingComponent` tool
6. **Assembly**: AI generates complete circuit using `generateCircuit` tool
7. **Response**: AI explains the process and provides circuit visualization
8. **Rendering**: Frontend displays the circuit in real-time using CircuitCanvas

## Development

### Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts     # AI chat API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
└── components/
    ├── ChatInterface.tsx    # Chat UI component
    └── CircuitCanvas.tsx    # Circuit visualization component
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**: Ensure your OpenRouter API key is correctly set in `.env.local`
2. **Circuit Not Displaying**: Check browser console for errors and ensure circuit-bricks is properly imported
3. **AI Not Responding**: Verify the API endpoint is accessible and the model is available

## License

This demo application is part of the circuit-bricks project and follows the same license terms.
