import { createRouter, createWebHistory } from "vue-router";
import LobbyView from "@/views/LobbyView.vue";
import GameView from "@/views/GameView.vue";

const routes = [
  {
    path: "/",
    name: "lobby",
    component: LobbyView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/game",
    name: "game",
    component: GameView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
