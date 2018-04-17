const wx = require('./wx')
exports.postHandle = (ctx, next) => {
  let msg,
    MsgType,
    result

  msg = ctx.req.body ? ctx.req.body.xml : ''

  if (!msg) {
    ctx.body = 'error request.'
    return;
  }

  MsgType = msg.MsgType[0]

  switch (MsgType) {
    case 'text':
      result = wx.message.text(msg, msg.Content)
      break;
    default:
      result = 'success'
  }
  ctx.res.setHeader('Content-Type', 'application/xml')
  ctx.res.end(result)
}