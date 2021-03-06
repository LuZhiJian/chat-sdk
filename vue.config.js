const path = require('path')
const packageJson = require('./package.json')

function resolve(dir) {
  return path.join(__dirname, dir)
}

let myAppName = 'xdsdk'

module.exports = {
  publicPath: './',
  lintOnSave: false,
  filenameHashing: true,
  runtimeCompiler: true,
  productionSourceMap: false,
  chainWebpack: config => {
    config.resolve.symlinks(true)
    config.resolve.alias
      .set('@', resolve('src'))
      .set('utils', resolve('src/utils'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))

    //svgicon
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: '[name]'
      })

    config.module
      .rule('js')
      .test(/\.(js|es6)$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end()
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "@/styles/common";`
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      outputDir: 'codeDist',
      customFileProtocol: "/",
      builderOptions: {
        "appId": `co.sdk.web${myAppName}`,
        "productName": '花生大少',
        "copyright": process.env.VUE_APP_COPYRIGHT, //版权信息
        "directories": {
          "output": "./appDist" //输出文件路径
        },
        "extraResources": [{
          "from": "./static",
          "to": "static"
        }], // 拷贝静态文件到指定位置
    //     , {
    // 　　　 "from": "./static/qq/PrScrn.dll",
    // 　　　 "to": "./extraResources/PrScrn.dll"
    // 　　 }
        "win": { //win相关配置
          "icon": "./src/assets/logo.ico",
          // "requestedExecutionLevel": "highestAvailable", //权限
          "target": [{
            "target": "nsis", //利用nsis制作安装程序
            "arch": [ //注意：这样打包出来的安装包体积比较大，所以建议直接打32的安装包。
              //"x64", //64位
              "ia32" //32位
            ]
          }],
          "publish": [
            {
              "provider": "generic",
              "url": "#",
            }
          ],
        },
        "compression": "maximum", // 压缩级别，如果要打包成安装包的话建议设为 maximum 可以使安装包体积更小，当然打包时间会长一点点
        "asar": true, // 设置为 true 可以把自己的代码合并并加密
        // "version": '1.0.2',
        "nsis": {
          'oneClick': false,
          'perMachine': false,
          'allowToChangeInstallationDirectory': true,// 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
          'installerIcon': './static/logo.ico',// 安装图标
          'uninstallerIcon': './static/unshift.ico',// 卸载图标
          'installerHeaderIcon': './static/logo.ico', // 安装时头部图标
          'createDesktopShortcut': true, // 创建桌面图标
          'createStartMenuShortcut': true, // 创建开始菜单图标
          'deleteAppDataOnUninstall': true,
          'artifactName': `${myAppName}_Setup_${packageJson.version}.exe`
          // 'include':'.nsh' //自定义安装界面
          // 'license': 'LICENSE.txt'// electron中LICENSE.txt所需要的格式，并非是GBK，或者UTF-8，LICENSE.txt写好之后，需要进行转化，转化为ANSI
        },
        'mac': {
          'target': 'dmg',
          'icon': './static/logo-x2.png'
        },
        'dmg': {
          'title': 'sdk',
          'icon': './static/logo-x2.png',
          'contents': [
            {
              'x': 110,
              'y': 150
            },
            {
              'x': 240,
              'y': 150,
              'type': 'link',
              'path': '/Applications'
            }
          ],
          'window': {
            'x': 400,
            'y': 400
          },
          'artifactName': `${myAppName}_Setup_${packageJson.version}.dmg`
        }
      }
    }
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: false
    },
    port: 3000, // 端口号
    host: 'localhost',
    proxy: {
      "/api": {
        target: "http://47.119.126.109:8080",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  }
}
