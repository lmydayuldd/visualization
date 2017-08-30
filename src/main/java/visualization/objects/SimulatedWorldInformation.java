package visualization.objects;

import java.util.ArrayList;
import java.util.List;

public class SimulatedWorldInformation {

    private long timeFrame;
    private List<Car> cars;
    private long simulationTime = 0;
    private boolean raining;
    private List<PedestrianProxy> pedestrians;
    private List<Long> trafficSignals;
    private List<StaticBoxObject> staticBoxObjects;

    public SimulatedWorldInformation() {
        pedestrians = new ArrayList<>();
        cars = new ArrayList<>();
        trafficSignals = new ArrayList<>();
        staticBoxObjects = new ArrayList<>();
    }

    public boolean addAllTrafficSignals(List<Long> e) {
        return trafficSignals.addAll(e);
    }

    public List<Long> getTrafficSignals() {
        return trafficSignals;
    }


    private boolean lastFrame = false;

    public boolean isLastFrame() {
        return lastFrame;
    }

    public void setLastFrame(boolean lastFrame) {
        this.lastFrame = lastFrame;
    }

    public List<PedestrianProxy> getPedestrians() {
        return pedestrians;
    }

    public void addPedestrians(PedestrianProxy pedestrian) {
        this.pedestrians.add(pedestrian);
    }

    public boolean isRaining() {
        return raining;
    }

    public void setRaining(boolean raining) {
        this.raining = raining;
    }

    public long getSimulationTime() {
        return simulationTime;
    }

    public void setSimulationTime(long simulationTime) {
        this.simulationTime = simulationTime;
    }

    public long getTimeFrame() {
        return timeFrame;
    }

    public void setTimeFrame(long timeFrame) {
        this.timeFrame = timeFrame;
    }

    public List<Car> getCars() {
        return cars;
    }

    public void addCars(Car car) {
        this.cars.add(car);
    }

    public void addStaticBoxObject(StaticBoxObject staticBoxObject) {
        this.staticBoxObjects.add(staticBoxObject);
    }

    public List<StaticBoxObject> getStaticBoxObjects() {
        return staticBoxObjects;
    }
}
