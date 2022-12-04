<template>
  <el-config-provider :size="size" :z-index="zIndex" :locale="locale">
    <RouterLink to="/"></RouterLink>
    <RouterView />
  </el-config-provider>
</template>

<script>
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";

import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { RouterView } from "vue-router";

export default defineComponent({
  components: {
    ElConfigProvider,
    RouterView,
  },
  setup() {
    return {
      zIndex: 3000,
      size: "small",
      locale: zhCn,
    };
  },
});
</script>
