import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

function agentDevApiPlugin() {
  return {
    name: 'agent-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/agent' && req.method === 'POST') {
          try {
            const { handleAgentRequest } = await import('./api/agentHandler.js');

            let bodyStr = '';
            for await (const chunk of req) {
              bodyStr += chunk;
            }

            const headers = new Headers();
            for (const [k, v] of Object.entries(req.headers)) {
              if (v) headers.set(k, Array.isArray(v) ? v.join(',') : v);
            }

            const webReq = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
              method: 'POST',
              headers,
              body: bodyStr,
            });

            const webRes = await handleAgentRequest(webReq);

            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            if (webRes.body) {
              const reader = webRes.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
              res.end();
            } else {
              const text = await webRes.text();
              res.end(text);
            }
          } catch (err) {
            console.error('Agent Dev API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), agentDevApiPlugin()],
  assetsInclude: ['**/*.glb'],
});
