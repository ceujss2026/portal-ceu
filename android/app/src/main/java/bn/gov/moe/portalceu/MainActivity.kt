package bn.gov.moe.portalceu

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar

    // Target Production URL rasmi di Vercel
    private val TARGET_URL = "https://rsvp-ceu.vercel.app"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        progressBar = findViewById(R.id.progressBar)

        // Konfigurasi WebSettings untuk PWA & Google Apps Script API
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            // Buang pengenalpastian WebView supaya Vercel / PWA melayan aplikasi seperti Chrome Pelayar Penuh
            userAgentString = userAgentString.replace("; wv", "")
        }

        // Pengendali Tarik untuk Muat Semula (Pull-to-refresh)
        swipeRefreshLayout.setColorSchemeResources(R.color.primary, R.color.accent)
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

        // Pengendali Muat Naik Bar Kemajuan
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                    swipeRefreshLayout.isRefreshing = false
                }
            }
        }

        // Pengendali URL & Pintasan WhatsApp (+6738669690)
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                // 1. Pintasan WhatsApp Rasmi Urus Setia (+6738669690)
                if (url.startsWith("https://wa.me/") || url.startsWith("whatsapp://") || url.contains("api.whatsapp.com")) {
                    try {
                        val waIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(waIntent)
                        return true
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "WhatsApp tidak ditemui pada peranti ini.", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }

                // 2. Pintasan Telefon & Emel
                if (url.startsWith("tel:") || url.startsWith("mailto:")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        return false
                    }
                }

                // 3. Kekalkan navigasi dalam domain rsvp-ceu.vercel.app
                if (url.contains("rsvp-ceu.vercel.app") || url.contains("portal-ceu2026.vercel.app")) {
                    return false
                }

                // Pautan luar dibuka melalui pelayar luar telefon
                return try {
                    val extIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(extIntent)
                    true
                } catch (e: Exception) {
                    false
                }
            }
        }

        // Pengendali Butang Kembali (Back Button)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Muat laman Vercel jika pertama kali dibuka
        if (savedInstanceState == null) {
            webView.loadUrl(TARGET_URL)
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
}
