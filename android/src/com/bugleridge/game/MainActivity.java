package com.bugleridge.game;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Thin offline wrapper. The game always loads from file:///android_asset/www/ so the save (localStorage) never moves.
 * "Check for updates" in the game menu is the only thing that touches the network: it downloads a newer build from
 * GitHub Pages into files/www, and requests for asset files are answered from there while that copy is newer.
 */
public class MainActivity extends Activity {
    static final String GAME = "file:///android_asset/www/index.html";
    static final String ASSET_PREFIX = "file:///android_asset/www/";
    static final String SITE = "https://climbhigh09.github.io/Bugle_Ridge/";
    private WebView web;
    private File updateDir;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.BLACK));
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }

        // A downloaded build is only used while it's newer than the one inside this APK.
        updateDir = new File(getFilesDir(), "www");
        String downloaded = readText(new File(updateDir, "version.txt"));
        if (downloaded == null || !newer(downloaded, installedVersion())) deleteTree(updateDir);

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                Log.i("BugleRidge", m.message() + " @" + m.sourceId() + ":" + m.lineNumber());
                return true;
            }
        });
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return !req.getUrl().toString().startsWith("file:///android_asset/");  // stay inside the game
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (!url.startsWith(ASSET_PREFIX)) return null;
                String rel = url.substring(ASSET_PREFIX.length());
                int q = rel.indexOf('?'); if (q >= 0) rel = rel.substring(0, q);
                File f = new File(updateDir, rel);
                if (rel.contains("..") || !f.isFile()) return null;
                try {
                    return new WebResourceResponse(mime(rel), "utf-8", new FileInputStream(f));
                } catch (Exception e) {
                    return null;
                }
            }
        });
        setContentView(web);
        hideBars();
        web.loadUrl(GAME);
    }

    private String installedVersion() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "0";
        }
    }

    static boolean newer(String a, String b) {
        String[] x = a.trim().split("\\."), y = b.trim().split("\\.");
        for (int i = 0; i < 3; i++) {
            int xi = i < x.length ? parseInt(x[i]) : 0, yi = i < y.length ? parseInt(y[i]) : 0;
            if (xi != yi) return xi > yi;
        }
        return false;
    }

    static int parseInt(String s) {
        try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception e) { return 0; }
    }

    static String mime(String path) {
        if (path.endsWith(".js")) return "text/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".png")) return "image/png";
        return "application/octet-stream";
    }

    static byte[] fetch(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(15000);
        c.setUseCaches(false);
        try {
            if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode() + " for " + url);
            InputStream in = c.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            for (int n; (n = in.read(buf)) > 0; ) out.write(buf, 0, n);
            return out.toByteArray();
        } finally {
            c.disconnect();
        }
    }

    static void write(File f, byte[] data) throws Exception {
        File dir = f.getParentFile();
        if (dir != null && !dir.isDirectory() && !dir.mkdirs()) throw new Exception("mkdir " + dir);
        OutputStream o = new FileOutputStream(f);
        try { o.write(data); } finally { o.close(); }
    }

    static String readText(File f) {
        try {
            if (!f.isFile()) return null;
            FileInputStream in = new FileInputStream(f);
            byte[] b = new byte[(int) f.length()];
            int n = in.read(b);
            in.close();
            return new String(b, 0, Math.max(0, n), "UTF-8").trim();
        } catch (Exception e) {
            return null;
        }
    }

    static void deleteTree(File f) {
        if (f == null || !f.exists()) return;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        f.delete();
    }

    private void sendResult(final String json) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() { web.evaluateJavascript("window.BRUpdateResult&&BRUpdateResult(" + json + ")", null); }
        });
    }

    private void hideBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    @Override
    protected void onPause() {
        // Save first, then stop all JS timers so the game costs nothing in the background.
        web.evaluateJavascript("window.BRPause&&BRPause()", null);
        web.onPause();
        web.pauseTimers();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.resumeTimers();
        hideBars();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.BRBack?BRBack():false", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String handled) {
                if (!"true".equals(handled)) MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }

    class Bridge {
        @JavascriptInterface
        public String shell() { return "android-" + installedVersion(); }

        /** Runs only when the player taps "Check for updates". Downloads into a temp folder, then swaps it in whole. */
        @JavascriptInterface
        public void checkUpdate(final String current) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        JSONObject v = new JSONObject(new String(fetch(SITE + "version.json?nc=" + System.currentTimeMillis()), "UTF-8"));
                        String latest = v.getString("version");
                        if (!newer(latest, current)) { sendResult("{\"status\":\"current\"}"); return; }
                        JSONArray files = v.getJSONArray("files");
                        File tmp = new File(getFilesDir(), "www-new");
                        deleteTree(tmp);
                        for (int i = 0; i < files.length(); i++) {
                            String rel = files.getString(i);
                            if (rel.contains("..")) continue;
                            write(new File(tmp, rel), fetch(SITE + rel + "?v=" + latest));
                        }
                        write(new File(tmp, "version.txt"), latest.getBytes("UTF-8"));
                        File old = new File(getFilesDir(), "www-old");
                        deleteTree(old);
                        if (updateDir.exists() && !updateDir.renameTo(old)) throw new Exception("swap");
                        if (!tmp.renameTo(updateDir)) throw new Exception("swap");
                        deleteTree(old);
                        sendResult("{\"status\":\"updated\",\"version\":\"" + latest.replace("\"", "") + "\"}");
                    } catch (Exception e) {
                        Log.w("BugleRidge", "update failed: " + e);
                        sendResult("{\"status\":\"error\"}");
                    }
                }
            }).start();
        }

        @JavascriptInterface
        public void restart() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { web.clearCache(false); web.loadUrl(GAME); }
            });
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null) return;
            if (Build.VERSION.SDK_INT >= 26) {
                v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                v.vibrate(ms);
            }
        }

        /** Ridge mode: drop this app's window brightness to a floor. System setting is untouched. */
        @JavascriptInterface
        public void setDim(final boolean dim) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    WindowManager.LayoutParams lp = getWindow().getAttributes();
                    lp.screenBrightness = dim ? 0.02f : WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE;
                    getWindow().setAttributes(lp);
                }
            });
        }
    }
}
