const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');

  const execCommand = (cmd) => {
    return new Promise((resolve) => {
      console.log(`\n--- RUNNING: ${cmd} ---`);
      conn.exec(cmd, (err, stream) => {
        if (err) return resolve({ code: -1, output: err.message });
        
        let output = '';
        stream.on('close', (code) => {
          console.log(`--- DONE with code ${code} ---`);
          resolve({ code, output });
        }).on('data', (data) => {
          process.stdout.write(data);
          output += data;
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
          output += data;
        });
      });
    });
  };

  (async () => {
    try {
      // 1. Install Node 20 properly using nvm to avoid old ubuntu packages
      await execCommand('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash');
      const nvmSource = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"';
      await execCommand(`${nvmSource} && nvm install 20 && nvm use 20 && nvm alias default 20`);
      
      // 2. Install PM2 with Node 20
      await execCommand(`${nvmSource} && npm install -g pm2`);
      
      // 3. Build Backend
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/backend && npm install`);
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/backend && npm run build`);
      await execCommand(`${nvmSource} && pm2 delete mawgood-backend || true`);
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/backend && npx medusa db:migrate`);
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/backend && pm2 start npm --name "mawgood-backend" -- run start`);
      await execCommand(`${nvmSource} && pm2 save`);

      // 4. Build Admin Panel
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/admin-panel && npm install`);
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/admin-panel && npm run build`);

      // 5. Setup Nginx for mawgood.cloud
      const nginxConfig = `
server {
    listen 80;
    server_name mawgood.cloud www.mawgood.cloud;

    location / {
        root /var/www/mawgood-web/admin-panel/dist;
        try_files $uri $uri/ /index.html;
    }

    location /store {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
`;
      await execCommand(`echo "${nginxConfig}" > /etc/nginx/sites-available/mawgood.cloud`);
      await execCommand(`ln -sf /etc/nginx/sites-available/mawgood.cloud /etc/nginx/sites-enabled/`);
      await execCommand(`rm -f /etc/nginx/sites-enabled/default`);
      await execCommand(`systemctl restart nginx`);
      
      // 6. Run Certbot
      await execCommand(`certbot --nginx -d mawgood.cloud -d www.mawgood.cloud --non-interactive --agree-tos -m admin@mawgood.cloud`);

      console.log('ALL DONE SUCCESSFULLY!');
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      conn.end();
    }
  })();
}).connect({
  host: '72.62.177.210',
  port: 22,
  username: 'root',
  password: 'lzmC-DiHh23/&A5#6X\'7'
});
