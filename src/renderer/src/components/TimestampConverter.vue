<script setup>
import { ref, watch } from 'vue'

// 数据模型
const timestamp = ref('')
const datetime = ref('')
const isMilliseconds = ref(true) // true=毫秒, false=秒
const timezone = ref('local') // 'local' 或 'utc'
const error = ref('')

// 标记当前活跃输入，避免循环触发
let activeField = null

// 获取当前时区偏移（分钟）
const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset()
}

// 时间戳 → 日期字符串
const convertTimestampToDate = (ts) => {
  let num = Number(ts)
  if (isNaN(num)) throw new Error('请输入有效数字')

  // 如果是秒，转为毫秒
  if (!isMilliseconds.value) num *= 1000

  const date = new Date(num)

  if (isNaN(date.getTime())) {
    throw new Error('无效时间戳')
  }

  if (timezone.value === 'utc') {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  } else {
    return date.toLocaleString()
  }
}

// 日期字符串 → 时间戳
const convertDateToTimestamp = (dtStr) => {
  const date = new Date(dtStr)

  if (isNaN(date.getTime())) {
    throw new Error('无法解析日期格式')
  }

  let ts = date.getTime() // 毫秒
  if (!isMilliseconds.value) ts = Math.floor(ts / 1000)

  return ts.toString()
}

// 输入监听
const handleTimestampInput = (value) => {
  if (activeField === 'timestamp') return
  activeField = 'timestamp'
  error.value = ''

  try {
    if (value === '') {
      datetime.value = ''
      return
    }
    datetime.value = convertTimestampToDate(value)
  } catch (e) {
    error.value = e.message
  } finally {
    setTimeout(() => {
      activeField = null
    }, 0)
  }
}

const handleDatetimeInput = (value) => {
  if (activeField === 'datetime') return
  activeField = 'datetime'
  error.value = ''

  try {
    if (value === '') {
      timestamp.value = ''
      return
    }
    timestamp.value = convertDateToTimestamp(value)
  } catch (e) {
    error.value = e.message
  } finally {
    setTimeout(() => {
      activeField = null
    }, 0)
  }
}

// 切换单位时自动重算
watch(isMilliseconds, () => {
  if (activeField) return
  if (timestamp.value) {
    handleTimestampInput(timestamp.value)
  }
})

// 切换时区时自动重算
watch(timezone, () => {
  if (activeField) return
  if (timestamp.value) {
    handleTimestampInput(timestamp.value)
  }
})

// 复制功能
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`✅ ${label} 已复制到剪贴板`)
  } catch (e) {
    alert(`❌ 复制失败，请手动选择复制 ${label}`)
  }
}

// 快捷设置当前时间
const setNow = () => {
  const now = Date.now()
  timestamp.value = isMilliseconds.value ? now.toString() : Math.floor(now / 1000).toString()
  handleTimestampInput(timestamp.value)
}

// 清空
const clearAll = () => {
  timestamp.value = ''
  datetime.value = ''
  error.value = ''
}
</script>

<template>
  <div class="timestamp-converter">
    <h1>🕒 时间戳转换器</h1>

    <div v-if="error" class="error-box">❌ {{ error }}</div>

    <div class="controls">
      <div class="unit-toggle">
        <label>
          <input type="radio" v-model="isMilliseconds" :value="true" />
          毫秒 (13位)
        </label>
        <label>
          <input type="radio" v-model="isMilliseconds" :value="false" />
          秒 (10位)
        </label>
      </div>

      <div class="timezone-toggle">
        <label>
          <input type="radio" v-model="timezone" value="local" />
          本地时间
        </label>
        <label>
          <input type="radio" v-model="timezone" value="utc" />
          UTC 时间
        </label>
      </div>
    </div>

    <div class="converter-grid">
      <!-- 时间戳输入 -->
      <div class="input-section">
        <label>时间戳</label>
        <div class="input-wrapper">
          <input
            v-model="timestamp"
            @input="handleTimestampInput($event.target.value)"
            placeholder="例如：1700000000000"
            class="input-field"
            type="text"
            inputmode="numeric"
          />
          <div class="btn-group">
            <button @click="copyToClipboard(timestamp, '时间戳')" class="copy-btn">📋</button>
          </div>
        </div>
        <div class="hint">
          ⚡ 快捷操作：
          <button @click="setNow" class="link-btn">设为当前时间</button>
        </div>
      </div>

      <!-- 日期时间输入 -->
      <div class="input-section">
        <label>日期时间</label>
        <div class="input-wrapper">
          <input
            v-model="datetime"
            @input="handleDatetimeInput($event.target.value)"
            :placeholder="
              timezone === 'utc' ? '例如：2023-11-15 08:13:20 UTC' : '例如：2023/11/15 下午3:13:20'
            "
            class="input-field"
            type="text"
          />
          <div class="btn-group">
            <button @click="copyToClipboard(datetime, '日期时间')" class="copy-btn">📋</button>
          </div>
        </div>
        <div class="hint">📅 支持格式：ISO、本地字符串、时间戳自动识别</div>
      </div>
    </div>

    <div class="action-bar">
      <button @click="clearAll" class="clear-btn">🗑️ 清空</button>
    </div>

    <div class="info-box">
      <p>📌 支持自动双向转换：修改任一输入框，另一框自动更新</p>
      <p>📌 自动识别毫秒/秒（也可手动切换）</p>
      <p>📌 支持本地时间和 UTC 时间显示</p>
    </div>
  </div>
</template>

<style scoped>
.timestamp-converter {
  max-width: 700px;
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

.error-box {
  background: #ffebee;
  color: #c62828;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-weight: 500;
  border: 1px solid #ef9a9a;
}

.controls {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.unit-toggle,
.timezone-toggle {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.unit-toggle label,
.timezone-toggle label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.converter-grid {
  display: grid;
  gap: 25px;
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

.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #2196f3;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.copy-btn {
  padding: 10px 14px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #e0e0e0;
}

.hint {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
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

.action-bar {
  margin: 25px 0;
  text-align: center;
}

.clear-btn {
  padding: 10px 24px;
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
  margin-top: 30px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.info-box p {
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timestamp-converter {
    margin: 20px;
    padding: 20px;
  }

  .controls {
    flex-direction: column;
    gap: 15px;
  }

  .converter-grid {
    gap: 20px;
  }

  .input-wrapper {
    flex-direction: column;
  }

  .btn-group {
    width: 100%;
    justify-content: center;
  }
}
</style>
