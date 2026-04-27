const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');

  const execCommand = (cmd) => {
    return new Promise((resolve, reject) => {
      console.log(`\n--- RUNNING: ${cmd} ---`);
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        
        let output = '';
        stream.on('close', (code, signal) => {
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
      // 1. Ensure npm and nginx are installed
      await execCommand('export DEBIAN_FRONTEND=noninteractive; apt-get install -y npm nginx certbot python3-certbot-nginx');
      
      // Install PM2 correctly
      await execCommand('npm install -g pm2');
      
      // 2. Install and Build Backend
      await execCommand('cd /var/www/mawgood-web/backend && npm install');
      await execCommand('cd /var/www/mawgood-web/backend && npm run build');
      
      // 3. Start Backend
      await execCommand('pm2 delete mawgood-backend || true');
      await execCommand('cd /var/www/mawgood-web/backend && npx medusa db:migrate');
      await execCommand('cd /var/www/mawgood-web/backend && pm2 start npm --name "mawgood-backend" -- run start');
      await execCommand('pm2 save');
      
      // 4. Install and Build Admin Panel
      await execCommand('cd /var/www/mawgood-web/admin-panel && npm install');
      await execCommand('cd /var/www/mawgood-web/admin-panel && npm run build');
      
      console.log('BUILD AND STARTUP DONE!');
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
