package visualization.objects;

public class OverallSimulationStatistics {

    private long numberOfTimeFramesSimulated;
    private long simulationTimeMillis;

    public long getNumberOfTimeFramesSimulated() {
        return numberOfTimeFramesSimulated;
    }

    public void setNumberOfTimeFramesSimulated(long numberOfTimeFramesSimulated) {
        this.numberOfTimeFramesSimulated = numberOfTimeFramesSimulated;
    }

    public long getSimulationTimeMillis() {
        return simulationTimeMillis;
    }

    public void setSimulationTimeMillis(long simulationTimeMillis) {
        this.simulationTimeMillis = simulationTimeMillis;
    }

}
