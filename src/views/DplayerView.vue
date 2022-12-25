<script setup lang="ts">
import { useQuery } from "@urql/vue";
import router from "../router";
import { ref } from "vue";
import Artplayer from "artplayer";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { gapi } from "../main";

const $$route = router.currentRoute.value;
let result;
const dl = ref("awesome");
const dan = ref("awesome");
const sub = ref("awesome");
const ep = ($$route.params.ep as string).split("-----")[0];

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
        "/index/md/" + $$route.params.mdid + "/" + $$route.params.ep + ".mp4",
    },
  });

  dl.value = await result.data.value.od.raw.dlinks[0].dlink;

  const res_dan = await fetch(gapi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query($path: String!) {
    od(path: $path) {
      raw {
        dlinks {
          dlink
        }
      }
    }
  }
`,
      variables: {
        path:
          "/index/md/" + $$route.params.mdid + "/" + $$route.params.ep + ".xml",
      },
    }),
  }).then((res) => res.json());

  dan.value = await res_dan?.data?.od?.raw?.dlinks[0]?.dlink;

  const res_sub =
    (
      await fetch(gapi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query($path: String!) {
    od(path: $path) {
      raw {
        dlinks {
          dlink
        }
      }
    }
  }
`,
          variables: {
            path:
              "/index/md/" +
              $$route.params.mdid +
              "/" +
              ep +
              "----------.zh-Hans.srt",
          },
        }),
      }).then((res) => res.json())
    )?.data?.od?.raw?.dlinks[0]?.dlink ||
    (
      await fetch(gapi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query($path: String!) {
    od(path: $path) {
      raw {
        dlinks {
          dlink
        }
      }
    }
  }
`,
          variables: {
            path:
              "/index/md/" +
              $$route.params.mdid +
              "/" +
              ep +
              "----------.zh-Hant.srt",
          },
        }),
      }).then((res) => res.json())
    )?.data?.od?.raw?.dlinks[0]?.dlink;

  sub.value = res_sub;

  let artCon: {
    container: string;
    url: string;
    autoSize?: boolean;
    playbackRate?: boolean;
    aspectRatio?: boolean;
    setting?: boolean;
    hotkey?: boolean;
    mutex?: boolean;
    fullscreen?: boolean;
    fullscreenWeb?: boolean;
    whitelist?: string[];
    plugins?: any[];
    subtitle?: object;
    fastForward?: boolean;
  } = {
    container: ".artRef", // 容器
    url: dl.value, // 视频链接
    autoSize: true,
    playbackRate: true,
    aspectRatio: true,
    setting: true,
    hotkey: true,
    mutex: true,
    fullscreen: true,
    fullscreenWeb: true,
    fastForward: true,
    whitelist: ["*"],
    plugins: [
      artplayerPluginDanmuku({
        // 弹幕 XML 文件，和 Bilibili 网站的弹幕格式一致
        danmuku: dan.value,
      }),
    ],
  };
  if (res_sub)
    artCon.subtitle = {
      url: res_sub,
      type: "srt",
      encoding: "utf-8",
      style: {
        color: "#03A9F4",
      },
    };

  const art = new Artplayer(artCon);
  console.log(art);
}
main();
</script>

<template>
  <main>
    <h1>信息</h1>
    <p>番剧:md{{ $route.params.mdid }}<br />集数:{{ $route.params.ep }}</p>
    <p>
      若使用其它播放器，请提前下载好弹幕和字幕。<a
        href="//dan2any.xrzyun.top/"
        target="_blank"
        >弹幕格式转换</a
      >
    </p>
    <p>
      <a v-if="dl !== 'awesome' && dl" :href="dl">下载视频</a>&nbsp;&nbsp;
      <a v-if="dl !== 'awesome' && dl" :href="'potplayer://' + dl"
        >用potplayer打开</a
      >&nbsp;&nbsp;
      <a v-if="dl !== 'awesome' && dl" :href="'vlc://' + dl">用vlc打开</a
      >&nbsp;&nbsp;
      <a v-if="dl !== 'awesome' && dl" :href="'nplayer-' + dl">用nplayer打开</a
      >&nbsp;&nbsp;
      <a
        v-if="dl !== 'awesome' && dl"
        :href="'intent:' + dl + '#Intent;package=com.mxtech.videoplayer.ad;end'"
        >用MX Player Free打开</a
      >&nbsp;&nbsp;
      <a
        v-if="dl !== 'awesome' && dl"
        :href="
          'intent:' + dl + '#Intent;package=com.mxtech.videoplayer.pro;end'
        "
        >用MX Player Pro打开</a
      >&nbsp;&nbsp;
      <a v-if="dan !== 'awesome' && dan" :href="dan">下载弹幕</a>&nbsp;&nbsp;
      <a v-if="sub !== 'awesome' && sub" :href="sub">下载字幕</a>&nbsp;&nbsp;
    </p>
    <h1>视频播放</h1>
    <p>
      若只有声音，说明你的浏览器不支持H.265播放。在上面用其它的专业播放器播放。
    </p>
    <br />
    <div class="artRef"></div>
  </main>
</template>

<style>
.artRef {
  width: 400px;
  height: 300px;
}
</style>
