package com.healthtracker.util;

import java.io.InputStream;
import java.util.Properties;

public final class AppVersion {

    private static final String VERSION_FILE = "version.properties";
    private static Properties properties = new Properties();

    static {
        try (InputStream is =
                AppVersion.class.getClassLoader().getResourceAsStream(VERSION_FILE)) {

            if (is != null) {
                properties.load(is);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private AppVersion() {}

    public static String getVersion() {
        return properties.getProperty("version", "UNKNOWN");
    }

    public static String getBuildDate() {
        return properties.getProperty("buildDate", "UNKNOWN");
    }
}
