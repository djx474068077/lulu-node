'use strict'
const router = require('koa-router')()
const Game = require('../models/Game')
const User = require('../models/User')
const GameScore = require('../models/GameScore')
const Home = require('../models/Home')
// const Promise = require('promise')
const util = require('utility')

router.prefix('/game')

// 对战记录
router.get('/selfLogs', async (ctx, next) => {
  let username = ctx.query.username
  let mateLogs = ''
  let pracLogs = ''
  let findMateLogs = function () {
    return new Promise((resolve, reject) => {
      Home.find({$or: [{is_practice: false, is_game: false, 'user_f.username': username}, {is_practice: false, is_game: false, 'user_s.username': username}]}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let findPracLogs = function () {
    return new Promise((resolve, reject) => {
      Home.find({$or: [{is_practice: true, is_game: false, 'user_f.username': username}, {is_practice: true, is_game: false, 'user_s.username': username}]}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  await findMateLogs().then(res => {
    console.log('mate')
    console.log(res)
    mateLogs = res
  })
  await findPracLogs().then(res => {
    console.log('prac')
    console.log(res)
    pracLogs = res
  })
  ctx.body = {
    status: 10000,
    msg: '获取数据成功',
    data: {mateLogs: mateLogs, pracLogs: pracLogs}
  }
})

// 提交本次对战游戏记录,并刷新最大分数
router.post('/mate/upSelfLogs', async (ctx, next) => {
  let { game_id, home, username, log, score } = ctx.request.body
  let selfIsFirst = ''
  if (home.user_f.username === username) {
    selfIsFirst = true
  } else {
    selfIsFirst = false
  }
  let home_now = {}
  let maxScore = ''
  let otherScore = ''
  let findOtherScore = function () {
    return new Promise((resolve, reject) => {
      Home.findOne({_id: home._id}, (err, doc) => {
      if (err) {
        reject(err)
      }
      resolve(doc)
    })
  })
  }
  let upSelfLogs = function () {
    if (selfIsFirst) {
      return new Promise((resolve, reject) => {
        Home.update({_id: home._id}, {$set: {'user_f.score': score, 'user_f.log': log}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        Home.update({_id: home._id}, {$set: {'user_s.score': score, 'user_s.log': log}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    }
  }
  let upHomeWin = function () {
    if (parseInt(home_now.user_f.score) > parseInt(home_now.user_s.score)) {
      return new Promise((resolve, reject) => {
        Home.update({_id: home._id}, {$set: {'is_game': false, 'username_win': 'f'}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else if (parseInt(home_now.user_f.score) < parseInt(home_now.user_s.score)) {
      return new Promise((resolve, reject) => {
        Home.update({_id: home._id}, {$set: {'is_game': false, 'username_win': 's'}}, (err, doc) => {
          if (err) {
            reject(err)
          }
          resolve(doc)
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        Home.update({_id: home._id}, {$set: {'is_game': false, 'username_win': 'n'}}, (err, doc) => {
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
  await upSelfLogs().then(res => {
    console.log('upSelfLogs')
    console.log(res)
  })
  await findOtherScore().then(res => {
    // console.log('findOtherScore')
    // console.log(res)
    if (res) {
      home_now = res
      if (selfIsFirst) {
        otherScore = res.user_s.score
      } else {
        otherScore = res.user_f.score
      }
    }
  })
  if (otherScore !== '') {
    console.log('home_now')
    console.log(home_now)
    await upHomeWin().then(res => {
      console.log('upHomeWin')
      console.log(res)
    })
  }
  await getGameScore().then(res => {
    // console.log('getGameScore')
    // console.log(res)
    if (res) {
      maxScore = res.max_score
    } else {
      maxScore = '无'
    }
  })
  await upSelfMaxScore().then(res => {
    // console.log('upSelfMaxScore')
    // console.log(res)
    if (res) {
      ctx.body = {
        status: 10000,
        msg: 'niubi'
      }
    } else {
      ctx.body = {
        status: 10001,
        msg: '更新个人记录失败'
      }
    }
  })
})

// 轮询查找对手
router.get('/askMate', async (ctx, next) => {
  let username = ctx.query.username
  let home = {}
  let hasfind = false
  let findHomeByUm = function () {
    return new Promise((resolve, reject) => {
      Home.findOne({is_match: true, is_practice: false, 'user_f.username': username}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let setHomeIsMatch = function () {
    return new Promise((resolve, reject) => {
      Home.update({_id: home._id}, {$set: {'is_match': false}}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  await findHomeByUm().then(res => {
    console.log('findHomeByUm')
    console.log(res)
    if (res && res.user_s.username) {
      hasfind = true
      home = res
    } else {
      hasfind = false
    }
  })
  if (hasfind) {
    await setHomeIsMatch().then(res => {
      console.log('setMatch')
      console.log(res)
    })
  }
  if (hasfind) {
    ctx.body = {
      status: 10000,
      msg: '找到对手',
      data: home
    }
  } else {
    ctx.body = {
      status: 10001,
      msg: '未找到对手'
    }
  }
})
// 创建对战房间,并寻找对手
router.get('/mate/findOther', async (ctx, next) => {
  let username = ctx.query.username
  let games = []
  let game = {}
  let user = {}
  let max_score = {}
  let home = {}
  let is_first = true
  let setMsg = ''
  let getGames = function() {
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
  let getGameById = function() {
    return new Promise((resolve, reject) => {
      Game.findOne({_id: home.game_id}, (err, doc) => {
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
  // 找一个有play1的房间
  let getHomeHasF = function () {
    return new Promise((resolve, reject) => {
      Home.findOne({is_match: true,is_practice: false, 'user_s.username': ''}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let setHomeFirst = function () {
    return new Promise((resolve, reject) => {
      const homeModal = new Home({is_practice: false, is_match: true, game_id: game._id, game_name: game.name, user_f: {username: user.username, nickname: user.nickname, avatar: user.avatar, sex: user.sex, birthday: user.birthday}})
      homeModal.save((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let setHomeSecond = function () {
    return new Promise((resolve, reject) => {
      Home.update({_id: home._id}, {$set: {'user_s.username': user.username, 'user_s.nickname': user.nickname, 'user_s.avatar': user.avatar, 'user_s.sex': user.sex, 'user_s.birthday': user.birthday}}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  let findFullHome = function () {
    return new Promise((resolve, reject) => {
      Home.findOne({_id: home._id}, (err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
    })
  }
  await getHomeHasF().then(res => {
    console.log('home')
    console.log(res)
    if (res) {
      home = res
      is_first = false
    } else {
      home = {}
      is_first = true
    }
  })

  await getUser().then(res => {
    user = res
    // console.log('user')
    // console.log(res)
  })
  if (is_first) {
    // 没找到有人的房间
    await getGames().then(res => {
      console.log('getGames')
      console.log(res)
      games = res
      game = games[parseInt(Math.random()*games.length)]
    })
    await setHomeFirst().then(res => {
      console.log('setFirst')
      console.log(res)
      home = res
    })
  } else {
    // 找到有人等的房间
    await setHomeSecond().then(res => {
      console.log('setSecond')
      console.log(res)
      setMsg = res
    })
  }
  if (setMsg.n === 1) {
    // 找到对手并创建房间成功，查找当前房间信息
    await findFullHome().then(res => {
      console.log('findFullHome')
      console.log(res)
      home = res
    })
    await getGameById().then(res => {
      console.log(res)
      game = res
  })
  }
  if (is_first) {
    ctx.body = {
      status: 10001,
      msg: '创建房间成功,但没有找到队友',
      data: {home: home, game: game}
    }
  } else if (setMsg.n !== 1) {
    ctx.body = {
      status: 10002,
      msg: '创建数据库失败，请重试'
    }
  } else {
    ctx.body = {
      status: 10000,
      msg: '创建房间成功并找到队友',
      data: {home: home, game: game}
    }
  }
})

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
    // console.log(res)
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

// 提交本次训练游戏记录,并刷新最大分数
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
    // console.log('findOtherScore')
    // console.log(res)
    if (res) {
      otherScore = res.user_s.score
    }
  })
  await upHomeLogs().then(res => {
    // console.log('upHomeLogs')
    // console.log(res)
  })
  await getGameScore().then(res => {
    // console.log('getGameScore')
    // console.log(res)
    if (res) {
      maxScore = res.max_score
    } else {
      maxScore = '无'
    }
  })
  await upSelfMaxScore().then(res => {
    // console.log('upSelfMaxScore')
    // console.log(res)
    ctx.body = {
      status: 10000,
      msg: 'niubi'
    }
  })
})

// 创建训练房间
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
  if (result.n === 1) {
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
