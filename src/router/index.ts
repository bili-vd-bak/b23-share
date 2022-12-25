import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/raw/md/:mdid/fn/:fn",
      name: "raw",
      component: () => import("../views/DlView.vue"),
      meta: {
        isKeepAlive: true,
      },
    },
    {
      path: "/md/:mdid/ep/:ep",
      name: "dplayer",
      component: () => import("../views/DplayerView.vue"),
      meta: {
        isKeepAlive: true,
      },
    },
    {
      path: "/md/:mdid",
      name: "info",
      component: () => import("../views/InfoView.vue"),
      meta: {
        isKeepAlive: true,
      },
    },
  ],
});

export default router;
