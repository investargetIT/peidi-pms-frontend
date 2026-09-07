// import { getAdminUserEnum } from "../api/pmApi";
// ======== 产品维护 / 项目进度总览 权限配置（命中任一即拥有权限）========
const permissionConfig = {
  // 钉钉用户ID
  dingTalkUserIds: ["010035500329324065"],
  // 系统内部用户ID（登录后存储的 user-check-info.id）
  internalUserIds: ["1926449443739601524"],
  // 部门ID：新产品研发中心NPD 854426504；产品市场PM 982315056；测试 939900386
  adminDeptIds: [854426504, 982315056, 939900386]
};

// 判断当前登录用户是否命中权限配置
const hasPermissionByConfig = () => {
  // 1. 钉钉用户信息判断（钉钉ID + 部门ID）
  let ddUserInfo: any = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  }
  if (ddUserInfo) {
    // 钉钉用户ID
    if (permissionConfig.dingTalkUserIds.includes(String(ddUserInfo?.userid))) {
      return true;
    }
    // 部门ID
    if (ddUserInfo?.dept_id_list && ddUserInfo.dept_id_list.length > 0) {
      for (const item of ddUserInfo.dept_id_list) {
        if (permissionConfig.adminDeptIds.includes(item)) return true;
      }
    }
  }
  // 2. 系统内部用户ID（登录后存储的 user-check-info.id）
  try {
    const userCheckStr = localStorage.getItem("user-check-info");
    if (userCheckStr) {
      const userCheck = JSON.parse(userCheckStr);
      if (permissionConfig.internalUserIds.includes(String(userCheck?.id))) {
        return true;
      }
    }
  } catch (error) {
    console.error("解析 localStorage 中的 user-check-info 失败", error);
  }
  return false;
};

// ========== 以下任务相关权限函数当前项目未使用，暂时注释保留 ==========
/*
// 相关权限的判断
const isInArr = (val, arr) => {
  const item = arr.find(item => item.userId == val);
  return Boolean(item);
};

// isCreator
const isCreator = (val, obj) => {
  return val == obj.userId;
};

// 判断当前用户是否是超级用户
export const isSuperAdmin = async () => {
  return new Promise(async resolve => {
    let ddUserInfo = localStorage.getItem("ddUserInfo");
    if (ddUserInfo) {
      ddUserInfo = JSON.parse(ddUserInfo);
    }
    let superAdmin: any = [];
    // const res = await getAdminUserEnum();
    superAdmin = res;
    let flag = false;
    console.log("superAdmin", superAdmin[0].id, ddUserInfo?.userid);

    superAdmin.map(item => {
      if (item.value == ddUserInfo?.userid) {
        flag = true;
      }
    });
    resolve(flag);
  });
};

// 当前登陆人是否可以看任务
export const canViewTask = data => {
  // creator creatorAD contacters contactersad workerIds workerIdsAD
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  let userId = ddUserInfo?.userid;
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  return (
    isInArr(userId, contacters) ||
    isInArr(userId, contacterAds) ||
    isCreator(userId, creator) ||
    isInArr(userId, creatorAds) ||
    isInArr(userId, workers) ||
    isInArr(userId, workerAds)
  );
};

// 当前登陆人是否可以关闭任务
export const canCloseTask = data => {
  // creator workerAds
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isInArr(userId, workerAds) || isCreator(userId, creator);
};

// 当前登陆人是否可以审核任务
export const canExamineTask = data => {
  // workerAds
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isInArr(userId, workerAds);
};

// 当前登陆人是否可以修改任务状态
export const canUpdateTaskStatus = data => {
  // worker workerAds
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isInArr(userId, workerAds) || isInArr(userId, workers);
};

// 是否可以新增任务记录
export const canAddTaskRecord = data => {
  // worker
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isInArr(userId, workers);
};

// 是否可以修改任务记录
export const canUpdateTaskRecord = data => {
  // worker workerAds
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isInArr(userId, workerAds) || isInArr(userId, workers);
};

// 是否可以修改期望日期
export const updateExpectData = data => {
  // creator creatorAD
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isCreator(userId, creator) || isInArr(userId, creatorAds);
};

// 是否可以修改优先级
export const updatePrivorty = data => {
  //  workerAds
  let ddUserInfo = localStorage.getItem("ddUserInfo");
  if (ddUserInfo) {
    ddUserInfo = JSON.parse(ddUserInfo);
  } else {
    return false;
  }
  let userId = ddUserInfo?.userid;
  const { contacters, contacterAds, creator, creatorAds, workers, workerAds } =
    data;
  // return isInArr(userId, contacterAds)
  console.log("canExamineTask", userId, workerAds);
  // 测试是自己
  // return isInArr(userId, [{ userId }])
  return isInArr(userId, workerAds);
};
*/

// 是否可以修改产品维护列表
export const updateProductMaintainList = () => {
  return hasPermissionByConfig();
};

// 是否可以查看项目进度管理系统
export const canViewProjectProgress = () => {
  return hasPermissionByConfig();
};
