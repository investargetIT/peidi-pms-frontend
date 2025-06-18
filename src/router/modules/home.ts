const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import cateIcon from "../../assets/png/cateIcon.png";
export default {
  path: "/",
  name: "Home",
  redirect: "/index",
  component: Layout,
  meta: {
    icon: "prime:box",
    title: "产品进度概览",
    rank: 0
  },
  children: [
    {
      path: "/index",
      name: "dashboard",
      component: () => import("@/views/dashboard/index.vue"),
      meta: {
        title: "产品进度概览",
        showParent: false
      }
    }
  ]
} satisfies RouteConfigsTable;
