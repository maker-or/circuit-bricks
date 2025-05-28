/**
 * Component registry loader
 *
 * This module imports and registers all component schemas
 */

import { registerComponent } from '../index';
import { ComponentSchema } from '../../schemas/componentSchema';

// Import component schemas
import resistorSchema from './resistor.json';
import capacitorSchema from './capacitor.json';
import batterySchema from './battery.json';
import groundSchema from './ground.json';
import switchSchema from './switch.json';
import voltageSourceSchema from './voltage-source.json';
import diodeSchema from './diode.json';
import transistorNpnSchema from './transistor-npn.json';
import ledSchema from './led.json';
import icSchema from './ic.json';

// Register components
const registerBuiltInComponents = () => {
  // Basic components
  registerComponent(resistorSchema as ComponentSchema);
  registerComponent(capacitorSchema as ComponentSchema);
  registerComponent(groundSchema as ComponentSchema);
  registerComponent(switchSchema as ComponentSchema);

  // Sources
  registerComponent(batterySchema as ComponentSchema);
  registerComponent(voltageSourceSchema as ComponentSchema);

  // Semiconductors
  registerComponent(diodeSchema as ComponentSchema);
  registerComponent(transistorNpnSchema as ComponentSchema);
  registerComponent(ledSchema as ComponentSchema);

  // Advanced components
  registerComponent(icSchema as ComponentSchema);

  // Add more component registrations here as they are created
};

export default registerBuiltInComponents;
