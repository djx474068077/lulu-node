'use strict'
const router = require('koa-router')()
const User = require('../models/User')

router.prefix('/users')

router.get('/', async (ctx, next) => {
  console.log('请求了users')
  var params = {
    nickName: 'dadao'
  }
  await User.find(params, (err, doc) => {
    console.log(err)
    if (err) {
      return ctx.response.body = {
        status: '10002',
        msg: err.message
      }
    }
    if (!doc) {
      return ctx.response.body = {
        status: '10002',
        msg: '用户未找到'
      }
    }
    console.log(doc)
    return ctx.response.body = {
      status: '10000',
      data: doc,
      msg: 'success'
    }
  })
  // ctx.response.json = doct
  // ctx.response.body = '应该是一个json'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/login', function (ctx, next) {
  ctx.body = 'login!!!!!'
})

module.exports = router
