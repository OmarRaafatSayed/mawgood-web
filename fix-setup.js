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
      // 1. Fix dpkg locks in case previous attempt hung
      await execCommand('killall -9 apt-get dpkg || true');
      await execCommand('rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock');
      await execCommand('export DEBIAN_FRONTEND=noninteractive; dpkg --configure -a');

      // 2. Install Node.js, Redis, Postgres
      await execCommand('export DEBIAN_FRONTEND=noninteractive; apt-get update');
      await execCommand('export DEBIAN_FRONTEND=noninteractive; apt-get install -y nodejs redis-server postgresql postgresql-contrib');
      
      // 3. Install PM2
      await execCommand('npm install -g pm2');
      
      // 4. Setup Postgres
      await execCommand('sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD \'02486\';"');
      await execCommand('sudo -u postgres psql -c "CREATE DATABASE mercurjs;" || true'); // ignore if already exists
      
      // 5. Clone repository
      await execCommand('mkdir -p /var/www && cd /var/www && rm -rf mawgood-web && git clone https://github.com/OmarRaafatSayed/mawgood-web.git');
      
      // 6. Setup Backend
      const envContent = `STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000,http://localhost:7001,https://docs.medusajs.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:7001,https://docs.medusajs.com
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
DATABASE_URL=postgresql://postgres:02486@localhost:5432/mercurjs
DB_NAME=mercurjs
`;
      // Write .env
      await execCommand(`echo "${envContent}" > /var/www/mawgood-web/backend/.env`);
      
      // Backend NPM Install & Build
      await execCommand('cd /var/www/mawgood-web/backend && npm install');
      await execCommand('cd /var/www/mawgood-web/backend && npm run build');
      
      // Stop previous instance if exists
      await execCommand('pm2 delete mawgood-backend || true');
      // Run migrations
      await execCommand('cd /var/www/mawgood-web/backend && npx medusa db:migrate');
      // Start backend
      await execCommand('cd /var/www/mawgood-web/backend && pm2 start npm --name "mawgood-backend" -- run start');
      
      // 7. Setup Admin Panel
      await execCommand('cd /var/www/mawgood-web/admin-panel && npm install');
      await execCommand('cd /var/www/mawgood-web/admin-panel && npm run build');
      
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
