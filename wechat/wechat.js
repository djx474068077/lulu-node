var crypto = require('crypto');
const router = require('koa-router')()

router.prefix('/weixin') // 设置路由字段，在app中的weixin.routes

var token = "wawa"; //此处需要你自己修改！

/* GET home page. */
router.get('/', function(ctx, next) {
  // 获取req中的timestamp、nonce 与token加密后 与 微信返回的加密后的signature字段比对，相同则返回echostr
  var signature = ctx.request.query.signature;
  var timestamp = ctx.request.query.timestamp;
  var nonce = ctx.request.query.nonce;
  var echostr = ctx.request.query.echostr;

  /*  加密/校验流程如下： */
  //1. 将token、timestamp、nonce三个参数进行字典序排序
  var array = new Array(token,timestamp,nonce);
  array.sort();
  var str = array.toString().replace(/,/g,"");

  //2. 将三个参数字符串拼接成一个字符串进行sha1加密
  var sha1Code = crypto.createHash("sha1");
  var code = sha1Code.update(str,'utf-8').digest("hex");

  //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  if(code===signature){
    ctx.response.body = echostr
  }else{
    ctx.response.body = "error"
  }
});
module.exports = router;