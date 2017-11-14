package simulator.integration;

import commons.controller.commons.BusEntry;
import commons.controller.interfaces.FunctionBlockInterface;
import commons.map.IAdjacency;
import commons.map.IControllerNode;
import de.topobyte.osm4j.core.access.OsmInputException;
import de.topobyte.osm4j.core.dataset.InMemoryMapDataSet;
import de.topobyte.osm4j.core.dataset.MapDataSetLoader;
import de.topobyte.osm4j.core.model.iface.OsmNode;
import de.topobyte.osm4j.core.resolve.EntityNotFoundException;
import de.topobyte.osm4j.xml.dynsax.OsmXmlReader;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.math3.linear.RealVector;
import simulation.environment.World;
import simulation.environment.WorldModel;
import simulation.vehicle.PhysicalVehicle;
import simulation.vehicle.VehicleActuatorType;

import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class AutopilotAdapterAsFunctionBlock implements FunctionBlockInterface {

    private static final int MAX_INPUT_LIST_LEN = 10000;

    private final AutopilotAdapter adapter;

    private boolean isMapDataInitialized = false;
    private Long destinationNodeId = null;
    private PhysicalVehicle vehicle;

    public AutopilotAdapterAsFunctionBlock(AutopilotAdapter adapter) {
        this.adapter = adapter;
    }

    public void driveToNode(long destinationNodeId) {
        this.destinationNodeId = destinationNodeId;
    }

    public void setVehicle(PhysicalVehicle vehicle) {
        this.vehicle = vehicle;
    }

    public PhysicalVehicle getVehicle() {
        return vehicle;
    }

    @Override
    public void execute() {
        adapter.execute();
    }

    @Override
    public void setInputs(Map<String, Object> inputs) {
        adapter.initialize();
        setMapData();
        setGoal();
        double timeIncrement = (Double) inputs.get(BusEntry.SIMULATION_DELTA_TIME.toString());
        double currentVelocity = (Double) inputs.get(BusEntry.SENSOR_VELOCITY.toString());
        RealVector gps = (RealVector) inputs.get(BusEntry.SENSOR_GPS_COORDINATES.toString());
        double positionLat = gps.getEntry(0);
        double positionLon = gps.getEntry(1);
        double compass = (Double) inputs.get(BusEntry.SENSOR_COMPASS.toString());
        double engine = getCurrentActuatorValue(VehicleActuatorType.VEHICLE_ACTUATOR_TYPE_MOTOR);
        double steering = getCurrentActuatorValue(VehicleActuatorType.VEHICLE_ACTUATOR_TYPE_STEERING);
        double brakes = getCurrentActuatorValue(VehicleActuatorType.VEHICLE_ACTUATOR_TYPE_BRAKES_BACK_LEFT);
        adapter.set_timeIncrement(timeIncrement);
        adapter.set_currentVelocity(currentVelocity);
        adapter.set_currentGpsLat(positionLat);
        adapter.set_currentGpsLon(positionLon);
        adapter.set_compass(compass);
        adapter.set_currentEngine(engine);
        adapter.set_currentSteering(steering);
        adapter.set_currentBrakes(brakes);
    }

    @Override
    public Map<String, Object> getOutputs() {
        adapter.initialize();
        Map<String, Object> result = new HashMap<>();
        result.put(
                BusEntry.ACTUATOR_ENGINE.toString(),
                adapter.get_engine()
        );
        result.put(
                BusEntry.ACTUATOR_BRAKE.toString(),
                adapter.get_brakes()
        );
        result.put(
                BusEntry.ACTUATOR_STEERING.toString(),
                adapter.get_steering()
        );
        return result;
    }

    @Override
    public String[] getImportNames() {
        return new String[0];
    }

    private void setMapData() {
        if (isMapDataInitialized) {
            return;
        }
        int addNodes_length = 0;
        long[] addNodes_id = new long[MAX_INPUT_LIST_LEN];
        double[] addNodes_gpsLat = new double[MAX_INPUT_LIST_LEN];
        double[] addNodes_gpsLon = new double[MAX_INPUT_LIST_LEN];
        int addOrUpdateEdges_length = 0;
        long[] addOrUpdateEdges_fromNodeId = new long[MAX_INPUT_LIST_LEN];
        long[] addOrUpdateEdges_toNodeId = new long[MAX_INPUT_LIST_LEN];
        double[] addOrUpdateEdges_cost = new double[MAX_INPUT_LIST_LEN];
        InMemoryMapDataSet osmDataSet = getOsmDataSet();
        if (osmDataSet == null) {
            isMapDataInitialized = true;
            return;
        }
        World worldModel = WorldModel.getInstance();
        List<IAdjacency> adj = worldModel.getControllerMap().getAdjacencies();
        Set<Long> processedNodes = new HashSet<>();
        Set<ImmutablePair<Long, Long>> processedEdges = new HashSet<>();
        for (IAdjacency a : adj) {
            IControllerNode n1 = a.getNode1();
            IControllerNode n2 = a.getNode1();
            IControllerNode[] nodes = new IControllerNode[]{n1, n2};
            for (IControllerNode node : nodes) {
                long osmId = node.getOsmId();
                if (processedNodes.add(osmId)) {
                    OsmNode osmNode = null;
                    try {
                        osmNode = osmDataSet.getNode(osmId);
                    } catch (EntityNotFoundException e) {
                        // just skip it
                    }
                    if (osmNode != null) {
                        addNodes_id[addNodes_length] = osmId;
                        addNodes_gpsLat[addNodes_length] = osmNode.getLatitude();
                        addNodes_gpsLon[addNodes_length] = osmNode.getLongitude();
                        addNodes_length++;
                    }
                }
            }
            long fromId = n1.getOsmId();
            long toId = n2.getOsmId();
            ImmutablePair<Long, Long> edge = ImmutablePair.of(fromId, toId);
            if (processedEdges.add(edge)) {
                addOrUpdateEdges_fromNodeId[addOrUpdateEdges_length] = fromId;
                addOrUpdateEdges_toNodeId[addOrUpdateEdges_length] = toId;
                addOrUpdateEdges_cost[addOrUpdateEdges_length] = a.getDistance();
                addOrUpdateEdges_length++;
            }
        }
        adapter.set_addNodes_length(addNodes_length);
        if (addNodes_length > 0) {
            adapter.set_addNodes_id(addNodes_id);
            adapter.set_addNodes_gpsLat(addNodes_gpsLat);
            adapter.set_addNodes_gpsLon(addNodes_gpsLon);
        }
        adapter.set_addOrUpdateEdges_length(addOrUpdateEdges_length);
        if (addOrUpdateEdges_length > 0) {
            adapter.set_addOrUpdateEdges_fromNodeId(addOrUpdateEdges_fromNodeId);
            adapter.set_addOrUpdateEdges_toNodeId(addOrUpdateEdges_toNodeId);
            adapter.set_addOrUpdateEdges_cost(addOrUpdateEdges_cost);
        }
        isMapDataInitialized = true;
    }

    private void setGoal() {
        if (destinationNodeId == null) {
            return;
        }
        adapter.set_goalNodeId(destinationNodeId);
        destinationNodeId = null;
    }

    private double getCurrentActuatorValue(VehicleActuatorType type) {
        return vehicle.getSimulationVehicle().getVehicleActuator(type).getActuatorValueCurrent();
    }

    private static InMemoryMapDataSet getOsmDataSet() {
        InputStream input = AutopilotAdapter.class
                .getClassLoader()
                .getResourceAsStream("/map_ahornstrasse.osm");
        OsmXmlReader reader = new OsmXmlReader(input, true);
        try {
            return MapDataSetLoader.read(reader, true, true, true);
        } catch (OsmInputException e) {
            return null;
        }
    }
}
