const { Client } = require('ssh2');

const scriptContent = `#!/bin/bash
echo "=== NGINX STATUS ==="
systemctl status nginx
echo "=== PORTS ==="
netstat -tulpn | grep -E ':(80|443)'
echo "=== NGINX CONFIG ==="
cat /etc/nginx/sites-available/mawgood.cloud
`;

const base64Script = Buffer.from(scriptContent).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo "${base64Script}" | base64 -d > /root/check_nginx.sh && bash /root/check_nginx.sh`, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({ host: '72.62.177.210', port: 22, username: 'root', password: 'lzmC-DiHh23/&A5#6X\'7' });
