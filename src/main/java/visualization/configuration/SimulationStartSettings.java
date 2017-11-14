package visualization.configuration;

public class SimulationStartSettings {

    private Integer scenarioNo;

    private boolean isNativeModel = false;

    public Integer getScenarioNo() {
        return scenarioNo;
    }

    public void setScenarioNo(Integer scenarioNo) {
        this.scenarioNo = scenarioNo;
    }

    public boolean isNativeModel() {
        return isNativeModel;
    }

    public void setNativeModel(boolean nativeModel) {
        isNativeModel = nativeModel;
    }
}
