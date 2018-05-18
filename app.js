// 引用koa框架
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
// 用户处理前端传值的数据处理
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
// 引用微信的权限验证的api
const API = require('wechat-api')
// 引用koa2-cors快速处理跨域问题
const cors = require('koa2-cors')
// 引用各个路由
const index = require('./routes/index')
const users = require('./routes/users')
const game = require('./routes/game')
const weixin = require('./wechat/wechat')
const oauth = require('./wechat/oauth')
const config = require('./config/config')

// error handler
onerror(app)

// koa2-cors实现跨域
app.use(cors())
// app.use(cors({app.use(cors({
//   origin: function (ctx) {
//     if (ctx.url === '/test') {
//       return "*";
//     }
//     return 'http://wawa.dongff.xyz';
//   },
//   exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//   maxAge: 5,
//   credentials: true,
//   allowMethods: ['GET', 'POST', 'DELETE'],
//   allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }));

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))


// 请求日志（可有可无）
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(game.routes(), game.allowedMethods())
app.use(weixin.routes(), weixin.allowedMethods())
app.use(oauth.routes(), oauth.allowedMethods())

// app.use(function(ctx, next){
//   console.log("oauth - login")
//   var AppID = config.appid;
//   // 第一步：用户同意授权，获取code
//   var router = 'get_wx_access_token';
//   // 这是编码后的地址
//   var return_uri = 'http://wawaapi.dongff.xyz/oauth/'+router;
//   var scope = 'snsapi_userinfo';
//
//   ctx.response.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');
// })

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
