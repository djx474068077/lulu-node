'use strict'
const router = require('koa-router')()
const Game = require('../models/Game')
const User = require('../models/User')
const GameScore = require('../models/GameScore')
const Home = require('../models/Home')
// const Promise = require('promise')
const util = require('utility')

router.prefix('/game')

// 提交完成后，返回的本次战斗数据
router.get('/gameData', async (ctx, next) => {
  let home_id = ctx.query.home_id
  let home = ''
  let findHomeData = function () {
    return new Promise((resolve, reject) => {
      Home.findOne({_id: home_id}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  await findHomeData().then(res => {
    console.log(res)
    home = res
  })
  if (home) {
    ctx.body = {
      status: 10000,
      msg: '获取结算信息成功',
      data: home
    }
  } else {
    ctx.body = {
      status: 10001,
      msg: '获取结算信息失败'
    }
  }
})

// 提交本次游戏记录,并刷新最大分数
router.post('/practice/upSelfLogs', async (ctx, next) => {
  let { game_id, home_id, username, log, score } = ctx.request.body
  let maxScore = ''
  let otherScore = ''
  let findOtherScore = function () {
    return new Promise((resolve, reject) => {
      Home.findOne({_id: home_id}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let upHomeLogs = function () {
    if (score > otherScore) {
      return new Promise((resolve, reject) => {
        Home.update({_id: home_id}, {$set: {'user_f.score': score, 'user_f.log': log, 'is_game': false, 'username_win': 'f'}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else if (score < otherScore) {
      return new Promise((resolve, reject) => {
        Home.update({_id: home_id}, {$set: {'user_f.score': score, 'user_f.log': log, 'is_game': false, 'username_win': 's'}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        Home.update({_id: home_id}, {$set: {'user_f.score': score, 'user_f.log': log, 'is_game': false, 'username_win': 'n'}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    }
  }
  let getGameScore = function () {
    return new Promise((resolve, reject) => {
      GameScore.findOne({game_id: game_id, username: username}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let upSelfMaxScore = function () {
    if (maxScore === '无') {
      return new Promise((resolve, reject) => {
        GameScore.create({username: username, game_id: game_id, max_score: score}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else if (score > maxScore) {
      return new Promise((resolve, reject) => {
        GameScore.update({username: username, game_id: game_id}, {$set: {'max_score': score}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        GameScore.update({username: username, game_id: game_id}, {$set: {'max_score': maxScore}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    }
  }
  await findOtherScore().then(res => {
    console.log('findOtherScore')
    console.log(res)
    if (res) {
      otherScore = res.user_s.score
    }
  })
  await upHomeLogs().then(res => {
    console.log('upHomeLogs')
    console.log(res)
  })
  await getGameScore().then(res => {
    console.log('getGameScore')
    console.log(res)
    if (res) {
      maxScore = res.max_score
    } else {
      maxScore = '无'
    }
  })
  await upSelfMaxScore().then(res => {
    console.log('upSelfMaxScore')
    console.log(res)
    ctx.body = {
      status: 10000,
      msg: 'niubi'
    }
  })
})

// 创建房间
router.get('/practice/mate', async (ctx, next) => {
  let username = ctx.query.username
  let game_id = ctx.query.game_id
  let game = {}
  let user = {}
  let max_score = {}
  let home = {}
  let getGame = function() {
    return new Promise((resolve, reject) => {
      Game.findOne({_id: game_id},(err, doc) => {
      // console.log(err)
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let getUser = function() {
    return new Promise((resolve, reject) => {
      User.findOne({username: username},(err, doc) => {
      // console.log(err)
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let getUserMaxScore = function () {
    return new Promise((resolve, reject) => {
      GameScore.findOne({username: user.username, game_id: game._id},{max_score: 1}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let setPracticeHome = function () {
    return new Promise((resolve, reject) => {
      const homeModal = new Home({is_practice: true, game_id: game._id, game_name: game.name, user_f: {username: user.username, nickname: user.nickname, avatar: user.avatar, sex: user.sex, birthday: user.birthday}, user_s: {username: user.username, nickname: user.nickname,avatar: user.avatar, sex: user.sex, birthday: user.birthday, score: max_score}})
      homeModal.save((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  await getGame().then(res => {
    game = res
    // console.log('game')
    // console.log(res)
  })
  await getUser().then(res => {
    user = res
    // console.log('user')
    // console.log(res)
  })
  await getUserMaxScore().then(res => {
    if (res) {
      max_score = res.max_score
    } else {
      max_score = 0
  }
    // console.log('score')
    // console.log(res)
  })
  await setPracticeHome().then(res => {
    // console.log('set')
    // console.log(res)
    home = res
  })
  if (home) {
    ctx.body = {
      status: 10000,
      msg: '创建训练房间成功',
      data: home
    }
  } else {
    ctx.body = {
      status: 10001,
      msg: '创建训练房间失败',
      data: ''
    }
  }
})

// 退出房间，1是训练时的退出，2是对战时取消匹配
router.get('/deleteHome', async (ctx, next) => {
  let home_id = ctx.query.home_id
  let result = ''
  let deletehome = function () {
    return new Promise((resolve, reject) => {
      Home.remove({_id: home_id}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  await deletehome().then(res => {
    // console.log(res)
    result = res
  })
  if (result.ok === 1) {
    ctx.body = {
      status: 10000,
      msg: '删除房间成功'
    }
  } else {
    ctx.body = {
      status: 10001,
      msg: '删除房间成功'
    }
  }
})

// 获取游戏列表
router.get('/list', async (ctx, next) => {
  let username = ctx.query.username
  let gameList = []
  let scoreList = []
  let getGameList = function() {
    return new Promise((resolve, reject) => {
      Game.find((err, doc) => {
      // console.log(err)
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let getGameScore = function (id, username) {
    return new Promise((resolve, reject) => {
      GameScore.findOne({game_id: id, username: username}, (err, doc2) => {
        if (err) {
          reject(err)
        }
        // console.log(doc2['max_score'])
        if (doc2) {
          resolve(doc2)
        } else {
          resolve('0')
        }
      })
    })
  }
  await getGameList().then(res => {
    gameList = res
  })
  for (var game of gameList) {
    await getGameScore(game._id, username).then(res => {
      if (res === '0') {
      scoreList.push({})
      } else {
        scoreList.push(res)
      }
    })
  }
  if (gameList) {
    ctx.body = {
      status: 10000,
      msg: '获取成功',
      data: {gameList: gameList, scoreList: scoreList}
    }
  } else {
    ctx.body = {
      status: 10009,
      msg: '数据有误，请重试'
    }
  }
})

module.exports = router
