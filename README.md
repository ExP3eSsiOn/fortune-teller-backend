# 🔮 Fortune Teller Backend API

Backend API สำหรับฟีเจอร์ "ดูดวงเลขนำโชค" ที่ใช้ OpenAI ChatGPT ในการวิเคราะห์และทำนายดวงจากเบอร์โทรศัพท์

## ✨ Features

- ✅ วิเคราะห์พลังงานจากเบอร์โทรศัพท์
- ✅ ทำนายดวงโดยใช้ AI (OpenAI GPT-4o-mini)
- ✅ แนะนำเลขหวยโชคดี (2 ตัว, 3 ตัว, 3 ตัวบน)
- ✅ Rate limiting (5 requests/minute per IP)
- ✅ CORS support
- ✅ Security headers (Helmet)
- ✅ Error handling

## 📋 Prerequisites

- Node.js (v16 ขึ้นไป)
- npm หรือ yarn
- OpenAI API Key ([สมัครได้ที่นี่](https://platform.openai.com/api-keys))

## 🚀 Installation

### 1. ติดตั้ง Dependencies

```bash
cd fortune-backend
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` และใส่ OpenAI API Key ของคุณ:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3000
ALLOWED_ORIGINS=*
```

> ⚠️ **สำคัญ:** อย่า commit ไฟล์ `.env` เข้า Git! ไฟล์นี้มี API key ที่เป็นความลับ

### 3. รัน Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server จะรันที่ `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "Fortune Teller API is running"
}
```

### Get Fortune
```
POST /api/fortune
```

Request Body:
```json
{
  "phoneNumber": "0812345678"
}
```

Response (Success):
```json
{
  "success": true,
  "phoneNumber": "0812345678",
  "fortune": "เบอร์โทรของคุณมีพลังงานที่ดีมาก...",
  "luckyNumbers": {
    "twoDigit": "23",
    "threeDigit": "789",
    "threeDigitTop": "456"
  }
}
```

Response (Error):
```json
{
  "error": "Invalid phone number. Please provide a valid 10-digit Thai phone number."
}
```

## 🔒 Security Features

### Rate Limiting
- จำกัด 5 requests ต่อนาทีต่อ IP address
- ป้องกันการใช้งาน API มากเกินไป

### CORS
- สามารถกำหนด allowed origins ผ่าน environment variable
- Default: อนุญาตทุก origin (`*`)

### Input Validation
- ตรวจสอบรูปแบบเบอร์โทรศัพท์ (10 หลัก เริ่มต้นด้วย 0)
- Sanitize input data

## 🌐 Deployment

### Deploy to Production

1. **ตั้งค่า Environment Variables บน server:**
```bash
export OPENAI_API_KEY=sk-your-real-api-key
export PORT=3000
export ALLOWED_ORIGINS=https://yourdomain.com
export NODE_ENV=production
```

2. **ติดตั้ง PM2 (Process Manager):**
```bash
npm install -g pm2
```

3. **รัน server ด้วย PM2:**
```bash
pm2 start server.js --name fortune-api
pm2 save
pm2 startup
```

### Deploy to Cloud Platforms

#### Heroku
```bash
heroku create your-fortune-api
heroku config:set OPENAI_API_KEY=sk-your-key
git push heroku main
```

#### Railway / Render / Fly.io
- อัปโหลดโค้ดไปยัง platform
- ตั้งค่า Environment Variables ใน dashboard
- Deploy!

## 💰 Cost Estimation

ใช้ **GPT-4o-mini** ซึ่งราคาถูกมาก:

- Input: ~$0.000015 per request
- Output: ~$0.000060 per request
- **รวม: ~$0.000075 (~0.0027 บาท) ต่อ 1 คำขอ**

ตัวอย่าง:
- 1,000 requests = ~$0.075 (2.7 บาท)
- 10,000 requests = ~$0.75 (27 บาท)
- 100,000 requests = ~$7.50 (270 บาท)

## 🔧 Troubleshooting

### Error: "API authentication failed"
- ตรวจสอบว่า `OPENAI_API_KEY` ถูกต้อง
- ตรวจสอบว่า API key ยังไม่หมดอายุ
- ตรวจสอบว่ามี credits เหลืออยู่ใน OpenAI account

### Error: "Rate limit exceeded"
- OpenAI มี rate limit ตาม plan ของคุณ
- รอสักครู่แล้วลองใหม่
- พิจารณาอัพเกรด plan หากใช้งานบ่อย

### Error: "CORS blocked"
- ตั้งค่า `ALLOWED_ORIGINS` ใน `.env` ให้ตรงกับ domain ของหน้าเว็บ
- ตัวอย่าง: `ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:8080`

## 📝 Configuration

### ปรับแต่งการทำนายดวง

แก้ไขไฟล์ `server.js` ที่ส่วน system prompt:

```javascript
{
  role: 'system',
  content: `คุณคือหมอดูเลขมงคลที่มีชื่อเสียง...`
}
```

### เปลี่ยน Model

```javascript
model: 'gpt-4o-mini', // เปลี่ยนเป็น 'gpt-4o' หากต้องการคุณภาพสูงขึ้น (แต่แพงกว่า)
```

### ปรับ Rate Limit

```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // เปลี่ยนจำนวน requests ได้ที่นี่
  message: { error: 'Too many requests, please try again later.' }
});
```

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

## ⚠️ Important Notes

1. **อย่า commit API key เข้า Git!**
2. ใช้ `.gitignore` เพื่อป้องกันไฟล์ `.env` ถูก commit
3. ตั้งค่า rate limiting เพื่อป้องกันค่าใช้จ่ายเกินควบคุม
4. Monitor usage ใน OpenAI dashboard เป็นประจำ

## 📄 License

MIT License
