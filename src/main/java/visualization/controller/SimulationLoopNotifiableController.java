package visualization.controller;

import commons.simulation.SimulationLoopExecutable;
import commons.simulation.SimulationLoopNotifiable;
import commons.simulation.model.ReceivedScreenshot;
import commons.simulation.model.Screenshot;
import databus.DataBus;
import de.monticore.lang.monticar.ema2kt.runtime.api.Component;
import de.monticore.lang.monticar.ema2kt.runtime.api.ComponentCreationParameters;
import de.rwth.ryndin.modelling.autopilot.AutopilotSystemBuilder;
import de.rwth.ryndin.modelling.autopilot.integration.MainBlockAdapter;
import de.rwth.ryndin.modelling.autopilot.integration.NavigationAwareMainBlockAdapter;
import de.rwth.ryndin.modelling.meta.de.rwth.ryndin.modelling.component.integration.MetaDataForAutopilotAdapter;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import sensors.util.SensorUtil;
import simulation.environment.WorldModel;
import simulation.simulator.SimulationType;
import simulation.simulator.Simulator;
import simulation.vehicle.PhysicalVehicle;
import simulation.vehicle.PhysicalVehicleBuilder;
import simulation.vehicle.RandomStatusLogger;
import visualization.configuration.AppSettings;
import visualization.configuration.Messaging;
import visualization.configuration.RestApi;
import visualization.configuration.SimulationStartSettings;
import visualization.objects.SimulatedWorldInformation;
import visualization.util.ConversionUtils;
import visualization.util.ScreenshotToFileSaver;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;

@Controller
@RequestMapping(value = RestApi.SIMULATION)
public class SimulationLoopNotifiableController implements SimulationLoopNotifiable {

    private static final Logger logger = Logger.getLogger(SimulationLoopNotifiableController.class);

    private final SimpMessagingTemplate template;

    private final Map<Long, Screenshot> screenshots;

    private SimulatedWorldInformation simulatedWorldInformation;
    private static BlockingQueue<SimulatedWorldInformation> simulatedWorldInformationList;

    private final AppSettings appSettings;

    @Autowired
    public SimulationLoopNotifiableController(SimpMessagingTemplate template, AppSettings appSettings) {
        screenshots = new HashMap<>();
        simulatedWorldInformationList = new LinkedBlockingDeque<>();
        this.template = template;
        this.appSettings = appSettings;
    }

    @MessageMapping(Messaging.START)
    public @ResponseBody
    Boolean beginSimulation(@Payload SimulationStartSettings settings) {
        simulatedWorldInformationList.clear();
        setupSimulator(100, 1.0);
        // add simulation objects
        // ++++++++++++++++++++++++++++++++++++++++
        if (settings != null && settings.getScenarioNo() != null) {
            int no = settings.getScenarioNo();
            switch (no) {
                case 1:
                    setupScenario1();
                    break;
                case 2:
                    setupScenario2();
                    break;
                case 3:
                    setupScenario3();
                    break;
                case 4:
                    setupScenario4();
                    break;
                case 5:
                    setupScenario5();
                    break;
                default:
                    setupScenario1();
            }
        } else {
            setupScenario1();
        }
        // ++++++++++++++++++++++++++++++++++++++++
        Simulator sim = Simulator.getSharedInstance();
        sim.registerLoopObserver(this);
        sim.startSimulation();
        return true;
    }

    @MessageMapping(Messaging.GET_NEXT_FRAME)
    public void getNextFrame() throws InterruptedException {
        SimulatedWorldInformation worldInformation = simulatedWorldInformationList.take();
        template.convertAndSend(Messaging.EVENT_MESSAGE, worldInformation);
    }

    @MessageMapping(Messaging.STOP)
    public @ResponseBody
    Boolean stopSimulation() {
        Simulator sim = Simulator.getSharedInstance();
        if (sim.isSimulationRunning()) {
            sim.stopSimulation();
            return true;
        }
        return false;
    }

    @Override
    public void willExecuteLoop(List<SimulationLoopExecutable> simulationObjects, long totalTime, long deltaTime) {
        Simulator sim = Simulator.getSharedInstance();
        simulatedWorldInformation = new SimulatedWorldInformation();
        simulatedWorldInformation.setTimeFrame(sim.getFrameCount());
        simulatedWorldInformation.setSimulationTime(sim.getSimulationTime());
        simulatedWorldInformation.setRaining(WorldModel.getInstance().isItRaining());
        simulatedWorldInformation.addAllTrafficSignals(WorldModel.getInstance().getChangedTrafficSignals());
    }

    @Override
    public void didExecuteLoop(List<SimulationLoopExecutable> simulationObjects, long totalTime, long deltaTime) {
        // Add simulated world information now to list after one loop is completely finished
        // Otherwise the data set might be incomplete
        simulatedWorldInformationList.add(simulatedWorldInformation);
    }

    @Override
    public void willExecuteLoopForObject(SimulationLoopExecutable simulationObject, long totalTime, long deltaTime) {
        // Check if the argument is of type PhysicalVehicle
        if (simulationObject instanceof PhysicalVehicle) {
            // Convert the argument to PhysicalVehicle type
            PhysicalVehicle physicalVehicle = ((PhysicalVehicle) simulationObject);
            this.simulatedWorldInformation.addCars(ConversionUtils.physicalVehicle2Car(physicalVehicle));
        }
    }

    @Override
    public void didExecuteLoopForObject(SimulationLoopExecutable simulationObject, long totalTime, long deltaTime) {
    }

    @Override
    public void simulationStarted(List<SimulationLoopExecutable> simulationObjects) {
    }

    @Override
    public void simulationStopped(List<SimulationLoopExecutable> simulationObjects, long totalTime) {
    }

    public static MainBlockAdapter setupScenario1() {
        // drive along Pariser Ring
        return setupScenario(
                891.8161730201917,
                229.75065720023528,
                -0.25 * Math.PI,
                27289812
        );
    }

    public static MainBlockAdapter setupScenario2() {
        // turn: Ahornstrasse -- Halifaxstrasse
        return setupScenario(
                1633.0406766820315,
                894.0681918002548,
                0.5 * Math.PI,
                1223037301
        );
    }

    public static MainBlockAdapter setupScenario3() {
        // double turn: Hainbuchenstrasse -- Mies-van-der-Rohe-Strasse -- Informatik Zentrum
        return setupScenario(
                1962.6511628086676,
                713.3681610004725,
                0.6 * Math.PI,
                2949567123L
        );
    }

    public static MainBlockAdapter setupScenario4() {
        // 180 turn: Halifaxstrasse
        return setupScenario(
                1563.6253511442985,
                820.3153338002578,
                0.25 * Math.PI,
                1223037301L
        );
    }

    public static MainBlockAdapter setupScenario5() {
        // drive along Halifaxstrasse
        return setupScenario(
                1482.0469025414297,
                247.5309563998136,
                0.0,
                60009513L
        );
    }

    public static void setupSimulator(int frequency, double simulationTimeMinutes) {
        Simulator.resetSimulator();
        Simulator sim = Simulator.getSharedInstance();
        sim.setSimulationLoopFrequency(frequency);
        long simulationTimeMillis = (long) (simulationTimeMinutes * 60 * 1000);
        sim.stopAfter(simulationTimeMillis);
        sim.setSimulationType(SimulationType.SIMULATION_TYPE_FIXED_TIME);
        sim.setSynchronousSimulation(true);
    }

    public static MainBlockAdapter setupScenario(
            double startX,
            double startY,
            double startRotation,
            long destinationNodeId
    ) {
        AutopilotSystemBuilder builder = new AutopilotSystemBuilder();
        Component autopilotComponent = builder.buildComponent(
                MetaDataForAutopilotAdapter.INSTANCE,
                ComponentCreationParameters.Companion.create()
        );
        PhysicalVehicleBuilder vehicleBuilder = PhysicalVehicleBuilder.getInstance();
        vehicleBuilder.resetPhysicalVehicle();
        NavigationAwareMainBlockAdapter mainBlockAdapter = new NavigationAwareMainBlockAdapter(autopilotComponent);
        PhysicalVehicle physicalVehicle = vehicleBuilder.buildPhysicalVehicle(
                Optional.of(new DataBus()),
                Optional.of(mainBlockAdapter),
                Optional.empty()
        );
        physicalVehicle.getSimulationVehicle().setStatusLogger(new RandomStatusLogger());
        SensorUtil.sensorAdder(physicalVehicle);
        mainBlockAdapter.setVehicle(physicalVehicle);
        Simulator.getSharedInstance().registerAndPutObject(mainBlockAdapter.getVehicle(), startX, startY, startRotation);
        mainBlockAdapter.driveToNodeId(destinationNodeId);
        return mainBlockAdapter;
    }

    @MessageMapping(Messaging.SCREENSHOT)
    public void onScreenshot(final ReceivedScreenshot screenshot) throws Exception {
        if (!this.appSettings.isEnableScreenshots()) {
            return;
        }
        logger.info("received screenshot for car with id " + screenshot.getCarId());
        if (screenshots != null) {
            Screenshot s = Screenshot.fromReceivedScreenshot(screenshot);
            Long catId = new Long(s.getCarId());
            if (screenshots.containsKey(catId)) {
                logger.info("removing previous screensort with id" + catId);
                screenshots.remove(catId);
            }
            logger.info("put new screensort with id" + catId);
            screenshots.put(catId, s);
            if (appSettings.isSaveScreenshotsToFs()) {
                try {
                    ScreenshotToFileSaver.saveScreenshot(s);
                } catch (Exception e) {
                    logger.error(e);
                }
            }
        } else {
            logger.warn("screenshot is null");
        }
    }
}
