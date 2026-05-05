# Hybrid Deployment Guide
## Vercel DNS + Dewahostinger Hosting + Supabase Database

Setup ini menggunakan:
- **Vercel**: Untuk DNS dan domain management saja
- **Dewahostinger**: Untuk hosting aplikasi Next.js (VPS atau cPanel)
- **Supabase**: Untuk database

---

## Langkah 1: Deploy ke Dewahostinger

### Option A: VPS dengan PM2 (Recommended)

#### a. SSH ke VPS
```bash
ssh user@your-vps-ip
```

#### b. Setup Node.js
```bash
# Install Node.js 18.x atau 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### c. Clone Repository
```bash
cd /var/www
git clone https://github.com/Xvrsded/Kepengurusan.git
cd Kepengurusan
```

#### d. Install Dependencies & Build
```bash
npm install --production
npm run build
```

#### e. Setup Environment Variables
```bash
nano .env
```

Isi dengan:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### f. Setup PM2
```bash
# Install PM2
npm install -g pm2

# Start aplikasi
pm2 start npm --name "kepengurusan" -- start

# Save PM2 config
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### g. Setup Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/kepengurusan
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/kepengurusan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option B: cPanel dengan Node.js

#### a. Upload Files
1. Compress project lokal:
```bash
# Lokal
tar -czf kepengurusan.tar.gz . --exclude=node_modules --exclude=.next --exclude=.git
```

2. Upload ke cPanel File Manager → public_html
3. Extract file di server

#### b. Setup Node.js di cPanel
1. Buka cPanel → Setup Node.js App
2. Create Application:
   - Node.js Version: 20.x
   - Application Mode: Production
   - Application Root: public_html/kepengurusan
   - Application URL: your-domain.com
   - Application Startup File: node_modules/next/dist/bin/next
   - Startup Arguments: start

#### c. Install Dependencies
```bash
cd ~/public_html/kepengurusan
npm install --production
npm run build
```

#### d. Setup Environment Variables
Di cPanel Node.js App setup, add environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

---

## Langkah 2: Setup Domain di Vercel

### Option A: Point Vercel ke IP VPS (Jika pakai VPS)

#### a. Buka Vercel Dashboard
1. Buka [vercel.com](https://vercel.com)
2. Buat project baru atau gunakan project existing
3. Klik Settings → Domains

#### b. Tambah Custom Domain
1. Klik "Add Domain"
2. Masukkan domain Anda (misal: your-domain.com)
3. Vercel akan menampilkan DNS records yang perlu ditambahkan

#### c. Update DNS di Domain Registrar
Jika domain Anda di Dewahostinger atau registrar lain:
- Tambah A record: `@` → IP VPS Anda
- Tambah A record: `www` → IP VPS Anda

#### d. Update Nameserver ke Vercel (Opsional)
Jika ingin Vercel manage DNS:
1. Di Vercel dashboard, copy nameserver (misal: ns1.vercel-dns.com, ns2.vercel-dns.com)
2. Update nameserver di domain registrar ke nameserver Vercel
3. Tambah A record di Vercel DNS: `@` → IP VPS Anda

### Option B: Gunakan DNS Vercel untuk Point ke IP Dewahostinger

#### a. Setup Domain di Vercel
1. Buat project di Vercel (bisa kosong, hanya untuk DNS)
2. Tambah custom domain di Vercel
3. Copy nameserver dari Vercel

#### b. Update Nameserver di Domain Registrar
Update nameserver domain Anda ke nameserver Vercel

#### c. Tambah A Record di Vercel DNS
1. Buka Vercel Dashboard → Project → Settings → Domains
2. Klik "Edit DNS Configuration"
3. Tambah A record:
   - Name: `@`
   - Value: IP VPS atau IP dari Dewahostinger
   - TTL: 3600

#### d. Tambah CNAME untuk www (Opsional)
- Name: `www`
- Value: your-domain.com
- TTL: 3600

---

## Langkah 3: Setup SSL Certificate

### Option A: Let's Encrypt di VPS
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option B: SSL di cPanel
1. Buka cPanel → SSL/TLS Status
2. Select domain
3. Click "Auto SSL"

### Option C: SSL dari Vercel (Jika menggunakan Vercel Proxy)
1. Buka Vercel Dashboard → Settings → Domains
2. Pastikan "Automatic HTTPS" di-enable
3. Vercel akan otomatis generate SSL

---

## Checklist Deployment

### Pre-Deployment
- [ ] Code sudah push ke GitHub ✅
- [ ] Environment variables sudah dikumpulkan dari Supabase
- [ ] Local build berhasil (`npm run build`)

### Dewahostinger Deployment
- [ ] VPS/cPanel sudah siap
- [ ] Node.js 18+ sudah terinstall
- [ ] Project sudah di-upload/clone ke server
- [ ] Dependencies sudah di-install
- [ ] Build berhasil di server
- [ ] Environment variables sudah di-set (.env)
- [ ] PM2 sudah di-setup (untuk VPS)
- [ ] Nginx sudah di-setup (untuk VPS)
- [ ] Aplikasi running di port 3000

### Vercel DNS Setup
- [ ] Project sudah dibuat di Vercel
- [ ] Custom domain sudah ditambahkan
- [ ] DNS records sudah dikonfigurasi (A record ke IP server)
- [ ] Nameserver sudah di-update (opsional)
- [ ] SSL sudah di-setup

### Testing
- [ ] Aplikasi bisa diakses via IP server
- [ ] Aplikasi bisa diakses via domain
- [ ] SSL berfungsi (HTTPS)
- [ ] Supabase connection berhasil
- [ ] Semua fitur berfungsi (auth, iuran, surat, voting, alert)

---

## Troubleshooting

### Dewahostinger
- **Build Error:** Pastikan Node.js version minimal 18.x
- **PM2 Error:** Cek logs: `pm2 logs kepengurusan`
- **Nginx Error:** Cek config: `sudo nginx -t`
- **Port Error:** Pastikan port 3000 tidak digunakan aplikasi lain

### Vercel DNS
- **Domain tidak resolve:** Cek DNS propagation (bisa butuh 24-48 jam)
- **SSL Error:** Pastikan DNS sudah resolve dan SSL sudah di-setup
- **DNS Configuration Error:** Pastikan A record mengarah ke IP server yang benar

### Hybrid Setup
- **Aplikasi tidak bisa diakses via domain:**
  1. Cek apakah aplikasi running di server: `pm2 status`
  2. Cek apakah Nginx running: `sudo systemctl status nginx`
  3. Cek DNS: `nslookup your-domain.com`
  4. Cek firewall di server: pastikan port 80 dan 443 terbuka

---

## Architecture Diagram

```
User Browser
    ↓ (HTTPS via Domain)
Vercel DNS (Nameserver)
    ↓ (A record → IP Server)
Dewahostinger VPS/cPanel
    ↓ (Next.js App)
Supabase Database
```

---

## Cost Breakdown (Estimasi)

- **Vercel DNS:** Gratis (untuk 1 domain)
- **Dewahostinger VPS:** Rp 50.000 - 150.000/bulan (tergantung spesifikasi)
- **Dewahostinger cPanel:** Rp 30.000 - 100.000/bulan
- **Supabase:** Gratis (500MB database) atau Rp 150.000/bulan (Pro)

Total: **Rp 80.000 - 400.000/bulan**

---

## Keuntungan Setup Hybrid

1. **Cost Efficiency:** Dewahostinger lebih murah untuk hosting
2. **Performance:** VPS memberikan kontrol penuh
3. **DNS Management:** Vercel DNS gratis dan reliable
4. **SSL:** Gratis dari Vercel atau Let's Encrypt
5. **Scalability:** Bisa upgrade VPS jika traffic meningkat
