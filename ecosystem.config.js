module.exports = {
  apps: [
    {
      name: 'consultara',
      script: 'npm',
      args: 'start -- -p 3001',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      watch: false,
    },
  ],
};
