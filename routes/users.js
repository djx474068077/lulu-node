const router = require('koa-router')()
const User = require('../models/user')

router.prefix('/users')

router.get('/', function (ctx, next) {
  console.log('请求了users')
  ctx.response.body = '应该是一个json'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/login', function (ctx, next) {
  ctx.body = 'login!!!!!'
})

module.exports = router
