// 微信授权模块
const router = require('koa-router')()
var request = require('request');
var config = require('../config/config');

router.prefix('/oauth') // 设置路由字段，在app中的weixin.routes

/* 微信网页授权 */
var AppID = config.appid;
var AppSecret = config.appsecret;
// router.get('/wx_login', function(ctx, next){
//   console.log("oauth - login")
//   // 第一步：用户同意授权，获取code
//   var router = 'get_wx_access_token';
//   // 这是编码后的地址
//   var return_uri = 'http://wawaapi.dongff.xyz/oauth/'+router;
//   var scope = 'snsapi_userinfo';
//
//   ctx.response.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');
// });

/* 获取access_token */
router.get('/get_wx_access_token', function(ctx, next){
  console.log("get_wx_access_token")
  console.log("code_return: "+ctx.request.query.code)

  // 第二步：通过code换取网页授权access_token
  var code = ctx.request.query.code;
  request.get(
    {
      url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+AppID+'&secret='+AppSecret+'&code='+code+'&grant_type=authorization_code',
    },
    function(error, response, body){
      if(response.statusCode == 200){

        // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
        console.log(JSON.parse(body));
        var data = JSON.parse(body);
        var access_token = data.access_token;
        var openid = data.openid;
        console.log('openid' + openid);
        request.get(
          {
            url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
          },
          function(error, response, body){
            if(response.statusCode == 200){

              // 第四步：根据获取的用户信息进行对应操作
              var  userinfo = JSON.parse(body);
              //console.log(JSON.parse(body));
              console.log('获取微信信息成功！' + userinfo.nickname + userinfo.city + userinfo.country);

              // 小测试，实际应用中，可以由此创建一个帐户
              ctx.response.body = "\
                                <h1>"+userinfo.nickname+" 的个人信息</h1>\
                                <p><img src='"+userinfo.headimgurl+"' /></p>\
                                <p>"+userinfo.city+"，"+userinfo.province+"，"+userinfo.country+"</p>\
                            ";
            }else{
              console.log(response.statusCode);
            }
          }
        );
      }else{
        console.log(response.statusCode);
      }
    }
  );
});
module.exports = router;