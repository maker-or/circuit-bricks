/**
 * Port position utility
 *
 * Provides functions to get the absolute position of ports in the DOM.
 * Compatible with infinite circuit canvas with panning and zooming.
 * Now includes SSR-safe implementations.
 */

import { isBrowser, safeQuerySelector } from "./ssrUtils";

// Define Point type locally since it's a simple interface
interface Point {
  x: number;
  y: number;
}

/**
 * Retrieves the absolute position of a port in the SVG coordinate system,
 * accounting for any viewport transformations (pan/zoom).
 *
 * @param componentId - The ID of the component
 * @param portId - The ID of the port on the component
 * @returns The position of the port or null if not found
 */
export function getPortPosition(
  componentId: string,
  portId: string,
): Point | null {
  // SSR-safe check
  if (!isBrowser()) {
    return null;
  }

  // Find the port element in the DOM
  const portElement = safeQuerySelector(
    `[data-component-id="${componentId}"][data-port-id="${portId}"]`,
  );

  if (!portElement) {
    console.warn(
      `Port not found: componentId=${componentId}, portId=${portId}`,
    );
    return null;
  }

  // Find the SVG root to calculate the relative position
  let currentEl: Element | null = portElement;
  let svgRoot: SVGSVGElement | null = null;

  while (currentEl) {
    if (currentEl instanceof SVGSVGElement) {
      svgRoot = currentEl;
      break;
    }
    currentEl = currentEl.parentElement;
  }

  if (!svgRoot) {
    console.warn("SVG root not found for port");
    return null;
  }

  // Get the bounding client rect of the port element and SVG
  const portRect = (portElement as SVGElement).getBoundingClientRect();
  const svgRect = svgRoot.getBoundingClientRect();

  // Get the center point of the port in client coordinates
  const clientX = portRect.left + portRect.width / 2;
  const clientY = portRect.top + portRect.height / 2;

  // Create an SVG point in client coordinates
  const svgPoint = svgRoot.createSVGPoint();
  svgPoint.x = clientX;
  svgPoint.y = clientY;

  // Get the current transformation matrix and its inverse
  // This will automatically factor in any viewport transformations (pan/zoom)
  const ctm = svgRoot.getScreenCTM();
  if (!ctm) {
    console.warn("Could not get screen CTM for SVG");
    return null;
  }

  const inverseCTM = ctm.inverse();

  // Transform the client coordinates to SVG user space
  const transformedPoint = svgPoint.matrixTransform(inverseCTM);

  // Return the point in user space coordinates, which accounts for pan/zoom
  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
  };
}

/**
 * Hook version of getPortPosition for React components
 * Will be implemented in a separate usePortPosition.ts file
 */
