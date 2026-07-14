import { http } from "@/utils/http";

// 环境配置，根据不同环境使用不同的基础 URL
const getBaseUrl = () => {
  // 开发环境
  return "http://12.18.1.36:8089";
  // 生产/预发布环境
  return "https://api.peidigroup.cn";
};

const baseUrlApi = (url: string, hasPm = true) => {
  return `${getBaseUrl()}/${hasPm ? "prm" : ""}${url}`;
};

// 获取项目进度列表
export const getProjectProgressList = params => {
  return http.request("get", baseUrlApi("/pm/list-info"), {
    params
  });
};

// 新增项目进度
export const addProjectProgress = data => {
  return http.request("post", baseUrlApi("/pm/new-info"), {
    data
  });
};

// 获取系列列表
export const getProjectTypeList = params => {
  return http.request("get", baseUrlApi("/pm/series"), {
    params
  });
};

// 获取阶段信息列表
export const getProjectStageList = params => {
  return http.request("get", baseUrlApi("/pm/stage"), {
    params
  });
};

// 新增项目进度
export const updateProjectStateProgress = data => {
  return http.request("post", baseUrlApi("/pm/update-stage"), {
    data
  });
};
