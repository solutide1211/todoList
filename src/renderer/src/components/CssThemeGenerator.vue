<script setup>
import { ref, computed, watch } from 'vue'

// 主题配置
const themeConfig = ref({
  // 颜色变量
  colors: {
    primary: { name: '--color-primary', value: '#4a90e2', category: '品牌色' },
    secondary: { name: '--color-secondary', value: '#6c757d', category: '次要色' },
    success: { name: '--color-success', value: '#28a745', category: '成功色' },
    warning: { name: '--color-warning', value: '#ffc107', category: '警告色' },
    danger: { name: '--color-danger', value: '#dc3545', category: '危险色' },
    info: { name: '--color-info', value: '#17a2b8', category: '信息色' },
    background: { name: '--color-background', value: '#ffffff', category: '背景色' },
    surface: { name: '--color-surface', value: '#f8f9fa', category: '表面色' },
    text: { name: '--color-text', value: '#333333', category: '文字色' },
    textSecondary: { name: '--color-text-secondary', value: '#666666', category: '次要文字色' },
    border: { name: '--color-border', value: '#dee2e6', category: '边框色' }
  },
  // 字体变量
  fonts: {
    family: {
      name: '--font-family',
      value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      category: '字体族'
    },
    size: { name: '--font-size', value: '16px', category: '基础字号' },
    sizeSm: { name: '--font-size-sm', value: '14px', category: '小字号' },
    sizeLg: { name: '--font-size-lg', value: '18px', category: '大字号' },
    weight: { name: '--font-weight', value: '400', category: '字体粗细' },
    weightBold: { name: '--font-weight-bold', value: '700', category: '粗体' }
  },
  // 间距变量
  spacing: {
    xs: { name: '--spacing-xs', value: '4px', category: '超小间距' },
    sm: { name: '--spacing-sm', value: '8px', category: '小间距' },
    md: { name: '--spacing-md', value: '16px', category: '中等间距' },
    lg: { name: '--spacing-lg', value: '24px', category: '大间距' },
    xl: { name: '--spacing-xl', value: '32px', category: '超大间距' }
  },
  // 圆角变量
  borderRadius: {
    sm: { name: '--border-radius-sm', value: '4px', category: '小圆角' },
    md: { name: '--border-radius-md', value: '8px', category: '中圆角' },
    lg: { name: '--border-radius-lg', value: '12px', category: '大圆角' },
    full: { name: '--border-radius-full', value: '9999px', category: '圆形' }
  },
  // 阴影变量
  shadows: {
    sm: { name: '--shadow-sm', value: '0 1px 3px rgba(0,0,0,0.12)', category: '小阴影' },
    md: { name: '--shadow-md', value: '0 4px 6px rgba(0,0,0,0.1)', category: '中阴影' },
    lg: { name: '--shadow-lg', value: '0 10px 15px rgba(0,0,0,0.1)', category: '大阴影' }
  }
})

// 当前主题模式
const themeMode = ref('light') // 'light' 或 'dark'

// 深色主题预设
const darkThemePreset = {
  primary: '#4a90e2',
  secondary: '#868e96',
  success: '#51cf66',
  warning: '#ffd43b',
  danger: '#ff6b6b',
  info: '#20c997',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#e0e0e0',
  textSecondary: '#aaaaaa',
  border: '#333333'
}

// 应用深色主题
const applyDarkTheme = () => {
  themeMode.value = 'dark'
  for (const [key, value] of Object.entries(darkThemePreset)) {
    if (themeConfig.value.colors[key]) {
      themeConfig.value.colors[key].value = value
    }
  }
}

// 应用浅色主题
const applyLightTheme = () => {
  themeMode.value = 'light'
  themeConfig.value.colors.primary.value = '#4a90e2'
  themeConfig.value.colors.secondary.value = '#6c757d'
  themeConfig.value.colors.success.value = '#28a745'
  themeConfig.value.colors.warning.value = '#ffc107'
  themeConfig.value.colors.danger.value = '#dc3545'
  themeConfig.value.colors.info.value = '#17a2b8'
  themeConfig.value.colors.background.value = '#ffffff'
  themeConfig.value.colors.surface.value = '#f8f9fa'
  themeConfig.value.colors.text.value = '#333333'
  themeConfig.value.colors.textSecondary.value = '#666666'
  themeConfig.value.colors.border.value = '#dee2e6'
}

// 生成 CSS 变量代码
const cssVariablesCode = computed(() => {
  let code = ':root {\n'

  // 颜色变量
  for (const [key, config] of Object.entries(themeConfig.value.colors)) {
    code += `  ${config.name}: ${config.value};\n`
  }

  // 字体变量
  for (const [key, config] of Object.entries(themeConfig.value.fonts)) {
    code += `  ${config.name}: ${config.value};\n`
  }

  // 间距变量
  for (const [key, config] of Object.entries(themeConfig.value.spacing)) {
    code += `  ${config.name}: ${config.value};\n`
  }

  // 圆角变量
  for (const [key, config] of Object.entries(themeConfig.value.borderRadius)) {
    code += `  ${config.name}: ${config.value};\n`
  }

  // 阴影变量
  for (const [key, config] of Object.entries(themeConfig.value.shadows)) {
    code += `  ${config.name}: ${config.value};\n`
  }

  code += '}\n\n'

  // 深色主题
  code += '@media (prefers-color-scheme: dark) {\n'
  code += '  :root {\n'
  for (const [key, value] of Object.entries(darkThemePreset)) {
    if (themeConfig.value.colors[key]) {
      code += `    ${themeConfig.value.colors[key].name}: ${value};\n`
    }
  }
  code += '  }\n'
  code += '}\n\n'

  // 手动切换类
  code += '.theme-dark {\n'
  for (const [key, value] of Object.entries(darkThemePreset)) {
    if (themeConfig.value.colors[key]) {
      code += `  ${themeConfig.value.colors[key].name}: ${value};\n`
    }
  }
  code += '}\n\n'

  code += '.theme-light {\n'
  for (const [key, config] of Object.entries(themeConfig.value.colors)) {
    code += `  ${config.name}: ${config.value};\n`
  }
  code += '}'

  return code
})

// 复制到剪贴板
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`✅ ${label} 已复制到剪贴板`)
  } catch (e) {
    alert(`❌ 复制失败，请手动选择复制 ${label}`)
  }
}

// 导出主题配置
const exportTheme = () => {
  const data = {
    themeMode: themeMode.value,
    config: themeConfig.value
  }
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'css-theme-config.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 导入主题配置
const importTheme = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      themeMode.value = data.themeMode || 'light'
      themeConfig.value = data.config || themeConfig.value
    } catch (e) {
      alert('导入失败：文件格式不正确')
    }
  }
  reader.readAsText(file)
}

// 重置为默认主题
const resetTheme = () => {
  themeMode.value = 'light'
  themeConfig.value = {
    colors: {
      primary: { name: '--color-primary', value: '#4a90e2', category: '品牌色' },
      secondary: { name: '--color-secondary', value: '#6c757d', category: '次要色' },
      success: { name: '--color-success', value: '#28a745', category: '成功色' },
      warning: { name: '--color-warning', value: '#ffc107', category: '警告色' },
      danger: { name: '--color-danger', value: '#dc3545', category: '危险色' },
      info: { name: '--color-info', value: '#17a2b8', category: '信息色' },
      background: { name: '--color-background', value: '#ffffff', category: '背景色' },
      surface: { name: '--color-surface', value: '#f8f9fa', category: '表面色' },
      text: { name: '--color-text', value: '#333333', category: '文字色' },
      textSecondary: { name: '--color-text-secondary', value: '#666666', category: '次要文字色' },
      border: { name: '--color-border', value: '#dee2e6', category: '边框色' }
    },
    fonts: {
      family: {
        name: '--font-family',
        value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        category: '字体族'
      },
      size: { name: '--font-size', value: '16px', category: '基础字号' },
      sizeSm: { name: '--font-size-sm', value: '14px', category: '小字号' },
      sizeLg: { name: '--font-size-lg', value: '18px', category: '大字号' },
      weight: { name: '--font-weight', value: '400', category: '字体粗细' },
      weightBold: { name: '--font-weight-bold', value: '700', category: '粗体' }
    },
    spacing: {
      xs: { name: '--spacing-xs', value: '4px', category: '超小间距' },
      sm: { name: '--spacing-sm', value: '8px', category: '小间距' },
      md: { name: '--spacing-md', value: '16px', category: '中等间距' },
      lg: { name: '--spacing-lg', value: '24px', category: '大间距' },
      xl: { name: '--spacing-xl', value: '32px', category: '超大间距' }
    },
    borderRadius: {
      sm: { name: '--border-radius-sm', value: '4px', category: '小圆角' },
      md: { name: '--border-radius-md', value: '8px', category: '中圆角' },
      lg: { name: '--border-radius-lg', value: '12px', category: '大圆角' },
      full: { name: '--border-radius-full', value: '9999px', category: '圆形' }
    },
    shadows: {
      sm: { name: '--shadow-sm', value: '0 1px 3px rgba(0,0,0,0.12)', category: '小阴影' },
      md: { name: '--shadow-md', value: '0 4px 6px rgba(0,0,0,0.1)', category: '中阴影' },
      lg: { name: '--shadow-lg', value: '0 10px 15px rgba(0,0,0,0.1)', category: '大阴影' }
    }
  }
}

// 实时应用 CSS 变量到预览区域
const applyCssVariables = () => {
  const root = document.documentElement
  for (const [key, config] of Object.entries(themeConfig.value.colors)) {
    root.style.setProperty(config.name, config.value)
  }
  for (const [key, config] of Object.entries(themeConfig.value.fonts)) {
    root.style.setProperty(config.name, config.value)
  }
  for (const [key, config] of Object.entries(themeConfig.value.spacing)) {
    root.style.setProperty(config.name, config.value)
  }
  for (const [key, config] of Object.entries(themeConfig.value.borderRadius)) {
    root.style.setProperty(config.name, config.value)
  }
  for (const [key, config] of Object.entries(themeConfig.value.shadows)) {
    root.style.setProperty(config.name, config.value)
  }
}

// 监听主题配置变化
watch(themeConfig, applyCssVariables, { deep: true })

// 初始化
applyCssVariables()
</script>

<template>
  <div class="css-theme-generator">
    <h1>🎨 CSS 变量主题生成器</h1>

    <div class="theme-controls">
      <button @click="applyLightTheme" :class="{ active: themeMode === 'light' }">
        ☀️ 浅色主题
      </button>
      <button @click="applyDarkTheme" :class="{ active: themeMode === 'dark' }">🌙 深色主题</button>
      <button @click="exportTheme" class="export-btn">📤 导出主题</button>
      <label class="import-btn">
        📥 导入主题
        <input type="file" @change="importTheme" accept=".json" class="file-input" />
      </label>
      <button @click="resetTheme" class="reset-btn">🔄 重置默认</button>
    </div>

    <div class="preview-section">
      <h2>🎨 主题预览</h2>
      <div class="preview-container">
        <div class="preview-card">
          <h3>卡片标题</h3>
          <p>这是一段示例文本，用于展示主题效果。</p>
          <div class="button-group">
            <button class="btn primary">主要按钮</button>
            <button class="btn secondary">次要按钮</button>
            <button class="btn success">成功按钮</button>
            <button class="btn warning">警告按钮</button>
            <button class="btn danger">危险按钮</button>
          </div>
        </div>
      </div>
    </div>

    <div class="editor-section">
      <h2>⚙️ 变量编辑器</h2>

      <!-- 颜色变量 -->
      <div class="variable-group">
        <h3>🎨 颜色变量</h3>
        <div class="variable-grid">
          <div v-for="(config, key) in themeConfig.colors" :key="key" class="variable-item">
            <label>{{ config.category }}</label>
            <div class="input-wrapper">
              <input type="text" v-model="config.name" class="var-name" placeholder="变量名" />
              <input type="color" v-model="config.value" class="color-picker" />
              <input type="text" v-model="config.value" class="color-value" placeholder="#000000" />
            </div>
          </div>
        </div>
      </div>

      <!-- 字体变量 -->
      <div class="variable-group">
        <h3>🔤 字体变量</h3>
        <div class="variable-grid">
          <div v-for="(config, key) in themeConfig.fonts" :key="key" class="variable-item">
            <label>{{ config.category }}</label>
            <div class="input-wrapper">
              <input type="text" v-model="config.name" class="var-name" placeholder="变量名" />
              <input
                type="text"
                v-model="config.value"
                class="text-input"
                :placeholder="key === 'family' ? '字体族' : '值'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 间距变量 -->
      <div class="variable-group">
        <h3>📏 间距变量</h3>
        <div class="variable-grid">
          <div v-for="(config, key) in themeConfig.spacing" :key="key" class="variable-item">
            <label>{{ config.category }}</label>
            <div class="input-wrapper">
              <input type="text" v-model="config.name" class="var-name" placeholder="变量名" />
              <input
                type="text"
                v-model="config.value"
                class="text-input"
                placeholder="值 (如: 16px)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 圆角变量 -->
      <div class="variable-group">
        <h3>⭕ 圆角变量</h3>
        <div class="variable-grid">
          <div v-for="(config, key) in themeConfig.borderRadius" :key="key" class="variable-item">
            <label>{{ config.category }}</label>
            <div class="input-wrapper">
              <input type="text" v-model="config.name" class="var-name" placeholder="变量名" />
              <input
                type="text"
                v-model="config.value"
                class="text-input"
                placeholder="值 (如: 8px)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 阴影变量 -->
      <div class="variable-group">
        <h3>🪟 阴影变量</h3>
        <div class="variable-grid">
          <div v-for="(config, key) in themeConfig.shadows" :key="key" class="variable-item">
            <label>{{ config.category }}</label>
            <div class="input-wrapper">
              <input type="text" v-model="config.name" class="var-name" placeholder="变量名" />
              <input type="text" v-model="config.value" class="text-input" placeholder="阴影值" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="output-section">
      <h2>📋 CSS 代码</h2>
      <div class="code-container">
        <textarea readonly class="css-code" :value="cssVariablesCode" rows="20"></textarea>
      </div>
      <div class="action-buttons">
        <button @click="copyToClipboard(cssVariablesCode, 'CSS变量代码')" class="copy-btn">
          📋 复制代码
        </button>
      </div>
    </div>

    <div class="info-box">
      <p>📌 实时预览主题效果</p>
      <p>📌 支持深色/浅色主题切换</p>
      <p>📌 一键导出/导入主题配置</p>
      <p>📌 生成包含媒体查询的完整 CSS 代码</p>
    </div>
  </div>
</template>

<style>
/* 全局 CSS 变量 - 将在脚本中动态设置 */
:root {
  --color-primary: #4a90e2;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-border: #dee2e6;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size: 16px;
  --font-size-sm: 14px;
  --font-size-lg: 18px;
  --font-weight: 400;
  --font-weight-bold: 700;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 9999px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
</style>

<style scoped>
.css-theme-generator {
  max-width: 1400px;
  margin: 40px auto;
  padding: 30px;
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  font-family: var(--font-family);
}

h1 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 30px;
  font-weight: 600;
  font-size: 28px;
}

.theme-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--color-surface);
  border-radius: 12px;
  align-items: center;
}

.theme-controls button {
  padding: 10px 20px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.theme-controls button:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.theme-controls button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.export-btn,
.reset-btn {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.export-btn:hover,
.reset-btn:hover {
  background: #218838;
}

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.import-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.file-input {
  display: none;
}

.preview-section {
  margin-bottom: 40px;
}

.preview-section h2 {
  color: var(--color-text);
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 22px;
}

.preview-container {
  background: var(--color-surface);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.preview-card {
  background: var(--color-background);
  padding: 25px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.preview-card h3 {
  color: var(--color-text);
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: 600;
}

.preview-card p {
  color: var(--color-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.6;
  font-size: var(--font-size);
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  transition: all 0.2s;
}

.btn.primary {
  background: var(--color-primary);
  color: white;
}

.btn.primary:hover {
  background: #3a7bc8;
  transform: translateY(-1px);
}

.btn.secondary {
  background: var(--color-secondary);
  color: white;
}

.btn.secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn.success {
  background: var(--color-success);
  color: white;
}

.btn.success:hover {
  background: #218838;
  transform: translateY(-1px);
}

.btn.warning {
  background: var(--color-warning);
  color: #212529;
}

.btn.warning:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.btn.danger {
  background: var(--color-danger);
  color: white;
}

.btn.danger:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.editor-section {
  margin-bottom: 40px;
}

.editor-section h2 {
  color: var(--color-text);
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 22px;
}

.variable-group {
  margin-bottom: 30px;
  background: var(--color-surface);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.variable-group h3 {
  color: var(--color-text);
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-border);
}

.variable-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.variable-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variable-item label {
  font-weight: 500;
  color: var(--color-text);
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.var-name {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text);
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: var(--color-background);
}

.color-value {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text);
}

.text-input {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text);
}

.output-section {
  background: var(--color-surface);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.output-section h2 {
  color: var(--color-text);
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
}

.code-container {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 20px;
}

.css-code {
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text);
  resize: vertical;
  line-height: 1.5;
  outline: none;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.copy-btn {
  padding: 12px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #3a7bc8;
}

.info-box {
  margin-top: 30px;
  padding: 20px;
  background: var(--color-info);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.info-box p {
  margin: 6px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .css-theme-generator {
    margin: 20px;
    padding: 20px;
  }

  .theme-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .variable-grid {
    grid-template-columns: 1fr;
  }

  .input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .var-name,
  .color-value,
  .text-input {
    min-width: auto;
  }

  .button-group {
    justify-content: center;
  }

  .btn {
    width: 100%;
    max-width: 150px;
  }
}
</style>
