const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// 服务端内存缓存 (多级缓存的一部分)
const apiCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.use(cors());
app.use(express.json());
app.use(express.static('.', {
    maxAge: '1d' // 浏览器缓存静态资源
}));

app.get('/api/proxy', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: '缺少url参数' });
        }
        
        const decodedUrl = decodeURIComponent(url);

        // 检查缓存
        if (apiCache.has(decodedUrl)) {
            const cachedData = apiCache.get(decodedUrl);
            if (Date.now() - cachedData.timestamp < CACHE_TTL) {
                console.log('HIT API CACHE:', decodedUrl);
                res.set('Cache-Control', 'public, max-age=600'); // 允许浏览器缓存10分钟
                return res.json(cachedData.data);
            } else {
                apiCache.delete(decodedUrl); // 缓存失效策略
            }
        }
        
        console.log('代理请求:', decodedUrl);
        
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Referer': decodedUrl.substring(0, decodedUrl.indexOf('/', 8))
            },
            timeout: 15000
        });
        
        const contentType = response.headers.get('content-type');
        
        let responseData;
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const text = await response.text();
            try {
                responseData = JSON.parse(text);
            } catch (e) {
                responseData = text;
            }
        }
        
        // 保存到缓存
        if (typeof responseData === 'object') {
            apiCache.set(decodedUrl, { data: responseData, timestamp: Date.now() });
        }
        
        res.set('Cache-Control', 'public, max-age=600');
        res.json(responseData);
    } catch (error) {
        console.error('代理错误:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`影视网站服务已启动:`);
    console.log(`- 网站地址: http://localhost:${PORT}`);
    console.log(`- 代理接口: http://localhost:${PORT}/api/proxy?url=xxx`);
});
