import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import urql from "@urql/vue";

import "./assets/main.css";

const app = createApp(App);

app.use(router);
app.use(urql, {
  url: "https://b23.xrzapi.eu.org/api/graphql",
});
export const gapi = "https://b23.xrzapi.eu.org/api/graphql";

app.mount("#app");
