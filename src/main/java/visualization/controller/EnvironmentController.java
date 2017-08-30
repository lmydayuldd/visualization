package visualization.controller;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import visualization.objects.PedestrianProxy;
import visualization.configuration.RestApi;
import simulation.environment.World;
import simulation.environment.WorldModel;
import simulation.environment.osm.ParserSettings;
import simulation.environment.pedestrians.Pedestrian;
import simulation.environment.visualisationadapter.interfaces.VisualisationEnvironmentContainer;
import simulation.environment.weather.Weather;
import simulation.environment.weather.WeatherSettings;

@Controller
@RequestMapping(value = "/env")
public class EnvironmentController {
    
     private static final Logger logger = Logger.getLogger(EnvironmentController.class);
    
    public EnvironmentController() {
        logger.info("World is initialling....");
        
        WeatherSettings weatherSettings = new WeatherSettings(Weather.SUNSHINE);
        ParserSettings parserSettings = new ParserSettings("/map_ahornstrasse.osm", ParserSettings.ZCoordinates.ALLZERO);

        try {
            WorldModel.init(parserSettings, weatherSettings);
        } catch (Exception e) {
            logger.warn(e);
        }
    }

    @RequestMapping(value = RestApi.WORLD, method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody VisualisationEnvironmentContainer getWorld() throws Exception {
        logger.info("sending world map to client....");
        World world = WorldModel.getInstance();
        return world.getContainer();
    }

    @RequestMapping(value = RestApi.PEDESTRIANS, method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody List<PedestrianProxy> getPedestrians() throws Exception {
        logger.info("sending PEDESTRIANS list to client....");
        List<PedestrianProxy> pedestrians = new ArrayList<>();
        World world = WorldModel.getInstance();
        for (Pedestrian pedestrian : world.getPedestrianContainer().getPedestrians()) {
            pedestrians.add(new PedestrianProxy(pedestrian));
        }
        return pedestrians;
    }
    
    @RequestMapping(value = RestApi.GROUNT_FOR_NONSTREET, method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody Number getGroundForNonStreet(Number x, Number y) {
        World world = WorldModel.getInstance();
        return world.getGroundForNonStreet(x, y);
    }

}
