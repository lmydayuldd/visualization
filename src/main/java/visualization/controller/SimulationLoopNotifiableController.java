package visualization.controller;

import java.util.*;

import org.apache.log4j.Level;
import visualization.objects.StaticBoxObject;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;

import databus.DataBus;
import visualization.util.ConversionUtils;
import visualization.objects.PedestrianProxy;
import visualization.objects.SimulatedWorldInformation;
import commons.controller.interfaces.Bus;
import commons.simulation.SimulationLoopExecutable;
import commons.simulation.SimulationLoopNotifiable;
import commons.simulation.model.ReceivedScreenshot;
import commons.simulation.model.Screenshot;
import visualization.configuration.AppSettings;
import visualization.configuration.Messaging;
import visualization.configuration.RestApi;
import visualization.util.ScreenshotToFileSaver;
import sensors.util.SensorUtil;
import mainControlBlock.MainControlBlock;
import navigationBlock.NavigationBlock;
import simulation.environment.WorldModel;
import simulation.environment.object.TrafficLightSwitcher;
import simulation.environment.osm.ParserSettings;
import simulation.environment.pedestrians.Pedestrian;
import simulation.environment.visualisationadapter.implementation.Node2D;
import simulation.environment.weather.Weather;
import simulation.environment.weather.WeatherSettings;
import simulation.network.NetworkCellBaseStation;
import simulation.network.NetworkSimulator;
import simulation.simulator.SimulationType;
import simulation.simulator.Simulator;
import simulation.vehicle.PhysicalVehicle;
import simulation.vehicle.PhysicalVehicleBuilder;
import simulation.vehicle.RandomStatusLogger;

import simulation.environment.object.Tree;
import simulation.environment.object.StreetLantern;
import simulation.environment.object.House;
import simulation.environment.object.RoadWorkSign;
import simulation.environment.visualisationadapter.implementation.Node2D;
import simulation.environment.visualisationadapter.interfaces.EnvNode;
import simulation.environment.visualisationadapter.interfaces.EnvStreet;


@Controller
@RequestMapping(value = RestApi.SIMULATION)
public class SimulationLoopNotifiableController implements SimulationLoopNotifiable {

    private static final Logger logger = Logger.getLogger(SimulationLoopNotifiableController.class);

    private final SimpMessagingTemplate template;

    private final Map<Long, Screenshot> screenshots;

    private boolean simulationFinished = false;
    private boolean staticObjectsAdded = false;

    private Simulator sim = Simulator.getSharedInstance();

    private SimulatedWorldInformation simulatedWorldInformation;
    private static List<SimulatedWorldInformation> simulatedWorldInformationList;
    private static int simulatedFrameCount = 0;
    private final AppSettings appSettings;

    @Autowired
    public SimulationLoopNotifiableController(SimpMessagingTemplate template, AppSettings appSettings) {
        simulatedWorldInformationList = Collections.synchronizedList(new ArrayList<>());
        this.screenshots = new HashMap<>();
        this.appSettings = appSettings;
        this.template = template;
    }

    @MessageMapping(Messaging.START)
    public @ResponseBody Boolean beginSimulation() {

        // Set update frequency to 100 loop iterations per second
        Simulator sim = Simulator.getSharedInstance();
        sim.setSimulationLoopFrequency(100);
        sim.stopAfter(60000);
        sim.setSimulationType(SimulationType.SIMULATION_TYPE_FIXED_TIME);

        // Asynchronous simulation
        sim.setSynchronousSimulation(false);

        // World settings
        WeatherSettings weatherSettings = new WeatherSettings(Weather.SUNSHINE);
        ParserSettings parserSettings = new ParserSettings("/map_ahornstrasse.osm", ParserSettings.ZCoordinates.ALLZERO);

        try {
            WorldModel.init(parserSettings, weatherSettings);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // add this class as Loop Observer
        sim.registerLoopObserver(this);

        // Register network simulation and objects
        NetworkSimulator.resetInstance();
        NetworkSimulator networkSimulator = NetworkSimulator.getInstance();
        sim.registerLoopObserver(networkSimulator);
        NetworkCellBaseStation baseStation1 = new NetworkCellBaseStation();
        sim.registerAndPutObject(baseStation1, 800.0, 750.0, 0.0);
        NetworkCellBaseStation baseStation2 = new NetworkCellBaseStation();
        sim.registerAndPutObject(baseStation2, 1300.0, 750.0, 0.0);
        NetworkCellBaseStation baseStation3 = new NetworkCellBaseStation();
        sim.registerAndPutObject(baseStation3, 1800.0, 750.0, 0.0);
        baseStation2.addConnectedBaseStationID(baseStation1.getId());
        baseStation2.addConnectedBaseStationID(baseStation3.getId());
        baseStation1.addConnectedBaseStationID(baseStation2.getId());
        baseStation3.addConnectedBaseStationID(baseStation2.getId());
        
        
        //setup the trees
        setupTrees();

        //setup the lanterns
        setupStreetLantern();

        //setup the construction signs
        setupCons();

        //setup the Houses
        setupHouses();


        //examples for adding objetcs

        //Tree tree = new Tree();
        //sim.registerAndPutObject(tree,1580.31626412008, 870.404690000371, 0);
        //More objectives

        //StreetLantern streetLantern = new StreetLantern();
        //sim.registerAndPutObject(streetLantern, 1584.31626412008, 877.404690000371, 0);

        //RoadWorkSign roadWorkSign = new RoadWorkSign();
        //sim.registerAndPutObject(roadWorkSign, 1584.31626412008, 877.404690000371, 0);

        //House house = new House();
        //sim.registerAndPutObject(house, 1584.31626412008, 877.404690000371, 0);


        // add simulation objects
        // +++++++++++++++++++++++++++++++++++++++
        

        // add simulation objects
        // ++++++++++++++++++++++++++++++++++++++++

        setupPedestrians();
        setupTrafficLights();
        setupAllVehicles();
        // ++++++++++++++++++++++++++++++++++++++++

        new Thread(new Runnable() {

            @Override
            public void run() {
                sim.startSimulation();
            }
        }).start();

        return true;
    }

    
    //methods for adding the objects as decripted in the documentation
     private void setupCons() {
        //distance between the signs
        double a = 500;
        for (EnvStreet street : WorldModel.getInstance().getContainer().getStreets()) {
            ArrayList<EnvNode> nodes = (ArrayList<EnvNode>) street.getNodes();

            double width = street.getStreetWidth().doubleValue();
            for (int i = 1; i < nodes.size(); i++) {
                double az = 0, ax = 0;
                EnvNode node = nodes.get(i);
                EnvNode prev = nodes.get(i - 1);
                double nodex2 = 0, nodez2 = 0;
                double r = Math.random();
                //to avoid a crash of the simulator--> random spawn
                if (r >= 0.5) {
                    double deltax = node.getX().doubleValue() - prev.getX().doubleValue();
                    double deltaz = node.getY().doubleValue() - prev.getY().doubleValue();
                    //l is the length of this part
                    double l = Math.sqrt(deltax * deltax + deltaz * deltaz);
                    if (2 * (width / (Math.sqrt(2))) <= l) {
                        double nodex = node.getX().doubleValue();
                        double nodez = node.getY().doubleValue();
                        if (deltax != 0 && deltaz != 0) {
                            double b = deltax / -deltaz;
                            double ll = Math.sqrt(b * b + 1);
                            nodez = nodez - (width / 2) * 1 / ll * b;
                            nodex = nodex - (width / 2) * 1 / ll * 1;
                            //place the sign under the node
                            RoadWorkSign workSign = new RoadWorkSign();
                            sim.registerAndPutObject(workSign, nodex, nodez, 0);

                            nodex2 = nodex;
                            nodez2 = nodez;
                            nodex = node.getX().doubleValue();
                            nodez = node.getY().doubleValue();
                        } else if (deltax == 0) {
                            nodex = nodex - (width / 2);
                            //place the sign under the node
                            RoadWorkSign workSign = new RoadWorkSign();
                            sim.registerAndPutObject(workSign, nodex, nodez, 0);
                            nodex2 = nodex;
                            nodez2 = nodez;
                            nodex = node.getX().doubleValue();
                            nodez = node.getY().doubleValue();
                        } else if (deltaz == 0) {
                            nodez = nodez - (width / 2);
                            //place the sign under the node
                            RoadWorkSign workSign = new RoadWorkSign();
                            sim.registerAndPutObject(workSign, nodex, nodez, 0);
                            nodex2 = nodex;
                            nodez2 = nodez;
                            nodex = node.getX().doubleValue();
                            nodez = node.getY().doubleValue();
                        }
                        //ax and az = distance between node and current point
                        ax = nodex - (width / (Math.sqrt(2))) * 1 / l * deltax;
                        az = nodez - (width / (Math.sqrt(2))) * 1 / l * deltaz;
                        RoadWorkSign workSign2 = new RoadWorkSign();
                        sim.registerAndPutObject(workSign2, ax, az, 0);
                        RoadWorkSign workSign3 = new RoadWorkSign();
                        sim.registerAndPutObject(workSign3, (nodex2 + ax) / 2, (nodez2 + az) / 2, 0);

                        //ll = Length of the distance
                        double ll = Math.sqrt((ax - nodex) * (ax - nodex) + (az - nodez) * (az - nodez));
                        double m = 1;
                        while ((ll + a) <= (l - (width / (Math.sqrt(2))))) {
                            ax = ax - m * a * deltax * (1 / l);
                            az = az - m * a * deltaz * (1 / l);
                            RoadWorkSign workSign = new RoadWorkSign();
                            sim.registerAndPutObject(workSign, ax, az, 0);
                            ll = Math.sqrt((ax - nodex) * (ax - nodex) + (az - nodez) * (az - nodez));
                            m++;
                        }
                    }
                }
            }
        }
    }


    private void setupTrees() {
        //a is the distance between trees in a row of them
        double a = 1000;
        for (EnvStreet street : WorldModel.getInstance().getContainer().getStreets()) {
            ArrayList<EnvNode> nodes = (ArrayList<EnvNode>) street.getNodes();

            double width = street.getStreetWidth().doubleValue();
            for (int i = 1; i < nodes.size(); i++) {
                EnvNode node = nodes.get(i);
                EnvNode prev = nodes.get(i - 1);
                double r = Math.random();
                //to avoid a crash of the simulator--> random spawn
                if (r >= 0.5) {

                    double deltax = node.getX().doubleValue() - prev.getX().doubleValue();
                    double deltaz = node.getY().doubleValue() - prev.getY().doubleValue();
                    double mx = (node.getX().doubleValue() + prev.getX().doubleValue()) / 2;
                    double mz = (node.getY().doubleValue() + prev.getY().doubleValue()) / 2;
                    double l = Math.sqrt(deltax * deltax + deltaz * deltaz);
                    if (deltax != 0 && deltaz != 0) {
                        double b = deltax / -deltaz;
                        double ll = Math.sqrt(b * b + 1);
                        mx = mx + (width / 2 + 100) * 1 / ll * 1;
                        mz = mz + (width / 2 + 100) * 1 / ll * b;
                        Tree tree = new Tree();
                        sim.registerAndPutObject(tree, mx, mz, 0);
                        mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                        mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                        mz = mz - (width / 2 + 100) * 1 / ll * b;
                        mx = mx - (width / 2 + 100) * 1 / ll * 1;
                        Tree tree2 = new Tree();
                        sim.registerAndPutObject(tree2, mx, mz, 0);
                        mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                        mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                        mz = mz + (width / 2 + 100) * 1 / ll * b;
                        mx = mx + (width / 2 + 100) * 1 / ll * 1;
                        if (l >= (2 * a)) {
                            mz = mz + a * 1 / l * deltaz;
                            mx = mx + a * 1 / l * deltax;
                            Tree tree3 = new Tree();
                            sim.registerAndPutObject(tree3, mx, mz, 0);
                            mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                            mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                            mx = mx - (width / 2 + 100) * 1 / ll * 1;
                            mz = mz - (width / 2 + 100) * 1 / ll * b;
                            mx = mx + a * 1 / l * deltax;
                            mz = mz + a * 1 / l * deltaz;
                            Tree tree4 = new Tree();
                            sim.registerAndPutObject(tree4, mx, mz, 0);
                            mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                            mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                            mx = mx + (width / 2 + 100) * 1 / ll * 1;
                            mz = mz + (width / 2 + 100) * 1 / ll * b;
                            mz = mz - a * 1 / l * deltaz;
                            mx = mx - a * 1 / l * deltax;
                            Tree tree5 = new Tree();
                            sim.registerAndPutObject(tree5, mx, mz, 0);
                            mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                            mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                            mx = mx - (width / 2 + 100) * 1 / ll * 1;
                            mz = mz - (width / 2 + 100) * 1 / ll * b;
                            mx = mx - a * 1 / l * deltax;
                            mz = mz - a * 1 / l * deltaz;
                            Tree tree6 = new Tree();
                            sim.registerAndPutObject(tree6, mx, mz, 0);
                        }
                    } else if (deltax == 0) {
                        mx = mx + (width / 2 + 100);
                        Tree tree = new Tree();
                        sim.registerAndPutObject(tree, mx, mz, 0);
                        mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                        mx = mx - (width / 2 + 100);
                        Tree tree2 = new Tree();
                        sim.registerAndPutObject(tree2, mx, mz, 0);
                        if (l >= 2 * a) {
                            mz = mz + a * 1 / l * deltaz;
                            Tree tree3 = new Tree();
                            sim.registerAndPutObject(tree3, mx, mz, 0);
                            mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                            mx = mx + (width / 2 + 100);
                            Tree tree4 = new Tree();
                            sim.registerAndPutObject(tree4, mx, mz, 0);
                            mz = mz - 2 * a * 1 / l * deltaz;
                            Tree tree5 = new Tree();
                            sim.registerAndPutObject(tree5, mx, mz, 0);
                            mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                            mx = mx - (width / 2 + 100);
                            Tree tree6 = new Tree();
                            sim.registerAndPutObject(tree6, mx, mz, 0);
                        }
                    } else if (deltaz == 0) {
                        mz = mz + (width / 2 + 100);
                        Tree tree = new Tree();
                        sim.registerAndPutObject(tree, mx, mz, 0);
                        mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                        mz = mz - (width / 2 + 100);
                        Tree tree2 = new Tree();
                        sim.registerAndPutObject(tree2, mx, mz, 0);
                        if (l >= 2 * a) {
                            mx = mx + a * 1 / l * deltax;
                            Tree tree3 = new Tree();
                            sim.registerAndPutObject(tree3, mx, mz, 0);
                            mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                            mz = mz + (width / 2 + 100);
                            Tree tree4 = new Tree();
                            sim.registerAndPutObject(tree4, mx, mz, 0);
                            mx = mx - 2 * a * 1 / l * deltax;
                            Tree tree5 = new Tree();
                            sim.registerAndPutObject(tree5, mx, mz, 0);
                            mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                            mz = mz - (width / 2 + 100);
                            Tree tree6 = new Tree();
                            sim.registerAndPutObject(tree6, mx, mz, 0);
                        }
                    }
                }
            }
        }
    }

    private void setupStreetLantern() {
        //for the distance between the lanterns
        double a = 2000;
        for (EnvStreet street : WorldModel.getInstance().getContainer().getStreets()) {
            ArrayList<EnvNode> nodes = (ArrayList<EnvNode>) street.getNodes();

            double width = street.getStreetWidth().doubleValue();
            for (int i = 1; i < nodes.size(); i++) {
                EnvNode node = nodes.get(i);
                EnvNode prev = nodes.get(i - 1);
                //linear equation
                double r = Math.random();
                double lu = 0, ll = 0, b = 0;
                double nodex2 = 0, nodez2 = 0;
                //to avoid a crash of the simulator--> random spawn
                if (r >= 0.5) {

                    double deltax = node.getX().doubleValue() - prev.getX().doubleValue();
                    double deltaz = node.getY().doubleValue() - prev.getY().doubleValue();
                    double l = Math.sqrt(deltax * deltax + deltaz * deltaz);
                    double nodex = node.getX().doubleValue();
                    double nodez = node.getY().doubleValue();
                    if (deltax != 0 && deltaz != 0) {
                        b = deltax / -deltaz;
                        ll = Math.sqrt(b * b + 1);
                        nodex = nodex - (width / 2) * 1 / ll * 1;
                        nodez = nodez - (width / 2) * 1 / ll * b;
                        nodex2 = nodex;
                        nodez2 = nodez;
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        lu = Math.sqrt(ax * ax + az * az);
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                    } else if (deltax == 0) {
                        nodex = nodex - (width / 2);
                        nodex2 = nodex;
                        nodez2 = nodez;
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                        lu = Math.sqrt(ax * ax + az * az);
                    } else if (deltaz == 0) {
                        nodez = nodez - (width / 2);
                        nodex2 = nodex;
                        nodez2 = nodez;
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                        lu = Math.sqrt(ax * ax + az * az);
                    }
                    while (l >= lu + a) {
                        nodex = nodex - a * deltax * (1 / l);
                        nodez = nodez - a * deltaz * (1 / l);
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        lu = Math.sqrt((ax) * (ax) + (az) * (az));
                    }
                    //now the other side
                    nodex = node.getX().doubleValue();
                    nodez = node.getY().doubleValue();
                    if (deltax != 0 && deltaz != 0) {
                        nodex = nodex + (width / 2) * 1 / ll * 1;
                        nodez = nodez + (width / 2) * 1 / ll * b;
                        nodex2 = nodex;
                        nodez2 = nodez;
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        lu = Math.sqrt(ax * ax + az * az);
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                    } else if (deltax == 0) {
                        nodex = nodex + (width / 2);
                        nodex2 = nodex;
                        nodez2 = nodez;
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                        lu = Math.sqrt(ax * ax + az * az);
                    } else if (deltaz == 0) {
                        nodez = nodez + (width / 2);
                        nodex2 = nodex;
                        nodez2 = nodez;
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                        lu = Math.sqrt(ax * ax + az * az);
                    }
                    while (l >= lu + a) {
                        nodex = nodex - a * deltax * (1 / l);
                        nodez = nodez - a * deltaz * (1 / l);
                        StreetLantern streetLantern = new StreetLantern();
                        sim.registerAndPutObject(streetLantern, nodex, nodez, 0);
                        double ax = nodex - nodex2;
                        double az = nodez - nodez2;
                        lu = Math.sqrt((ax) * (ax) + (az) * (az));
                    }
                }
            }
        }
    }


    private void setupHouses()
    {
        for (EnvStreet street : WorldModel.getInstance().getContainer().getStreets()) {
            {
                ArrayList<EnvNode> nodes = (ArrayList<EnvNode>) street.getNodes();

                double width = street.getStreetWidth().doubleValue();
                for (int i = 1; i < nodes.size(); i++) {
                    EnvNode node = nodes.get(i);
                    EnvNode prev = nodes.get(i - 1);
                    double deltax = node.getX().doubleValue() - prev.getX().doubleValue();
                    double deltaz = node.getY().doubleValue() - prev.getY().doubleValue();
                    double l = Math.sqrt(deltax * deltax + deltaz * deltaz);
                    double r = Math.random();
                    //275 is the size of one side of the housevisualization
                    if (r >= 0.5) {
                        if (l > 275) {
                            if (deltax != 0 && deltaz != 0) {
                                double b = deltax / -deltaz;
                                double ll = Math.sqrt(b * b + 1);
                                double mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                                double mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                                mz = mz + (width / 2 + 1000) * 1 / ll * b;
                                mx = mx + (width / 2 + 1000) * 1 / ll * 1;
                                House house = new House();
                                sim.registerAndPutObject(house, mx, mz, 0);
                            } else if (deltaz == 0) {
                                double mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                                double mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                                mz = mz + width / 2 + 1000;
                                House house = new House();
                                sim.registerAndPutObject(house, mx, mz, 0);
                            } else if (deltax == 0) {
                                double mz = (prev.getY().doubleValue() + node.getY().doubleValue()) / 2;
                                double mx = (prev.getX().doubleValue() + node.getX().doubleValue()) / 2;
                                mx = mx + width / 2 + 1000;
                                House house = new House();
                                sim.registerAndPutObject(house, mx, mz, 0);
                            }
                        }
                    }
                }
            }
        }
    }
    
    
    
    @MessageMapping(Messaging.GET_NEXT_FRAME)
    public void getNextFrame() throws InterruptedException {
        //logger.info("Client asks for next frame");

        if (simulationFinished && simulatedWorldInformationList.size() <= simulatedFrameCount) {
            logger.info("Simulation finished, no data frame available!" + " [Frame: " + simulatedFrameCount + "]");
            return;
        }

        while (simulatedWorldInformationList.size() == 0 || simulatedWorldInformationList.size() <= simulatedFrameCount) {
            try {
                int frequency = Simulator.getSharedInstance().getSimulationLoopFrequency();
                int sleepTime = (1000 / (frequency <= 0 ? 100 : frequency)) + 1;
                logger.info("Requested Simulation frame is not yet produced! Sleep for " + sleepTime + "ms." + " [Frame: " + simulatedFrameCount + "]");
                Thread.sleep(sleepTime);
            } catch (InterruptedException e) {
                // recommended because catching InterruptedException clears
                // interrupt flag
                Thread.currentThread().interrupt();
                // you probably want to quit if the thread is interrupted
                return;
            }
        }

        SimulatedWorldInformation worldInformation = simulatedWorldInformationList.get(simulatedFrameCount);
        simulatedFrameCount += appSettings.getRenderFlequency();
        template.convertAndSend(Messaging.EVENT_MESSAGE, worldInformation);

        logger.debug(new Gson().toJson(worldInformation));
    }

    @RequestMapping(value = RestApi.ADD_CAR, method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody Boolean addCar(String json) {
        if (this.sim == null) {
            return false;
        }
        if (!this.sim.isSimulationRunning()) {
            return false;
        }
        // Create a new vehicle
        PhysicalVehicleBuilder physicalVehicleBuilder = PhysicalVehicleBuilder.getInstance();
        physicalVehicleBuilder.loadPropertiesFromJSON(json);
        PhysicalVehicle physicalVehicle = physicalVehicleBuilder.buildPhysicalVehicle(Optional.empty(),
                Optional.empty(), Optional.empty());
        this.sim.registerSimulationObject(physicalVehicle);
        return true;
    }

    @MessageMapping(Messaging.STOP)
    public @ResponseBody Boolean stopSimulation() {
        if (this.sim.isSimulationRunning()) {
            this.sim.stopSimulation();
            return true;
        }
        return false;
    }

    @RequestMapping(value = RestApi.SAMPLE_CAR_PROPERTIES, method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody PhysicalVehicleBuilder.ParsableVehicleProperties sampleCarProperty() {
        PhysicalVehicleBuilder builder = PhysicalVehicleBuilder.getInstance();
        PhysicalVehicle physicalVehicle = builder.buildPhysicalVehicle(Optional.empty(), Optional.empty(),
                Optional.empty());
        return new PhysicalVehicleBuilder.ParsableVehicleProperties(physicalVehicle);
    }

    @Override
    public void willExecuteLoop(List<SimulationLoopExecutable> simulationObjects, long totalTime, long deltaTime) {
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
        staticObjectsAdded = true;
    }

    @Override
    public void willExecuteLoopForObject(SimulationLoopExecutable simulationObject, long totalTime, long deltaTime) {

        // Check if the argument is of type PhysicalVehicle
        if (simulationObject instanceof PhysicalVehicle) {

            // Convert the argument to PhysicalVehicle type
            PhysicalVehicle physicalVehicle = ((PhysicalVehicle) simulationObject);
            this.simulatedWorldInformation.addCars(ConversionUtils.physicalVehicle2Car(physicalVehicle));
            // check if Screenshot is available o not
            if ((sim.getFrameCount() % appSettings.getScreenshotFrequency()) == 0) {
                Screenshot screenshot = screenshots.get(physicalVehicle.getId());
                if (screenshot != null) {
                    physicalVehicle.getSimulationVehicle().setCameraImage(Optional.of(screenshot.getScreenshot()));
                }
            }

        }

        if (simulationObject instanceof Pedestrian) {
            Pedestrian pedestrian = (Pedestrian) simulationObject;
            this.simulatedWorldInformation.addPedestrians(new PedestrianProxy(pedestrian));
        }

        if (!staticObjectsAdded) {
            if (simulationObject instanceof NetworkCellBaseStation) {
                NetworkCellBaseStation networkCellBaseStation = (NetworkCellBaseStation) simulationObject;
                this.simulatedWorldInformation.addStaticBoxObject(new StaticBoxObject(networkCellBaseStation));
            } else if (simulationObject instanceof Tree) {
                Tree tree = (Tree) simulationObject;
                this.simulatedWorldInformation.addStaticBoxObject(new StaticBoxObject(tree));
            } else if (simulationObject instanceof StreetLantern) {
                StreetLantern streetLantern = (StreetLantern) simulationObject;
                this.simulatedWorldInformation.addStaticBoxObject(new StaticBoxObject(streetLantern));
            }
            else if(simulationObject instanceof House) {
                House house = (House) simulationObject;
                this.simulatedWorldInformation.addStaticBoxObject(new StaticBoxObject(house));
            }
            else if(simulationObject instanceof RoadWorkSign) {
                RoadWorkSign roadWorkSign= (RoadWorkSign) simulationObject;
                this.simulatedWorldInformation.addStaticBoxObject(new StaticBoxObject(roadWorkSign));
            }
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
        simulationFinished = true;
    }

    private void setupPedestrians() {
        List<Pedestrian> pedestrians = WorldModel.getInstance().getPedestrianContainer().getPedestrians();
        for (Pedestrian pedestrian : pedestrians) {
            sim.registerSimulationObject(pedestrian);
        }
    }

    private void setupTrafficLights() {
        List<TrafficLightSwitcher> switcher = TrafficLightSwitcher.getSwitcher();
        logger.info(switcher.size() + " TrafficLight Switcher found and register them to Simulator...");
        for (TrafficLightSwitcher trafficLightSwitcher : switcher) {
            sim.registerSimulationObject(trafficLightSwitcher);
        }
    }

    private PhysicalVehicle setupDefaultVehicle() {

        // Create a new vehicle
        PhysicalVehicleBuilder physicalVehicleBuilder = PhysicalVehicleBuilder.getInstance();
        Bus bus = new DataBus();
        MainControlBlock mainControlBlock = new MainControlBlock();
        NavigationBlock navigationBlock = new NavigationBlock();
        PhysicalVehicle physicalVehicle = physicalVehicleBuilder.buildPhysicalVehicle(Optional.of(bus), Optional.of(mainControlBlock), Optional.of(navigationBlock));
        physicalVehicle.getSimulationVehicle().setStatusLogger(new RandomStatusLogger());
        SensorUtil.sensorAdder(physicalVehicle);
        return physicalVehicle;
    }

    private void setupAllVehicles() {

        // TODO: This should be changed to loading data from files (see SimulatorMain as well)
        // Load simulation cases
        PhysicalVehicle physicalVehicle = null;

        // Position: Bus stop Ahornstrasse in front of Informatikzentrum
        // End Position: Bus stop named Melatener Strasse on Halifaxstrasse with OSM Id 1223037297
        /*
        physicalVehicle = setupDefaultVehicle();
        sim.registerAndPutObject(physicalVehicle, 1584.31626412008, 877.404690000371, 0.5 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1593.322563254177, 591.3829242001566, 0.0, 1223037297));
        sim.setSimulationLoopFrequency(50);
        sim.stopAfter(60 * 1000);
        */

        // Position: Nordhoffstrasse
        // End Position: Intersection Siemensstrasse and Ahornstrasse
        /*
        physicalVehicle = setupDefaultVehicle();
        sim.registerAndPutObject(physicalVehicle, 1391.8239762001342, 832.4453015998025, 0.75 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1437.9355620588449, 782.0125002004822, 0.0, 60697265));
        sim.setSimulationLoopFrequency(50);
        sim.stopAfter(60 * 1000);
        */

        // Position: Nordhoffstrasse
        // End Position: Intersection Siemensstrasse and Auf der Hoern
        /*
        physicalVehicle = setupDefaultVehicle();
        sim.registerAndPutObject(physicalVehicle, 1391.8239762001342, 832.4453015998025, 0.75 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1266.0997688590649, 815.7265128000583, 0.0, 60697271));
        sim.setSimulationLoopFrequency(50);
        sim.stopAfter(60 * 1000);
        */

        // Simulation scenario: Rear collision avoidance
        // Spawn one standing vehicle on Nordhoffstrasse and another vehicle driving on Nordhoffstrasse
        // Driving vehicle must stop to avoid rear end collision with standing vehicle
        /*
        physicalVehicle = setupDefaultVehicle();
        sim.registerAndPutObject(physicalVehicle, 1391.8239762001342 - 1.2, 832.4453015998025 + 1.1, 0.90 * Math.PI);
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1414.5795784719526 - 1.2, 887.7986460000561 - 0.3, 0.85 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1325.850224315231, 716.475290399856, 0.0, 60698562));
        sim.setSimulationLoopFrequency(30);
        sim.stopAfter(60 * 1000);
        */

        // Simulation scenario: Collision avoidance at intersection when turning left
        // Vehicle One Start Position: Bus stop Ahornstrasse in front of Informatikzentrum, End Position: Bus stop named Melatener Strasse on Halifaxstrasse with OSM Id 1223037297
        // Vehicle Two Start Position: Ahornstrasse near OSM ID 36951775, End Position: Ahornstrasse OSM ID 205455272
        physicalVehicle = setupDefaultVehicle();
        sim.registerAndPutObject(physicalVehicle, 1584.31626412008, 877.404690000371, 0.5 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1593.322563254177, 591.3829242001566, 0.0, 1223037297));
        physicalVehicle = setupDefaultVehicle();
        sim.registerAndPutObject(physicalVehicle, 1474.5398601532963, 837.4404676004327, 1.4 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1584.3162641200822, 877.404690000371, 0.0, 205455272));
        sim.setSimulationLoopFrequency(30);
        sim.stopAfter(60 * 1000);

        // Simulation scenario: Priority to Right
        // Spawn four vehicles on intersection Pauwelsstrasse / Forckenbeckstrasse / Parking lot access
        // to create a right before left priority situation - without priority mechanisms they all meet at the same time at intersection
        /*
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 966.6905532033019, 498.1714592002669, 0.8 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(907.8272188834519, 414.3760650003208, 0.0, 2571073071L));
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 982.3084859322336, 425.53842059972903, 0.3 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(853.8273088238116, 459.2580515999848, 0.0, 766905849));
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 906.8272188834519, 410.8760650003208, 1.75 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(967.5905532033019, 497.6714592002669, 0.0, 1212435114));
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 883.8273088238116, 457.7580515999848, 1.5 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(987.3084859322336, 419.83842059972903, 0.0, 1374074086));
        sim.setSimulationLoopFrequency(30);
        sim.stopAfter(90 * 1000);
        */

        // Simulation scenario: Traffic optimization
        // Spawn one driving vehicle from Nordhoffstrasse to crossing Melatener Weg / Melatener Strasse
        // This vehicle would choose to use Ahornstrasse to get there, but there will be several cars in a traffic jam
        // Spawn four non moving vehicles at crossing near Siemensstrasse and Ahornstrasse creating a traffic jam for driving vehicle
        // Thus driving car chooses to take alternative route along street Auf der Hoern
        /*
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1414.5795784719526 - 1.2, 887.7986460000561 - 0.3, 0.85 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1325.850224315231, 716.475290399856, 0.0, 60698562));
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1432.634250157141, 782.2504028641573, 1.4 * Math.PI);
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1427.328314461235, 784.0412256892611, 1.4 * Math.PI);
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1422.022378765329, 785.8320485143647, 1.4 * Math.PI);
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1416.716443069423, 787.6228713394686, 1.4 * Math.PI);
        sim.setSimulationLoopFrequency(30);
        sim.stopAfter(90 * 1000);
        */

        // Simulation scenario: Two straight streets
        // Spawn vehicles on Pariser Ring in opposite directions. Update frequency of 150 is useful for high speed testing up to 30 m/s.
        // Vehicle 1: From OSM-Node 27289814 to OSM-Node 27289817
        // Vehicle 2: From OSM-Node 15256153 to OSM-Node 2590077350
        /*
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1102.7632469426999, 748.3316597997224, 0.0 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1092.4394280349586, 1466.686708200332, 0.0, 27289817));
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 1081.4934524970931, 1404.1239389998957, 1.0 * Math.PI);
        physicalVehicle.getSimulationVehicle().navigateTo(new Node2D(1088.6064100227006, 718.4213927998137, 0.0, 2590077350L));
        sim.setSimulationLoopFrequency(150);
        sim.stopAfter(30 * 1000);
        */

        // Simulation scenario: Downhill Idle Car, no real map for this case
        // Change simulation setup to load with height map to see downhill forces
        /*
        physicalVehicle = setupDefaultVehicle();
        Simulator.getSharedInstance().registerAndPutObject(physicalVehicle, 100.0, 600.0, -0.5 * Math.PI);
        sim.setSimulationLoopFrequency(100);
        sim.stopAfter(60 * 1000);
        */
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
