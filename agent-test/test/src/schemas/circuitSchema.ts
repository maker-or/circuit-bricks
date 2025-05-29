import { z } from 'zod';

// Position schema (Point in circuit-bricks)
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Size schema
export const sizeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

// Component instance schema - matches circuit-bricks ComponentInstance interface
export const componentInstanceSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: positionSchema, // Required in circuit-bricks
  size: sizeSchema.optional(),
  props: z.record(z.any()), // Required in circuit-bricks
  rotation: z.number().optional(),
});

// Wire connection point schema
export const connectionPointSchema = z.object({
  componentId: z.string(),
  portId: z.string(),
});

// Wire style schema - matches circuit-bricks exactly
export const wireStyleSchema = z.object({
  color: z.string().optional(),
  strokeWidth: z.number().optional(),
  dashArray: z.string().optional(),
}).optional();

// Wire schema - matches circuit-bricks Wire interface exactly
export const wireSchema = z.object({
  id: z.string(),
  from: connectionPointSchema,
  to: connectionPointSchema,
  style: z.object({
    color: z.string().optional(),
    strokeWidth: z.number().optional(),
    dashArray: z.string().optional(),
  }).optional(),
});

// Circuit schema - simplified version for markdown rendering
// Note: This is different from CircuitState which includes selection arrays
export const circuitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  components: z.array(componentInstanceSchema),
  wires: z.array(wireSchema), // Required array, can be empty
});

// Type exports
export type Position = z.infer<typeof positionSchema>;
export type Size = z.infer<typeof sizeSchema>;
export type ComponentInstance = z.infer<typeof componentInstanceSchema>;
export type ConnectionPoint = z.infer<typeof connectionPointSchema>;
export type WireStyle = z.infer<typeof wireStyleSchema>;
export type Wire = z.infer<typeof wireSchema>;
export type Circuit = z.infer<typeof circuitSchema>;

// Validation function with detailed error reporting
export function validateCircuit(data: unknown): { success: true; data: Circuit } | { success: false; error: string } {
  console.log('🔍 validateCircuit called with data:', {
    type: typeof data,
    isObject: typeof data === 'object' && data !== null,
    keys: typeof data === 'object' && data !== null ? Object.keys(data as object) : 'N/A',
    preview: JSON.stringify(data).substring(0, 200) + '...'
  });

  try {
    const result = circuitSchema.parse(data);
    console.log('✅ Circuit validation successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Circuit validation failed:', error);

    if (error instanceof z.ZodError) {
      console.log('📋 Detailed Zod errors:', error.errors);

      const errorMessages = error.errors.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root';
        console.log(`  - Error at ${path}: ${err.message}`, {
          code: err.code,
          path: err.path,
          errorData: err
        });
        return `${path}: ${err.message}`;
      }).join('; ');

      // Provide helpful hints for common errors
      let helpfulHint = '';
      if (errorMessages.includes('position: Required')) {
        helpfulHint = ' (Hint: Each component needs a position object with x and y coordinates)';
      } else if (errorMessages.includes('props: Required')) {
        helpfulHint = ' (Hint: Each component needs a props object, even if empty: {})';
      } else if (errorMessages.includes('wires: Required')) {
        helpfulHint = ' (Hint: Circuit needs a wires array, even if empty: [])';
      }

      const fullError = `${errorMessages}${helpfulHint}`;
      console.error('🚨 Final validation error:', fullError);
      return { success: false, error: fullError };
    }

    console.error('🚨 Unknown validation error:', error);
    return { success: false, error: 'Unknown validation error' };
  }
}
