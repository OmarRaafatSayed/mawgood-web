const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.shell((err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Stream :: close');
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    });

    const runCommand = (cmd, waitTime = 5000) => {
      return new Promise((resolve) => {
        console.log(`\n\n--- RUNNING: ${cmd} ---`);
        stream.write(cmd + '\n');
        setTimeout(resolve, waitTime);
      });
    };

    (async () => {
      // 1. Install Node.js, Redis, and Postgres
      await runCommand('curl -fsSL https://deb.nodesource.com/setup_20.x | bash -', 15000);
      await runCommand('apt-get install -y nodejs redis-server postgresql postgresql-contrib', 30000);
      
      // 2. Install PM2
      await runCommand('npm install -g pm2', 15000);
      
      // 3. Setup Postgres Database
      await runCommand('sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD \'02486\';"', 5000);
      await runCommand('sudo -u postgres psql -c "CREATE DATABASE mercurjs;"', 5000);
      
      // 4. Clone repository
      await runCommand('mkdir -p /var/www && cd /var/www && rm -rf mawgood-web && git clone https://github.com/OmarRaafatSayed/mawgood-web.git', 15000);
      
      // 5. Setup Backend
      await runCommand('cd /var/www/mawgood-web/backend', 2000);
      await runCommand('echo "STORE_CORS=http://localhost:8000,https://docs.medusajs.com\nADMIN_CORS=http://localhost:5173,http://localhost:9000,http://localhost:7001,https://docs.medusajs.com\nAUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:7001,https://docs.medusajs.com\nREDIS_URL=redis://localhost:6379\nJWT_SECRET=supersecret\nCOOKIE_SECRET=supersecret\nDATABASE_URL=postgresql://postgres:02486@localhost:5432/mercurjs\nDB_NAME=mercurjs" > .env', 2000);
      await runCommand('npm install', 45000);
      await runCommand('npm run build', 30000);
      
      // Run Medusa migrations (usually needed for first run)
      await runCommand('npx medusa db:migrate', 15000);
      
      // Start Backend with PM2
      await runCommand('pm2 start npm --name "mawgood-backend" -- run start', 5000);
      
      // 6. Setup Admin Panel
      await runCommand('cd /var/www/mawgood-web/admin-panel', 2000);
      await runCommand('npm install', 45000);
      await runCommand('npm run build', 30000);
      
      console.log('DONE!');
      stream.end('exit\n');
    })();
  });
}).connect({
  host: '72.62.177.210',
  port: 22,
  username: 'root',
  password: 'lzmC-DiHh23/&A5#6X\'7'
});
