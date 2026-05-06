module.exports = {
  apps: [
    {
      name: 'mawgood-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      max_memory_restart: '1G',
      autorestart: true
    },
    {
      name: 'mawgood-admin',
      cwd: './admin-panel',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      max_memory_restart: '500M',
      autorestart: true
    },
    {
      name: 'mawgood-vendor',
      cwd: './vendor-panel',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 5174
      },
      max_memory_restart: '500M',
      autorestart: true
    },
    {
      name: 'mawgood-storefront',
      cwd: './storefront',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '1G',
      autorestart: true
    }
  ]
};
