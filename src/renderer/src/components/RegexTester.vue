<script setup>
import { ref, computed, watch } from 'vue'

// 数据模型
const regexInput = ref('')
const testString = ref('Hello World! 123-456-7890 example@email.com')
const flags = ref({
  g: true, // 全局匹配
  i: false, // 忽略大小写
  m: false, // 多行模式
  s: false // 点号匹配换行符（ES2018）
})
const replaceTemplate = ref('$&')

// 匹配结果
const matches = ref([])
const error = ref('')
const highlightedText = ref('')

// 常用正则模板
const regexTemplates = [
  { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: '手机号', pattern: '1[3-9]\\d{9}' },
  { name: 'URL', pattern: 'https?://[\\w.-]+(?:\\/[^\\s]*)?' },
  { name: '身份证号', pattern: '\\d{17}[\\dXx]' },
  {
    name: 'IP地址',
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b'
  },
  { name: '数字', pattern: '\\d+' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+' },
  { name: 'HTML标签', pattern: '<[^>]+>' }
]

// 构建正则标志字符串 —— 🔧 修复点1：防御性检查
const flagString = computed(() => {
  if (!flags.value) return '' // 👈 关键修复

  let flagsStr = ''
  if (flags.value.g) flagsStr += 'g'
  if (flags.value.i) flagsStr += 'i'
  if (flags.value.m) flagsStr += 'm'
  if (flags.value.s) flagsStr += 's'
  return flagsStr
})

// 解析正则并执行匹配 —— 🔧 修复点2：防御性初始化
const parseRegex = () => {
  // 👈 关键修复：确保 flags.value 存在
  if (!flags.value) {
    flags.value = { g: true, i: false, m: false, s: false }
  }

  if (!regexInput.value) {
    matches.value = []
    highlightedText.value = testString.value
    error.value = ''
    return
  }

  try {
    error.value = ''

    // 创建正则对象
    const regex = new RegExp(regexInput.value, flagString.value)

    // 执行匹配
    const results = []
    let match
    let lastIndex = 0

    // 重置 lastIndex（因为 flags 可能变化）
    regex.lastIndex = 0

    if (flags.value.g) {
      // 全局匹配
      while ((match = regex.exec(testString.value)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          input: match.input
        })
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }
    } else {
      // 单次匹配
      match = regex.exec(testString.value)
      if (match) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          input: match.input
        })
      }
    }

    matches.value = results

    // 生成高亮文本
    generateHighlightedText(results)
  } catch (e) {
    error.value = '正则表达式错误: ' + e.message
    matches.value = []
    highlightedText.value = testString.value
  }
}

// 生成高亮文本
const generateHighlightedText = (results) => {
  if (results.length === 0) {
    highlightedText.value = testString.value
    return
  }

  let html = ''
  let lastIndex = 0

  // 按索引排序
  const sortedResults = [...results].sort((a, b) => a.index - b.index)

  for (const result of sortedResults) {
    // 添加未匹配的文本
    if (result.index > lastIndex) {
      html += escapeHtml(testString.value.substring(lastIndex, result.index))
    }

    // 添加高亮的匹配文本
    html += `<span class="highlight">${escapeHtml(result.match)}</span>`

    lastIndex = result.index + result.match.length
  }

  // 添加剩余文本
  if (lastIndex < testString.value.length) {
    html += escapeHtml(testString.value.substring(lastIndex))
  }

  highlightedText.value = html
}

// HTML 转义
const escapeHtml = (str) => {
  return str.replace(
    /[&<>"']/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '<',
        '>': '>',
        '"': '&quot;',
        "'": '&#39;'
      })[tag] || tag
  )
}

// 替换结果
const replaceResult = computed(() => {
  if (!regexInput.value || !testString.value) return testString.value

  try {
    // 👈 防御性检查
    if (!flags.value) {
      return testString.value
    }

    const regex = new RegExp(regexInput.value, flagString.value)
    return testString.value.replace(regex, replaceTemplate.value)
  } catch (e) {
    return testString.value
  }
})

// 正则表达式解释（简化版）
const regexExplanation = computed(() => {
  if (!regexInput.value) return ''

  const explanations = []
  const pattern = regexInput.value

  if (pattern.includes('\\d')) explanations.push('匹配数字 (0-9)')
  if (pattern.includes('\\w')) explanations.push('匹配字母、数字、下划线')
  if (pattern.includes('\\s')) explanations.push('匹配空白字符')
  if (pattern.includes('^')) explanations.push('匹配行首')
  if (pattern.includes('$')) explanations.push('匹配行尾')
  if (pattern.includes('*')) explanations.push('匹配前面元素0次或多次')
  if (pattern.includes('+')) explanations.push('匹配前面元素1次或多次')
  if (pattern.includes('?')) explanations.push('匹配前面元素0次或1次')
  if (pattern.includes('.')) explanations.push('匹配除换行符外的任意字符')
  if (pattern.includes('|')) explanations.push('或操作')
  if (pattern.includes('(') && pattern.includes(')')) explanations.push('分组捕获')
  if (pattern.includes('[') && pattern.includes(']')) explanations.push('字符集合')
  if (pattern.includes('{') && pattern.includes('}')) explanations.push('指定匹配次数')

  return explanations.length > 0 ? explanations.join('; ') : '未识别特殊模式'
})

// 应用模板
const applyTemplate = (template) => {
  regexInput.value = template.pattern
  parseRegex()
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

// 清空 —— 🔧 修复点3：保持 flags 结构完整
const clearAll = () => {
  regexInput.value = ''
  testString.value = ''
  replaceTemplate.value = '$&'
  // 👈 关键修复：不破坏结构
  flags.value = { g: true, i: false, m: false, s: false }
  matches.value = []
  error.value = ''
  highlightedText.value = ''
}

// 监听输入变化
watch([regexInput, testString, () => flagString.value], parseRegex, { immediate: true })
</script>

<template>
  <div class="regex-tester">
    <h1>🔍 正则表达式测试器</h1>

    <div v-if="error" class="error-box">❌ {{ error }}</div>

    <!-- 正则输入区 -->
    <div class="input-section">
      <label>正则表达式</label>
      <div class="regex-input-wrapper">
        <input v-model="regexInput" placeholder="例如: \d{3}-\d{4}" class="regex-input" />
        <div class="flags">
          <label v-for="(value, key) in flags" :key="key">
            <input type="checkbox" v-model="flags[key]" :id="key" />
            <span>{{ key.toUpperCase() }}</span>
          </label>
        </div>
      </div>

      <!-- 常用模板 -->
      <div class="templates">
        <div
          class="template-btn"
          v-for="template in regexTemplates"
          :key="template.name"
          @click="applyTemplate(template)"
        >
          {{ template.name }}
        </div>
      </div>
    </div>

    <!-- 测试文本输入区 -->
    <div class="input-section">
      <label>测试文本</label>
      <textarea
        v-model="testString"
        placeholder="输入要测试的文本..."
        class="test-input"
      ></textarea>
    </div>

    <!-- 替换功能 -->
    <div class="input-section">
      <label>替换模板（支持 $& $1 $2 等）</label>
      <input v-model="replaceTemplate" placeholder="例如: [$&] 或 $1-$2" class="replace-input" />
    </div>

    <!-- 匹配结果 -->
    <div class="results-section">
      <h3>匹配结果</h3>
      <div class="highlighted-preview" v-html="highlightedText"></div>

      <div v-if="matches.length > 0" class="matches-info">
        <p>找到 {{ matches.length }} 个匹配项</p>
        <div class="matches-list">
          <div v-for="(match, index) in matches" :key="index" class="match-item">
            <div class="match-header">
              <span class="match-index">匹配 #{{ index + 1 }}</span>
              <span class="match-value">"{{ match.match }}"</span>
            </div>
            <div v-if="match.groups.length > 0" class="groups">
              <div v-for="(group, i) in match.groups" :key="i" class="group-item">
                <span class="group-label">分组 {{ i + 1 }}:</span>
                <span class="group-value">"{{ group }}"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!error && regexInput" class="no-matches">未找到匹配项</div>
    </div>

    <!-- 替换预览 -->
    <div class="replace-preview-section">
      <h3>替换预览</h3>
      <div class="replace-preview">{{ replaceResult }}</div>
      <button @click="copyToClipboard(replaceResult, '替换后文本')" class="copy-btn">
        📋 复制替换结果
      </button>
    </div>

    <!-- 正则解释 -->
    <div class="explanation-section">
      <h3>正则解释</h3>
      <div class="explanation-text">{{ regexExplanation }}</div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button @click="copyToClipboard(regexInput, '正则表达式')" class="copy-btn">
        📋 复制正则
      </button>
      <button @click="copyToClipboard(testString, '测试文本')" class="copy-btn">
        📋 复制测试文本
      </button>
      <button @click="clearAll" class="clear-btn">🗑️ 清空</button>
    </div>

    <div class="info-box">
      <p>📌 实时高亮匹配项，支持分组捕获</p>
      <p>📌 支持正则标志：g(全局)、i(忽略大小写)、m(多行)、s(点号匹配换行)</p>
      <p>📌 替换模板支持 $& (整个匹配)、$1 $2 (分组) 等</p>
      <p>📌 提供常用正则模板，一键应用</p>
    </div>
  </div>
</template>

<style scoped>
.regex-tester {
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
}

.regex-input-wrapper {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.regex-input {
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.regex-input:focus {
  border-color: #2196f3;
}

.flags {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.flags label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.flags input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.test-input {
  width: 100%;
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

.test-input:focus {
  border-color: #2196f3;
}

.replace-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.replace-input:focus {
  border-color: #2196f3;
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 8px;
}

.template-btn {
  padding: 8px 16px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.template-btn:hover {
  background: #bbdefb;
}

.results-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.results-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-weight: 600;
}

.highlighted-preview {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  min-height: 60px;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin-bottom: 20px;
}

.highlight {
  background: #fff3cd;
  border-bottom: 2px solid #ffc107;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.matches-info {
  margin-top: 20px;
}

.matches-info p {
  margin: 0 0 15px 0;
  font-weight: 500;
  color: #444;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.match-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.match-index {
  font-weight: 600;
  color: #2196f3;
}

.match-value {
  font-family: 'Courier New', monospace;
  background: #f0f7ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 6px;
}

.group-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.group-value {
  font-family: 'Courier New', monospace;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #eee;
  font-size: 14px;
}

.no-matches {
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
}

.replace-preview-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.replace-preview-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-weight: 600;
}

.replace-preview {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  min-height: 60px;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin-bottom: 15px;
}

.explanation-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.explanation-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-weight: 600;
}

.explanation-text {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  min-height: 40px;
  line-height: 1.6;
  color: #444;
}

.action-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 30px 0;
}

.copy-btn,
.clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.copy-btn {
  background: #2196f3;
  color: white;
}

.copy-btn:hover {
  background: #1976d2;
}

.clear-btn {
  background: #f44336;
  color: white;
}

.clear-btn:hover {
  background: #d32f2f;
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
  .regex-tester {
    margin: 20px;
    padding: 20px;
  }

  .regex-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .flags {
    justify-content: center;
  }

  .templates {
    justify-content: center;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .copy-btn,
  .clear-btn {
    width: 100%;
  }
}
</style>
