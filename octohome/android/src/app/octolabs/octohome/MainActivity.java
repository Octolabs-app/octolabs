package app.octolabs.octohome;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.net.Uri;
import android.webkit.*;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;

public class MainActivity extends Activity {
    private WebView web;
    private static final String HOST = "appassets.androidplatform.net";
    private static final String[] ASSETS = {"index.html", "style.css", "model.js", "app.js"};
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().setStatusBarColor(Color.rgb(245,245,247));
        getWindow().setNavigationBarColor(Color.rgb(245,245,247));
        getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(245,245,247));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !"https".equals(request.getUrl().getScheme()) || !HOST.equals(request.getUrl().getHost());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                String path = u.getPath();
                if ("https".equals(u.getScheme()) && HOST.equals(u.getHost()) && path != null && path.startsWith("/assets/")) {
                    String name = path.substring(8);
                    if (Arrays.asList(ASSETS).contains(name)) {
                        try {
                            String mime = name.endsWith(".html") ? "text/html" : name.endsWith(".css") ? "text/css" : "application/javascript";
                            return new WebResourceResponse(mime, "UTF-8", getAssets().open(name));
                        } catch (IOException ignored) { }
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", null, new ByteArrayInputStream(new byte[0]));
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
                new android.app.AlertDialog.Builder(MainActivity.this).setMessage(message)
                    .setPositiveButton("Continue", (d,w)->result.confirm()).setNegativeButton("Cancel",(d,w)->result.cancel())
                    .setOnCancelListener(d->result.cancel()).show(); return true;
            }
        });
        setContentView(web);
        web.loadUrl("https://" + HOST + "/assets/index.html");
    }
    @Override public void onBackPressed() { if(web.canGoBack())web.goBack();else super.onBackPressed(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
