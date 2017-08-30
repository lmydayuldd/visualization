package visualization.configuration;

/**
 * Helper class with constants.
 */
public final class Messaging {

    private Messaging() {
    }

    public final static String ENPOINT = "/messaging";
    public final static String BROCKER_DESTINATION_PREFIX = "/event";
    public final static String APPLICATION_DESTINATION_PREFIX = "/app";

    //outgoing
    public final static String EVENT_MESSAGE = BROCKER_DESTINATION_PREFIX + "/message";
    public final static String EVENT_NEXT_SIMULATION_TIME_FRAME = "/event/nextSimulationTimeFrame";
    public final static String EVENT_END_OF_SIMULATION = "/event/endOfSimulation";
    public final static String EVENT_COMMAND = BROCKER_DESTINATION_PREFIX + "/command";

    //incoming
    public final static String SCREENSHOT = "/screenshot";
    public final static String GET_NEXT_FRAME = "/getnextframe";

    public final static String START = "/start";
    public final static String STOP = "/stop";

    public final static int MESSAGE_SIZE_LIMIT_KB = 5000;

}
