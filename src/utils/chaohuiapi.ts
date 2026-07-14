import Axios from "axios";
import { ElLoading } from "element-plus";
export const default_upload_url = "/web_packages/test/uploadFile";
import { message } from "@/utils/message";

const DINGTALK_CORP_ID = "dingfc722e531a4125b735c2f4657eb6378f";
const port = 5001;
const USERNAME = "夏琰";
const PASSWORD = "X81y0122";
let sid = "";
let ipThis = "";
const ips = ["192.168.1.252", "12.18.1.16", "192.168.110.252"];
const ipsName = [
  {
    url: "192.168.1.252",
    name: "A区"
  },
  {
    url: "12.18.1.16",
    name: "B区"
  },
  {
    url: "192.168.110.252",
    name: "CD区"
  }
];
import { jsonp } from "vue-jsonp";

const testResults: any = [];
// let uploadUrl = "http://9vx396nm1505.vicp.fun:6001";
let uploadUrl = "https://pms.peidigroup.cn/nas";

const testIPWithJsonp = ip => {
  return new Promise((resolve, reject) => {
    jsonp(
      `https://${ip}:${port}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${USERNAME}&passwd=${PASSWORD}&session=FileStation&format=cookie`,
      {
        callbackName: "callback", // 自定义回调函数名，需和服务端配合
        timeout: 2000 // 设置超时时间（单位毫秒）
      }
    )
      .then(response => {
        console.log("1", response);

        // 如果成功获取到响应数据，认为可访问
        testResults.push({
          ip: ip,
          port: port,
          message: "is accessible"
        });
        ipThis = ip;
        resolve(ip);
      })
      .catch(error => {
        // 如果出现错误，认为不可访问，记录错误信息
        console.log("ddddsss", error);

        testResults.push({
          ip: ip,
          port: port,
          message: `is not accessible, error: ${error.message}`
        });
        reject({ error, ip });
      });
  });
};

// 导入这个方法，导入后会自动登陆chaohui
export const testAllIPs = async () => {
  return new Promise((resolve, reject) => {
    resolve(chaohuilogin());
  });
};

// 添加缓存，避免重复登录
let cachedLoginPromise: Promise<any> | null = null;
let loginCacheTime = 0;
const LOGIN_CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 登陆
export const chaohuilogin = () => {
  // 检查缓存
  const now = Date.now();
  if (cachedLoginPromise && (now - loginCacheTime) < LOGIN_CACHE_DURATION) {
    return cachedLoginPromise;
  }

  console.log("开始连接上传服务...");

  // 不再使用全屏加载遮罩
  const promise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("连接超时，请检查网络"));
    }, 8000); // 8秒超时

    Axios.get(
      `${uploadUrl}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${USERNAME}&passwd=${PASSWORD}&session=FileStation&format=cookie`,
      { timeout: 8000 } // 添加请求超时
    )
      .then(res => {
        clearTimeout(timeoutId);
        if (res?.data?.data?.sid) {
          sid = res?.data?.data?.sid;
          resolve({
            sid: res?.data?.data?.sid,
            postUrl: `${uploadUrl}/webapi/entry.cgi?api=SYNO.FileStation.Upload&method=upload&version=2&_sid=${res?.data?.data?.sid}`
          });
        } else {
          reject(new Error("登录响应格式错误"));
        }
        console.log("res-------", res);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.log("chaohuilogin err", err);
        localStorage.removeItem("ipThis");
        reject(err);
      });
  });

  // 缓存登录Promise
  cachedLoginPromise = promise;
  loginCacheTime = now;

  // 如果失败，清除缓存
  promise.catch(() => {
    cachedLoginPromise = null;
  });

  return promise;
};

// 下载
export const chaohuiDownload = async filename => {
  const encodedFilename = encodeURIComponent(filename);
  console.log(
    "filename",
    filename,
    encodedFilename,
    `${uploadUrl}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${"/web_packages/test/uploadFile"}/${encodedFilename}&_sid=${sid}`
  );

  try {
    const res = await Axios.get(
      `${uploadUrl}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${"/web_packages/test/uploadFile"}/${encodedFilename}&_sid=${sid}`,
      {
        responseType: "blob",
        timeout: 10000 // 10秒超时
      }
    );

    const link = document.createElement("a");
    const objectURL = window.URL.createObjectURL(res.data);
    link.href = objectURL;
    link.download = filename; // 自定义文件名，可选
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectURL); // 释放临时URL对象
  } catch (err) {
    console.error("Download error:", err);
    localStorage.removeItem("ipThis");
    // 如果有需要，可以重新登录，但不要自动重试导致循环
    // 清除缓存，下次需要时重新登录
    cachedLoginPromise = null;
    throw err;
  }
};
