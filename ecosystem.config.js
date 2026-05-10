module.exports = {
  apps: [
    {
      name: 'mawgood-backend',
      cwd: './backend',
      script: 'node',
      args: '.medusa/server/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      max_memory_restart: '1G',
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      log_type: 'json',
      // Graceful shutdown
      kill_timeout: 30000,
      listen_timeout: 10000,
      // Watch (disabled in production)
      watch: false,
    },
    {
      name: 'mawgood-storefront',
      cwd: './storefront',
      script: 'node',
      args: '.next/standalone/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      max_memory_restart: '1G',
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/storefront-error.log',
      out_file: './logs/storefront-out.log',
      merge_logs: true,
      kill_timeout: 30000,
      watch: false,
    },
    {
      name: 'mawgood-admin',
      cwd: './admin-panel',
      script: 'npx',
      args: 'serve -s dist -l 5173',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      max_memory_restart: '500M',
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      merge_logs: true,
      kill_timeout: 10000,
      watch: false,
    },
    {
      name: 'mawgood-vendor',
      cwd: './vendor-panel',
      script: 'npx',
      args: 'serve -s dist -l 5174',
      env: {
        NODE_ENV: 'production',
        PORT: 5174
      },
      max_memory_restart: '500M',
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/vendor-error.log',
      out_file: './logs/vendor-out.log',
      merge_logs: true,
      kill_timeout: 10000,
      watch: false,
    }
  ]
}
