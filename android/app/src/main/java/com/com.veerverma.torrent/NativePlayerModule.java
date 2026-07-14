package com.veerverma.torrent;

import android.app.Activity;
import android.content.Intent;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class NativePlayerModule extends ReactContextBaseJavaModule {
    private static NativePlayerModule instance;

    public NativePlayerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        instance = this;
        // Start the TorrServer subprocess
        new Thread(() -> TorrServerManager.get(reactContext).start()).start();
    }

    @Override
    public String getName() {
        return "NativePlayer";
    }

    /** Called from PlayerActivity (any thread) to forward an event to JS. */
    public static void emit(String event, WritableMap data) {
        NativePlayerModule m = instance;
        if (m != null) {
            m.getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(event, data);
        }
    }

    /**
     * Launches PlayerActivity from the current foreground Activity so it joins
     * the app's existing task/back-stack — pressing back then simply returns
     * to whichever JS screen was showing, the normal Android back behavior.
     * Falls back to the (rarer) Application-context + NEW_TASK path only if no
     * Activity is currently attached, since starting an Activity from a
     * non-Activity Context requires that flag.
     */
    private void startPlayerIntent(Intent intent) {
        Activity activity = getReactApplicationContext().getCurrentActivity();
        if (activity != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            activity.startActivity(intent);
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }

    @ReactMethod
    public void play(ReadableMap params, Promise promise) {
        String url = params.hasKey("url") ? params.getString("url") : null;
        if (url == null || url.isEmpty()) {
            promise.reject("Missing url", "Missing url");
            return;
        }
        
        String title = params.hasKey("title") ? params.getString("title") : "";
        String subtitle = params.hasKey("subtitle") ? params.getString("subtitle") : "";
        double startPercent = params.hasKey("startPercent") ? params.getDouble("startPercent") : 0.0;
        String metadataJson = params.hasKey("metadataJson") ? params.getString("metadataJson") : "{}";
        boolean hasNext = params.hasKey("hasNext") && params.getBoolean("hasNext");

        launchPlayer(url, title, subtitle, 0L, startPercent, metadataJson, hasNext);
        promise.resolve(null);
    }

    @ReactMethod
    public void stop(Promise promise) {
        PlayerActivity.requestStop();
        promise.resolve(null);
    }

    @ReactMethod
    public void getLogs(Promise promise) {
        WritableMap ret = Arguments.createMap();
        ret.putString("logs", AppLogger.readAll());
        promise.resolve(ret);
    }

    @ReactMethod
    public void clearLogs(Promise promise) {
        AppLogger.clear();
        promise.resolve(null);
    }

    @ReactMethod
    public void logClientError(String tag, String message, Promise promise) {
        AppLogger.error(tag != null ? tag : "JS", message != null ? message : "");
        promise.resolve(null);
    }

    @ReactMethod
    public void playTorrent(ReadableMap params, Promise promise) {
        String magnet = params.hasKey("magnet") ? params.getString("magnet") : null;
        if (magnet == null || magnet.isEmpty()) {
            promise.reject("Missing magnet", "Missing magnet");
            return;
        }

        String title = params.hasKey("title") ? params.getString("title") : "";
        String subtitle = params.hasKey("subtitle") ? params.getString("subtitle") : "";
        double startPercent = params.hasKey("startPercent") ? params.getDouble("startPercent") : 0.0;
        String metadataJson = params.hasKey("metadataJson") ? params.getString("metadataJson") : "{}";
        boolean hasNext = params.hasKey("hasNext") && params.getBoolean("hasNext");

        Intent intent = new Intent(getReactApplicationContext(), PlayerActivity.class);
        intent.putExtra(PlayerActivity.EXTRA_MAGNET, magnet);
        intent.putExtra(PlayerActivity.EXTRA_TITLE, title);
        intent.putExtra(PlayerActivity.EXTRA_SUBTITLE, subtitle);
        intent.putExtra(PlayerActivity.EXTRA_START_PERCENT, startPercent);
        intent.putExtra(PlayerActivity.EXTRA_METADATA, metadataJson);
        intent.putExtra(PlayerActivity.EXTRA_HAS_NEXT, hasNext);
        startPlayerIntent(intent);

        promise.resolve(null);
    }

    private void launchPlayer(String url, String title, String subtitle, long startPositionMs,
                               double startPercent, String metadataJson, boolean hasNext) {
        Intent intent = new Intent(getReactApplicationContext(), PlayerActivity.class);
        intent.putExtra(PlayerActivity.EXTRA_URL, url);
        intent.putExtra(PlayerActivity.EXTRA_TITLE, title);
        intent.putExtra(PlayerActivity.EXTRA_SUBTITLE, subtitle);
        intent.putExtra(PlayerActivity.EXTRA_START_MS, startPositionMs);
        intent.putExtra(PlayerActivity.EXTRA_START_PERCENT, startPercent);
        intent.putExtra(PlayerActivity.EXTRA_METADATA, metadataJson);
        intent.putExtra(PlayerActivity.EXTRA_HAS_NEXT, hasNext);
        startPlayerIntent(intent);
    }
}
