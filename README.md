# Visualization
The visualization project uses WebGL and Three.JS to illustrate the data from the simulation in a web browser.

In addition to that, this module is also responsible for the data exchange between the simulation and the visualization with the help of a WebSocket.

# Simulation Start: Visualization
Use the following commands to start the simulation with visualization support:

```bash
cd visualization
mvn jetty:run
```

After some seconds of waiting, the visualization is available in your web browser: `http://127.0.0.1:8081/`.

In the top right corner you can click `Start` to start the simulation with the specified simulation scenario from the file `SimulationLoopNotifiableController.java`.

For Chrome there is a useful tip:

If your CPU can not create the simulation results fast enough for the visualization, the visualization will begin to stutter. To avoid that, you can click the `Start` button and afterwards you can minimize your Chrome browser window for some time. This allows the simulation to compute the required results without having to display them immediately. After some waiting you can open the browser window again and the visualization should run smoothly.

# Driving Scenarios
Different driving scenarios can be loaded in the file `SimulationLoopNotifiableController.java`.

The corresponding code blocks can be enabled / disabled in the `setupAllVehicles()` function of the `SimulationLoopNotifiableController.java` class.