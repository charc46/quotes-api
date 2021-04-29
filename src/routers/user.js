const express = require('express')
const router = new express.Router

const User = require('../models/user')
const auth = require('../middleware/auth')

// User endpoints

// Create user
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    const token = await user.generateAuthToken()
    await user.save()
    res.status(201).send({user, token})
  } catch(e) {
    res.status(400).send(e)
  }
})

// Login user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch(e) {
    res.status(400).send(e)
  }
})

// Logout user
router.post('/users/logout', auth, async (req, res) => {
  try {
    // Remove current sessions request token from tokens array
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
    await req.user.save()
    res.send()
  } catch(e) {
    res.status(500).send(e)
  }
})

// Logout user all sessions
router.post('/users/logoutAll', auth, async(req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch(e) {
    res.status(500).send(e)
  }
})

// Get signed in user info
router.get('/users/me', auth, async (req, res) => {
  res.send({user: req.user, token: req.token})
})

// Update user
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body).filter(update => update !== 'currentPassword')
  const allowedUpdates = ['username', 'email', 'password']
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

  if(!isValidUpdate) {
    return res.status(400).send({ error: 'Invalid updates' })
  }

  try {
    const user = await User.findByCredentials(req.body.email, req.body.currentPassword)
    updates.forEach(update => user[update] = req.body[update])
    await user.save()

    if(!req.user) {
      return res.status(400).send('User not found')
    }

    res.send({user, token: req.token})
  } catch(e) {
    console.log(e)
    res.status(400).send(e)
  }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch(e) {
    res.status(500).send(e)
  }
})

module.exports = router