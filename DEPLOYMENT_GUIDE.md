# 🚀 คู่มือ Deploy Backend API

มี 4 วิธีในการ deploy backend API เลือกได้ตามความสะดวก:

---

## 🌟 แนะนำ: Railway (ง่ายที่สุด + ฟรี)

### ✅ ข้อดี:
- ฟรี $5/เดือน (พอใช้งานได้เยอะมาก)
- Deploy ง่าย ไม่ต้องตั้งค่าอะไรมาก
- มี SSL/HTTPS อัตโนมัติ
- ไม่ต้องใส่ credit card สำหรับ trial

### 📝 วิธี Deploy:

#### 1. สร้าง GitHub Repository (ถ้ายังไม่มี)

```bash
cd fortune-backend

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Fortune Teller API"

# สร้าง repo ใหม่บน GitHub แล้วรัน:
git remote add origin https://github.com/YOUR_USERNAME/fortune-backend.git
git branch -M main
git push -u origin main
```

#### 2. Deploy บน Railway

1. ไปที่ https://railway.app
2. กด **"Start a New Project"**
3. เลือก **"Deploy from GitHub repo"**
4. Login GitHub และเลือก repository `fortune-backend`
5. Railway จะ detect Node.js โดยอัตโนมัติ

#### 3. ตั้งค่า Environment Variables

1. ไปที่ tab **"Variables"** ใน Railway dashboard
2. เพิ่ม variables ต่อไปนี้:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

#### 4. Deploy!

- Railway จะ deploy อัตโนมัติ
- รอ 1-2 นาที
- จะได้ URL เช่น `https://fortune-backend-production-xxxx.up.railway.app`

#### 5. อัปเดต Frontend

แก้ไขไฟล์ `index.html` (บรรทัด ~2109):

```javascript
// เปลี่ยนจาก
const API_URL = 'http://localhost:3000/api/fortune';

// เป็น
const API_URL = 'https://fortune-backend-production-xxxx.up.railway.app/api/fortune';
```

#### 6. ทดสอบ

```bash
# Test health endpoint
curl https://fortune-backend-production-xxxx.up.railway.app/health

# ควรได้ response:
# {"status":"ok","message":"Fortune Teller API is running"}
```

---

## 🔵 Option 2: Render (ฟรีถาวร แต่ช้ากว่า)

### ✅ ข้อดี:
- ฟรีตลอดชีพ (ไม่มีหมดอายุ)
- ไม่ต้องใส่ credit card
- Setup ง่าย

### ⚠️ ข้อเสีย:
- Instance จะ sleep หลังจาก 15 นาทีไม่ใช้งาน
- Cold start ใช้เวลา ~30 วินาที

### 📝 วิธี Deploy:

1. ไปที่ https://render.com
2. สร้าง account (ฟรี)
3. กด **"New +"** → **"Web Service"**
4. Connect GitHub repository
5. ตั้งค่า:
   ```
   Name: fortune-teller-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
6. เพิ่ม Environment Variables (เหมือน Railway)
7. กด **"Create Web Service"**
8. รอ 3-5 นาที จะได้ URL เช่น `https://fortune-teller-api.onrender.com`

---

## 🟢 Option 3: Vercel (สำหรับ Serverless)

### ✅ ข้อดี:
- Deploy เร็วมาก
- Scale อัตโนมัติ
- ฟรี (มี limits พอใช้งานได้)

### 📝 วิธี Deploy:

#### 1. ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

#### 2. สร้างไฟล์ `vercel.json`

```bash
cd fortune-backend
```

สร้างไฟล์ `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key",
    "NODE_ENV": "production"
  }
}
```

#### 3. Deploy

```bash
vercel login
vercel

# ตอบคำถาม:
# ? Set up and deploy: Yes
# ? Which scope: Your account
# ? Link to existing project: No
# ? What's your project's name: fortune-backend
# ? In which directory is your code located: ./
```

#### 4. เพิ่ม Secrets

```bash
vercel secrets add openai-api-key sk-your-actual-key
```

#### 5. Deploy Production

```bash
vercel --prod
```

จะได้ URL เช่น `https://fortune-backend.vercel.app`

---

## 🟠 Option 4: VPS (ควบคุมได้เต็มที่)

### ✅ ข้อดี:
- ควบคุมได้เต็มที่
- Performance ดีที่สุด
- ไม่มี cold start

### ⚠️ ข้อเสีย:
- ต้องจัดการ server เอง
- ต้องเสียเงินค่า VPS

### 📝 วิธี Deploy (Ubuntu/DigitalOcean):

#### 1. เช่า VPS
- DigitalOcean: https://digitalocean.com (Droplet $5/เดือน)
- Linode: https://linode.com
- Vultr: https://vultr.com

#### 2. เชื่อมต่อ SSH

```bash
ssh root@your-server-ip
```

#### 3. ติดตั้ง Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Git
apt install -y git
```

#### 4. Clone Project

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/fortune-backend.git
cd fortune-backend

# Install dependencies
npm install --production
```

#### 5. ตั้งค่า Environment Variables

```bash
nano .env
```

ใส่:
```
OPENAI_API_KEY=sk-your-key
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

#### 6. รัน Server ด้วย PM2

```bash
pm2 start server.js --name fortune-api

# Auto-restart on reboot
pm2 startup
pm2 save

# ดู logs
pm2 logs fortune-api
```

#### 7. ตั้งค่า Nginx (Reverse Proxy)

```bash
apt install -y nginx

nano /etc/nginx/sites-available/fortune-api
```

ใส่:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

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

Enable:
```bash
ln -s /etc/nginx/sites-available/fortune-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 8. ติดตั้ง SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

---

## 📊 เปรียบเทียบ

| Platform | ราคา | ความเร็ว | Cold Start | SSL | แนะนำสำหรับ |
|----------|------|----------|------------|-----|-------------|
| **Railway** | ฟรี $5/เดือน | ⚡⚡⚡ | ไม่มี | ✅ Auto | **👍 แนะนำที่สุด** |
| Render | ฟรีตลอด | ⚡⚡ | ~30s | ✅ Auto | งบน้อย |
| Vercel | ฟรี (มี limits) | ⚡⚡⚡ | ~1s | ✅ Auto | Serverless |
| VPS | ~$5-10/เดือน | ⚡⚡⚡⚡ | ไม่มี | ต้องตั้งเอง | Pro users |

---

## 🔒 Security Checklist

หลัง deploy แล้ว ต้องตรวจสอบ:

- [ ] ตั้งค่า `ALLOWED_ORIGINS` ให้ตรงกับ domain จริง
- [ ] ไม่ commit `.env` file เข้า Git
- [ ] ตั้งค่า rate limiting (มีแล้วใน code)
- [ ] ใช้ HTTPS เท่านั้น
- [ ] Monitor OpenAI usage: https://platform.openai.com/usage
- [ ] ตั้ง spending limits ใน OpenAI

---

## 🐛 Troubleshooting

### ❌ CORS Error

```javascript
// ใน .env บน server
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### ❌ OpenAI API Error 401

- ตรวจสอบ API key ใน environment variables
- ตรวจสอบว่า key ยังไม่หมดอายุ
- ตรวจสอบว่ามี credits เหลือ

### ❌ Backend ตอบช้า

- Railway/Render: ตรวจสอบว่า instance ไม่ sleep
- ปรับ keep-alive endpoint (ping ทุกๆ 5 นาที)

### ❌ 500 Internal Server Error

```bash
# ดู logs
# Railway: ไปที่ Deployments → View Logs
# Render: ไปที่ Logs tab
# PM2: pm2 logs fortune-api
```

---

## 📝 หลังจาก Deploy แล้ว

### 1. อัปเดต Frontend URL

แก้ไขไฟล์ `index.html`:

```javascript
const API_URL = 'https://your-deployed-backend.com/api/fortune';
```

### 2. ทดสอบ

```bash
# Test health
curl https://your-deployed-backend.com/health

# Test fortune
curl -X POST https://your-deployed-backend.com/api/fortune \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0812345678"}'
```

### 3. Monitor Usage

- OpenAI Dashboard: https://platform.openai.com/usage
- ตั้ง email alerts เมื่อใช้เกิน $X

---

## 💡 Tips

1. **Railway แนะนำที่สุด** - Setup ง่าย ฟรี ไม่มี cold start
2. **ตั้ง CORS ให้ถูก** - ป้องกัน unauthorized access
3. **Monitor costs** - เช็ค OpenAI usage เป็นประจำ
4. **Keep backend URL ลับ** - อย่าเปิดเผย API endpoint ในที่สาธารณะ
5. **Test ก่อน go live** - ทดสอบทุก endpoint ก่อนปล่อยจริง

---

## 🎯 Quick Start (Railway)

```bash
# 1. Push to GitHub
cd fortune-backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fortune-backend.git
git push -u origin main

# 2. Deploy บน Railway
# - ไปที่ https://railway.app
# - Deploy from GitHub
# - ตั้งค่า Environment Variables
# - รอ deploy เสร็จ

# 3. อัปเดต Frontend
# แก้ API_URL ใน index.html

# Done! 🎉
```

---

**มีคำถามเพิ่มเติม?** อ่าน [Backend README.md](./README.md) หรือ [Main Guide](../FORTUNE_FEATURE_README.md)
