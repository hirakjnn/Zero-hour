module.exports = {
  apps: [{
    name: "zerohour-backend",
    script: "./server.js",
    instances: 1, // Do not run in cluster mode since SessionManager uses local memory
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
      ALLOWED_ORIGINS: "https://your-vercel-domain.vercel.app,https://www.zerohour.com"
    }
  }]
}
