let mongoose = require('mongoose')
let db = mongoose.createConnection('mongodb://localhost:27017/wawa')

db.on('open', cb => {
    console.log('数据库连接真的成功了')
})
db.on('error', cb => {
    console.log('数据库连接失败')
})

module.exports = db;