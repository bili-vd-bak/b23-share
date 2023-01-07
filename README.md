# b23-share

本仓库属于[bili-vd-bak](https://tp.xrzyun.top/bili-vd-bak)  

## 提供您保存的番剧

1. 在OneDrive根目录中新建`bangumi-index`文件夹。  
2. 在`bangumi-index`文件夹中新建`md`文件夹。  
3. 在`md`文件夹中新建`{mdid}`文件夹，`{mdid}`为数字，即BiliBili番剧的数字代号。每一个`{mdid}`文件夹即一部番剧。  
4. 下载番剧剧集文件格式规范`{(数字)集数}-----{(字符串)清晰度}-----{(字符串)视频编码}.(mp4/ass/xml)`对应视频/弹幕，`{(数字)集数}----------.srt`对应字幕(可选)。  
详细格式参照[此分享链接](https://xrzcloud-my.sharepoint.com/:f:/g/personal/xrz_xrzyun_ml/EtnvTU56yoFDg4UlWvCl4owBXMCGKcPwRoaJaUi2zOTT2A?e=yRTdQ7)中文件格式。  
使用BBDown下载请按照此配置文件片段：  

```txt
--multi-file-pattern
<pageNumber>-----<dfn>-----<videoCodecs>

-p ALL
```

5. 在`{mdid}`中保存番剧信息，以BiliBiliAPI获取的格式为参考。可以下载`https://api.bilibili.com/pgc/view/web/season?season_id={ssid}`保存为`info.json`，下载`http://api.bilibili.com/pgc/review/user?media_id={mdid}`为`simple-info.json`并在里面找到`ssid`。  
或者你也可以手动编写`info.json`的信息：  

```json
{
  "code": 0,
  "result": {
    "title": "标题",
    "evaluate": "简介",
    "episodes": [
      {
        "share_copy": "第1集 目前以分享用的标题为完整标题获取"
      },
      {
        "share_copy": "第2集 这里仅展示最简单的信息配置"
      }
    ]
  }
}
```

6. 退回到`bangumi-index`目录，配置番剧标题显示：创建`md_name_dic.json`，满足格式`{"(字符串形式数字){mdid}": "番剧名"}`，例：  

```json
{
  "2270": "魔卡少女樱 香港之旅",
  "12345": "这是一个自定义的名字"
}
```

7. 分享`bangumi-index`文件夹为**公开**、**无密码**，将链接PR至本仓库`linklist.json`或发个Issue。  
