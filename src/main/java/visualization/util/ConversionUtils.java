package visualization.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import visualization.objects.Car;
import visualization.objects.TrafficSignal;
import commons.utils.Geometry;
import javafx.geometry.Point3D;
import simulation.environment.pedestrians.Pedestrian;
import simulation.environment.object.Tree;
import simulation.environment.visualisationadapter.interfaces.EnvNode;
import simulation.vehicle.PhysicalVehicle;
import simulation.vehicle.VehicleActuatorType;

/**
 * Utility class.
 */
public class ConversionUtils {

    private ConversionUtils() {
    }

    public static List<Car> physicalVehicles2Cars(Collection<PhysicalVehicle> cars) {
        if (cars == null) {
            return new ArrayList<>();
        }
        List<Car> carModels = cars.stream().map(ConversionUtils::physicalVehicle2Car).collect(Collectors.toList());
        for (int i = 0; i < carModels.size(); i++) {
            carModels.get(i).setId(i);
        }
        return carModels;
    }

    public static Car physicalVehicle2Car(PhysicalVehicle car) {
        Car result = new Car();
        result.setId(car.getId());
        result.setPosition(Geometry.realVector2Point3D(car.getGeometryPos()));
        result.setAcceleration(Geometry.realVector2Point3D(car.getAcceleration()));
        result.setVelocity(Geometry.realVector2Point3D(car.getVelocity()));
        result.setSteeringAngle(car.getSimulationVehicle()
                .getVehicleActuator(VehicleActuatorType.VEHICLE_ACTUATOR_TYPE_STEERING).getActuatorValueCurrent());
        result.setRotation(car.getGeometryRot());
        return result;
    }

    public static List<Point3D> envNodes2Points3D(Collection<EnvNode> envNodes) {
        if (envNodes == null) {
            return new ArrayList<>();
        }
        return envNodes.stream().map(ConversionUtils::envNode2Point3D).collect(Collectors.toList());
    }

    public static Point3D envNode2Point3D(EnvNode envNode) {
        double x = envNode.getX().doubleValue();
        double y = envNode.getY().doubleValue();
        double z = envNode.getZ().doubleValue();
        return new Point3D(x, y, z);
    }

    public static List<Point3D> envPedestrians2Pedestrians(Collection<Pedestrian> pedestrians) {
        if (pedestrians == null) {
            return new ArrayList<>();
        }
        return pedestrians.stream().map(ConversionUtils::envPedestrian2Pedestrian).collect(Collectors.toList());
    }

    public static Point3D envPedestrian2Pedestrian(Pedestrian pedestrian) {
        return Geometry.realVector2Point3D(pedestrian.getGeometryPos());
    }

    public static List<Tree> envTrees2simuTrees(Collection<EnvNode> trees) {
        if (trees == null) {
            return new ArrayList<>();
        }
        return trees.stream().map(ConversionUtils::envNode2simuTree).collect(Collectors.toList());
    }

    public static Tree envNode2simuTree(EnvNode envNode) {
        Tree t = new Tree();
        t.setPosition(Geometry.point3D2RealVector(ConversionUtils.envNode2Point3D(envNode)));
        return t;
    }

    public static List<Point3D> simuTrees2TreeModels(List<Tree> trees) {
        if (trees == null) {
            return new ArrayList<>();
        }
        return trees.stream().map(ConversionUtils::simuTree2TreeModel).collect(Collectors.toList());
    }

    public static Point3D simuTree2TreeModel(Tree t) {
        return Geometry.realVector2Point3D(t.getGeometryPos());
    }

    public static TrafficSignal convertTrafficSignal(
            simulation.environment.visualisationadapter.interfaces.TrafficSignal signal) {
        TrafficSignal trafficSignal = new TrafficSignal();
        trafficSignal.setSignalA(signal.getSignalA().toString());
        trafficSignal.setSignalB(signal.getSignalB().toString());
        return trafficSignal;
    }

}
