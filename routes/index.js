const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  // render 进入views里面的页面
  ctx.body = '测试接口访问成功'
})

router.get('/string', async (ctx, next) => {
  // body 直接写在页面上
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
