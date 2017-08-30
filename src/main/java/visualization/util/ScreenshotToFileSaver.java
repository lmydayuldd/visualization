package visualization.util;

import commons.simulation.model.Screenshot;

import javax.imageio.ImageIO;
import java.io.File;

/**
 * Created by Shahriar Robbani on 25-Mar-17.
 */
public class ScreenshotToFileSaver {
    // TODO: debug stuff
    public static void saveScreenshot(final Screenshot screenshot) throws Exception {
        String dirName = "screenshots";
        new File(dirName).mkdir();
        final long timestamp = System.currentTimeMillis();
        final String fileName = dirName + File.separator
                + "car-" + screenshot.getCarId() + "-" + timestamp
                + "." + screenshot.getExtension();
        final File outputFile = new File(fileName);
        ImageIO.write(
                screenshot.getScreenshot(),
                screenshot.getExtension(),
                outputFile
        );

    }
}
