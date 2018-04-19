const router = require('koa-router')()
const index = require('./index.js')
const users = require('./users.js')
console.log('api.router')
router.use('/index', index.allowedMethods())
router.use('/users', users.allowedMethods())

module.exports = router