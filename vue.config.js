module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.electron.removeSampleRate",
        productName: "采样率删除工具",
        win: {
          icon: "public/filter.ico"
        },
        mac: {
          target: "dmg",
          icon: "public/filter.ico"
        },
        dmg: {
          title: "采样率删除工具",
          icon: "public/filter.ico"
        },
        publish: ["github"],
        nsis: {
          oneClick: false, // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装
          allowToChangeInstallationDirectory: true // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
        }
      }
    }
  }
};
