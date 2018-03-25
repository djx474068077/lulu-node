const router = require('koa-router')()
const User = require('../models/user')

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/login', function (ctx, next) {
  ctx.body = 'login!!!!!'
})

module.exports = router
