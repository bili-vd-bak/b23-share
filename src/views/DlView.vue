<script setup lang="ts">
import { useQuery } from "@urql/vue";
import router from "../router";
import { ref } from "vue";

const $$route = router.currentRoute.value;
let result;
const dl = ref("awesome");

async function main() {
  result = await useQuery({
    query: `
  query($path: String!) {
    od(path: $path) {
      raw {
        dlinks {
          dlink,
          sharelink
        }
      }
    }
  }
`,
    variables: {
      path:
        "/bangumi-index/md/" + $$route.params.mdid + "/" + $$route.params.fn,
    },
  });

  dl.value = await result.data.value.od.raw.dlinks[0].dlink;

  console.log(dl.value);
}
main();
</script>

<template>
  <main>
    <p>番剧:md{{ $route.params.mdid }}<br />文件名:{{ $route.params.fn }}</p>
    <a :href="dl">下载</a>
  </main>
</template>
