'use strict'
const router = require('koa-router')()
const User = require('../models/User')
// const Promise = require('promise')
const util = require('utility')

router.prefix('/users')

// 注册  /users/register
router.post('/register', async (ctx, next) => {
  let username = ctx.request.body.username
  let password = util.md5(ctx.request.body.password)
  let hasUser = await User.findOne({username: username}, (err, doc) => {
    // console.log(err);
    if (err) {
      return 10100
    };
    return doc
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
      User.create({username: username, password: password, nickname: '游客' + username}, (err, doc) => {
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
})

// 登陆 /users/login
router.post('/login', async (ctx, next) => {
  let username = ctx.request.body.username
  let password = util.md5(ctx.request.body.password)
  await User.findOne({username: username, password: password}, (err, doc) => {
    // console.log(err);
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

// 修改个人信息 /users/changeSelf
router.post('/changeSelf', async (ctx, next) => {
  let { username, nickname, avatar, sex, birthday, province, city, county, describe } = ctx.request.body
  await User.update({username}, {$set: {nickname, avatar, sex, birthday, province,city, county, describe}}, (err, doc) => {
    if (err) {
      return ctx.body = {
        status: 10100,
        msg: '数据库连接失败'
      }
    };
    if (doc.ok === 1) {
      return ctx.body = {
        status: 10000,
        msg: '修改成功'
      }
    } else {
      return ctx.body = {
        status: 10002,
        msg: '未知错误'
      }
    }
  })
})

// 获取个人信息 /users/self
router.get('/self', async (ctx, next) => {
  let username = ctx.query.username
  await User.findOne({username}, (err, doc) => {
    if (err) {
      return ctx.body = {
        status: 10100,
        msg: '数据库连接失败'
      }
    };
    if (!doc) {
      return ctx.body = {
        status: 10001,
        msg: '用户不存在'
      }
    }
    return ctx.body = {
      status: 10000,
      msg: '获取信息成功',
      data: doc
    }
  })
})

module.exports = router
