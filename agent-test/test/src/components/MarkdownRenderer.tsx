'use client';

import React, { Component, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { validateCircuit, type Circuit } from '../schemas/circuitSchema';
import { CircuitCanvas as CircuitBricksCanvas } from 'circuit-bricks';

// Simple Error Boundary for inline circuit rendering
class InlineCircuitErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Inline Circuit Rendering Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-red-300 font-medium">Circuit Rendering Error</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-red-300/70">
            {this.state.error?.message || 'Failed to render circuit diagram'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface MarkdownRendererProps {
  content: string;
  onCircuitGenerated?: (circuit: Circuit) => void;
}

// Custom code component that handles circuit diagrams
const CodeComponent = ({
  node,
  inline,
  className,
  children,
  onCircuitGenerated,
  ...props
}: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Debug logging
  if (!inline && String(children).length > 10) {
    console.log('📝 CodeComponent:', {
      className,
      language,
      inline,
      childrenType: typeof children,
      childrenLength: String(children).length,
      preview: String(children).substring(0, 200) + '...',
      hasOnCircuitGenerated: !!onCircuitGenerated
    });
  }

  // Handle circuit diagrams
  const jsonString = String(children).replace(/\n$/, '').trim();

  // Check if this is a circuit diagram (either explicitly marked or auto-detected)
  const hasComponents = jsonString.includes('"components"');
  const hasWires = jsonString.includes('"wires"');
  const hasComponentId = jsonString.includes('"componentId"');
  const hasPosition = jsonString.includes('"position"');
  const looksLikeCircuit = hasComponents && (hasWires || hasComponentId || hasPosition);

  // Additional checks to ensure the JSON is complete
  const startsWithBrace = jsonString.startsWith('{');
  const endsWithBrace = jsonString.endsWith('}');
  const appearsComplete = startsWithBrace && endsWithBrace;

  // Count braces to check for basic structure completeness
  const openBraces = (jsonString.match(/\{/g) || []).length;
  const closeBraces = (jsonString.match(/\}/g) || []).length;
  const bracesMatch = openBraces === closeBraces && openBraces > 0;

  // More lenient circuit detection - prioritize content over language identifier
  const isCircuitBlock = language === 'circuit' ||
    language === 'Circuit Diagram' ||
    // If it looks like a circuit and is properly formatted, render it as a circuit regardless of language
    (looksLikeCircuit && appearsComplete && bracesMatch);

  // Enhanced debugging for circuit detection
  if (!inline && (looksLikeCircuit || language === 'json' || language === 'circuit')) {
    console.log('🔍 Circuit Detection Debug:', {
      language,
      hasComponents,
      hasWires,
      hasComponentId,
      hasPosition,
      looksLikeCircuit,
      appearsComplete,
      bracesMatch,
      openBraces,
      closeBraces,
      startsWithBrace,
      endsWithBrace,
      isCircuitBlock,
      jsonLength: jsonString.length,
      firstChars: jsonString.substring(0, 50),
      lastChars: jsonString.substring(jsonString.length - 50)
    });
  }

  if (isCircuitBlock && !inline) {
    console.log('🔌 Detected circuit block:', {
      language,
      hasComponents,
      hasWires,
      looksLikeCircuit,
      appearsComplete,
      bracesMatch,
      openBraces,
      closeBraces,
      jsonPreview: jsonString.substring(0, 100) + '...'
    });

    try {
      // Enhanced debugging for circuit parsing
      console.log('🔍 Circuit parsing debug:', {
        jsonLength: jsonString.length,
        startsWithBrace: jsonString.startsWith('{'),
        endsWithBrace: jsonString.endsWith('}'),
        appearsComplete,
        bracesMatch,
        openBraces,
        closeBraces,
        firstChars: jsonString.substring(0, 50),
        lastChars: jsonString.substring(jsonString.length - 50)
      });

      // Only try to parse if it looks like JSON (starts with { or [) AND appears complete
      if (!appearsComplete || !bracesMatch) {
        console.log('⏳ Circuit block appears incomplete, skipping parse:', {
          appearsComplete,
          bracesMatch,
          jsonLength: jsonString.length,
          reason: !appearsComplete ? 'not complete' : 'braces mismatch'
        });
        // Fall through to regular code block rendering
        return (
          <code
            className={`${className} block bg-gray-900 text-gray-200 p-3 rounded-lg overflow-x-auto`}
            {...props}
          >
            {children}
          </code>
        );
      }

      if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
        console.log('⏳ Circuit block does not start with { or [, skipping parse:', {
          firstChar: jsonString.charAt(0),
          firstFewChars: jsonString.substring(0, 10)
        });
        // Fall through to regular code block rendering
        return (
          <code
            className={`${className} block bg-gray-900 text-gray-200 p-3 rounded-lg overflow-x-auto`}
            {...props}
          >
            {children}
          </code>
        );
      }

      console.log('🔄 Attempting to parse JSON...');
      const parsedData = JSON.parse(jsonString);
      console.log('✅ JSON parsing successful:', {
        type: typeof parsedData,
        isObject: typeof parsedData === 'object',
        keys: typeof parsedData === 'object' ? Object.keys(parsedData) : 'N/A',
        hasComponents: parsedData?.components !== undefined,
        hasWires: parsedData?.wires !== undefined,
        componentsLength: Array.isArray(parsedData?.components) ? parsedData.components.length : 'N/A',
        wiresLength: Array.isArray(parsedData?.wires) ? parsedData.wires.length : 'N/A'
      });

      // Validate the circuit data using Zod schema
      console.log('🔄 Attempting circuit validation...');
      const validation = validateCircuit(parsedData);

      if (validation.success) {
        const circuitData = validation.data;
        console.log('✅ Circuit validation successful:', circuitData);

        // Notify parent component about the circuit (still needed for potential external handling)
        if (onCircuitGenerated) {
          console.log('📤 Calling onCircuitGenerated with:', circuitData);
          onCircuitGenerated(circuitData);
        } else {
          console.warn('⚠️ onCircuitGenerated callback not provided');
        }

        // Return the actual CircuitCanvas component inline instead of a placeholder
        return (
          <div className="my-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            {/* Circuit Header */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-blue-300 font-medium">Circuit Diagram</span>
                {circuitData.name && (
                  <span className="ml-2 text-sm text-blue-200">
                    {circuitData.name}
                  </span>
                )}
              </div>
            </div>

            {/* Circuit Description */}
            {circuitData.description && (
              <div className="mb-3 text-xs text-gray-300">
                {circuitData.description}
              </div>
            )}

            {/* Circuit Stats */}
            <div className="flex space-x-4 mb-3 text-xs text-gray-400">
              <span>Components: {circuitData.components?.length || 0}</span>
              <span>Connections: {circuitData.wires?.length || 0}</span>
            </div>

            {/* Inline Circuit Canvas */}
            <div className="bg-[#0c0c0c] rounded border border-gray-600 overflow-hidden" style={{ height: '300px' }}>
              <div className="w-full h-full flex items-center justify-center">
                <InlineCircuitErrorBoundary>
                  <CircuitBricksCanvas
                    components={circuitData.components || []}
                    wires={circuitData.wires || []}
                    width={550}
                    height={280}
                    showGrid={true}
                  />
                </InlineCircuitErrorBoundary>
              </div>
            </div>
          </div>
        );
      } else {
        // Validation failed - show error message
        console.error('Circuit validation failed:', validation.error);
        return (
          <div className="my-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-red-300 font-medium">Invalid Circuit Schema</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-red-300/70">
              {validation.error}
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('❌ Failed to parse circuit JSON:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: typeof error,
        jsonLength: jsonString.length,
        jsonPreview: jsonString.substring(0, 200) + '...',
        jsonSuffix: jsonString.substring(jsonString.length - 100)
      });
      // Fall through to regular code block rendering
    }
  }

  // Regular code block
  return (
    <code
      className={`${className} ${inline ? 'bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm' : 'block bg-gray-900 text-gray-200 p-3 rounded-lg overflow-x-auto'}`}
      {...props}
    >
      {children}
    </code>
  );
};

export default function MarkdownRenderer({ content, onCircuitGenerated }: MarkdownRendererProps) {
  // Debug logging for content analysis
  console.log('📄 MarkdownRenderer received content:', {
    length: content.length,
    hasCircuitBlock: content.includes('```circuit'),
    hasJsonBlock: content.includes('```json'),
    preview: content.substring(0, 200) + '...'
  });

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code: (props) => CodeComponent({ ...props, onCircuitGenerated }),
          pre: ({ children }) => <div className="bg-gray-900 rounded-lg overflow-hidden">{children}</div>,
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-md font-medium text-white mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-gray-200 mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="text-gray-200 mb-3 ml-4 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="text-gray-200 mb-3 ml-4 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-3">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
