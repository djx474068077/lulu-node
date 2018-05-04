'use strict'
const router = require('koa-router')()
const Game = require('../models/Game')
const GameScore = require('../models/GameScore')
// const Promise = require('promise')
const util = require('utility')

router.prefix('/game')

router.get('/list', async (ctx, next) => {
  let username = ctx.query.username
  let gameList = []
  var getGameList = function() {
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
  var getGameScore = function (id, username) {
    return new Promise((resolve, reject) => {
      GameScore.findOne({game_id: id, username: username}, (err, doc2) => {
        if (err) {
          reject(err)
        }
        console.log(doc2)
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
  let scoreList = []
  for (var game of gameList) {
    await getGameScore(game.id, username).then(res => {
      if (res === '0') {
        // game.max_score = 0
        scoreList.push({})
      } else {
        console.log(res)
      // !!!!!  这里 能获取到res，但是获取不到res.max_score
      // !!!!!  好像也不能设置for循环里面的game对象的某一个key的值
      //   game.max_score = res
      //   console.log(game)
        scoreList.push(res)
      }
    })
  }
  console.log(scoreList)
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
  // await new Promise((resolve, reject) => {
  //   Game.find((err, doc) = > {
  //     console.log(err)
  //     if(err) {
  //       return reject(err)
  //     }
  //     return reject(doc)
  //   })
  // }).then(res => {
  //   console.log(res)
  // })
  // console.log('底部')

  // function timeout(ms) {
  //   return new Promise((resolve) => {
  //     console.log("111");
  //     setTimeout(resolve, ms)
  // });
  // }
  //
  // await timeout(1000).then(() => {
  //   console.log('222')
  // });
  //
  // console.log("333")
})

module.exports = router
