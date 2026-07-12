module.exports = {
  apps: [
    {
      name: 'optisphere',
      script: '.next/standalone/server.js',
      cwd: '/var/www/optisphere',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '127.0.0.1',
      },
      error_file: '/var/log/pm2/optisphere-error.log',
      out_file: '/var/log/pm2/optisphere-out.log',
      max_memory_restart: '900M',
      autorestart: true,
    },
  ],
};
