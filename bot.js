const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 🛡️ BLINDAGEM GLOBAL: Impede que erros do plugin Stealth derrubem o servidor
process.on('unhandledRejection', (reason, promise) => {
    console.warn('⚠️ Erro interno ignorado (Stealth plugin/aba fechada):', reason.message || reason);
});

puppeteer.use(StealthPlugin());
const app = express();
app.use(cors());
app.use(express.json());

const SITE_URL = 'https://getflixfree.vercel.app/';

// ✅ CONFIGURAÇÃO DOS 30 IPs PREMIUM DO DECODO (3 Contas)
const DECODO_PROXIES = [
    // CONTA 1 (data.txt)
    { host: 'dc.decodo.com', port: 10001, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10002, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10003, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10004, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10005, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10006, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10007, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10008, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10009, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    { host: 'dc.decodo.com', port: 10010, user: 'spnukwi4di', pass: 'k4i4umY=6KaAD3tezz' },
    
    // CONTA 2 (data (1).txt)
    { host: 'dc.decodo.com', port: 10001, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10002, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10003, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10004, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10005, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10006, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10007, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10008, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10009, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },
    { host: 'dc.decodo.com', port: 10010, user: 'spz6w15pol', pass: 'm_wtmwAvDIp3v9t5F5' },

    // CONTA 3 (data (2).txt)
    { host: 'dc.decodo.com', port: 10001, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10002, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10003, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10004, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10005, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10006, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10007, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10008, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10009, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' },
    { host: 'dc.decodo.com', port: 10010, user: 'spvzdjykgk', pass: 'Mp66ivYOem7Apt8d=n' }
];

const randomDelay = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1) + min)));

let isProcessing = false;

// 1. Validação com httpbin.org
async function proxyEstaVivo(proxyUrl, timeout = 10000) {
    try {
        const agent = new HttpsProxyAgent(proxyUrl);
        await axios.get('http://httpbin.org/ip', {
            httpAgent: agent,
            httpsAgent: agent,
            timeout: timeout,
            validateStatus: () => true
        });
        return true;
    } catch (error) {
        return false;
    }
}

// 2. Função Principal
async function executarSequenciaGetflix() {
    const maxRetries = 10; 
    
    for (let i = 0; i < maxRetries; i++) {
        // Sorteia um dos 30 IPs do Decodo
        const selectedProxy = DECODO_PROXIES[Math.floor(Math.random() * DECODO_PROXIES.length)];
        
        // URL para o Axios testar (com user e pass)
        const proxyUrlFull = `http://${selectedProxy.user}:${selectedProxy.pass}@${selectedProxy.host}:${selectedProxy.port}`;
        
        // URL para o Chrome (sem usuário e senha)
        const proxyUrlChrome = `http://${selectedProxy.host}:${selectedProxy.port}`;
        
        // Credenciais separadas para o Puppeteer
        const authCredentials = {
            username: selectedProxy.user,
            password: selectedProxy.pass
        };

        console.log(`\n[${new Date().toLocaleTimeString()}] Tentativa ${i + 1}: Validando Decodo IP (${selectedProxy.host}:${selectedProxy.port})...`);
        
        const vivo = await proxyEstaVivo(proxyUrlFull);
        if (!vivo) {
            console.log(`⏳ Proxy demorou a conectar (ou banda acabou). Tentando outro...`);
            await randomDelay(2, 4);
            continue;
        }

        console.log(`✅ Proxy validado! Abrindo navegador...`);
        
        let browser;
        let page;
        
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                executablePath: '/usr/bin/google-chrome-stable',
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox', 
                    '--disable-dev-shm-usage',
                    '--ignore-certificate-errors',
                    `--proxy-server=${proxyUrlChrome}`
                ]
            });

            page = await browser.newPage();
            
            // FAZ A AUTENTICAÇÃO DO PROXY DENTRO DO NAVEGADOR
            await page.authenticate(authCredentials);
            
            page.setDefaultTimeout(45000); 
            
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1366, height: 768 });

            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            });

            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            });

            // MONITOR DE MONETIZAÇÃO
            browser.on('targetcreated', async (target) => {
                if (target.type() === 'page') {
                    const adPage = await target.page();
                    if (adPage) {
                        try {
                            console.log('💰 [Monetização] Anúncio abriu! Contando impressão...');
                            await randomDelay(10000, 15000);
                            await adPage.close();
                            await page.bringToFront();
                            console.log('🔒 Anúncio fechado.');
                        } catch (e) {}
                    }
                }
            });

            console.log('Acessando o GETFLIX...');
            await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('#main-content .mc');

            // FUNÇÕES AUXILIARES
            const pegarCentroDoSeletor = async (seletor) => {
                return await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) return null;
                    const rect = el.getBoundingClientRect();
                    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                }, seletor);
            };

            const pegarCentroDeVarios = async (seletor) => {
                return await page.evaluate((sel) => {
                    const els = Array.from(document.querySelectorAll(sel));
                    return els.map(el => {
                        const rect = el.getBoundingClientRect();
                        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
                    }).filter(b => b.x > 0 && b.y > 0);
                }, seletor);
            };

            const moverMouseRealista = async (x, y) => {
                const steps = 10;
                for (let i = 1; i <= steps; i++) {
                    await page.mouse.move((x / steps) * i + Math.random() * 5, (y / steps) * i + Math.random() * 5);
                    await new Promise(r => setTimeout(r, 10));
                }
            };

            const clicarNasCoordenadas = async (coords) => {
                if (!coords || typeof coords.x !== 'number' || typeof coords.y !== 'number') return;
                try {
                    await moverMouseRealista(coords.x, coords.y);
                    await randomDelay(100, 300);
                    await page.mouse.click(coords.x, coords.y);
                } catch (e) {
                    console.warn('Falha ao clicar:', e.message);
                }
            };

            console.log('✅ Site carregado. Iniciando comportamento humano...');
            await moverMouseRealista(600, 400);
            await randomDelay(1000, 2000);
            
            // BLOCO 1: BUSCA
            try {
                if (Math.random() < 0.3) {
                    console.log('⌨️ Abrindo busca e digitando...');
                    const searchBtn = await pegarCentroDoSeletor('#searchToggle');
                    await clicarNasCoordenadas(searchBtn);
                    await randomDelay(500, 1000);
                    const termos = ['Batman','Anime', 'Terror'];
                    const termo = termos[Math.floor(Math.random() * termos.length)];
                    await page.type('#searchInput', termo, { delay: 100 });
                    await randomDelay(2000, 4000);
                    const closeBtn = await pegarCentroDoSeletor('#searchClose');
                    await clicarNasCoordenadas(closeBtn);
                    await randomDelay(500, 1000);
                }
            } catch (e) { console.warn('Erro na busca:', e.message); }

            await page.evaluate(() => window.scrollBy(0, 600));
            await randomDelay(1000, 3000);

            // BLOCO 2: BANNERS
            try {
                if (Math.random() < 0.4) {
                    const bannerCoords = await pegarCentroDeVarios('.ad-mobile, .ad-native');
                    if (bannerCoords.length > 0) {
                        const target = bannerCoords[Math.floor(Math.random() * bannerCoords.length)];
                        const currentUrl = page.url();
                        await clicarNasCoordenadas(target);
                        await randomDelay(2000, 4000); 
                        if (page.url() !== currentUrl) {
                            await page.goBack({ waitUntil: 'domcontentloaded' });
                            await randomDelay(1000, 2000);
                        }
                    }
                }
            } catch (e) { console.warn('Erro no banner:', e.message); }

            // BLOCO 3: FILME
            try {
                const filmeCoords = await pegarCentroDeVarios('#main-content .mc');
                if (filmeCoords.length > 0) {
                    const target = filmeCoords[Math.floor(Math.random() * filmeCoords.length)];
                    await clicarNasCoordenadas(target);
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
                }
            } catch (e) { console.warn('Erro ao clicar no filme:', e.message); }

            // BLOCO 4: PLAYER
            try {
                await page.waitForSelector('#mainPlayer', { timeout: 30000 });
                await randomDelay(2000, 4000);
                
                if (Math.random() < 0.3) {
                    const playerBanners = await pegarCentroDeVarios('.ad-mobile, .ad-sidebar');
                    if (playerBanners.length > 0) {
                        const target = playerBanners[Math.floor(Math.random() * playerBanners.length)];
                        await clicarNasCoordenadas(target);
                        await randomDelay(2000, 3000);
                    }
                }
            } catch (e) { console.warn('Erro no player:', e.message); }

            // BLOCO 5: RECOMENDAÇÕES
            try {
                await page.evaluate(() => {
                    const recs = document.getElementById('recsSection');
                    if (recs) recs.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
                await randomDelay(2000, 4000);

                const recsCoords = await pegarCentroDeVarios('#recsGrid .mc');
                if (recsCoords.length > 0) {
                    const target = recsCoords[Math.floor(Math.random() * recsCoords.length)];
                    await clicarNasCoordenadas(target);
                    await randomDelay(3000, 8000);
                }
            } catch (e) { console.warn('Erro nas recomendações:', e.message); }

            console.log('🎉 Engajamento concluído com sucesso!');
            break; 
            
        } catch (error) {
            console.warn(`⚠️ Erro fatal ou timeout estourado: ${error.message}`);
        } finally {
            try { if (page) await page.close(); } catch (e) {}
            try { if (browser) await browser.close(); } catch (e) {}
        }
    }
    console.log('Ciclo do bot finalizado.');
}

// --- LÓGICA DE LOOP (Pausa rápida: 5 a 10 segundos) ---
async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    while (true) {
        await executarSequenciaGetflix();
        
        // Pausa rápida apenas para limpar a memória do Render e não travar
        const tempoDescanso = Math.floor(Math.random() * (10 - 5 + 1) + 5);
        console.log(`\n⏳ Ciclo concluído. Próximo ciclo em ${tempoDescanso} segundos...`);
        await new Promise(r => setTimeout(r, tempoDescanso * 1000));
    }
}

// --- ENDPOINTS DA API ---
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        uptime_seconds: Math.round(process.uptime()),
        is_processing: isProcessing
    });
});

app.post('/api/engajar', async (req, res) => {
    res.status(202).json({ status: 'queued', message: 'Bot na fila.' });
    if (!isProcessing) {
        processQueue();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor de Bot rodando na porta ${PORT}`));
