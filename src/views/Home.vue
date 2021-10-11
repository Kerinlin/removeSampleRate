<template>
  <div class="home" @drop.prevent="addFile" @dragover.prevent>
    <div class="input-wrapper">
      <label for="attach-project-file">
        <div class="filename" v-if="!path" id="attached-project-file">
          点击选择或者拖拽目录
        </div>
        <div class="filename" v-if="path" id="attached-project-file">
          {{ path }}
        </div>
      </label>
      <input
        @change="getFile"
        id="attach-project-file"
        type="file"
        webkitdirectory
        directory
      />
    </div>

    <button class="button loading-btn" v-if="loading">
      <span class="spinner"></span>
      <span class="spinner-text">删除中...</span>
    </button>
    <button class="button" v-else @click="deleteSample(path)">开始删除</button>
  </div>
</template>

<script>
const path = window.path;
const fs = window.fs;
const fsp = fs.promises;
const { Readable } = window.stream;
const musicMetadata = require("music-metadata-browser");
const { shell } = window.require("electron");
export default {
  name: "home",
  data() {
    return {
      path: "",
      loading: false,
      droppedFiles: [],
      result: []
    };
  },
  methods: {
    addFile(e) {
      // 将伪数组转换成数组
      this.droppedFiles = [...e.dataTransfer.files];
      this.path = this.droppedFiles[0].path;
    },

    async getFile(e) {
      // console.log(e);
      const filePath = path.dirname(e.target.files[0].path);
      this.path = filePath;
    },

    // 判断是否是文件夹
    async isDir(path) {
      try {
        const res = await fsp.stat(path);
        if (res.isDirectory()) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log(error);
      }
    },

    startDelete(dirpath) {
      // console.log(dirpath);
      fs.readdir(dirpath, (err, files) => {
        files.forEach(async file => {
          const filePath = path.resolve(dirpath, file);
          const isDir = await this.isDir(filePath);
          if (!isDir) {
            // console.log('不是文件夹,文件的父目录为', path.dirname(filePath));
            try {
              let buffer = await fs.readFileSync(filePath); //读取文件，并将缓存区进行转换
              let stream = this.bufferToStream(buffer); //将buffer数据转换成node 可读流
              const metadata = await musicMetadata.parseNodeStream(stream);

              // 采样率
              const sampleRate = metadata?.format?.sampleRate;

              if (sampleRate < 44100) {
                console.log("采样率", sampleRate);
                console.log("小于44100路径", filePath);
                fs.unlinkSync(filePath);
              }
              stream.destroy();
            } catch (error) {
              console.log(error);
            }
          } else {
            console.log("是文件夹，文件夹路径为", filePath);
            this.startDelete(filePath);
          }
        });
      });
    },

    bufferToStream(binary) {
      const readableInstanceStream = new Readable({
        read() {
          this.push(binary);
          this.push(null);
        }
      });

      return readableInstanceStream;
    },

    deleteSample(dirpath) {
      const dirPath = dirpath;
      this.loading = true;
      let timer = setTimeout(async () => {
        await this.startDelete(dirPath);
        this.loading = false;
        shell.showItemInFolder(dirpath);
        clearTimeout(timer);
      }, 1000);
    }
  }
};
</script>

<style lang="less" scoped>
.home {
  -webkit-app-region: no-drag;
  width: 100%;
  height: 100vh;
  label {
    -webkit-app-region: no-drag;
    cursor: pointer;
    display: block;
    text-align: center;
    color: #fff;
    background-color: transparent;
    border-radius: 4px;
    height: 100px;
    width: 60%;
    border: 2px dashed #e0dfd5;
    position: relative;
    margin: 0 auto;
    margin-top: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [type="file"] {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  .close {
    line-height: 1em;
    font-size: 16px;
    padding: 10px;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    font-style: normal;
  }
  .filename {
    width: 90%;
    font-size: 16px;
    line-height: 100px;
    margin: 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .button {
    -webkit-app-region: no-drag;
    position: relative;
    height: 50px;
    width: 200px;
    top: 50px;
    left: calc(50vw - 100px);
    background-image: none;
    border: 1px dashed #fff;
    outline: none;
    background-color: transparent;
    border-radius: 1px;
    color: white;
    text-transform: uppercase;
    font-size: 20px;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s ease-out;
    &:hover {
      border-color: rgb(91, 75, 95);
      color: rgb(91, 75, 95);
      border-radius: 16px 4px;
    }
  }

  .button::after {
    content: "";
    display: block;
    position: absolute;
    width: 160px;
    height: 40px;
    background-color: black;
    z-index: -1;
    left: calc(50% - 80px);
    top: 10px;
    opacity: 0.3;
    filter: blur(5px);
    transition: all 0.2s ease-out;
  }
  .button:hover::after {
    opacity: 0.5;
    filter: blur(20px);
    transform: translatey(10px) scalex(1.2);
  }
  .loading {
    border-radius: 50px;
    width: 50px;
    left: calc(50vw - 25px);
  }
  .button.loading::after {
    width: 40px;
    left: 5px;
    top: 12px;
    border-radius: 100%;
  }
  .spinner {
    display: inline-block;
    width: 30px;
    height: 30px;
    position: absolute;
    top: 10px;
    left: 20px;
    background: transparent;
    box-sizing: border-box;
    border-top: 4px solid white;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-radius: 100%;
    animation: spin 0.6s ease-out infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
