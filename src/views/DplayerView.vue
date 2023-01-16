<script setup lang="ts">
import { useQuery } from "@urql/vue";
import router from "../router";
import { ref } from "vue";
import Artplayer from "artplayer";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { gapi } from "../main";

const $$route = router.currentRoute.value;
let result,
  qn: { default?: Boolean; html: string; url: string }[] = [],
  dm: { html: string; url: string; click: Function }[] = [];
const dl = ref("awesome");
const dan = ref("awesome");
const sub = ref("awesome");
const info = ($$route.params.ep as string).split("-----");
const ep = info[0];

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
        "/bangumi-index/md/" +
        $$route.params.mdid +
        "/" +
        $$route.params.ep +
        ".mp4",
    },
  });

  dl.value = await result.data.value.od.raw.dlinks[0].dlink;
  let i1 = 0;
  for (const r of await result.data.value.od.raw.dlinks) {
    qn.push({ html: `源${i1}`, url: r.dlink });
    i1++;
  }

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
          "/bangumi-index/md/" +
          $$route.params.mdid +
          "/" +
          $$route.params.ep +
          ".xml",
      },
    }),
  }).then((res) => res.json());

  dan.value = await res_dan?.data?.od?.raw?.dlinks[0]?.dlink;
  let i2 = 0;
  for (const r of await res_dan.data.od.raw.dlinks) {
    dm.push({
      html: `源${i2}`,
      url: r.dlink,
      click: function () {
        art.plugins.artplayerPluginDanmuku.config({
          danmuku: r.dlink,
        });
        art.plugins.artplayerPluginDanmuku.load();
      },
    });
    i2++;
  }

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
              "/bangumi-index/md/" +
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
              "/bangumi-index/md/" +
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
    quality?: any[];
    subtitle?: object;
    fastForward?: boolean;
    type?: string;
    controls?: any[];
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
    plugins: [],
    quality: qn,
    controls: [
      {
        position: "right",
        html: "切换弹幕",
        selector: dm,
        onSelect: function (item: any) {
          art.plugins.artplayerPluginDanmuku.config({
            danmuku: item.url,
          });
          art.plugins.artplayerPluginDanmuku.load();
        },
      },
    ],
  };
  if (dan.value) {
    artCon.plugins?.push(
      artplayerPluginDanmuku({
        // 弹幕 XML 文件，和 Bilibili 网站的弹幕格式一致
        danmuku: dan.value,
      })
    );
  }
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
      若只有声音，说明你的浏览器不支持H.265播放。在上面用其它的专业播放器播放。<br />
      从清晰度处切换视频后，推荐将弹幕切换至同源。
    </p>
    <br />
    <div class="artRef"></div>
  </main>
</template>

<style>
.artRef {
  width: 100%;
  height: 500px;
}
</style>
