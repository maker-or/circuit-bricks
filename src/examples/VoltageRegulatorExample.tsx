// filepath: /Users/harshithpasupuleti/code/circuit-bricks/examples/VoltageRegulatorExample.tsx
import React from 'react';
import CircuitCanvas from '../core/CircuitCanvas';
import useCircuit from '../hooks/useCircuit';

/**
 * Voltage Regulator Circuit Example
 * 
 * This example demonstrates a simple 7805 voltage regulator circuit
 * with input and output capacitors.
 * 
 * Components:
 * - Battery (9V)
 * - IC (7805 voltage regulator)
 * - Input capacitor (100µF)
 * - Output capacitor (10µF)
 * - Resistor (load)
 * - Ground
 * 
 * @returns {JSX.Element} The rendered circuit example
 */
const VoltageRegulatorExample: React.FC = () => {
  const [state, actions] = useCircuit();

  // Initialize the circuit on mount
  React.useEffect(() => {
    // Add components
    const batteryId = actions.addComponent({
      type: 'battery',
      position: { x: 100, y: 100 },
      props: { voltage: 9 }
    });

    const regulatorId = actions.addComponent({
      type: 'ic',
      position: { x: 300, y: 100 },
      props: { 
        name: '7805',
        pins: 3,
        width: 60,
        height: 40
      }
    });

    const inputCapId = actions.addComponent({
      type: 'capacitor',
      position: { x: 200, y: 150 },
      props: { capacitance: 100, unit: 'µF' }
    });

    const outputCapId = actions.addComponent({
      type: 'capacitor',
      position: { x: 400, y: 150 },
      props: { capacitance: 10, unit: 'µF' }
    });

    const loadResistorId = actions.addComponent({
      type: 'resistor',
      position: { x: 500, y: 100 },
      props: { resistance: 1000 }
    });

    const groundId = actions.addComponent({
      type: 'ground',
      position: { x: 300, y: 200 },
      props: {}
    });

    // Connect components with wires
    actions.addWire(
      { componentId: batteryId, portId: 'positive' },
      { componentId: regulatorId, portId: 'input' }
    );

    actions.addWire(
      { componentId: batteryId, portId: 'negative' },
      { componentId: groundId, portId: 'input' }
    );

    actions.addWire(
      { componentId: regulatorId, portId: 'input' },
      { componentId: inputCapId, portId: 'positive' }
    );

    actions.addWire(
      { componentId: inputCapId, portId: 'negative' },
      { componentId: groundId, portId: 'input' }
    );

    actions.addWire(
      { componentId: regulatorId, portId: 'ground' },
      { componentId: groundId, portId: 'input' }
    );

    actions.addWire(
      { componentId: regulatorId, portId: 'output' },
      { componentId: outputCapId, portId: 'positive' }
    );

    actions.addWire(
      { componentId: outputCapId, portId: 'negative' },
      { componentId: groundId, portId: 'input' }
    );

    actions.addWire(
      { componentId: regulatorId, portId: 'output' },
      { componentId: loadResistorId, portId: 'left' }
    );

    actions.addWire(
      { componentId: loadResistorId, portId: 'right' },
      { componentId: groundId, portId: 'input' }
    );
  }, []);

  return (
    <div className="example-container">
      <h2>Voltage Regulator Circuit (7805)</h2>
      <p>A simple 9V to 5V regulator with input and output capacitors</p>
      <div className="circuit-container">
        <CircuitCanvas
          components={state.components}
          wires={state.wires}
          width={700}
          height={400}
          showGrid={true}
        />
      </div>
      <div className="description">
        <h3>Circuit Description</h3>
        <p>
          This circuit converts a 9V input to a regulated 5V output using the 7805 linear voltage regulator.
          The input capacitor (100µF) helps smooth out input voltage fluctuations, while the
          output capacitor (10µF) improves transient response. A 1kΩ resistor serves as the load.
        </p>
      </div>
    </div>
  );
};

export default VoltageRegulatorExample;
