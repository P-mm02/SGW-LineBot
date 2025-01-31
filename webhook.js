const express = require('express')
const axios = require('axios')
const fs = require('fs')

const router = express.Router()

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN

// Load predefined message data from JSON
const msgData = JSON.parse(fs.readFileSync('./msgData.json', 'utf8'))

// Store user messages: { userId: [ "message1", "message2", ... ] }
const userMessages = new Map()

router.post('/webhook', async (req, res) => {
  // console.log('🔹 Received Webhook Event:', JSON.stringify(req.body, null, 2)) // Debugging log

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
      const userId = event.source.userId
      const userMessage = event.message.text.toLowerCase().trim()

      // ✅ Initialize storage for this user if not exists
      if (!userMessages.has(userId)) {
        userMessages.set(userId, [])
      }

      // ✅ Check if this user already sent the same message
      if (userMessages.get(userId).includes(userMessage)) {
        /* console.log(
          `⚠️ User ${userId} already sent message: "${userMessage}". Ignoring.`
        ) */
        return res.sendStatus(200)
      }

      // ✅ Store the new message for this user
      userMessages.get(userId).push(userMessage)

      console.log(
        `📩 New message received from User ${userId}: "${userMessage}"`
      )

      let replyText = 'กรุณารอการตอบกลับจากเจ้าหน้าที่'

      // ✅ Check if the message matches any key in msgData.json
      for (const key in msgData) {
        if (userMessage.includes(key)) {
          replyText = msgData[key]
          break
        }
      }

      // ✅ If no predefined response, ignore
      if (replyText === 'กรุณารอการตอบกลับจากเจ้าหน้าที่') {
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

      console.log(`✅ Processed message from User ${userId}: "${userMessage}"`)
    }
  }

  res.sendStatus(200)
})

module.exports = router
