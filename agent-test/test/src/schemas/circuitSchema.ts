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

// Wire style schema
export const wireStyleSchema = z.object({
  color: z.string().optional(),
  strokeWidth: z.number().optional(),
  dashArray: z.string().optional(),
}).optional();

// Wire schema - matches circuit-bricks Wire interface
export const wireSchema = z.object({
  id: z.string(),
  from: connectionPointSchema,
  to: connectionPointSchema,
  style: wireStyleSchema,
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
  try {
    const result = circuitSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root';
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

      return { success: false, error: `${errorMessages}${helpfulHint}` };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
