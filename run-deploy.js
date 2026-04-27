const { Client } = require('ssh2');

const scriptContent = `#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

cd /var/www/mawgood-web
npm install -g yarn
yarn install
cd admin-panel
yarn build

cat << 'EOF' > /etc/nginx/sites-available/mawgood.cloud
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
EOF

ln -sf /etc/nginx/sites-available/mawgood.cloud /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

certbot --nginx -d mawgood.cloud -d www.mawgood.cloud --non-interactive --agree-tos -m admin@mawgood.cloud
`;

const base64Script = Buffer.from(scriptContent).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(`echo "${base64Script}" | base64 -d > /root/deploy.sh && bash /root/deploy.sh`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('--- DONE with code', code, '---');
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '72.62.177.210',
  port: 22,
  username: 'root',
  password: 'lzmC-DiHh23/&A5#6X\'7'
});
