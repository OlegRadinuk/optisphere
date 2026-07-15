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
        // Абсолютные пути намеренны: standalone server.js делает process.chdir(__dirname),
        // cwd становится .next/standalone — относительный путь кладёт БД внутрь .next/ и она гибнет при каждом билде.
        DB_PATH: '/var/www/optisphere/data/bots.db',
        BOT_SEED_PATH: '/var/www/optisphere/data/bots-seed.json',
      },
      error_file: '/var/log/pm2/optisphere-error.log',
      out_file: '/var/log/pm2/optisphere-out.log',
      max_memory_restart: '900M',
      autorestart: true,
    },
  ],
};
