const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import cateIcon from "../../assets/png/cateIcon.png";
export default {
  path: "/",
  name: "Home",
  redirect: "/classify/index",
  component: Layout,
  meta: {
    title: "产品维护列表",
    rank: 0,
    icon: "prime:book"
  },
  children: [
    {
      path: "/classify/index",
      name: "classify",
      component: () => import("@/views/classify/index.vue"),
      meta: {
        title: "产品维护列表"
      }
    }
  ]
} satisfies RouteConfigsTable;
