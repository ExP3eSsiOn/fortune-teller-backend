const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Verify OpenAI API Key is loaded
console.log('[Startup] Checking OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('[Startup] API Key length:', process.env.OPENAI_API_KEY?.length || 0);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
// Temporarily disable helmet for local development
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   crossOriginEmbedderPolicy: false
// }));

// CORS - Restricted origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Rate limiting - 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/fortune', limiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Fortune Teller API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      fortune: 'POST /api/fortune'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fortune Teller API is running' });
});

// Handle preflight requests
// Preflight requests are handled by the cors middleware

// Fortune telling endpoint
app.post('/api/fortune', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || !/^0\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        error: 'Invalid phone number. Please provide a valid 10-digit Thai phone number.'
      });
    }

    console.log(`[Fortune Request] Phone: ${phoneNumber}`);

    // Call OpenAI ChatGPT API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: `คุณคือหมอดูเลขมงคลที่มีชื่อเสียง เชี่ยวชาญการทำนายดวงจากเลขโทรศัพท์และแนะนำเลขหวยโชคดี

คำแนะนำ:
1. วิเคราะห์พลังงานของเลขโทรศัพท์ที่ได้รับ
2. บอกความหมายของตัวเลขในเบอร์โทร (เช่น ผลรวมเลข, เลขซ้ำ, รูปแบบพิเศษ)
3. ให้คำทำนายที่เป็นบวกและสร้างแรงบันดาลใจ
4. แนะนำเลขหวยโชคดี 3 ชุด (2 ตัว, 3 ตัว, 3 ตัวบน) ที่เหมาะสมกับพลังงานของเบอร์นั้นๆ
5. ใช้ภาษาไทยที่อบอุ่น เข้าใจง่าย เหมาะกับคนไทยทั่วไป
6. ความยาวประมาณ 120-150 คำ

รูปแบบการตอบ:
ให้ตอบเป็น JSON object ที่มี structure ดังนี้:
{
  "fortune": "คำทำนายดวงและวิเคราะห์พลังงานของเบอร์โทร",
  "luckyNumbers": {
    "twoDigit": "XX",
    "threeDigit": "XXX",
    "threeDigitTop": "XXX"
  }
}

ห้ามใส่ข้อความอื่นนอกจาก JSON object เท่านั้น`
        },
        {
          role: 'user',
          content: `ดูดวงและวิเคราะห์พลังงานเบอร์โทรศัพท์: ${phoneNumber} แล้วแนะนำเลขหวยโชคดีให้หน่อยครับ`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    console.log('[OpenAI Response]:', result);

    // Parse the JSON response
    const fortuneData = JSON.parse(result);

    res.json({
      success: true,
      phoneNumber: phoneNumber,
      fortune: fortuneData.fortune,
      luckyNumbers: fortuneData.luckyNumbers
    });

  } catch (error) {
    console.error('[Error]:', error.message);

    if (error.status === 401) {
      return res.status(500).json({
        error: 'API authentication failed. Please check your OpenAI API key.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate fortune. Please try again later.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔮 Fortune Teller API server running on port ${PORT}`);
  console.log(`📝 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
});
