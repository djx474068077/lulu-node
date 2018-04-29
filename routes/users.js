'use strict'
const router = require('koa-router')()
const User = require('../models/User')
// const Promise = require('promise')
const util = require('utility')

router.prefix('/users')

router.get('/', async (ctx, next) => {
  console.log('请求了users');
  var params = {
    nickname: 'dadao'
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
  // console.log(ctx.request.body)
  let username = ctx.request.body.username
  let password = util.md5(ctx.request.body.password)
  let hasUser = await User.findOne({username: username}, (err, doc) => {
    // console.log(err);
    if (err) {
      // return ctx.response.body = {
      //   status: '10100',
      //   msg: '数据库连接失败'
      // }
      return 10100
    };
    return doc
    // if (doc) {
    //   return ctx.response.body = {
    //     status: '10010',
    //     msg: '用户已被注册'
    //   }
    // }
  })
  if (hasUser === 10100) {
    ctx.response.body = {
      status: 10100,
      msg: '数据库连接失败'
    }
  } else if (hasUser) {
    ctx.response.body = {
      status: 10001,
      msg: '用户已存在'
    }
  } else {
    await new Promise((resolve, reject) => {
      User.create({username, password}, (err, doc) => {
        if(err){
          return reject(err)
        }
        return resolve(doc)
      })
    }).then(res => {
      ctx.response.body = {
        status: 10000,
        msg: "注册成功",
        data: res
      }
    }).catch(err => {
      ctx.response.body = {
        status: 10100,
        msg: err.message
      }
    })
  }
  // console.log('find 最底下')
})

router.post('/login', async (ctx, next) => {
  let username = ctx.request.body.username
  let password = util.md5(ctx.request.body.password)
  await User.findOne({username: username, password: password}, (err, doc) => {
    console.log(err);
    if (err) {
      return ctx.body = {
        status: 10100,
        msg: '数据库连接失败'
      }
    };
    if (!doc) {
      return ctx.body = {
        status: 10001,
        msg: '用户不存在或密码输入错误'
      }
    }
    return ctx.body = {
      status: 10000,
      msg: '登陆成功',
      data: doc
    }
  })
})

module.exports = router
