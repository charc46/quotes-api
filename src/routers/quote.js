const express = require('express')
const router = new express.Router

const Quote = require('../models/quote')
const auth = require('../middleware/auth')

// Quote endpoints

// Create quote
router.post('/quotes', auth, async(req, res) => {
  const quote = new Quote({
    ...req.body,
    userId: req.user._id
  })

  try {
    await quote.save()
    res.status(201).send(quote)
  } catch(e) {
    res.status(500).send(e)
  }
})

// Get quotes
router.get('/quotes', auth, async(req, res) => {
  try {
    await req.user.populate('quotes').execPopulate()
    res.send(req.user.quotes)
  } catch(e) {
    res.status(500).send('e')
  }
})

// Get quote
router.get('/quotes/:id', auth, async ( req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id })

    if(!quote) {
      res.status(404).send('Quote not found')
    }

    res.send(quote)
  } catch(e) {
    res.status(500).send(e)
  }
})

// Update quote
router.patch('/quotes/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['quote', 'source']
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

  if(!isValidUpdate) return res.status(400).send({ error: 'Invalid Updates' })

  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.user._id })

    if(!quote) return res.status(404).send('Quote not found')

    updates.forEach(update => quote[update] = req.body[update])
    await quote.save()
    res.send(quote)
  } catch(e) {
    res.status(400).send()
  }
})

// Delete Quote
router.delete('/quotes/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findOneAndDelete({ _id: req.params.id, userId: req.user._id})

    if(!quote) {
      return res.status(404).send('Quote not found')
    }

    res.send(quote)
  } catch(e) {
    res.status(500).send(e)
  }
})

module.exports = router