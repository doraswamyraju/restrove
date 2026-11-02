# Restrove VPS Deployment Guide

## Hostinger VPS Server Details
- **Domain:** `restrove.sriddha.com`
- **VPS IP:** `147.93.107.21`
- **Backend Port:** `5088` (Configured in Firewall)
- **Frontend:** Static build or Vite preview proxied through Nginx

---

## 1. Initial VPS Setup & Clone

SSH into your Hostinger VPS:
```bash
ssh root@147.93.107.21
```

Clone the repository:
```bash
cd /var/www  # or your preferred applications folder
git clone https://github.com/doraswamyraju/restrove.git
cd restrove
```

---

## 2. Start Backend on Port 5088 (PM2)

```bash
cd /var/www/restrove/backend
npm install
npm run build

# Start using PM2 daemon on port 5088
pm2 start dist/server.js --name "restrove-backend"
pm2 save
```

Verify backend health:
```bash
curl http://localhost:5088/health
# Response: {"status":"ok","service":"Restrove POS API","port":"5088"}
```

---

## 3. Build & Host Web Module (restrove.sriddha.com)

```bash
cd /var/www/restrove/web
npm install
npm run build
```

---

## 4. Nginx Configuration for `restrove.sriddha.com`

Create `/etc/nginx/sites-available/restrove.sriddha.com`:

```nginx
server {
    listen 80;
    server_name restrove.sriddha.com;

    # Frontend Static Files
    location / {
        root /var/www/restrove/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy Backend API to Port 5088
    location /api/ {
        proxy_pass http://127.0.0.1:5088;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable & reload Nginx:
```bash
ln -s /etc/nginx/sites-available/restrove.sriddha.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Install SSL (Certbot):
```bash
certbot --nginx -d restrove.sriddha.com
```

---

## 5. Daily Git Workflow (No Localhost Testing)

Whenever code changes are committed and pushed from local:
```bash
# On your local machine (handled by agent):
git add .
git commit -m "feat: updated module"
git push origin main

# On your VPS:
cd /var/www/restrove
git pull origin main
cd backend && npm run build && pm2 restart restrove-backend
cd ../web && npm run build
```

