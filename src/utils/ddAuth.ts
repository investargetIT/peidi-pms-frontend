import * as dd from "dingtalk-jsapi";
import { getJsApi } from "@/api/user";

const DINGTALK_CORP_ID = "dingfc722e531a4125b735c2f4657eb6378f";
const nonceStr = "pmUsed";

// 检测是否在钉钉环境中
export const isInDingTalk = () => {
  return typeof dd !== 'undefined' && dd.ready && dd.version;
};

export const ddAuthFun = () => {
  // 只在钉钉环境中执行授权
  if (!isInDingTalk()) {
    console.log('不在钉钉环境中，跳过钉钉授权');
    return;
  }

  getJsApi({
    nonceStr,
    url: location.href
  }).then(res => {
    // dd.config去注册接口
    const {
      data: { sign, timeStamp }
    } = res;
    if (sign && timeStamp) {
      dd.config({
        agentId: "3317230753", // 必填，微应用ID
        corpId: DINGTALK_CORP_ID, //必填，企业ID
        timeStamp, // 必填，生成签名的时间戳
        nonceStr, // 必填，自定义固定字符串。
        signature: sign, // 必填，签名
        // type: 0 / 1,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
        jsApiList: [
          "runtime.info",
          "biz.contact.choose",
          "device.notification.confirm",
          "device.notification.alert",
          "device.notification.prompt",
          "biz.ding.post",
          "biz.util.openLink",
          "complexChoose"
        ] // 必填，需要使用的jsapi列表，注意：不要带dd。
      });

      dd.error(function (err) {
        console.warn('钉钉授权错误:', err);
      });
    }
  }).catch(err => {
    console.warn('获取钉钉JS API配置失败:', err);
  });
};
