const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN

app.post('/webhook', async (req, res) => {
  const events = req.body.events

  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId

      // Send a response (without database check)
      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: 'Thank you for messaging us!' }],
        },
        {
          headers: { Authorization: `Bearer ${LINE_ACCESS_TOKEN}` },
        }
      )
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


app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on Railway')
)
