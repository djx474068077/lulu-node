const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const wechat = require('wechat')
const API = require('wechat-api')
const cors = require('koa2-cors')

const index = require('./routes/index')
const users = require('./routes/users')
// const api = require('./routes/api')
const weixin = require('./wechat/wechat')
const oauth = require('./wechat/oauth')
const config = require('./config/config')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
// app.use(api.routes(), api.allowedMethods())
app.use(weixin.routes(), weixin.allowedMethods())
app.use(oauth.routes(), oauth.allowedMethods())

app.use(cors({
  origin: function (ctx) {
    if (ctx.url === '/test') {
      return false;
    }
    return 'http://localhost:9001';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
// 微信订阅号菜单
var wechat_api = new API(config.appid, config.appsecret)
var menu = JSON.stringify(require('./config/wx_menu.json'));
wechat_api.createMenu(menu, function (err, result) {
  console.log(result);
});

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
