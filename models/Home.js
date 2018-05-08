'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var db = require('../db/db')

/**
 * 定义一个模式(相当于传统意义的表结构)
 * 每个模式映射mongoDB的一个集合，
 * 它定义（只是定义，不是实现）这个集合里面文档的结构，就是定义这个文档有什么字段，字段类型是什么，字段默认值是什么等。
 * 除了定义结构外，还定义文档的实例方法，静态模型方法，复合索引，中间件等
 * @type {mongoose}
 */
var HomeSchema = new Schema({
  // id: {type: Number, index: { unique: true, dropDups: true }},  // id
  is_game: {type: Boolean, default: true}, // 是否在游戏中，true表示正在游戏中，false表示已经结束
  is_match: {type: Boolean, default: false}, // 是否在匹配中，true表示正在匹配中，false表示不在匹配，游戏开始了
  is_practice: {type: Boolean, default: false}, // 是否是训练局

  game_id: {type: String, default: ''},
  game_name: {type: String, default: ''},

  username_win: {type: String, default: ''},  // 胜利用户

  user_f: {
    username: {type: String, default: ''},
    nickname: {type: String, default: ''},
    avatar: {type: String, default: ''},
    sex: {type: String, default: ''},
    birthday: {type: String, default: ''},
    log: [  // 比赛记录
      {
        time: {type: Number, default: 0},  // 时间段
        is_right: {type: Boolean, default: false}, // 是否正确
        score_add: {type: Number, default: 0} // 加的分数（不正确为0// ）
      }
    ],
    score: {type: String, default: ''}       // 总分数
  },
  user_s: {
    username: {type: String, default: ''},
    nickname: {type: String, default: ''},
    avatar: {type: String, default: ''},
    sex: {type: String, default: ''},
    birthday: {type: String, default: ''},
    log: [  // 比赛记录
      {
        time: {type: Number, default: 0},  // 时间段
        is_right: {type: Boolean, default: false}, // 是否正确
        score_add: {type: Number, default: 0} // 加的分数（不正确为0// ）
      }
    ],
    score: {type: String, default: ''}       // 总分数
  },

  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    }
  }
})

// Defines a pre hook for the document.
HomeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  next()
})


/**
 * 定义模型Home
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数Home 数据库中的集合名称, 不存在会创建.
var Home = db.model('home', HomeSchema)
console.log('Home实例')
module.exports = Home

/**
 * nodejs中文社区这篇帖子对mongoose的用法总结的不错：https://cnodejs.org/topic/548e54d157fd3ae46b233502
 */