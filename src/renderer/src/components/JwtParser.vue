<script setup>
import { ref, computed, onMounted } from 'vue'

const jwtInput = ref('')
const error = ref('')
const now = ref(Math.floor(Date.now() / 1000)) // 当前时间戳（秒）

// 从 URL 自动读取 token 参数
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const tokenFromUrl = urlParams.get('token')
  if (tokenFromUrl) {
    jwtInput.value = tokenFromUrl
  }
})

// 分割 JWT
const parts = computed(() => {
  if (!jwtInput.value) return { header: '', payload: '', signature: '' }
  const segments = jwtInput.value.split('.')
  if (segments.length !== 3) {
    error.value = '❌ JWT 格式错误：应包含三部分（Header.Payload.Signature）'
    return { header: '', payload: '', signature: '' }
  }
  error.value = ''
  return {
    header: segments[0],
    payload: segments[1],
    signature: segments[2]
  }
})

// Base64Url 解码函数
const base64UrlDecode = (str) => {
  try {
    // 替换 JWT 使用的 Base64Url 字符
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    // 补齐 padding
    while (base64.length % 4) {
      base64 += '='
    }
    const decoded = atob(base64)
    return decoded
  } catch (e) {
    throw new Error('解码失败：' + e.message)
  }
}

// 解析 Header
const parsedHeader = computed(() => {
  if (!parts.value.header) return null
  try {
    const jsonStr = base64UrlDecode(parts.value.header)
    return JSON.parse(jsonStr)
  } catch (e) {
    error.value = '❌ Header 解析失败：' + e.message
    return null
  }
})

// 解析 Payload
const parsedPayload = computed(() => {
  if (!parts.value.payload) return null
  try {
    const jsonStr = base64UrlDecode(parts.value.payload)
    return JSON.parse(jsonStr)
  } catch (e) {
    error.value = '❌ Payload 解析失败：' + e.message
    return null
  }
})

// 检查是否过期
const isExpired = computed(() => {
  if (!parsedPayload.value || !parsedPayload.value.exp) return false
  return now.value > parsedPayload.value.exp
})

const expiresIn = computed(() => {
  if (!parsedPayload.value || !parsedPayload.value.exp) return null
  const diff = parsedPayload.value.exp - now.value
  if (diff <= 0) return '已过期'
  if (diff < 60) return `${diff} 秒后过期`
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟后过期`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时后过期`
  return `${Math.floor(diff / 86400)} 天后过期`
})

// 格式化 JSON 字符串（带缩进）
const formatJson = (obj) => {
  if (!obj) return ''
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
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

// 清空输入
const clearInput = () => {
  jwtInput.value = ''
  error.value = ''
}

// 示例 JWT（用于演示）
const loadSample = () => {
  jwtInput.value =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDAwMDAwMDB9.Dw0HjJjJjJjJjJjJjJjJjJjJjJjJjJjJjJjJjJjJjJj'
}
</script>

<template>
  <div class="jwt-parser">
    <h1>🔐 JWT 解析器</h1>

    <div class="input-section">
      <label>粘贴你的 JWT</label>
      <div class="input-wrapper">
        <textarea
          v-model="jwtInput"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.yyyyy"
          class="jwt-input"
        ></textarea>
        <div class="btn-group">
          <button @click="copyToClipboard(jwtInput, '完整 JWT')" class="copy-btn">📋</button>
          <button @click="clearInput" class="clear-btn">🗑️</button>
        </div>
      </div>
      <div class="sample-link">
        <button @click="loadSample" class="link-btn">📎 加载示例 JWT</button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-box">
      {{ error }}
    </div>

    <!-- 解析结果 -->
    <div v-else-if="parts.header && parts.payload" class="result-container">
      <!-- Header 部分 -->
      <div class="section">
        <div class="section-header">
          <h3>HeaderCode (算法 & 类型)</h3>
          <button @click="copyToClipboard(parts.header, 'Header')" class="copy-btn small">
            📋
          </button>
        </div>
        <pre class="json-block">{{ formatJson(parsedHeader) }}</pre>
      </div>

      <!-- Payload 部分 -->
      <div class="section">
        <div class="section-header">
          <h3>Payload (声明信息)</h3>
          <button @click="copyToClipboard(parts.payload, 'Payload')" class="copy-btn small">
            📋
          </button>
        </div>
        <pre class="json-block" :class="{ expired: isExpired }">{{
          formatJson(parsedPayload)
        }}</pre>

        <!-- 过期提示 -->
        <div v-if="parsedPayload.exp" class="exp-info" :class="{ expired: isExpired }">
          🕒 过期时间：{{ new Date(parsedPayload.exp * 1000).toLocaleString() }}
          <span v-if="expiresIn">（{{ expiresIn }}）</span>
        </div>
      </div>

      <!-- Signature 部分 -->
      <div class="section">
        <div class="section-header">
          <h3>Signature (签名)</h3>
          <button @click="copyToClipboard(parts.signature, 'Signature')" class="copy-btn small">
            📋
          </button>
        </div>
        <div class="signature-block">
          {{ parts.signature }}
        </div>
        <div class="verify-hint">🔍 前端无法真实验证签名，需使用服务端密钥验签</div>
      </div>
    </div>

    <div v-else-if="jwtInput" class="empty-state">
      请输入有效的 JWT（格式：Header.Payload.Signature）
    </div>

    <div class="info-box">
      <p>📌 自动从 URL 参数 ?token=xxx 读取 JWT</p>
      <p>📌 高亮 exp, iat, nbf 等标准声明</p>
      <p>📌 过期时间自动计算并提醒</p>
      <p>📌 所有数据仅在浏览器本地处理，不会上传</p>
    </div>
  </div>
</template>

<style scoped>
.jwt-parser {
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
  margin-bottom: 30px;
  font-weight: 600;
}

.input-section {
  margin-bottom: 30px;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.jwt-input {
  flex: 1;
  min-height: 80px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.jwt-input:focus {
  border-color: #2196f3;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.copy-btn,
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
.clear-btn:hover {
  background: #e0e0e0;
}

.copy-btn.small {
  padding: 6px 10px;
  font-size: 14px;
}

.sample-link {
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

.result-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.section {
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.json-block {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  white-space: pre;
  overflow: auto;
  margin: 0;
}

.json-block.expired {
  background: #ffebee;
  border-left: 4px solid #f44336;
}

.exp-info {
  margin-top: 12px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 14px;
  color: #1565c0;
}

.exp-info.expired {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.signature-block {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  word-break: break-all;
  margin: 0;
}

.verify-hint {
  margin-top: 10px;
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 40px 20px;
  font-size: 16px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .jwt-parser {
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

  .section {
    padding: 15px;
  }

  .json-block,
  .signature-block {
    font-size: 13px;
    padding: 12px;
  }
}
</style>
