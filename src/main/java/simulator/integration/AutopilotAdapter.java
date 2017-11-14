package simulator.integration;

public final class AutopilotAdapter {

    static {
        // make sure the corresponding DLL is on the classpath
        // when the java app with simulation is started
        System.loadLibrary("AutopilotAdapter");
    }

    private boolean isInitialized = false;

    public void execute() {
        initialize();
        exec();
    }

    public void initialize() {
        if (!isInitialized) {
            init();
            isInitialized = true;
        }
    }

    public native void set_timeIncrement(double timeIncrement);

    public native void set_currentVelocity(double currentVelocity);

    public native void set_currentGpsLat(double currentGpsLat);

    public native void set_currentGpsLon(double currentGpsLon);

    public native void set_compass(double compass);

    public native void set_currentEngine(double currentEngine);

    public native void set_currentSteering(double currentSteering);

    public native void set_currentBrakes(double currentBrakes);

    public native void set_goalNodeId(long goalNodeId);

    public native void set_addNodes_length(int addNodes_length);

    public native void set_addNodes_id(long[] addNodes_id);

    public native void set_addNodes_gpsLat(double[] addNodes_gpsLat);

    public native void set_addNodes_gpsLon(double[] addNodes_gpsLon);

    public native void set_removeNodes_length(int removeNodes_length);

    public native void set_removeNodes_id(long[] removeNodes_id);

    public native void set_addOrUpdateEdges_length(int addOrUpdateEdges_length);

    public native void set_addOrUpdateEdges_fromNodeId(long[] addOrUpdateEdges_fromNodeId);

    public native void set_addOrUpdateEdges_toNodeId(long[] addOrUpdateEdges_toNodeId);

    public native void set_addOrUpdateEdges_cost(double[] addOrUpdateEdges_cost);

    public native void set_removeEdges_length(int removeEdges_length);

    public native void set_removeEdges_fromNodeId(long[] removeEdges_fromNodeId);

    public native void set_removeEdges_toNodeId(long[] removeEdges_toNodeId);

    public native double get_engine();

    public native double get_steering();

    public native double get_brakes();

    private native void exec();

    private native void init();
}
