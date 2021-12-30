const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const poem = require('../models/poem')

// @desc    Show add page
// @route   GET /poems/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('poems/add')
})

// @desc    Process add form
// @route   POST /poems
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await poem.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all poems
// @route   GET /poems
router.get('/', ensureAuth, async (req, res) => {
  try {
    const poems = await poem.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('poems/index', {
      poems,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /poems/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let Poem = await poem.findById(req.params.id).populate('user').lean()

    if (!Poem) {
      return res.render('error/404')
    }

    if (Poem.user._id != req.user.id && Poem.status == 'private') {
      res.render('error/404')
    } else {
      res.render('poems/show', {
        Poem,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /poems/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const Poem = await poem.findOne({
      _id: req.params.id,
    }).lean()

    if (!Poem) {
      return res.render('error/404')
    }

    if (Poem.user != req.user.id) {
      res.redirect('/poems')
    } else {
      res.render('poems/edit', {
        Poem,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update story
// @route   PUT /poems/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let Poem = await poem.findById(req.params.id).lean()

    if (!Poem) {
      return res.render('error/404')
    }

    if (Poem.user != req.user.id) {
      res.redirect('/poems')
    } else {
      Poem = await poem.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let Poem = await poem.findById(req.params.id).lean()

    if (!Poem) {
      return res.render('error/404')
    }

    if (Poem.user != req.user.id) {
      res.redirect('/poems')
    } else {
      await poem.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const Poem = await poem.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('poems/index', {
      Poem,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router