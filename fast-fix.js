const { Client } = require('ssh2');

const scriptContent = `#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "FIXING ADMIN PANEL BUILD..."
cd /var/www/mawgood-web/admin-panel
npm install -g tsup
yarn add -D tsup
yarn build

echo "FIXING NGINX PORT 80..."
systemctl stop apache2 || true
fuser -k 80/tcp || true
systemctl restart nginx

echo "RUNNING CERTBOT..."
certbot --nginx -d mawgood.cloud -d www.mawgood.cloud --non-interactive --agree-tos -m admin@mawgood.cloud
`;

const base64Script = Buffer.from(scriptContent).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo "${base64Script}" | base64 -d > /root/fast.sh && bash /root/fast.sh`, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({ host: '72.62.177.210', port: 22, username: 'root', password: 'lzmC-DiHh23/&A5#6X\'7' });
