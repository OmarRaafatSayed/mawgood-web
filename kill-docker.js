const { Client } = require('ssh2');

const scriptContent = `#!/bin/bash
echo "=== DOCKER CONTAINERS ==="
docker ps -a
docker stop $(docker ps -aq) || true
docker rm $(docker ps -aq) || true

echo "=== RESTARTING NGINX ==="
systemctl restart nginx
netstat -tulpn | grep -E ':(80|443)'
`;

const base64Script = Buffer.from(scriptContent).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo "${base64Script}" | base64 -d > /root/dockerkill.sh && bash /root/dockerkill.sh`, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({ host: '72.62.177.210', port: 22, username: 'root', password: 'lzmC-DiHh23/&A5#6X\'7' });
