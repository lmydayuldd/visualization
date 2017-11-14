package simulator;

import org.junit.Ignore;
import org.junit.Test;
import simulation.simulator.Simulator;
import visualization.controller.SimulationLoopNotifiableController;

public class RunSimulationAsTest {

    private static final int FREQUENCY = 200;

    @Test
    @Ignore("not an actual test")
    public void driveAlongPariserRing() {
        SimulationLoopNotifiableController.setupSimulator(FREQUENCY, 0.5);
        SimulationLoopNotifiableController.setupScenario1ForNativeModel();
        Simulator sim = Simulator.getSharedInstance();
        sim.startSimulation();
    }
}
