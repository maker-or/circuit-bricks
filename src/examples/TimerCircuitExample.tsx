import React from 'react';
import CircuitCanvas from '../core/CircuitCanvas';
import useCircuit from '../hooks/useCircuit';

/**
 * 555 Timer Circuit Example
 * 
 * This example demonstrates a 555 timer in astable multivibrator mode,
 * creating an LED blinker circuit.
 * 
 * Components:
 * - Battery (9V)
 * - IC (555 timer)
 * - Resistors (timing resistors)
 * - Capacitor (timing capacitor)
 * - LED
 * - Ground
 * 
 * @returns {JSX.Element} The rendered circuit example
 */
const TimerCircuitExample: React.FC = () => {
  const [state, actions] = useCircuit();

  // Initialize the circuit on mount
  React.useEffect(() => {
    // Add components
    const batteryId = actions.addComponent({
      type: 'battery',
      position: { x: 100, y: 100 },
      props: { voltage: 9 }
    });

    const timerICId = actions.addComponent({
      type: 'ic',
      position: { x: 300, y: 150 },
      props: { 
        name: '555',
        pins: 8,
        width: 80,
        height: 100
      }
    });

    const resistor1Id = actions.addComponent({
      type: 'resistor',
      position: { x: 200, y: 50 },
      props: { resistance: 10, unit: 'kΩ' }
    });

    const resistor2Id = actions.addComponent({
      type: 'resistor',
      position: { x: 400, y: 50 },
      props: { resistance: 100, unit: 'kΩ' }
    });

    const capacitorId = actions.addComponent({
      type: 'capacitor',
      position: { x: 200, y: 250 },
      props: { capacitance: 10, unit: 'µF' }
    });

    const ledId = actions.addComponent({
      type: 'led',
      position: { x: 500, y: 150 },
      props: { color: '#ff0000' }
    });

    const resistor3Id = actions.addComponent({
      type: 'resistor',
      position: { x: 500, y: 250 },
      props: { resistance: 330 }
    });

    const groundId = actions.addComponent({
      type: 'ground',
      position: { x: 300, y: 350 },
      props: {}
    });

    // Connect components with wires
    // Battery connections
    actions.addWire(
      { componentId: batteryId, portId: 'positive' },
      { componentId: timerICId, portId: 'vcc' }
    );

    actions.addWire(
      { componentId: batteryId, portId: 'negative' },
      { componentId: groundId, portId: 'input' }
    );

    // Timer IC connections
    actions.addWire(
      { componentId: timerICId, portId: 'ground' },
      { componentId: groundId, portId: 'input' }
    );

    actions.addWire(
      { componentId: timerICId, portId: 'trigger' },
      { componentId: capacitorId, portId: 'negative' }
    );

    actions.addWire(
      { componentId: timerICId, portId: 'threshold' },
      { componentId: capacitorId, portId: 'positive' }
    );

    actions.addWire(
      { componentId: timerICId, portId: 'discharge' },
      { componentId: resistor2Id, portId: 'left' }
    );

    actions.addWire(
      { componentId: resistor1Id, portId: 'left' },
      { componentId: batteryId, portId: 'positive' }
    );

    actions.addWire(
      { componentId: resistor1Id, portId: 'right' },
      { componentId: resistor2Id, portId: 'right' }
    );

    actions.addWire(
      { componentId: resistor2Id, portId: 'right' },
      { componentId: timerICId, portId: 'threshold' }
    );

    actions.addWire(
      { componentId: capacitorId, portId: 'negative' },
      { componentId: groundId, portId: 'input' }
    );

    // LED connections
    actions.addWire(
      { componentId: timerICId, portId: 'output' },
      { componentId: ledId, portId: 'anode' }
    );

    actions.addWire(
      { componentId: ledId, portId: 'cathode' },
      { componentId: resistor3Id, portId: 'left' }
    );

    actions.addWire(
      { componentId: resistor3Id, portId: 'right' },
      { componentId: groundId, portId: 'input' }
    );
  }, []);

  return (
    <div className="example-container">
      <h2>555 Timer LED Blinker Circuit</h2>
      <p>An astable multivibrator circuit using the 555 timer IC to blink an LED</p>
      <div className="circuit-container">
        <CircuitCanvas
          components={state.components}
          wires={state.wires}
          width={700}
          height={500}
          showGrid={true}
        />
      </div>
      <div className="description">
        <h3>Circuit Description</h3>
        <p>
          This circuit uses a 555 timer IC configured as an astable multivibrator to generate
          a continuous square wave output. The frequency is determined by the values of the two
          resistors (10kΩ and 100kΩ) and the 10µF capacitor, resulting in a blinking LED.
          The blinking rate can be adjusted by changing the resistor and capacitor values.
        </p>
        <p>
          <strong>Formula:</strong> f ≈ 1.44 / ((R1 + 2 × R2) × C)
        </p>
      </div>
    </div>
  );
};

export default TimerCircuitExample;
