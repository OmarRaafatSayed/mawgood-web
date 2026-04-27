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

    const runCommand = (cmd) => {
      return new Promise((resolve) => {
        console.log(`\n\n--- RUNNING: ${cmd} ---`);
        stream.write(cmd + '\n');
        setTimeout(resolve, 3000); // Wait for output
      });
    };

    (async () => {
      await runCommand('which git');
      await runCommand('which node');
      await runCommand('which npm');
      await runCommand('which pm2');
      stream.end('exit\n');
    })();
  });
}).connect({
  host: '72.62.177.210',
  port: 22,
  username: 'root',
  password: 'lzmC-DiHh23/&A5#6X\'7'
});
