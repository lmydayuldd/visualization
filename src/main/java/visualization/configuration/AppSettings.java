package visualization.configuration;

import java.io.IOException;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * Application settings.
 */
@Component
@Scope("singleton")
public class AppSettings {

    private static final Logger logger = Logger.getLogger(AppSettings.class);

    private boolean enableScreenshots;
    private boolean saveScreenshotsToFs;
    private int screenshotFrequency = 10;
    private int renderFlequency = 10;

    public AppSettings() {
        Properties properties = new Properties();
        try {
            properties.load(this.getClass().getResourceAsStream("/app-settings.properties"));
        } catch (IOException ex) {
            properties = null;
            logger.error(ex);
        }
        if (properties != null) {
            this.enableScreenshots = getBoolean(properties, "enableScreenshots", false);
            this.saveScreenshotsToFs = getBoolean(properties, "saveScreenshotsToFs", false);
            this.screenshotFrequency = getInt(properties, "screenshotFrequency", 10);
            this.renderFlequency = getInt(properties, "renderFlequency", 10);
        }
    }

    public boolean isEnableScreenshots() {
        return enableScreenshots;
    }

    public boolean isSaveScreenshotsToFs() {
        return saveScreenshotsToFs;
    }

    public int getScreenshotFrequency() {
        return screenshotFrequency;
    }

    public int getRenderFlequency() {
        return renderFlequency;
    }

    private boolean getBoolean(Properties props, String propName, boolean defaultValue) {
        String val = props.getProperty(propName);
        if (val == null) {
            return defaultValue;
        }
        return "true".equals(val.trim().toLowerCase());
    }

    private int getInt(Properties props, String propName, int defaultValue) {
        String val = props.getProperty(propName);
        if (val == null) {
            return defaultValue;
        }
        int value = 0;
        try {
            value = Integer.parseInt(val);
        } catch (Exception e) {
            return defaultValue;
        }

        return value;
    }

}
