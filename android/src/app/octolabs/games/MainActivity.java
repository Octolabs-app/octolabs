package app.octolabs.games;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Online games shell. No native JavaScript bridge or bundled offline game copy. */
public class MainActivity extends Activity {
    private static final String HOME = "https://octolabs.app/";
    private WebView web;
    private LinearLayout offline;
    private String retryUrl = HOME;

    private boolean trusted(Uri uri) {
        return "https".equals(uri.getScheme()) && uri.getUserInfo() == null
            && (uri.getPort() == -1 || uri.getPort() == 443)
            && ("octolabs.app".equals(uri.getHost()) || "octoquiz.octolabs.app".equals(uri.getHost()));
    }

    private void openBrowser(Uri uri) {
        if (!"https".equals(uri.getScheme()) || uri.getHost() == null) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException error) { Toast.makeText(this, "No browser is available.", Toast.LENGTH_LONG).show(); }
    }

    private void showOffline() { offline.setVisibility(View.VISIBLE); web.setVisibility(View.INVISIBLE); }

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        int ivory = Color.rgb(245, 242, 233);
        getWindow().setStatusBarColor(ivory);
        getWindow().setNavigationBarColor(ivory);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        FrameLayout root = new FrameLayout(this);
        web = new WebView(this);
        web.setBackgroundColor(ivory);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        offline = new LinearLayout(this);
        offline.setOrientation(LinearLayout.VERTICAL);
        offline.setGravity(android.view.Gravity.CENTER);
        offline.setPadding(32, 32, 32, 32);
        offline.setBackgroundColor(ivory);
        TextView notice = new TextView(this);
        notice.setText("Octolabs needs a connection.\nCheck your internet and try again.");
        notice.setTextColor(Color.rgb(37, 79, 56));
        notice.setTextSize(20);
        notice.setGravity(android.view.Gravity.CENTER);
        offline.addView(notice);
        Button retry = new Button(this);
        retry.setText("Try again");
        retry.setOnClickListener(v -> { offline.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); web.loadUrl(retryUrl); });
        offline.addView(retry);
        offline.setVisibility(View.GONE);
        root.addView(offline, new FrameLayout.LayoutParams(-1, -1));
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (trusted(uri)) return false;
                if (request.isForMainFrame()) openBrowser(uri);
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                if (trusted(Uri.parse(url))) retryUrl = url;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 400) showOffline();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
                if (!trusted(Uri.parse(url))) { result.cancel(); return true; }
                new AlertDialog.Builder(MainActivity.this).setMessage(message)
                    .setPositiveButton("Continue", (d, w) -> result.confirm())
                    .setNegativeButton("Cancel", (d, w) -> result.cancel())
                    .setOnCancelListener(d -> result.cancel()).show();
                return true;
            }
        });
        web.setDownloadListener((url, agent, disposition, mime, length) -> openBrowser(Uri.parse(url)));
        setContentView(root);
        if (saved == null || web.restoreState(saved) == null) web.loadUrl(HOME);
    }

    @Override protected void onSaveInstanceState(Bundle out) { web.saveState(out); super.onSaveInstanceState(out); }
    @Override public void onBackPressed() {
        if (offline.getVisibility() == View.VISIBLE) { offline.setVisibility(View.GONE); web.setVisibility(View.VISIBLE); }
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
