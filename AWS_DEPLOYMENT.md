# ☁️ AWS Deployment Guide

## 🤔 AWS เหมาะสมกับโปรเจคนี้หรือไม่?

### ✅ เหมาะสมถ้า:
- มีประสบการณ์ใช้ AWS อยู่แล้ว
- มี AWS account และ credits อยู่แล้ว
- ต้องการ scale ใหญ่ในอนาคต
- ต้องการควบคุมทุกอย่างเอง
- บริษัทใช้ AWS อยู่แล้ว

### ❌ ไม่เหมาะถ้า:
- เพิ่งเริ่มต้น (learning curve สูง)
- ต้องการ setup เร็วๆ
- งบจำกัด (AWS ซับซ้อนกว่าในการคำนวณค่าใช้จ่าย)
- ไม่คุ้นเคยกับ DevOps

---

## 💰 เปรียบเทียบค่าใช้จ่าย

### Railway (แนะนำ)
```
- ฟรี: $5/เดือน
- เพียงพอสำหรับ: ~50,000 requests/เดือน
- ค่าใช้จ่าย: $0
```

### AWS Lambda (Serverless)
```
Free Tier:
- 1,000,000 requests/เดือน (ฟรี)
- 400,000 GB-seconds compute (ฟรี)

หลัง Free Tier:
- $0.20 per 1M requests
- $0.0000166667 per GB-second
- API Gateway: $3.50 per 1M requests

ประมาณการ (10,000 requests/เดือน):
- Lambda: $0.002
- API Gateway: $0.035
- CloudWatch Logs: $0.50
= รวม ~$0.54/เดือน (~20 บาท)
```

### AWS Lightsail (VPS เล็ก)
```
- $3.50/เดือน สำหรับ 512MB RAM
- $5/เดือน สำหรับ 1GB RAM
- รวม IP และ bandwidth แล้ว
```

### AWS EC2 (VPS)
```
t2.micro (Free Tier):
- ฟรีปีแรก (750 ชม./เดือน)
- หลังจากนั้น: ~$8.50/เดือน
```

---

## 📊 เปรียบเทียบ AWS Options

| Service | Setup | ราคา | Scale | แนะนำ |
|---------|-------|------|-------|-------|
| **Lambda + API Gateway** | ⚠️ ซับซ้อน | 💰 ถูก | ⚡⚡⚡⚡ | สำหรับ Pro |
| **App Runner** | ✅ ง่าย | 💰💰 ปานกลาง | ⚡⚡⚡ | 👍 **แนะนำ** |
| **Lightsail** | ✅ ง่าย | 💰 ถูก | ⚡⚡ | งบน้อย |
| **Elastic Beanstalk** | ⚠️ ซับซ้อน | 💰💰 แพง | ⚡⚡⚡ | Enterprise |
| **EC2** | ⚠️⚠️ ยาก | 💰💰 แพง | ⚡⚡⚡⚡ | Full control |

---

## 🌟 แนะนำ: AWS App Runner (ถ้าจะใช้ AWS)

**AWS App Runner** คือตัวเลือกที่ดีที่สุดสำหรับโปรเจคนี้ถ้าต้องการใช้ AWS

### ข้อดี:
- ✅ Setup ง่ายที่สุดใน AWS
- ✅ Deploy จาก GitHub โดยตรง
- ✅ SSL/HTTPS อัตโนมัติ
- ✅ Auto-scaling
- ✅ ราคาพอสมควร

### ราคา:
```
- $0.007/vCPU-hour
- $0.0008/GB-hour
- ประมาณ ~$5-7/เดือน สำหรับ traffic น้อย
```

### 📝 วิธี Deploy:

#### 1. สร้าง ECR Repository (Container Registry)

```bash
# ติดตั้ง AWS CLI
brew install awscli  # macOS
# หรือ apt install awscli  # Ubuntu

# Login AWS
aws configure
# ใส่: Access Key, Secret Key, Region (ap-southeast-1)

# สร้าง Dockerfile
cd fortune-backend
```

สร้างไฟล์ `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

สร้างไฟล์ `.dockerignore`:

```
node_modules
.env
.git
.gitignore
*.md
```

#### 2. Build และ Push Image

```bash
# Login ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# สร้าง repository
aws ecr create-repository --repository-name fortune-api

# Build image
docker build -t fortune-api .

# Tag
docker tag fortune-api:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/fortune-api:latest

# Push
docker push \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/fortune-api:latest
```

#### 3. สร้าง App Runner Service

ไปที่ AWS Console → App Runner → Create Service

```
Source: Container registry
Repository: fortune-api (ที่เพิ่ง push)
Deployment: Automatic (จาก ECR)

Configure service:
- Service name: fortune-api
- CPU: 1 vCPU
- Memory: 2 GB
- Port: 3000

Environment variables:
- OPENAI_API_KEY: sk-your-key
- NODE_ENV: production
- ALLOWED_ORIGINS: https://yourdomain.com
```

#### 4. Deploy!

- กด **Create & Deploy**
- รอ 3-5 นาที
- จะได้ URL: `https://xxxxx.ap-southeast-1.awsapprunner.com`

---

## 🔧 Option 2: AWS Lambda + API Gateway (Serverless)

**สำหรับ Pro users** ที่ต้องการ scale สูงและราคาต่ำ

### วิธี Deploy:

#### 1. แก้ไข Code สำหรับ Lambda

สร้างไฟล์ `lambda.js`:

```javascript
const serverless = require('serverless-http');
const express = require('express');
const app = express();

// ... copy code จาก server.js ...

module.exports.handler = serverless(app);
```

#### 2. ติดตั้ง Serverless Framework

```bash
npm install -g serverless
npm install --save serverless-http
```

#### 3. สร้างไฟล์ `serverless.yml`

```yaml
service: fortune-api

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-southeast-1
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    NODE_ENV: production

functions:
  api:
    handler: lambda.handler
    events:
      - httpApi:
          path: /{proxy+}
          method: ANY
      - httpApi:
          path: /
          method: ANY
    timeout: 30
```

#### 4. Deploy

```bash
export OPENAI_API_KEY=sk-your-key
serverless deploy

# จะได้ URL:
# https://xxxxxxx.execute-api.ap-southeast-1.amazonaws.com
```

---

## 💡 Option 3: AWS Lightsail (VPS ง่าย)

**เหมาะสำหรับ**: มือใหม่ที่ต้องการใช้ AWS แต่ไม่ซับซ้อน

### ราคา: $3.50-5/เดือน

### วิธี Setup:

1. ไปที่ AWS Console → Lightsail
2. Create Instance
3. เลือก: Linux/Unix → Node.js
4. เลือก Plan: $5/เดือน (1GB RAM)
5. Create Instance

จากนั้นทำตาม [VPS deployment guide](./DEPLOYMENT_GUIDE.md#-option-4-vps)

---

## ⚖️ AWS vs Railway: ควรเลือกอะไร?

### เลือก **Railway** ถ้า:
- ✅ เริ่มต้นโปรเจค
- ✅ ต้องการ deploy เร็ว (5 นาที)
- ✅ ไม่อยากจัดการ infrastructure
- ✅ งบ $0-5/เดือน
- ✅ Traffic < 100,000 requests/เดือน

### เลือก **AWS** ถ้า:
- ✅ มีประสบการณ์ AWS
- ✅ บริษัทใช้ AWS อยู่แล้ว
- ✅ ต้องการ scale ใหญ่ (millions of requests)
- ✅ ต้องการ integrate กับ AWS services อื่นๆ
- ✅ มี DevOps team

---

## 📈 ตารางเปรียบเทียบ

| | Railway | AWS App Runner | AWS Lambda | AWS EC2 |
|---|---------|---------------|------------|---------|
| **Setup Time** | 5 นาที | 30 นาที | 60 นาที | 90 นาที |
| **ความยาก** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **ราคา (traffic น้อย)** | ฟรี | ~$5-7 | ~$1-2 | ~$8.50 |
| **ราคา (traffic มาก)** | ~$20 | ~$30 | ~$10 | ~$8.50 |
| **Cold Start** | ไม่มี | ไม่มี | 1-3s | ไม่มี |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto | ❌ Manual |
| **Scale** | ⚡⚡⚡ | ⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ | ⚡⚡ |
| **Monitoring** | Basic | ✅ CloudWatch | ✅ CloudWatch | ✅ CloudWatch |

---

## 🎯 คำแนะนำสุดท้าย

### สำหรับโปรเจคนี้ (Fortune Teller API):

1. **🥇 แนะนำ: Railway**
   - Setup ง่ายที่สุด
   - ฟรี $5/เดือน
   - เพียงพอสำหรับการเริ่มต้น
   - Deploy ได้ใน 5 นาที

2. **🥈 ถ้าต้องการ AWS: App Runner**
   - ง่ายกว่า Lambda
   - Auto-scale
   - ราคาพอสมควร

3. **🥉 สำหรับ Pro: AWS Lambda**
   - ราคาถูกที่สุดเมื่อ scale
   - แต่ setup ยาก

---

## 💭 คำถามที่ควรถาม:

1. **คุณมีประสบการณ์ AWS หรือไม่?**
   - ไม่มี → ใช้ Railway
   - มี → ใช้ AWS App Runner

2. **Traffic คาดการณ์เท่าไร?**
   - < 100,000/เดือน → Railway
   - > 100,000/เดือน → AWS Lambda

3. **งบประมาณเท่าไร?**
   - $0-5 → Railway
   - $5-20 → AWS App Runner
   - > $20 → AWS Lambda (pay per use)

4. **ต้องการ deploy เร็วแค่ไหน?**
   - เร็วที่สุด → Railway (5 นาที)
   - ไม่รีบ → AWS (30-60 นาที)

---

## 📝 สรุป

**สำหรับโปรเจคนี้:**

```
✅ แนะนำ Railway เพราะ:
   - ฟรี
   - Setup ง่าย (5 นาที)
   - ไม่มี cold start
   - SSL อัตโนมัติ
   - เพียงพอสำหรับ traffic ตอนเริ่มต้น

⚠️  ใช้ AWS ก็ต่อเมื่อ:
   - มีประสบการณ์อยู่แล้ว
   - หรือบริษัทใช้ AWS อยู่แล้ว
   - หรือ traffic สูงมาก (> 100K requests/เดือน)
```

---

## 🚀 Quick Decision Tree

```
ต้องการ deploy backend API ง่ายๆ?
├─ ไม่เคยใช้ AWS → Railway ✅
└─ เคยใช้ AWS แล้ว
   ├─ ต้องการง่าย → AWS App Runner
   ├─ ต้องการถูก → AWS Lambda
   └─ ต้องการควบคุม → AWS EC2
```

---

**มีคำถามเพิ่มเติมเกี่ยว AWS deployment ไหมครับ?** 😊
