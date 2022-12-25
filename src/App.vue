<template>
  <el-config-provider :size="size" :z-index="zIndex" :locale="locale">
    <RouterView />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";

import zhCn from "./element-plus-locale-zh-cn.mjs";
import { RouterView } from "vue-router";

export default defineComponent({
  components: {
    ElConfigProvider,
    RouterView,
  },
  setup() {
    return {
      zIndex: 3000,
      size: "default",
      locale: zhCn,
    };
  },
});
</script>
