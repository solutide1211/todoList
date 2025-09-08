<script setup>
import { ref, computed } from 'vue'

const inputText = ref('')
const outputText = ref('')
const isEncoding = ref(true)
const fileName = ref('')
const fileType = ref('')
const previewUrl = ref('')
const error = ref('')
const originalBase64 = ref('') // 存储原始文件的纯 Base64（不含 data: 前缀）

let activeField = null

const isBase64 = (str) => {
  if (typeof str !== 'string') return false
  const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
  return base64Regex.test(str.replace(/\s/g, ''))
}

const encodeToBase64 = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)))
  } catch (e) {
    throw new Error('编码失败：包含不支持的字符')
  }
}

const decodeFromBase64 = (base64) => {
  try {
    return decodeURIComponent(escape(atob(base64.replace(/\s/g, ''))))
  } catch (e) {
    throw new Error('解码失败：不是有效的 Base64 字符串')
  }
}

const handleInputText = (value) => {
  if (activeField === 'input') return
  activeField = 'input'
  error.value = ''
  outputText.value = ''
  previewUrl.value = ''
  fileName.value = ''
  fileType.value = ''
  originalBase64.value = ''

  try {
    if (!value) return

    if (isBase64(value)) {
      isEncoding.value = false
      outputText.value = decodeFromBase64(value)
    } else {
      isEncoding.value = true
      outputText.value = encodeToBase64(value)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    setTimeout(() => {
      activeField = null
    }, 0)
  }
}

const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`✅ ${label} 已复制到剪贴板`)
  } catch (e) {
    alert(`❌ 复制失败，请手动选择复制 ${label}`)
  }
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  previewUrl.value = ''
  fileName.value = ''
  fileType.value = ''
  originalBase64.value = ''
  error.value = ''
  isEncoding.value = true
}

const loadTextExample = () => {
  inputText.value = 'Hello, 你好，世界！🌍'
  handleInputText(inputText.value)
}

const loadBase64Example = () => {
  inputText.value = 'SGVsbG8sIOS4lueVjCDnlL/msJHjgIIh8J+Mjw=='
  handleInputText(inputText.value)
}

// 🛠 修正：文件处理 —— 存储纯 Base64 + Data URL
const processFile = (file) => {
  fileName.value = file.name
  fileType.value = file.type

  const reader = new FileReader()

  // 读取为 ArrayBuffer，以便获取原始二进制
  reader.readAsArrayBuffer(file)

  reader.onload = (e) => {
    const buffer = e.target.result
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    // 得到纯 Base64 字符串
    const pureBase64 = btoa(binary)
    originalBase64.value = pureBase64

    // 生成 Data URL 用于预览或作为输入
    const dataUrl = `data:${fileType.value};base64,${pureBase64}`
    inputText.value = isEncoding.value ? pureBase64 : dataUrl

    if (isEncoding.value) {
      outputText.value = pureBase64
    } else {
      outputText.value = decodeFromBase64(pureBase64) // 如果是文本文件，可读；否则是乱码（正常）
    }

    // 如果是图片，预览
    if (fileType.value.startsWith('image/')) {
      previewUrl.value = dataUrl
    }
  }

  reader.onerror = () => {
    error.value = '文件读取失败'
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) processFile(file)
}

const handleDrop = (event) => {
  event.preventDefault()
  event.target.classList.remove('dragover')
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.target.classList.add('dragover')
}

const handleDragLeave = (event) => {
  event.target.classList.remove('dragover')
}

// 🛠 修正：下载逻辑 —— 根据场景还原文件
const downloadDecodedFile = () => {
  if (!fileName.value) {
    alert('请先上传文件')
    return
  }

  let blob
  let downloadName = fileName.value

  if (isEncoding.value) {
    // 编码模式：输出是 Base64 → 需要还原为原始文件
    if (!originalBase64.value) {
      alert('没有原始文件数据')
      return
    }
    try {
      const byteString = atob(originalBase64.value)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      blob = new Blob([ab], { type: fileType.value })
    } catch (e) {
      alert('文件还原失败：' + e.message)
      return
    }
  } else {
    // 解码模式：
    // 情况1：输入是纯 Base64 → 输出是文本 → 保存为 .txt
    if (isBase64(inputText.value)) {
      blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' })
      downloadName = fileName.value.replace(/\.[^/.]+$/, '') + '_decoded.txt'
    }
    // 情况2：输入是 Data URL → 输出可能是文本或二进制 → 尝试从原始 Base64 还原
    else if (inputText.value.startsWith('data:')) {
      if (!originalBase64.value) {
        // 如果没有原始数据，尝试从输入中提取
        try {
          const base64Part = inputText.value.split(',')[1]
          const byteString = atob(base64Part)
          const mime = inputText.value.split(',')[0].split(':')[1].split(';')[0]
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          blob = new Blob([ab], { type: mime })
        } catch (e) {
          alert('无法还原文件：' + e.message)
          return
        }
      } else {
        // 使用存储的原始 Base64
        const byteString = atob(originalBase64.value)
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        blob = new Blob([ab], { type: fileType.value })
      }
    }
  }

  if (blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
</script>

<template>
  <div class="base64-tool">
    <h1>🔠 Base64 编解码器</h1>

    <div class="mode-indicator">
      当前模式：
      <span :class="{ active: isEncoding }">编码 →</span>
      <span :class="{ active: !isEncoding }">← 解码</span>
    </div>

    <div v-if="error" class="error-box">❌ {{ error }}</div>

    <!-- 文件拖拽上传区 -->
    <div
      class="drop-area"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      📎 将文件拖拽至此，或
      <label class="file-label">
        <input type="file" @change="handleFileChange" class="file-input" />
        点击选择文件
      </label>
    </div>

    <!-- 输入区 -->
    <div class="input-section">
      <label>输入内容</label>
      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          @input="handleInputText($event.target.value)"
          placeholder="输入文本或 Base64 字符串，或上传文件..."
          class="input-field"
        ></textarea>
        <div class="btn-group">
          <button @click="copyToClipboard(inputText, '输入内容')" class="copy-btn">📋</button>
        </div>
      </div>
      <div class="example-links">
        <button @click="loadTextExample" class="link-btn">📝 文本示例</button>
        <button @click="loadBase64Example" class="link-btn">🔠 Base64示例</button>
      </div>
    </div>

    <!-- 输出区 -->
    <div v-if="outputText" class="output-section">
      <label>输出结果</label>
      <div class="input-wrapper">
        <textarea v-model="outputText" readonly class="output-field"></textarea>
        <div class="btn-group">
          <button @click="copyToClipboard(outputText, '输出结果')" class="copy-btn">📋</button>
          <button @click="downloadDecodedFile" class="download-btn" v-if="fileName">
            📥 下载文件
          </button>
        </div>
      </div>

      <!-- 图片预览 -->
      <div v-if="previewUrl" class="preview-area">
        <h4>📎 文件预览</h4>
        <img :src="previewUrl" alt="预览" class="preview-image" />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button @click="clearAll" class="clear-btn">🗑️ 清空</button>
    </div>

    <div class="info-box">
      <p>📌 自动识别输入：文本 → 编码，Base64 → 解码</p>
      <p>📌 支持上传任意文件 → 转为 Base64</p>
      <p>📌 解码后支持下载还原原始文件（不只是文本）</p>
      <p>📌 图片自动预览，所有操作本地完成</p>
    </div>
  </div>
</template>

<style scoped>
/* 样式部分保持不变，直接复用之前的即可 */
.base64-tool {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

.mode-indicator {
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  color: #555;
}

.mode-indicator .active {
  color: #2196f3;
  font-weight: bold;
}

.error-box {
  background: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-weight: 500;
  border: 1px solid #ef9a9a;
}

.drop-area {
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  margin-bottom: 30px;
  background: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
}

.drop-area.dragover {
  border-color: #2196f3;
  background: #e3f2fd;
}

.file-label {
  color: #2196f3;
  text-decoration: underline;
  cursor: pointer;
}

.file-input {
  display: none;
}

.input-section,
.output-section {
  margin-bottom: 30px;
}

.input-section label,
.output-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.input-field,
.output-field {
  flex: 1;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #2196f3;
}

.output-field {
  background: #f5f5f5;
  cursor: text;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.copy-btn,
.download-btn,
.clear-btn {
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.copy-btn:hover,
.download-btn:hover,
.clear-btn:hover {
  background: #e0e0e0;
}

.download-btn {
  background: #4caf50;
  color: white;
  border-color: #43a047;
}

.download-btn:hover {
  background: #43a047;
}

.example-links {
  margin-top: 8px;
  font-size: 13px;
}

.link-btn {
  background: none;
  border: none;
  color: #2196f3;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 13px;
  margin-right: 12px;
}

.action-bar {
  text-align: center;
  margin: 25px 0;
}

.clear-btn {
  padding: 10px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
}

.clear-btn:hover {
  background: #d32f2f;
}

.preview-area {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.preview-area h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-box {
  padding: 16px;
  background: #e8f5e8;
  border-radius: 8px;
  font-size: 14px;
  color: #2e7d32;
  line-height: 1.6;
}

.info-box p {
  margin: 4px 0;
}

@media (max-width: 768px) {
  .base64-tool {
    margin: 20px;
    padding: 20px;
  }

  .input-wrapper {
    flex-direction: column;
  }

  .btn-group {
    flex-direction: row;
    justify-content: center;
  }

  .example-links {
    display: flex;
    flex-wrap: wrap;
  }

  .link-btn {
    margin-bottom: 8px;
  }
}
</style>
