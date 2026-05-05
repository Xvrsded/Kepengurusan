# Deployment Guide

## Deploy ke Vercel

### 1. Persiapan

#### a. Push ke GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### b. Setup Supabase Environment Variables
Dapatkan dari dashboard Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/Public Key
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (untuk server actions)

### 2. Deploy ke Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

#### Option B: Via Vercel Dashboard
1. Buka [vercel.com](https://vercel.com)
2. Klik "Add New Project"
3. Import dari GitHub
4. Setup Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your-project-url.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-anon-key
   - `SUPABASE_SERVICE_ROLE_KEY` = your-service-role-key
5. Klik "Deploy"

### 3. Post-Deployment

#### a. Setup Custom Domain (Opsional)
1. Buka project settings di Vercel
2. Klik "Domains"
3. Tambah custom domain
4. Update DNS records sesuai instruksi Vercel

#### b. Setup Environment Variables di Production
Pastikan semua environment variables sudah di-set di Vercel dashboard:
- Settings → Environment Variables
- Tambah semua variabel dari `.env.example`

---

## Deploy ke Dewahostinger

### 1. Persiapan

#### a. Build Project
```bash
npm run build
```

#### b. Setup Environment Variables di Server
Buat file `.env` di server:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Deploy via cPanel/Plesk

#### Option A: Upload Manual
1. Build project lokal:
```bash
npm run build
```
2. Upload isi folder `.next` ke server
3. Upload file berikut ke root server:
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `tsconfig.json`
   - `public/` folder
   - `.env` (dengan environment variables)
4. Install dependencies di server:
```bash
npm install --production
```
5. Setup Node.js application di cPanel/Plesk:
   - Pilih Node.js version: 18.x atau 20.x
   - Application mode: Production
   - Application root: path ke project
   - Application URL: domain Anda
   - Application startup file: `node_modules/next/dist/bin/next`
   - Startup arguments: `start`

#### Option B: Git Clone
1. SSH ke server
2. Clone repository:
```bash
git clone https://github.com/username/rt-rw-digital.git
cd rt-rw-digital
```
3. Install dependencies:
```bash
npm install --production
```
4. Build project:
```bash
npm run build
```
5. Setup PM2 (Process Manager):
```bash
# Install PM2 global
npm install -g pm2

# Start aplikasi
pm2 start npm --name "rt-rw-digital" -- start

# Save PM2 config
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 3. Setup Nginx Reverse Proxy (Opsional)

Jika menggunakan VPS dengan Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Setup SSL Certificate (Opsional)

Gunakan Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

---

## Checklist Deployment

### Pre-Deployment
- [ ] `.env.example` sudah dibuat
- [ ] Environment variables sudah dikumpulkan dari Supabase
- [ ] Code sudah push ke GitHub
- [ ] Local build berhasil (`npm run build`)

### Vercel Deployment
- [ ] Project sudah connect ke Vercel
- [ ] Environment variables sudah di-set di Vercel
- [ ] Deploy berhasil
- [ ] Custom domain sudah di-setup (opsional)

### Dewahostinger Deployment
- [ ] Node.js sudah terinstall di server (v18+)
- [ ] Project sudah di-upload ke server
- [ ] Dependencies sudah di-install
- [ ] Build berhasil di server
- [ ] PM2 sudah di-setup (untuk VPS)
- [ ] Nginx sudah di-setup (untuk VPS)
- [ ] SSL certificate sudah di-setup (opsional)

---

## Troubleshooting

### Vercel
- **Build Error:** Cek environment variables di Vercel dashboard
- **Runtime Error:** Cek logs di Vercel dashboard
- **Supabase Connection Error:** Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY benar

### Dewahostinger
- **Build Error:** Pastikan Node.js version minimal 18.x
- **Runtime Error:** Cek PM2 logs: `pm2 logs rt-rw-digital`
- **Supabase Connection Error:** Pastikan .env file sudah dibuat dengan nilai yang benar
- **Port Error:** Pastikan port 3000 tidak digunakan aplikasi lain

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon/public key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes (untuk server actions) |

---

## Database Setup (Supabase)

Sebelum deploy, pastikan:
1. Project Supabase sudah dibuat
2. RLS policies sudah di-setup
3. Tables sudah dibuat:
   - profiles
   - letters
   - iuran_master
   - iuran_user
   - candidates
   - votes
   - panic_alerts
4. Realtime sudah di-enable untuk tables yang butuh realtime:
   - letters
   - iuran_user
   - iuran_master
   - panic_alerts
