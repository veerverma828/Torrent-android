package com.veerverma.torrent;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApkUpdaterModule extends ReactContextBaseJavaModule {
    private volatile boolean cancelRequested = false;
    private volatile Thread downloadThread;
    private File downloadedFile;

    public ApkUpdaterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ApkUpdater";
    }

    private void sendEvent(String eventName, WritableMap params) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void download(String url, Promise promise) {
        if (url == null) {
            promise.reject("Missing url", "Missing url");
            return;
        }

        cancelRequested = false;
        downloadThread = new Thread(() -> runDownload(promise, url));
        downloadThread.start();
    }

    private void runDownload(Promise promise, String urlString) {
        HttpURLConnection connection = null;
        try {
            File outFile = new File(getReactApplicationContext().getCacheDir(), "torrent-update.apk");
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(true);
            connection.connect();

            int totalBytes = connection.getContentLength();
            long downloaded = 0;
            int lastPercent = -1;

            try (InputStream input = connection.getInputStream();
                 FileOutputStream output = new FileOutputStream(outFile)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    if (cancelRequested) {
                        outFile.delete();
                        WritableMap data = Arguments.createMap();
                        sendEvent("downloadCancelled", data);
                        promise.resolve(null);
                        return;
                    }
                    output.write(buffer, 0, read);
                    downloaded += read;

                    if (totalBytes > 0) {
                        int percent = (int) ((downloaded * 100) / totalBytes);
                        if (percent != lastPercent) {
                            lastPercent = percent;
                            WritableMap progress = Arguments.createMap();
                            progress.putInt("percent", percent);
                            progress.putDouble("bytesDownloaded", downloaded);
                            progress.putInt("totalBytes", totalBytes);
                            sendEvent("downloadProgress", progress);
                        }
                    }
                }
            }

            downloadedFile = outFile;
            WritableMap ret = Arguments.createMap();
            ret.putString("filePath", outFile.getAbsolutePath());
            sendEvent("downloadComplete", ret);
            promise.resolve(ret);
        } catch (Exception e) {
            WritableMap err = Arguments.createMap();
            err.putString("message", e.getMessage() != null ? e.getMessage() : "Download failed");
            sendEvent("downloadError", err);
            promise.reject("Download failed", e);
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    @ReactMethod
    public void cancelDownload(Promise promise) {
        cancelRequested = true;
        promise.resolve(null);
    }

    @ReactMethod
    public void canInstall(Promise promise) {
        WritableMap ret = Arguments.createMap();
        boolean can = Build.VERSION.SDK_INT < Build.VERSION_CODES.O
                || getReactApplicationContext().getPackageManager().canRequestPackageInstalls();
        ret.putBoolean("allowed", can);
        promise.resolve(ret);
    }

    @ReactMethod
    public void openInstallPermissionSettings(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("No activity available", "No activity available");
            return;
        }
        Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
        intent.setData(Uri.parse("package:" + activity.getPackageName()));
        activity.startActivity(intent);
        promise.resolve(null);
    }

    @ReactMethod
    public void install(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("No activity available", "No activity available");
            return;
        }
        if (downloadedFile == null || !downloadedFile.exists()) {
            promise.reject("No downloaded APK to install", "No downloaded APK to install");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && !getReactApplicationContext().getPackageManager().canRequestPackageInstalls()) {
            promise.reject("Install permission not granted", "Install permission not granted");
            return;
        }

        Uri apkUri = FileProvider.getUriForFile(
                activity, activity.getPackageName() + ".fileprovider", downloadedFile);

        Intent installIntent = new Intent(Intent.ACTION_VIEW);
        installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
        installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(installIntent);
        promise.resolve(null);
    }
}
