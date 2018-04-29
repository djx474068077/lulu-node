'use strict'
const router = require('koa-router')()
const User = require('../models/User')
const util = require('utility')

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

// 注册  /users/register
router.post('/register', async (ctx, next) => {
  console.log(ctx.request.body)
  let userName = ctx.request.body.userName
  let password = util.md5(ctx.request.body.password)
  let doc = await User.findOne({userName: userName}, (err, doc) => {
    if (err) {
      console.log(err);
      return 10100
    };
    return doc
  })
  if (doc === 10100) {
    ctx.response.body = {
      status: '10100',
      msg: '数据库连接失败'
    }
  } else if (doc) {
    ctx.response.body = {
      status: '10010',
      msg: '用户已被注册'
    }
  } else {
    await User.create({userName, password}, (err, doc) => {
      if (err) {
        console.log(err);
        return ctx.response.body = {
          status: '10010',
          msg: err.message
        };
      };
      console.log('这是写入数据库的方法体内')
      if (doc) {
        return ctx.response.body = {
          status: '10000',
          msg: 'success'
        }
      }
      return ctx.response.body = {
        status: '10002',
        msg: '用户注册失败'
      }
    })
    console.log('这是注册最底下')
  }
})

router.get('/login', function (ctx, next) {
  ctx.body = 'login!!!!!'
})

module.exports = router
