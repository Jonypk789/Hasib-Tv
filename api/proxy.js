const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
    let targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send("No URL provided");
    }

    targetUrl = decodeURIComponent(targetUrl);

    // সার্ভারের রুট ইউআরএল বের করা (লিংক জোড়া দেওয়ার জন্য)
    const urlObj = new URL(targetUrl);
    const targetOrigin = urlObj.origin;

    const proxy = createProxyMiddleware({
        target: targetOrigin,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // আসল ম m3u8 ফাইলের পাথ সেট করা
            return urlObj.pathname + urlObj.search;
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                // আইপিটিভি সার্ভারকে বোকা বানাতে প্রিমিয়াম ইউজার এজেন্ট সেট করা
                proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                proxyReq.setHeader('Origin', targetOrigin);
                proxyReq.setHeader('Referer', targetOrigin);
            },
            proxyRes: (proxyRes, req, res) => {
                // ব্রাউজারের CORS ব্লক চিরতরে দূর করা
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', '*');
            }
        },
        logger: console
    });

    return proxy(req, res);
};
