const { Client } = require('ssh2');

const scriptContent = `#!/bin/bash
certbot --nginx -d mawgood.cloud -d www.mawgood.cloud --non-interactive --agree-tos -m admin@mawgood.cloud
systemctl restart nginx
`;

const base64Script = Buffer.from(scriptContent).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo "${base64Script}" | base64 -d > /root/ssl.sh && bash /root/ssl.sh`, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({ host: '72.62.177.210', port: 22, username: 'root', password: 'lzmC-DiHh23/&A5#6X\'7' });
