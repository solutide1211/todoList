<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import jsonLang from 'highlight.js/lib/languages/json'
import yamlLang from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github.css' // 你也可以换其他主题，如 vs2015, atom-one-dark 等

import * as yaml from 'js-yaml'

hljs.registerLanguage('json', jsonLang)
hljs.registerLanguage('yaml', yamlLang)

const rawJson = ref(`{
  "name": "示例",
  "version": 1.0,
  "items": [
    {"id": 1, "title": "项目1"},
    {"id": 2, "title": "项目2"}
  ]
}`)
const result = ref('')
const activeTab = ref('format') // 'format' | 'compress' | 'validate' | 'escape' | 'unescape' | 'toYaml' | 'toCsv'
const errorMessage = ref('')
const outputLanguage = ref('json') // 控制高亮语言：json, yaml, text

// 检查 JSON 是否有效
const isValidJson = computed(() => {
  try {
    JSON.parse(rawJson.value)
    return true
  } catch (e) {
    return false
  }
})

// 获取 JSON 解析错误信息
const jsonParseError = computed(() => {
  try {
    JSON.parse(rawJson.value)
    return null
  } catch (e) {
    return e.message
  }
})

// 格式化 JSON
const formattedJson = computed(() => {
  try {
    const parsed = JSON.parse(rawJson.value)
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return rawJson.value
  }
})

// 压缩 JSON
const compressedJson = computed(() => {
  try {
    const parsed = JSON.parse(rawJson.value)
    return JSON.stringify(parsed)
  } catch (e) {
    return rawJson.value
  }
})

// 转义 JSON 字符串（用于在字符串中安全嵌入）
const escapedJson = computed(() => {
  try {
    // 先尝试解析，确保是合法 JSON
    const parsed = JSON.parse(rawJson.value)
    const str = JSON.stringify(parsed)
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
  } catch (e) {
    return rawJson.value
  }
})

// 反转义 JSON 字符串
const unescapedJson = computed(() => {
  try {
    let str = rawJson.value
    str = str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')

    // 尝试解析反转义后的字符串
    const parsed = JSON.parse(str)
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return rawJson.value
  }
})

// JSON 转 YAML
const yamlResult = computed(() => {
  try {
    const parsed = JSON.parse(rawJson.value)
    return yaml.dump(parsed, { indent: 2, quotingType: '"' })
  } catch (e) {
    return ''
  }
})

// 简单 JSON 转 CSV（仅支持数组对象）
const csvResult = computed(() => {
  try {
    const parsed = JSON.parse(rawJson.value)

    if (!Array.isArray(parsed)) {
      throw new Error('仅支持数组类型转 CSV')
    }
    if (parsed.length === 0) return ''

    const headers = Object.keys(parsed[0])
    const csvRows = [
      headers.join(','),
      ...parsed.map((row) =>
        headers
          .map((header) => {
            let value = row[header] ?? ''
            if (typeof value === 'string') {
              value = value.replace(/"/g, '""') // 转义双引号
              return `"${value}"`
            }
            return value
          })
          .join(',')
      )
    ]

    return csvRows.join('\n')
  } catch (e) {
    return ''
  }
})

// 计算当前操作的错误信息
const computedErrorMessage = computed(() => {
  if (activeTab.value === 'validate') {
    return errorMessage.value // 保持校验按钮的错误信息
  }

  switch (activeTab.value) {
    case 'format':
    case 'compress':
    case 'escape':
      return jsonParseError.value ? `JSON 格式错误：${jsonParseError.value}` : ''
    case 'unescape':
      try {
        let str = rawJson.value
        str = str
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
        JSON.parse(str)
        return ''
      } catch (e) {
        return `反转义后 JSON 格式错误：${e.message}`
      }
    case 'toYaml':
      return jsonParseError.value ? `JSON 转 YAML 失败：${jsonParseError.value}` : ''
    case 'toCsv':
      if (jsonParseError.value) {
        return `JSON 转 CSV 失败：${jsonParseError.value}`
      }
      try {
        const parsed = JSON.parse(rawJson.value)
        if (!Array.isArray(parsed)) {
          return 'JSON 转 CSV 失败：仅支持数组类型转 CSV'
        }
        return ''
      } catch (e) {
        return `JSON 转 CSV 失败：${e.message}`
      }
    default:
      return ''
  }
})

// 校验 JSON
const validateJson = () => {
  try {
    JSON.parse(rawJson.value)
    errorMessage.value = '✅ JSON 格式正确'
    result.value = '校验通过'
    outputLanguage.value = 'text'
  } catch (e) {
    errorMessage.value = '❌ JSON 格式错误：' + e.message
    result.value = '校验失败'
    outputLanguage.value = 'text'
  }
}

// 根据当前标签页动态获取结果 & 设置语言
const currentResult = computed(() => {
  let res = ''
  outputLanguage.value = 'json'

  switch (activeTab.value) {
    case 'format':
      res = formattedJson.value
      break
    case 'compress':
      res = compressedJson.value
      break
    case 'escape':
      res = escapedJson.value
      outputLanguage.value = 'text'
      break
    case 'unescape':
      res = unescapedJson.value
      break
    case 'toYaml':
      res = yamlResult.value
      outputLanguage.value = 'yaml'
      break
    case 'toCsv':
      res = csvResult.value
      outputLanguage.value = 'text'
      break
    default:
      res = result.value
  }

  return res
})

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentResult.value)
    alert('✅ 已复制到剪贴板')
  } catch (e) {
    alert('❌ 复制失败，请手动选择复制')
  }
}

// 高亮处理函数
const highlightCode = () => {
  const blocks = document.querySelectorAll('pre code')
  blocks.forEach((block) => {
    if (block.parentElement.classList.contains('hljs')) return
    let lang = outputLanguage.value || 'json'
    if (lang === 'text') {
      block.classList.remove('hljs')
      return
    }
    hljs.highlightElement(block)
  })
}

// 组件挂载后初始化高亮
onMounted(() => {
  setTimeout(highlightCode, 100)
})

// 监听结果变化，重新高亮
watch(currentResult, () => {
  setTimeout(highlightCode, 50)
})
</script>

<template>
  <div class="json-tool-container">
    <!-- 左侧输入区 -->
    <div class="panel left-panel">
      <h3>输入 JSON</h3>
      <textarea v-model="rawJson" placeholder="请输入 JSON 字符串..." class="json-input"></textarea>
    </div>

    <!-- 右侧操作与结果区 -->
    <div class="panel right-panel">
      <div class="tabs">
        <button :class="{ active: activeTab === 'format' }" @click="activeTab = 'format'">
          格式化
        </button>
        <button :class="{ active: activeTab === 'compress' }" @click="activeTab = 'compress'">
          压缩
        </button>
        <button :class="{ active: activeTab === 'escape' }" @click="activeTab = 'escape'">
          转义
        </button>
        <button :class="{ active: activeTab === 'unescape' }" @click="activeTab = 'unescape'">
          反转义
        </button>
        <button :class="{ active: activeTab === 'toYaml' }" @click="activeTab = 'toYaml'">
          转 YAML
        </button>
        <button :class="{ active: activeTab === 'toCsv' }" @click="activeTab = 'toCsv'">
          转 CSV
        </button>
        <button class="validate-btn" @click="validateJson">校验</button>
        <button class="copy-btn" @click="copyToClipboard">📋 复制</button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="result-container">
        <h3>结果</h3>
        <pre class="json-output"><code :class="outputLanguage">{{ currentResult }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-tool-container {
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f9f9f9;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
}

.panel {
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.left-panel {
  max-width: 50%;
}

.json-input,
.json-output {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  resize: none;
  overflow: auto;
  white-space: pre;
  margin-top: 10px;
}

.json-input {
  background: white;
}

.json-output {
  background: #f5f5f5;
  border-color: #ccc;
  padding: 0;
  margin: 0;
  overflow: auto;
}

.json-output code {
  display: block;
  padding: 12px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #e9e9e9;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.tabs button:hover {
  background: #d9d9d9;
}

.tabs button.active {
  background: #007bff;
  color: white;
}

.validate-btn {
  background: #ffc107 !important;
  color: #212529;
}

.copy-btn {
  background: #28a745 !important;
  color: white;
  margin-left: auto;
}

.error-message {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
}

.result-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-weight: 600;
}

/* 响应式支持小屏 */
@media (max-width: 768px) {
  .json-tool-container {
    flex-direction: column;
  }

  .left-panel {
    max-width: none;
  }

  .tabs {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .copy-btn {
    margin-left: 0;
  }
}
</style>
