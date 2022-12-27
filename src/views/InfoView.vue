<script setup lang="ts">
import { useQuery } from "@urql/vue";
import router from "../router";
import { ref, reactive, computed } from "vue";
import * as FTC from "../utils/FileTypeCheck";
import { gapi } from "../main";

const $$route = router.currentRoute.value;
const data: {
  ffn: string;
  ep: number;
  qn: string;
  fn: string;
  res: string;
  sn: string;
}[] = reactive([]);

function alertd(mes: string) {
  alert(mes);
}

const search = ref("");
const filterTableData = computed(() =>
  data
    .filter(
      (data) =>
        !search.value ||
        data.ffn.toLowerCase().includes(search.value.toLowerCase())
    )
    .sort((a, b) => a.ep - b.ep)
);

const title = ref("加载中"),
  evaluate = ref("加载中");
let eps: { share_copy: string }[] = reactive([]);
async function getInfo() {
  const res_info = (
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
          path: "/index/md/" + $$route.params.mdid + "/info.json",
        },
      }),
    }).then((res) => res.json())
  )?.data?.od?.raw?.dlinks[0]?.dlink;
  const info = await fetch(res_info).then((res) => res.json());
  if (info.code === 0 && info.result) {
    title.value = info?.result?.title;
    evaluate.value = info?.result?.evaluate;
    eps = info?.result?.episodes;
    /* for (let i = 0; i < info?.result?.episodes.length; i++) {
      data[i].sn = info?.result?.episodes[i].share_copy;
    } */
  }
}

async function getPages(drive: string, nextPageToken: string) {
  const result = await fetch(gapi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query ($path: String!, $drive: String!, $nextPageToken: String!) {
    od(path: $path) {
      folder(drive: $drive, nextPageToken: $nextPageToken) {
        items {
          sharelink,
          folder {
            nextPageToken,
            value {
              name
            }
          }
        }
      }
    }
  }
`,
      variables: {
        path: "/index/md/" + $$route.params.mdid + "/",
        drive: drive,
        nextPageToken: nextPageToken,
      },
    }),
  }).then((res) => res.json());

  const items = result.data.od.folder.items;
  const i = items[0];
  const sharelink = i.sharelink,
    value = i.folder.value;
  for (const j of value) {
    const fn = FTC.FNeEXT(j.name),
      ext = FTC.EXT(j.name);
    if (ext === ("mp4" || "mkv" || "m4a")) {
      const info = fn.split("-----");
      data.push({
        ffn: fn, //完整文件名
        ep: Number(info[0]), //集数
        qn: info[1], //清晰度
        fn: info[2], //编码方式
        res: sharelink, //此集来源链接
        sn: eps[Number(info[0]) - 1].share_copy, //B站上本集标题
      });
    }
  }
  if (i.folder.nextPageToken) await getPages(drive, i.folder.nextPageToken);
}

async function main() {
  const result = await useQuery({
    query: `
  query($path: String!) {
    od(path: $path) {
      folder {
        items {
          sharelink,
          folder {
            nextPageToken,
            value {
              name
            }
          }
        }
      }
    }
  }
`,
    variables: {
      path: "/index/md/" + $$route.params.mdid + "/",
    },
  });

  await getInfo();

  const items = await result.data.value.od.folder.items;
  for (const i of items) {
    const sharelink = i.sharelink,
      value = i.folder.value;
    for (const j of value) {
      const fn = FTC.FNeEXT(j.name),
        ext = FTC.EXT(j.name);
      if (ext === ("mp4" || "mkv" || "m4a")) {
        const info = fn.split("-----");
        data.push({
          ffn: fn, //完整文件名
          ep: Number(info[0]), //集数
          qn: info[1], //清晰度
          fn: info[2], //编码方式
          res: sharelink, //此集来源链接
          sn: eps[Number(info[0]) - 1].share_copy, //B站上本集标题
        });
      }
    }
    if (i.folder.nextPageToken)
      await getPages(sharelink, i.folder.nextPageToken);
  }
}
main();
</script>

<template>
  <main>
    <h1>{{ title }}</h1>
    <p>简介：{{ evaluate }}</p>
    <h2>番剧: md{{ $route.params.mdid }}</h2>
    <p>完整搜索: {集数}-----{清晰度}-----{编码方式}</p>
    <el-table :data="filterTableData" stripe height="500" style="width: 100%">
      <el-table-column prop="ep" label="集数" width="60" />
      <el-table-column prop="sn" label="标题" width="300" />
      <el-table-column prop="qn" label="清晰度" width="130" />
      <el-table-column prop="fn" label="编码方式" />
      <el-table-column fixed="right" label="操作" width="130">
        <template #header>
          <el-input v-model="search" size="small" placeholder="搜索" />
        </template>
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click.prevent="alertd(filterTableData[scope.$index].res)"
          >
            来源
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click.prevent="
              router.push(
                '/md/' +
                  $route.params.mdid +
                  '/ep/' +
                  filterTableData[scope.$index].ffn
              )
            "
          >
            打开
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>
