import { storeToRefs } from "pinia";
import { getConfig } from "@/config";
import { emitter } from "@/utils/mitt";
import Avatar from "@/assets/user.jpg";
import { getTopMenu } from "@/router/utils";
import { useFullscreen } from "@vueuse/core";
import type { routeMetaType } from "../types";
import { useRouter, useRoute } from "vue-router";
import { router, remainingPaths } from "@/router";
import { computed, type CSSProperties } from "vue";
import { useAppStoreHook } from "@/store/modules/app";
import { useUserStoreHook } from "@/store/modules/user";
import { useGlobal, isAllEmpty } from "@pureadmin/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import ExitFullscreen from "@iconify-icons/ri/fullscreen-exit-fill";
import Fullscreen from "@iconify-icons/ri/fullscreen-fill";

const errorInfo =
  "The current routing configuration is incorrect, please check the configuration";

export function useNav() {
  const route = useRoute();
  const pureApp = useAppStoreHook();
  const routers = useRouter().options.routes;
  const { isFullscreen, toggle } = useFullscreen();
  const { wholeMenus } = storeToRefs(usePermissionStoreHook());
  /** 平台`layout`中所有`el-tooltip`的`effect`配置，默认`light` */
  const tooltipEffect = getConfig()?.TooltipEffect ?? "light";

  const getDivStyle = computed((): CSSProperties => {
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden"
    };
  });

  /** 头像（如果头像为空则使用 src/assets/user.jpg ） */
  const userAvatar = computed(() => {
    return isAllEmpty(useUserStoreHook()?.avatar)
      ? Avatar
      : useUserStoreHook()?.avatar;
  });

  /** 昵称（如果昵称为空则显示用户名，优先从 localStorage 的 dataSource 对象中获取） */
  const username = computed(() => {
    // 关键：先读取 store 中用户名作为响应式依赖（否则会被下面的 return 提前跳过而不收集依赖，
    // 导致登录切换后 store 变化无法触发本 computed 重算，出现显示旧用户需刷新才更新的情况）
    const storeName = isAllEmpty(useUserStoreHook()?.nickname)
      ? useUserStoreHook()?.username
      : useUserStoreHook()?.nickname;
    // 1. 优先从登录后存储的 user-check-info 中获取 username
    try {
      const userCheckStr = localStorage.getItem("user-check-info");
      if (userCheckStr) {
        const userCheck = JSON.parse(userCheckStr);
        if (userCheck?.username) {
          return userCheck.username;
        }
      }
    } catch (error) {
      console.error("解析 localStorage 中的 user-check-info 失败", error);
    }
    // 2. dataSource
    try {
      const dataSourceStr = localStorage.getItem("dataSource");
      if (dataSourceStr) {
        const dataSource = JSON.parse(dataSourceStr);
        if (dataSource?.username) {
          return dataSource.username;
        }
      }
    } catch (error) {
      console.error("解析 localStorage 中的 dataSource 失败", error);
    }
    // 3. store 兜底
    if (!isAllEmpty(storeName)) return storeName;
    // 4. 兜底：从钉钉用户信息中取真实姓名显示
    try {
      const ddUserInfoStr = localStorage.getItem("ddUserInfo");
      if (ddUserInfoStr) {
        const ddUserInfo = JSON.parse(ddUserInfoStr);
        if (ddUserInfo?.name) return ddUserInfo.name;
      }
    } catch (error) {
      console.error("解析 localStorage 中的 ddUserInfo 失败", error);
    }
    return "";
  });

  const avatarsStyle = computed(() => {
    return username.value ? { marginRight: "10px" } : "";
  });

  const isCollapse = computed(() => {
    return !pureApp.getSidebarStatus;
  });

  const device = computed(() => {
    return pureApp.getDevice;
  });

  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();
  const layout = computed(() => {
    return $storage?.layout?.layout;
  });

  const title = computed(() => {
    return $config.Title;
  });

  /** 动态title */
  function changeTitle(meta: routeMetaType) {
    const Title = getConfig().Title;
    if (Title) document.title = `${meta.title} | ${Title}`;
    else document.title = meta.title;
  }

  /** 退出登录 */
  function logout() {
    useUserStoreHook().logOut();
  }

  function backTopMenu() {
    router.push(getTopMenu()?.path);
  }

  function onPanel() {
    emitter.emit("openPanel");
  }

  function toggleSideBar() {
    pureApp.toggleSideBar();
  }

  function handleResize(menuRef) {
    menuRef?.handleResize();
  }

  function resolvePath(route) {
    if (!route.children) return console.error(errorInfo);
    const httpReg = /^http(s?):\/\//;
    const routeChildPath = route.children[0]?.path;
    if (httpReg.test(routeChildPath)) {
      return route.path + "/" + routeChildPath;
    } else {
      return routeChildPath;
    }
  }

  function menuSelect(indexPath: string) {
    if (wholeMenus.value.length === 0 || isRemaining(indexPath)) return;
    emitter.emit("changLayoutRoute", indexPath);
  }

  /** 判断路径是否参与菜单 */
  function isRemaining(path: string) {
    return remainingPaths.includes(path);
  }

  /** 获取`logo` */
  function getLogo() {
    return new URL("/logo.svg", import.meta.url).href;
  }

  return {
    route,
    title,
    device,
    layout,
    logout,
    routers,
    $storage,
    isFullscreen,
    Fullscreen,
    ExitFullscreen,
    toggle,
    backTopMenu,
    onPanel,
    getDivStyle,
    changeTitle,
    toggleSideBar,
    menuSelect,
    handleResize,
    resolvePath,
    getLogo,
    isCollapse,
    pureApp,
    username,
    userAvatar,
    avatarsStyle,
    tooltipEffect
  };
}
