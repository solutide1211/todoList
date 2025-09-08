<script setup>
import { ref, computed, watch } from 'vue'

// 输入的原始 URL
const rawUrl = ref('https://example.com/search?q=vue&category=frontend&page=1')

// URL 各部分
const protocol = ref('')
const hostname = ref('')
const pathname = ref('')
const hash = ref('')

// 参数列表（响应式数组）
const params = ref([])

// 错误信息
const error = ref('')

// 是否显示编码值
const showEncoded = ref(false)

// 解析 URL
const parseUrl = (url) => {
  try {
    error.value = ''
    const urlObj = new URL(url)

    protocol.value = urlObj.protocol
    hostname.value = urlObj.hostname
    pathname.value = urlObj.pathname
    hash.value = urlObj.hash

    // 解析参数
    const newParams = []
    for (const [key, value] of urlObj.searchParams.entries()) {
      newParams.push({
        key: key,
        value: value,
        encodedValue: encodeURIComponent(value),
        decodedValue: decodeURIComponent(value)
      })
    }
    params.value = newParams
  } catch (e) {
    error.value = '❌ URL 格式错误：' + e.message
    protocol.value = ''
    hostname.value = ''
    pathname.value = ''
    hash.value = ''
    params.value = []
  }
}

// 生成完整 URL
const generatedUrl = computed(() => {
  if (!protocol.value || !hostname.value) return ''

  try {
    const url = new URL(protocol.value + '//' + hostname.value + pathname.value)

    // 添加参数
    params.value.forEach((param) => {
      if (param.key.trim() !== '') {
        url.searchParams.append(
          param.key.trim(),
          showEncoded.value ? param.encodedValue : param.decodedValue
        )
      }
    })

    // 添加 hash
    if (hash.value) {
      url.hash = hash.value
    }

    return url.toString()
  } catch (e) {
    return ''
  }
})

// 生成参数字符串
const paramString = computed(() => {
  if (params.value.length === 0) return ''
  return params.value
    .filter((param) => param.key.trim() !== '')
    .map((param) => {
      const key = encodeURIComponent(param.key.trim())
      const val = showEncoded.value ? param.encodedValue : param.decodedValue
      return `${key}=${encodeURIComponent(val)}`
    })
    .join('&')
})

// 生成 JSON 格式
const jsonOutput = computed(() => {
  const obj = {}
  params.value.forEach((param) => {
    if (param.key.trim() !== '') {
      const key = param.key.trim()
      obj[key] = showEncoded.value ? param.encodedValue : param.decodedValue
    }
  })
  return JSON.stringify(obj, null, 2)
})

// 添加参数
const addParam = () => {
  params.value.push({
    key: '',
    value: '',
    encodedValue: '',
    decodedValue: ''
  })
}

// 删除参数
const removeParam = (index) => {
  params.value.splice(index, 1)
}

// 清理参数（移除空键、去重）
const cleanParams = () => {
  // 移除空键
  let filtered = params.value.filter((param) => param.key.trim() !== '')

  // 去重（保留第一个）
  const seen = new Set()
  filtered = filtered.filter((param) => {
    const key = param.key.trim()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })

  params.value = filtered
}

// 编码所有参数值
const encodeAll = () => {
  params.value = params.value.map((param) => ({
    ...param,
    value: param.decodedValue,
    encodedValue: encodeURIComponent(param.decodedValue),
    decodedValue: param.decodedValue
  }))
}

// 解码所有参数值
const decodeAll = () => {
  params.value = params.value.map((param) => ({
    ...param,
    value: param.decodedValue,
    encodedValue: encodeURIComponent(param.decodedValue),
    decodedValue: param.decodedValue
  }))
}

// 更新参数值
const updateParamValues = (param) => {
  param.encodedValue = encodeURIComponent(param.value)
  param.decodedValue = decodeURIComponent(param.value)
}

// 处理值输入变化
const handleValueInput = (event, param) => {
  if (showEncoded.value) {
    param.encodedValue = event.target.value
    try {
      param.decodedValue = decodeURIComponent(param.encodedValue)
    } catch (e) {
      param.decodedValue = param.encodedValue // 解码失败时保持原样
    }
    param.value = param.decodedValue
  } else {
    param.decodedValue = event.target.value
    param.encodedValue = encodeURIComponent(param.decodedValue)
    param.value = param.decodedValue
  }
}

// 复制功能
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`✅ ${label} 已复制到剪贴板`)
  } catch (e) {
    alert(`❌ 复制失败，请手动选择复制 ${label}`)
  }
}

// 清空所有
const clearAll = () => {
  rawUrl.value = ''
  protocol.value = ''
  hostname.value = ''
  pathname.value = ''
  hash.value = ''
  params.value = []
  error.value = ''
}

// 监听原始 URL 变化
watch(
  rawUrl,
  (newUrl) => {
    if (newUrl) {
      parseUrl(newUrl)
    }
  },
  { immediate: true }
)

// 监听参数变化，自动更新原始 URL 显示
watch(
  [params, protocol, hostname, pathname, hash],
  () => {
    if (generatedUrl.value && !error.value) {
      rawUrl.value = generatedUrl.value
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="url-param-editor">
    <h1>🔗 URL 参数编辑器</h1>

    <div v-if="error" class="error-box">
      {{ error }}
    </div>

    <!-- URL 输入区 -->
    <div class="input-section">
      <label>完整 URL</label>
      <textarea
        v-model="rawUrl"
        placeholder="例如: https://example.com/search?q=vue&category=frontend"
        class="url-input"
        rows="3"
      ></textarea>
      <div class="url-info" v-if="protocol && hostname">
        <div><strong>协议:</strong> {{ protocol }}</div>
        <div><strong>域名:</strong> {{ hostname }}</div>
        <div><strong>路径:</strong> {{ pathname || '/' }}</div>
        <div v-if="hash"><strong>锚点:</strong> {{ hash }}</div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="addParam" class="action-btn add-btn">➕ 添加参数</button>
      <button @click="cleanParams" class="action-btn clean-btn">🧹 清理参数</button>
      <button @click="encodeAll" class="action-btn">🔐 编码值</button>
      <button @click="decodeAll" class="action-btn">🔓 解码值</button>
      <label class="toggle-switch">
        <input type="checkbox" v-model="showEncoded" />
        <span>显示编码值</span>
      </label>
    </div>

    <!-- 参数编辑表格 -->
    <div class="params-section">
      <h3>参数编辑器</h3>
      <div v-if="params.length === 0" class="empty-state">
        暂无参数，点击"添加参数"或粘贴包含参数的 URL
      </div>

      <div v-else class="params-grid">
        <div class="param-header">
          <div class="header-cell">参数名 (Key)</div>
          <div class="header-cell">参数值 (Value)</div>
          <div class="header-cell">操作</div>
        </div>

        <div v-for="(param, index) in params" :key="index" class="param-row">
          <div class="param-cell">
            <input
              v-model="param.key"
              placeholder="参数名"
              class="key-input"
              @input="updateParamValues(param)"
            />
          </div>
          <div class="param-cell">
            <!-- 修复：使用 :value + @input 替代 v-model -->
            <textarea
              :value="showEncoded ? param.encodedValue : param.decodedValue"
              @input="handleValueInput($event, param)"
              placeholder="参数值"
              class="value-input"
              rows="2"
            ></textarea>
            <div v-if="param.value !== param.decodedValue" class="encoded-hint">🔤 已编码字符</div>
          </div>
          <div class="param-cell action-cell">
            <button @click="removeParam(index)" class="remove-btn">🗑️ 删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 输出结果 -->
    <div class="output-section">
      <h3>输出结果</h3>

      <!-- 完整 URL -->
      <div class="output-group">
        <label>完整 URL</label>
        <div class="output-container">
          <textarea :value="generatedUrl" readonly class="output-textarea" rows="3"></textarea>
          <button @click="copyToClipboard(generatedUrl, '完整URL')" class="copy-btn">📋</button>
        </div>
      </div>

      <!-- 参数字符串 -->
      <div class="output-group">
        <label>参数字符串</label>
        <div class="output-container">
          <input :value="paramString" readonly class="output-input" />
          <button @click="copyToClipboard(paramString, '参数字符串')" class="copy-btn">📋</button>
        </div>
      </div>

      <!-- JSON 格式 -->
      <div class="output-group">
        <label>JSON 格式</label>
        <div class="output-container">
          <textarea
            :value="jsonOutput"
            readonly
            class="output-textarea json-output"
            rows="5"
          ></textarea>
          <button @click="copyToClipboard(jsonOutput, 'JSON格式')" class="copy-btn">📋</button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button @click="copyToClipboard(generatedUrl, '完整URL')" class="copy-btn large">
        📋 复制完整 URL
      </button>
      <button @click="clearAll" class="clear-btn">🗑️ 清空所有</button>
    </div>

    <div class="info-box">
      <p>📌 自动解析 URL 并提取参数</p>
      <p>📌 支持添加、删除、编辑参数</p>
      <p>📌 一键清理空参数和重复参数</p>
      <p>📌 支持参数值编码/解码</p>
      <p>📌 可复制完整 URL、参数字符串或 JSON 格式</p>
    </div>
  </div>
</template>

<style scoped>
.url-param-editor {
  max-width: 1200px;
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
  margin-bottom: 30px;
  font-weight: 600;
  font-size: 28px;
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

.input-section {
  margin-bottom: 30px;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  font-size: 16px;
}

.url-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  line-height: 1.5;
}

.url-input:focus {
  border-color: #2196f3;
}

.url-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.url-info div {
  margin: 4px 0;
}

.url-info strong {
  color: #333;
  margin-right: 8px;
}

.controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 30px;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 12px;
  align-items: center;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.add-btn {
  background: #4caf50;
  color: white;
}

.add-btn:hover {
  background: #43a047;
}

.clean-btn {
  background: #ff9800;
  color: white;
}

.clean-btn:hover {
  background: #f57c00;
}

.action-btn:not(.add-btn):not(.clean-btn) {
  background: #e0e0e0;
  color: #333;
}

.action-btn:not(.add-btn):not(.clean-btn):hover {
  background: #d0d0d0;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.toggle-switch input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.params-section {
  margin-bottom: 40px;
}

.params-section h3 {
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 22px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #888;
  font-size: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.params-grid {
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
}

.param-header {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  background: #e3f2fd;
  padding: 15px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #bbdefb;
}

.header-cell {
  padding: 0 10px;
}

.param-row {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: white;
  transition: background 0.2s;
}

.param-row:hover {
  background: #f5f5f5;
}

.param-cell {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  outline: none;
}

.value-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  min-height: 40px;
}

.encoded-hint {
  font-size: 12px;
  color: #d32f2f;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn {
  width: 80px;
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #d32f2f;
}

.output-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.output-section h3 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
}

.output-group {
  margin-bottom: 25px;
}

.output-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  font-size: 16px;
}

.output-container {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.output-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: white;
  color: 333;
}

.output-textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: white;
  color: 333;
  resize: vertical;
  min-height: 60px;
}

.json-output {
  background: #f5f5f5;
}

.copy-btn {
  width: 40px;
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  background: #e0e0e0;
}

.action-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 30px 0;
}

.copy-btn.large {
  padding: 12px 24px;
  width: auto;
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.copy-btn.large:hover {
  background: #1976d2;
}

.clear-btn {
  padding: 12px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #d32f2f;
}

.info-box {
  padding: 20px;
  background: #e8f5e8;
  border-radius: 8px;
  font-size: 14px;
  color: #2e7d32;
  line-height: 1.6;
}

.info-box p {
  margin: 6px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .url-param-editor {
    margin: 20px;
    padding: 20px;
  }

  .param-header,
  .param-row {
    grid-template-columns: 1fr;
  }

  .action-cell {
    justify-content: flex-start;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .output-container {
    flex-direction: column;
  }

  .copy-btn {
    width: 100%;
    padding: 10px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .copy-btn.large,
  .clear-btn {
    width: 100%;
  }
}
</style>
