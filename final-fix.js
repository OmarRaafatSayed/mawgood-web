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
      const nvmSource = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"';
      
      // Fix Admin Panel with Yarn
      await execCommand(`${nvmSource} && npm install -g yarn`);
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/admin-panel && yarn install`);
      await execCommand(`${nvmSource} && cd /var/www/mawgood-web/admin-panel && yarn build`);

      // Fix Nginx Config securely using Node on the remote server
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
      // We will create a small JS file on the server and run it to write the config
      const writeScript = `const fs = require('fs'); fs.writeFileSync('/etc/nginx/sites-available/mawgood.cloud', \`${nginxConfig}\`);`;
      await execCommand(`${nvmSource} && node -e "${writeScript.replace(/"/g, '\\"').replace(/\$/g, '\\$')}"`);
      
      await execCommand(`ln -sf /etc/nginx/sites-available/mawgood.cloud /etc/nginx/sites-enabled/`);
      await execCommand(`rm -f /etc/nginx/sites-enabled/default`);
      await execCommand(`systemctl restart nginx`);
      
      // Re-run Certbot
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
