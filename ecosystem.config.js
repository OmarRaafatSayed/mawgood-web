module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 9000
      },
      watch: false,
      autorestart: true
    },
    {
      name: 'admin',
      cwd: './admin',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      watch: false,
      autorestart: true
    },
    {
      name: 'vendor',
      cwd: './vendor',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 5174
      },
      watch: false,
      autorestart: true
    },
    {
      name: 'storefront',
      cwd: './storefront',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      autorestart: true
    }
  ]
};
