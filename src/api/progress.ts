import { http } from "@/utils/http";

const baseUrlApi = (url: string, hasPm = true) => {
  return `https://api.peidigroup.cn/${hasPm ? "prm" : ""}${url}`;
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
