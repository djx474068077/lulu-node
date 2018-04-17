exports.message = {
  text (msg, content) {
    return xml.jsonToXml({
      xml: {
        ToUserName: msg.FromUserName,
        FromUserName: msg.ToUserName,
        CreateTime: Date.now(),
        MsgType: msg.MsgType,
        Content: content
      }
    })
  }
}