const { Client } = require('ssh2');

const script = `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

echo "Node version:"
node -v

cd /var/www/mawgood-web/backend
echo "Running migrations..."
npm run build
npx medusa db:migrate
pm2 restart mawgood-backend

cd /var/www/mawgood-web/storefront
npm install
npm run build
pm2 restart mawgood-storefront || pm2 start npm --name "mawgood-storefront" -- start

cd /var/www/mawgood-web/vendor-panel
yarn install
npm run build

cd /var/www/mawgood-web/admin-panel
yarn install
npm run build
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(script, (err, stream) => {
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
