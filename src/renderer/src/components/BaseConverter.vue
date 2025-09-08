<script setup>
import { ref } from 'vue'

// 四个进制的响应式数据
const bin = ref('')
const oct = ref('')
const dec = ref('')
const hex = ref('')

// 错误提示
const error = ref('')

// 标记当前正在输入的字段，避免循环更新
let activeInput = null

// 转换函数
const convertFromDecimal = (value) => {
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error('无效十进制数')
  }

  // 支持负数
  const isNegative = num < 0
  const absNum = Math.abs(num)

  const toBin = isNegative ? '-' + absNum.toString(2) : absNum.toString(2)
  const toOct = isNegative ? '-' + absNum.toString(8) : absNum.toString(8)
  const toHex = isNegative
    ? '-' + absNum.toString(16).toUpperCase()
    : absNum.toString(16).toUpperCase()

  bin.value = toBin
  oct.value = toOct
  hex.value = toHex
}

const convertFromBinary = (value) => {
  if (!/^-?[01]+$/.test(value)) {
    throw new Error('二进制只允许 0、1 和可选的负号')
  }
  const num = parseInt(value, 2)
  dec.value = num.toString()
  convertFromDecimal(num)
}

const convertFromOctal = (value) => {
  if (!/^-?[0-7]+$/.test(value)) {
    throw new Error('八进制只允许 0-7 和可选的负号')
  }
  const num = parseInt(value, 8)
  dec.value = num.toString()
  convertFromDecimal(num)
}

const convertFromHex = (value) => {
  if (!/^-?[0-9A-Fa-f]+$/.test(value)) {
    throw new Error('十六进制只允许 0-9、A-F、a-f 和可选的负号')
  }
  const num = parseInt(value, 16)
  dec.value = num.toString()
  convertFromDecimal(num)
}

// 输入监听器
const handleInput = (field, value) => {
  if (activeInput === field) return // 避免自己触发自己
  activeInput = field
  error.value = ''

  try {
    if (value === '') {
      bin.value = oct.value = dec.value = hex.value = ''
      return
    }

    switch (field) {
      case 'bin':
        convertFromBinary(value)
        break
      case 'oct':
        convertFromOctal(value)
        break
      case 'dec':
        convertFromDecimal(value)
        break
      case 'hex':
        convertFromHex(value)
        break
    }
  } catch (e) {
    error.value = e.message
  } finally {
    setTimeout(() => {
      activeInput = null
    }, 0)
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

// 初始化默认值
dec.value = '0'
convertFromDecimal(0)
</script>

<template>
  <div class="converter-container">
    <h1>🔢 进制转换器</h1>

    <div v-if="error" class="error-banner">❌ {{ error }}</div>

    <div class="input-grid">
      <!-- 二进制 -->
      <div class="input-group">
        <label>二进制 (Bin)</label>
        <div class="input-wrapper">
          <input
            v-model="bin"
            @input="handleInput('bin', $event.target.value)"
            placeholder="例如: 1010"
            class="base-input"
          />
          <button @click="copyToClipboard(bin, '二进制')" class="copy-btn">📋</button>
        </div>
      </div>

      <!-- 八进制 -->
      <div class="input-group">
        <label>八进制 (Oct)</label>
        <div class="input-wrapper">
          <input
            v-model="oct"
            @input="handleInput('oct', $event.target.value)"
            placeholder="例如: 12"
            class="base-input"
          />
          <button @click="copyToClipboard(oct, '八进制')" class="copy-btn">📋</button>
        </div>
      </div>

      <!-- 十进制 -->
      <div class="input-group">
        <label>十进制 (Dec)</label>
        <div class="input-wrapper">
          <input
            v-model="dec"
            @input="handleInput('dec', $event.target.value)"
            placeholder="例如: 10"
            class="base-input"
          />
          <button @click="copyToClipboard(dec, '十进制')" class="copy-btn">📋</button>
        </div>
      </div>

      <!-- 十六进制 -->
      <div class="input-group">
        <label>十六进制 (Hex)</label>
        <div class="input-wrapper">
          <input
            v-model="hex"
            @input="handleInput('hex', $event.target.value)"
            placeholder="例如: A"
            class="base-input"
            style="text-transform: uppercase"
          />
          <button @click="copyToClipboard(hex, '十六进制')" class="copy-btn">📋</button>
        </div>
      </div>
    </div>

    <div class="info-box">
      <p>📌 支持负数（仅十进制输入时）</p>
      <p>📌 自动转换，输入任一进制，其他同步更新</p>
      <p>📌 点击 📋 可复制对应值</p>
    </div>
  </div>
</template>

<style scoped>
.converter-container {
  padding: 30px;
  max-width: 600px;
  margin: 40px auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

.error-banner {
  background: #ffebee;
  color: #c62828;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-weight: 500;
  border: 1px solid #ef9a9a;
}

.input-grid {
  display: grid;
  gap: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: border-color 0.2s;
}

.base-input:focus {
  border-color: #2196f3;
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

/* 响应式 */
@media (max-width: 600px) {
  .converter-container {
    padding: 20px;
    margin: 20px;
  }

  .input-grid {
    gap: 16px;
  }

  .input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .copy-btn {
    width: 100%;
    padding: 10px;
  }
}
</style>
