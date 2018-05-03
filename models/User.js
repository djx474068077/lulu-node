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
var UserSchema = new Schema({
    username: String,   // 用戶名（唯一）
    password: String,   // 密码
    nickname: {type: String, default: ''},   // 昵称
    describe: {type: String, default: ''},       // 个人描述
    sex: {type: String, default: ''},        // 性别
    province: {type: String, default: ''},   // 省
    city: {type: String, default: ''},       // 城市
    county: {type: String, default: ''},     // 县、区
    birthday: {type: Date, default: ''},
    avatar: {type: String, default: ''},
    ability: {
        speed: {type: Number, default: 10}, // 速度
        accuracy: {type: Number, default: 10}, // 准确率
        computed: {type: Number, default: 10}, // 计算力
        memory: {type: Number, default: 10}, // 记忆力
        observe: {type: Number, default: 10}, // 观察力
        judge: {type: Number, default: 10}, // 判断力
    },
    is_match: {type: Boolean, default: false},
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
UserSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next()
})


/**
 * 定义模型User
 * 模型用来实现我们定义的模式，调用mongoose.model来编译Schema得到Model
 * @type {[type]}
 */
// 参数User 数据库中的集合名称, 不存在会创建.
var User = db.model('user', UserSchema)
console.log('User实例')
module.exports = User

/**
 * nodejs中文社区这篇帖子对mongoose的用法总结的不错：https://cnodejs.org/topic/548e54d157fd3ae46b233502
 */