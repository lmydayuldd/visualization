package visualization.objects;

import simulation.environment.pedestrians.Pedestrian;
import simulation.environment.pedestrians.PedestrianStreetParameters;

public class PedestrianProxy extends PedestrianStreetParameters {
    private long id;

    public PedestrianProxy(Pedestrian pedestrian) {
        super(pedestrian.getStreetParameters().isCrossing(), pedestrian.getStreetParameters().getPosition(),
                pedestrian.getStreetParameters().isDirection(), pedestrian.getStreetParameters().isLeftPavement());
        this.id = pedestrian.getId();
    }

    public long getId() {
        return id;
    }

}
