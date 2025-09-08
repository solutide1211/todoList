const { contextBridge, ipcRenderer } = require('electron')
console.log('✅ preload.js 被加载了！')
try {
  contextBridge.exposeInMainWorld('todoApp', {
    //最小化
    minimizeApp: () => {
      console.log('minimizeApp')
      ipcRenderer.send('minimize-window')
    },
    // 最大化
    maximizeApp: () => {
      console.log('maximize-window')
      ipcRenderer.send('maximize-window')
    },
    // 退出
    closeWindow: () => {
      console.log('close-window')
      ipcRenderer.send('close-window')
    }
  })
} catch (err) {
  console.error(err)
}
