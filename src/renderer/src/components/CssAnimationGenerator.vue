<script setup>
import { ref, computed, watch } from 'vue'

// 动画配置
const animationConfig = ref({
  name: 'myAnimation',
  duration: 1,
  timingFunction: 'ease',
  delay: 0,
  iterationCount: 1,
  direction: 'normal',
  fillMode: 'both'
})

// 关键帧配置
const keyframes = ref([
  {
    percentage: 0,
    properties: {
      transform: 'translateX(0px) rotate(0deg) scale(1)',
      opacity: 1,
      backgroundColor: '#ffffff',
      color: '#000000'
    }
  },
  {
    percentage: 100,
    properties: {
      transform: 'translateX(100px) rotate(360deg) scale(1.2)',
      opacity: 0.5,
      backgroundColor: '#4a90e2',
      color: '#ffffff'
    }
  }
])

// 缓动函数选项
const timingFunctions = [
  'ease',
  'linear',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'step-start',
  'step-end',
  'cubic-bezier(0.42, 0, 0.58, 1)',
  'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'cubic-bezier(0.455, 0.03, 0.515, 0.955)'
]

// 方向选项
const directions = [
  { value: 'normal', label: '正常' },
  { value: 'reverse', label: '反向' },
  { value: 'alternate', label: '交替' },
  { value: 'alternate-reverse', label: '交替反向' }
]

// 填充模式选项
const fillModes = [
  { value: 'none', label: '无' },
  { value: 'forwards', label: '保持结束状态' },
  { value: 'backwards', label: '保持开始状态' },
  { value: 'both', label: '保持两端状态' }
]

// 生成 CSS 动画代码
const cssCode = computed(() => {
  let code = ''

  // 生成 keyframes
  code += `@keyframes ${animationConfig.value.name} {\n`
  keyframes.value.forEach((frame) => {
    code += `  ${frame.percentage}% {\n`
    Object.entries(frame.properties).forEach(([prop, value]) => {
      if (value !== '' && value !== null) {
        code += `    ${prop}: ${value};\n`
      }
    })
    code += `  }\n`
  })
  code += `}\n\n`

  // 生成动画样式
  code += `.animated-element {\n`
  code += `  animation-name: ${animationConfig.value.name};\n`
  code += `  animation-duration: ${animationConfig.value.duration}s;\n`
  code += `  animation-timing-function: ${animationConfig.value.timingFunction};\n`
  code += `  animation-delay: ${animationConfig.value.delay}s;\n`
  code += `  animation-iteration-count: ${animationConfig.value.iterationCount === -1 ? 'infinite' : animationConfig.value.iterationCount};\n`
  code += `  animation-direction: ${animationConfig.value.direction};\n`
  code += `  animation-fill-mode: ${animationConfig.value.fillMode};\n`
  code += `}`

  return code
})

// 添加关键帧
const addKeyframe = () => {
  const lastFrame = keyframes.value[keyframes.value.length - 1]
  const newPercentage = Math.min(lastFrame.percentage + 25, 100)

  keyframes.value.push({
    percentage: newPercentage,
    properties: {
      transform: '',
      opacity: 1,
      backgroundColor: '#ffffff',
      color: '#000000'
    }
  })

  // 按百分比排序
  keyframes.value.sort((a, b) => a.percentage - b.percentage)
}

// 删除关键帧
const removeKeyframe = (index) => {
  if (keyframes.value.length <= 2) return
  keyframes.value.splice(index, 1)
}

// 复制到剪贴板
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`✅ ${label} 已复制到剪贴板`)
  } catch (e) {
    alert(`❌ 复制失败，请手动选择复制 ${label}`)
  }
}

// 保存配置
const saveConfig = () => {
  const config = {
    animation: animationConfig.value,
    keyframes: keyframes.value
  }
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${animationConfig.value.name}-config.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 加载配置
const loadConfig = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result)
      animationConfig.value = config.animation || animationConfig.value
      keyframes.value = config.keyframes || keyframes.value
    } catch (e) {
      alert('导入失败：文件格式不正确')
    }
  }
  reader.readAsText(file)
}

// 重置为默认
const resetConfig = () => {
  animationConfig.value = {
    name: 'myAnimation',
    duration: 1,
    timingFunction: 'ease',
    delay: 0,
    iterationCount: 1,
    direction: 'normal',
    fillMode: 'both'
  }

  keyframes.value = [
    {
      percentage: 0,
      properties: {
        transform: 'translateX(0px) rotate(0deg) scale(1)',
        opacity: 1,
        backgroundColor: '#ffffff',
        color: '#000000'
      }
    },
    {
      percentage: 100,
      properties: {
        transform: 'translateX(100px) rotate(360deg) scale(1.2)',
        opacity: 0.5,
        backgroundColor: '#4a90e2',
        color: '#ffffff'
      }
    }
  ]
}

// 应用动画到预览元素
const applyAnimation = () => {
  const previewElement = document.querySelector('.preview-element')
  if (!previewElement) return

  // 先移除动画类
  previewElement.classList.remove('animated-element')
  void previewElement.offsetWidth // 强制重排
  previewElement.classList.add('animated-element')
}

// 监听配置变化，自动应用动画
watch([animationConfig, keyframes], applyAnimation, { deep: true })
</script>

<template>
  <div class="css-animation-generator">
    <h1>🎬 CSS 动画生成器</h1>

    <div class="preview-section">
      <h2>🎨 动画预览</h2>
      <div class="preview-container">
        <div class="preview-element">
          <h3>动画预览元素</h3>
          <p>这段文字和背景会应用你设置的动画效果</p>
        </div>
      </div>
      <button @click="applyAnimation" class="play-btn">▶️ 重新播放动画</button>
    </div>

    <div class="config-section">
      <h2>⚙️ 动画配置</h2>

      <!-- 基础配置 -->
      <div class="config-group">
        <h3>基础设置</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>动画名称</label>
            <input
              v-model="animationConfig.name"
              type="text"
              class="config-input"
              placeholder="myAnimation"
            />
          </div>
          <div class="config-item">
            <label>持续时间 (s)</label>
            <input
              v-model="animationConfig.duration"
              type="number"
              step="0.1"
              min="0.1"
              class="config-input"
            />
          </div>
          <div class="config-item">
            <label>延迟 (s)</label>
            <input
              v-model="animationConfig.delay"
              type="number"
              step="0.1"
              min="0"
              class="config-input"
            />
          </div>
          <div class="config-item">
            <label>循环次数</label>
            <input
              v-model="animationConfig.iterationCount"
              type="number"
              step="1"
              min="-1"
              class="config-input"
            />
            <div class="hint">-1 = 无限循环</div>
          </div>
        </div>
      </div>

      <!-- 高级配置 -->
      <div class="config-group">
        <h3>高级设置</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>缓动函数</label>
            <select v-model="animationConfig.timingFunction" class="config-select">
              <option v-for="func in timingFunctions" :key="func" :value="func">
                {{ func }}
              </option>
            </select>
          </div>
          <div class="config-item">
            <label>播放方向</label>
            <select v-model="animationConfig.direction" class="config-select">
              <option v-for="dir in directions" :key="dir.value" :value="dir.value">
                {{ dir.label }}
              </option>
            </select>
          </div>
          <div class="config-item">
            <label>填充模式</label>
            <select v-model="animationConfig.fillMode" class="config-select">
              <option v-for="mode in fillModes" :key="mode.value" :value="mode.value">
                {{ mode.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 关键帧配置 -->
      <div class="config-group">
        <div class="keyframes-header">
          <h3>关键帧设置</h3>
          <button @click="addKeyframe" class="add-keyframe-btn">➕ 添加关键帧</button>
        </div>

        <div class="keyframes-list">
          <div v-for="(frame, index) in keyframes" :key="index" class="keyframe-item">
            <div class="keyframe-header">
              <span class="keyframe-title">关键帧 {{ index + 1 }}</span>
              <div class="keyframe-controls">
                <input
                  v-model="frame.percentage"
                  type="number"
                  min="0"
                  max="100"
                  class="percentage-input"
                />%
                <button
                  v-if="keyframes.length > 2"
                  @click="removeKeyframe(index)"
                  class="remove-btn"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div class="properties-grid">
              <div class="property-item">
                <label>Transform</label>
                <input
                  v-model="frame.properties.transform"
                  type="text"
                  class="property-input"
                  placeholder="translateX(0px) rotate(0deg) scale(1)"
                />
              </div>
              <div class="property-item">
                <label>Opacity</label>
                <input
                  v-model="frame.properties.opacity"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  class="property-input"
                />
              </div>
              <div class="property-item">
                <label>Background Color</label>
                <input
                  v-model="frame.properties.backgroundColor"
                  type="color"
                  class="color-input"
                />
                <input
                  v-model="frame.properties.backgroundColor"
                  type="text"
                  class="color-text-input"
                />
              </div>
              <div class="property-item">
                <label>Text Color</label>
                <input v-model="frame.properties.color" type="color" class="color-input" />
                <input v-model="frame.properties.color" type="text" class="color-text-input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="output-section">
      <h2>📋 CSS 代码</h2>
      <div class="code-container">
        <textarea readonly class="css-code" :value="cssCode" rows="15"></textarea>
      </div>
      <div class="action-buttons">
        <button @click="copyToClipboard(cssCode, 'CSS动画代码')" class="copy-btn">
          📋 复制代码
        </button>
        <label class="import-btn">
          📥 导入配置
          <input type="file" @change="loadConfig" accept=".json" class="file-input" />
        </label>
        <button @click="saveConfig" class="export-btn">📤 导出配置</button>
        <button @click="resetConfig" class="reset-btn">🔄 重置默认</button>
      </div>
    </div>

    <div class="info-box">
      <p>📌 实时预览动画效果</p>
      <p>📌 支持多种缓动函数和动画属性</p>
      <p>📌 可保存/加载动画配置</p>
      <p>📌 一键复制完整 CSS 代码</p>
      <p>📌 支持 transform、opacity、颜色等常用属性</p>
    </div>
  </div>
</template>

<style>
/* 全局动画样式 */
.animated-element {
  animation-fill-mode: both;
}
</style>

<style scoped>
.css-animation-generator {
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

.preview-section {
  margin-bottom: 40px;
  background: #f8f9fa;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #eee;
}

.preview-section h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
}

.preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.preview-element {
  width: 300px;
  padding: 30px;
  background: white;
  border: 2px solid #4a90e2;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.preview-element h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: 600;
}

.preview-element p {
  color: #666;
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

.play-btn {
  display: block;
  margin: 20px auto;
  padding: 12px 24px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.play-btn:hover {
  background: #3a7bc8;
}

.config-section {
  margin-bottom: 40px;
}

.config-section h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
}

.config-group {
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.config-group h3 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item label {
  font-weight: 500;
  color: #444;
  font-size: 14px;
}

.config-input,
.config-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #333;
}

.config-input:focus,
.config-select:focus {
  outline: none;
  border-color: #2196f3;
}

.hint {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.keyframes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-keyframe-btn {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.add-keyframe-btn:hover {
  background: #43a047;
}

.keyframes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.keyframe-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.keyframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.keyframe-title {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.keyframe-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.percentage-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: right;
}

.remove-btn {
  width: 40px;
  height: 40px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #d32f2f;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.property-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-item label {
  font-weight: 500;
  color: #444;
  font-size: 14px;
}

.property-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: white;
  color: #333;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  vertical-align: middle;
}

.color-text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: white;
  color: #333;
  margin-top: 8px;
}

.output-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.output-section h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
}

.code-container {
  background: white;
  border: 1px solid #ddd;
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
  background: white;
  color: #333;
  resize: vertical;
  line-height: 1.5;
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.copy-btn,
.export-btn,
.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s;
}

.copy-btn {
  background: #2196f3;
  color: white;
}

.copy-btn:hover {
  background: #1976d2;
}

.export-btn {
  background: #ff9800;
  color: white;
}

.export-btn:hover {
  background: #f57c00;
}

.reset-btn {
  background: #f44336;
  color: white;
}

.reset-btn:hover {
  background: #d32f2f;
}

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #9c27b0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s;
}

.import-btn:hover {
  background: #7b1fa2;
}

.file-input {
  display: none;
}

.info-box {
  margin-top: 30px;
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
  .css-animation-generator {
    margin: 20px;
    padding: 20px;
  }

  .preview-element {
    width: 100%;
    max-width: 300px;
  }

  .config-grid,
  .properties-grid {
    grid-template-columns: 1fr;
  }

  .keyframe-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .percentage-input {
    width: 100%;
    text-align: left;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .import-btn,
  .export-btn,
  .reset-btn,
  .copy-btn {
    width: 100%;
  }
}
</style>
