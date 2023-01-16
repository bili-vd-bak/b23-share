<script setup lang="ts">
import { useQuery } from "@urql/vue";
import router from "../router";
import { ref, reactive, computed } from "vue";
import { gapi } from "../main";
import { Base64 } from "js-base64";

const data: { md: number; name: string; ffn: string; res: string }[] = reactive(
  []
);

function alertd(mes: string) {
  alert(mes);
}

const search = ref("");
const filterTableData = computed(() =>
  data
    .filter(
      (data) =>
        !search.value ||
        data.ffn.toString().toLowerCase().includes(search.value.toLowerCase())
    )
    .sort((a, b) => a.md - b.md)
);

let md_name_dic: { [key: string]: { [key: string]: string } } = reactive({});
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
          dlink,
          sharelink
        }
      }
    }
  }
`,
        variables: {
          path: "/bangumi-index/md_name_dic.json",
        },
      }),
    }).then((res) => res.json())
  )?.data?.od?.raw?.dlinks;
  for (const r_info of res_info) {
    const info = await fetch(r_info?.dlink).then((res) => res.json());
    md_name_dic[r_info?.sharelink] = info;
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
        path: "/bangumi-index/md/",
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
    data.push({
      md: Number(j.name), //完整文件名
      name: md_name_dic[sharelink][j.name] || "",
      ffn: j.name + (md_name_dic[sharelink][j.name] || ""),
      res: sharelink, //此集来源链接
    });
  }
  if (i.folder.nextPageToken) await getPages(drive, i.folder.nextPageToken);
}

async function main() {
  const result = await useQuery({
    query: `
  {
    od(path: "/bangumi-index/md/") {
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
  });

  await getInfo();

  const items = await result.data.value.od.folder.items;
  for (const i of items) {
    const sharelink = i.sharelink,
      value = i.folder.value;
    for (const j of value) {
      data.push({
        md: Number(j.name), //完整文件名
        name: md_name_dic[sharelink][j.name] || "",
        ffn: j.name + (md_name_dic[sharelink][j.name] || ""),
        res: sharelink, //此集来源链接
      });
    }
    if (i.folder.nextPageToken)
      await getPages(sharelink, i.folder.nextPageToken);
  }
}
main();
</script>

<template>
  <main>
    <h2>首页</h2>
    <p>本页面属于<a href="//tp.xrzyun.top/bili-vd-bak">bili-vd-bak</a></p>
    <p>搜索: {mdid}-{title}</p>
    <p>点进去可以查看详情！<br />出现同ID番剧，则为不同源。</p>
    <el-table :data="filterTableData" stripe height="500" style="width: 100%">
      <el-table-column prop="md" label="md" width="200" />
      <el-table-column prop="name" label="标题" width="300" />
      <el-table-column fixed="right" label="操作" width="150">
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
                  filterTableData[scope.$index].md +
                  '/' +
                  Base64.encodeURI(filterTableData[scope.$index].res)
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
