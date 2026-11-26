# 风之岚 OS · UI 预览

[打开交互原型](https://zemu2718.github.io/fengzhilan-os-preview/)

从总览可以进入组织树、地图、AI 员工工作台和手机审批页。店名为虚构名称，经营数字均为演示数据。

## 本地查看

打开本目录的 index.html 即可浏览。字体对比页使用的 HarmonyOS Sans 可通过以下命令下载。

~~~sh
bash tools/fetch-fonts.sh
~~~

## 更新预览

在本仓库运行以下命令，从指定的 Git 版本导出页面和素材。导出时会统一替换店名。省略提交号时使用源项目当前的 HEAD。

~~~sh
node tools/sync-preview.mjs <原型目录> [提交号]
~~~

确认导出内容后推送到 main 分支，GitHub Pages 会更新同一个预览地址。
