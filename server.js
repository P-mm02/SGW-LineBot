const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN

// Store processed message IDs in memory
const processedMessages = new Set()

app.post('/webhook', async (req, res) => {
  console.log('🔹 Received Webhook Event:', JSON.stringify(req.body, null, 2)) // Debugging log

  if (!req.body || !req.body.events) {
    console.log('❌ No events received. Ignoring request.')
    return res.sendStatus(200)
  }

  const events = req.body.events
  if (events.length === 0) {
    console.log('❌ Received empty events array. Ignoring request.')
    return res.sendStatus(200)
  }

  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const messageId = event.message.id

      // ✅ Check if this message has already been processed
      if (processedMessages.has(messageId)) {
        console.log(`⚠️ Message ID ${messageId} already processed. Ignoring.`)
        return res.sendStatus(200)
      }

      // ✅ Mark this message as processed
      processedMessages.add(messageId)

      console.log('📩 Message received from LINE:', event.message.text) // Log message

      const userMessage = event.message.text.toLowerCase()
      let replyText = 'กรุณารอการตอบกลับจากเจ้าหน้าที่'

      if (userMessage.includes('hello') || userMessage.includes('hi')) {
        replyText = 'Hello! How can I help you today? 😊'
      } else if (userMessage.includes('price')) {
        replyText =
          'Our pricing depends on the project. Please visit our website or contact us for details!'
      } else if (userMessage.includes('location')) {
        replyText = 'We are located in Thailand. Would you like the map?'
      } else if (
        userMessage.includes('thanks') ||
        userMessage.includes('thank you')
      ) {
        replyText = "You're welcome! Let me know if you need anything else. 😊"
      } else {
        return res.sendStatus(200)
      }

      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: replyText }],
        },
        {
          headers: { Authorization: `Bearer ${LINE_ACCESS_TOKEN}` },
        }
      )

      console.log(`✅ Processed message ID: ${messageId}`)
    }
  }

  res.sendStatus(200)
})

// Debugging: Check if LINE_ACCESS_TOKEN is loaded
console.log('Environment Variables:', process.env)
console.log(
  'LINE_ACCESS_TOKEN:',
  process.env.LINE_ACCESS_TOKEN ? 'Loaded' : 'Not Found'
)

// Keep server alive & prevent Railway from stopping
process.on('SIGTERM', () => {
  console.log('⚠️ Received SIGTERM. Shutting down gracefully...')
  process.exit(0)
})

app.listen(process.env.PORT || 3000, () =>
  console.log('✅ Server running on Railway')
)
