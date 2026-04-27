const { Client } = require('ssh2');

const scriptContent = `#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "=== FIXING BUILD ==="
cd /var/www/mawgood-web
# Install all dependencies from the root monorepo
yarn install --network-timeout 1000000

cd admin-panel
# Ensure dist exists and has an index.html just in case build fails so nginx doesn't 404
mkdir -p dist
echo "<h1>Building... please wait</h1>" > dist/index.html
yarn build

echo "=== FIXING NGINX ==="
cat << 'EOF' > /etc/nginx/sites-available/mawgood.cloud
server {
    listen 80;
    server_name mawgood.cloud www.mawgood.cloud;

    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }

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

# Make sure PM2 is not hijacking port 80
fuser -k 80/tcp || true
systemctl restart nginx

echo "=== RUNNING CERTBOT ==="
certbot --nginx -d mawgood.cloud -d www.mawgood.cloud --non-interactive --agree-tos -m admin@mawgood.cloud

echo "=== RESTARTING BACKEND ==="
cd /var/www/mawgood-web/backend
pm2 start npm --name "mawgood-backend" -- run start
pm2 save
`;

const base64Script = Buffer.from(scriptContent).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo "${base64Script}" | base64 -d > /root/repair.sh && bash /root/repair.sh`, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({ host: '72.62.177.210', port: 22, username: 'root', password: 'lzmC-DiHh23/&A5#6X\'7' });
