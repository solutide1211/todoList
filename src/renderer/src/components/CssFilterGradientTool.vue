<script setup>
import { ref, computed } from 'vue'

// ============ 滤镜部分 ============
const filters = ref({
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  'hue-rotate': 0,
  invert: 0,
  opacity: 100,
  saturate: 100,
  sepia: 0
})

// 重置滤镜
const resetFilters = () => {
  filters.value = {
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    'hue-rotate': 0,
    invert: 0,
    opacity: 100,
    saturate: 100,
    sepia: 0
  }
}

// 获取滤镜 CSS 字符串
const filterCss = computed(() => {
  let filterStr = ''
  for (const [key, value] of Object.entries(filters.value)) {
    if (
      value !== 0 &&
      !(key === 'brightness' && value === 100) &&
      !(key === 'contrast' && value === 100) &&
      !(key === 'opacity' && value === 100) &&
      !(key === 'saturate' && value === 100)
    ) {
      if (key === 'hue-rotate') {
        filterStr += `${key}(${value}deg) `
      } else if (key === 'blur') {
        filterStr += `${key}(${value}px) `
      } else {
        filterStr += `${key}(${value}%) `
      }
    }
  }
  return filterStr.trim()
})

// ============ 渐变部分 ============
const gradientType = ref('linear') // 'linear' 或 'radial'
const gradientDirection = ref('to right') // 线性渐变方向
const gradientShape = ref('circle') // 径向渐变形状
const gradientSize = ref('farthest-corner') // 径向渐变大小
const gradientPosition = ref('center') // 径向渐变位置

// 渐变色标
const colorStops = ref([
  { color: '#ff6b6b', position: 0 },
  { color: '#4ecdc4', position: 100 }
])

// 添加色标
const addColorStop = () => {
  if (colorStops.value.length >= 6) return
  const last = colorStops.value[colorStops.value.length - 1]
  colorStops.value.push({
    color: '#45b7d1',
    position: Math.min(last.position + 20, 100)
  })
}

// 删除色标
const removeColorStop = (index) => {
  if (colorStops.value.length <= 2) return
  colorStops.value.splice(index, 1)
}

// 重置渐变
const resetGradient = () => {
  gradientType.value = 'linear'
  gradientDirection.value = 'to right'
  gradientShape.value = 'circle'
  gradientSize.value = 'farthest-corner'
  gradientPosition.value = 'center'
  colorStops.value = [
    { color: '#ff6b6b', position: 0 },
    { color: '#4ecdc4', position: 100 }
  ]
}

// 获取渐变 CSS 字符串
const gradientCss = computed(() => {
  let gradientStr = ''
  const sortedStops = [...colorStops.value].sort((a, b) => a.position - b.position)
  const stopStrings = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')

  if (gradientType.value === 'linear') {
    gradientStr = `linear-gradient(${gradientDirection.value}, ${stopStrings})`
  } else {
    gradientStr = `radial-gradient(${gradientShape.value} ${gradientSize.value} at ${gradientPosition.value}, ${stopStrings})`
  }

  return gradientStr
})

// ============ 通用功能 ============
// 复制到剪贴板
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`✅ ${label} 已复制到剪贴板`)
  } catch (e) {
    alert(`❌ 复制失败，请手动选择复制 ${label}`)
  }
}

// 预设滤镜效果
const applyPreset = (preset) => {
  resetFilters()
  Object.assign(filters.value, preset)
}

const presets = {
  vintage: { grayscale: 30, sepia: 60, brightness: 110, contrast: 90 },
  cold: { 'hue-rotate': 270, brightness: 110, saturate: 120 },
  warm: { 'hue-rotate': 30, brightness: 110, saturate: 120 },
  dark: { brightness: 70, contrast: 120, saturate: 80 },
  negative: { invert: 100 },
  blur: { blur: 5 }
}

// 预设渐变效果
const applyGradientPreset = (preset) => {
  resetGradient()
  Object.assign(gradientType, preset.type ? { value: preset.type } : {})
  Object.assign(gradientDirection, preset.direction ? { value: preset.direction } : {})
  Object.assign(gradientShape, preset.shape ? { value: preset.shape } : {})
  Object.assign(gradientSize, preset.size ? { value: preset.size } : {})
  Object.assign(gradientPosition, preset.position ? { value: preset.position } : {})
  if (preset.stops) {
    colorStops.value = [...preset.stops]
  }
}

const gradientPresets = {
  sunset: {
    type: 'linear',
    direction: 'to right',
    stops: [
      { color: '#ff7e5f', position: 0 },
      { color: '#feb47b', position: 100 }
    ]
  },
  ocean: {
    type: 'linear',
    direction: 'to bottom',
    stops: [
      { color: '#00c6ff', position: 0 },
      { color: '#0072ff', position: 100 }
    ]
  },
  purpleDream: {
    type: 'radial',
    shape: 'ellipse',
    size: 'farthest-corner',
    position: 'center',
    stops: [
      { color: '#a855f7', position: 0 },
      { color: '#ec4899', position: 100 }
    ]
  },
  cyberpunk: {
    type: 'linear',
    direction: '135deg',
    stops: [
      { color: '#ff00cc', position: 0 },
      { color: '#3333ff', position: 50 },
      { color: '#00ffff', position: 100 }
    ]
  }
}
</script>

<template>
  <div class="css-generator-tool">
    <h1>🎨 CSS 滤镜 & 渐变生成器</h1>

    <div class="tabs">
      <button :class="{ active: activeTab === 'filter' }" @click="activeTab = 'filter'">
        滤镜生成器
      </button>
      <button :class="{ active: activeTab === 'gradient' }" @click="activeTab = 'gradient'">
        渐变生成器
      </button>
    </div>

    <div v-if="activeTab === 'filter'" class="filter-section">
      <div class="preview-area">
        <div class="sample-image" :style="{ filter: filterCss }">
          <img
            src="https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=CSS+Filter+Preview"
            alt="预览"
          />
        </div>
        <div class="sample-text" :style="{ filter: filterCss }">
          <h3>文字效果预览</h3>
          <p>这段文字也应用了相同的滤镜效果</p>
        </div>
      </div>

      <div class="controls">
        <div class="presets">
          <h4>🎨 预设效果</h4>
          <div class="preset-buttons">
            <button
              v-for="(preset, name) in presets"
              :key="name"
              @click="applyPreset(preset)"
              class="preset-btn"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div class="filter-controls">
          <h4>🔧 自定义滤镜</h4>
          <div class="filter-grid">
            <div class="filter-item" v-for="(value, key) in filters" :key="key">
              <label>{{ key }}</label>
              <input
                type="range"
                v-model="filters[key]"
                :min="getMin(key)"
                :max="getMax(key)"
                :step="getStep(key)"
                class="filter-slider"
              />
              <input
                type="number"
                v-model="filters[key]"
                :min="getMin(key)"
                :max="getMax(key)"
                :step="getStep(key)"
                class="filter-input"
              />
              <span class="unit">{{ getUnit(key) }}</span>
            </div>
          </div>
        </div>

        <div class="result-section">
          <div class="css-output">
            <label>CSS 代码</label>
            <textarea
              readonly
              class="css-code"
              :value="filterCss ? `filter: ${filterCss};` : '无滤镜'"
            ></textarea>
          </div>
          <div class="action-buttons">
            <button
              @click="copyToClipboard(filterCss ? `filter: ${filterCss};` : '', 'CSS滤镜代码')"
              class="copy-btn"
            >
              📋 复制代码
            </button>
            <button @click="resetFilters" class="reset-btn">🔄 重置</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="gradient-section">
      <div class="preview-area">
        <div class="gradient-preview" :style="{ background: gradientCss }">
          <h3>渐变效果预览</h3>
          <p>这个区域应用了生成的渐变背景</p>
        </div>
      </div>

      <div class="controls">
        <div class="presets">
          <h4>🌈 渐变预设</h4>
          <div class="preset-buttons">
            <button
              v-for="(preset, name) in gradientPresets"
              :key="name"
              @click="applyGradientPreset(preset)"
              class="preset-btn"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div class="gradient-type">
          <label>渐变类型：</label>
          <select v-model="gradientType" class="type-select">
            <option value="linear">线性渐变</option>
            <option value="radial">径向渐变</option>
          </select>
        </div>

        <div v-if="gradientType === 'linear'" class="direction-control">
          <label>方向：</label>
          <select v-model="gradientDirection" class="direction-select">
            <option value="to right">→ 向右</option>
            <option value="to left">← 向左</option>
            <option value="to bottom">↓ 向下</option>
            <option value="to top">↑ 向上</option>
            <option value="to bottom right">↘ 右下</option>
            <option value="to bottom left">↙ 左下</option>
            <option value="to top right">↗ 右上</option>
            <option value="to top left">↖ 左上</option>
            <option value="0deg">0° (北)</option>
            <option value="45deg">45° (东北)</option>
            <option value="90deg">90° (东)</option>
            <option value="135deg">135° (东南)</option>
            <option value="180deg">180° (南)</option>
            <option value="225deg">225° (西南)</option>
            <option value="270deg">270° (西)</option>
            <option value="315deg">315° (西北)</option>
          </select>
        </div>

        <div v-if="gradientType === 'radial'" class="radial-controls">
          <div class="control-row">
            <label>形状：</label>
            <select v-model="gradientShape" class="shape-select">
              <option value="circle">圆形</option>
              <option value="ellipse">椭圆</option>
            </select>
          </div>
          <div class="control-row">
            <label>大小：</label>
            <select v-model="gradientSize" class="size-select">
              <option value="closest-side">最近边</option>
              <option value="closest-corner">最近角</option>
              <option value="farthest-side">最远边</option>
              <option value="farthest-corner">最远角</option>
            </select>
          </div>
          <div class="control-row">
            <label>位置：</label>
            <select v-model="gradientPosition" class="position-select">
              <option value="center">中心</option>
              <option value="left">左</option>
              <option value="right">右</option>
              <option value="top">上</option>
              <option value="bottom">下</option>
              <option value="left top">左上</option>
              <option value="right top">右上</option>
              <option value="left bottom">左下</option>
              <option value="right bottom">右下</option>
            </select>
          </div>
        </div>

        <div class="color-stops">
          <h4>🎨 色标设置</h4>
          <div class="color-stop-item" v-for="(stop, index) in colorStops" :key="index">
            <div class="color-input-wrapper">
              <input type="color" v-model="stop.color" class="color-picker" />
              <input type="text" v-model="stop.color" class="color-hex" />
            </div>
            <div class="position-control">
              <input
                type="range"
                v-model="stop.position"
                min="0"
                max="100"
                class="position-slider"
              />
              <input
                type="number"
                v-model="stop.position"
                min="0"
                max="100"
                class="position-input"
              />%
            </div>
            <button v-if="colorStops.length > 2" @click="removeColorStop(index)" class="remove-btn">
              ➖
            </button>
          </div>
          <button @click="addColorStop" :disabled="colorStops.length >= 6" class="add-btn">
            ➕ 添加色标
          </button>
        </div>

        <div class="result-section">
          <div class="css-output">
            <label>CSS 代码</label>
            <textarea readonly class="css-code" :value="`background: ${gradientCss};`"></textarea>
          </div>
          <div class="action-buttons">
            <button
              @click="copyToClipboard(`background: ${gradientCss};`, 'CSS渐变代码')"
              class="copy-btn"
            >
              📋 复制代码
            </button>
            <button @click="resetGradient" class="reset-btn">🔄 重置</button>
          </div>
        </div>
      </div>
    </div>

    <div class="info-box">
      <p>📌 实时预览滤镜和渐变效果</p>
      <p>📌 支持自定义参数和预设效果</p>
      <p>📌 一键复制生成的 CSS 代码</p>
      <p>📌 所有操作在浏览器本地完成</p>
    </div>
  </div>
</template>

<script>
// 在普通 script 中定义 activeTab，因为模板中需要使用
export default {
  setup() {
    const activeTab = ref('filter') // 'filter' 或 'gradient'

    // 获取滤镜参数的最小值
    const getMin = (key) => {
      switch (key) {
        case 'blur':
          return 0
        case 'brightness':
          return 0
        case 'contrast':
          return 0
        case 'grayscale':
          return 0
        case 'hue-rotate':
          return -360
        case 'invert':
          return 0
        case 'opacity':
          return 0
        case 'saturate':
          return 0
        case 'sepia':
          return 0
        default:
          return 0
      }
    }

    // 获取滤镜参数的最大值
    const getMax = (key) => {
      switch (key) {
        case 'blur':
          return 20
        case 'brightness':
          return 200
        case 'contrast':
          return 200
        case 'grayscale':
          return 100
        case 'hue-rotate':
          return 360
        case 'invert':
          return 100
        case 'opacity':
          return 100
        case 'saturate':
          return 200
        case 'sepia':
          return 100
        default:
          return 100
      }
    }

    // 获取滤镜参数的步长
    const getStep = (key) => {
      switch (key) {
        case 'blur':
          return 0.5
        case 'hue-rotate':
          return 1
        default:
          return 1
      }
    }

    // 获取滤镜参数的单位
    const getUnit = (key) => {
      switch (key) {
        case 'blur':
          return 'px'
        case 'hue-rotate':
          return 'deg'
        default:
          return '%'
      }
    }

    return {
      activeTab,
      getMin,
      getMax,
      getStep,
      getUnit
    }
  }
}
</script>

<style scoped>
.css-generator-tool {
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

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
}

.tabs button {
  padding: 12px 24px;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #e0e0e0;
}

.tabs button.active {
  background: #2196f3;
  color: white;
}

/* 滤镜部分样式 */
.filter-section,
.gradient-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
}

.preview-area {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.sample-image {
  flex: 1;
  min-width: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.sample-image img {
  width: 100%;
  height: auto;
  display: block;
}

.sample-text {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.sample-text h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.sample-text p {
  color: #666;
  margin: 0;
}

/* 渐变预览 */
.gradient-preview {
  height: 200px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.gradient-preview h3 {
  margin: 0 0 10px 0;
}

.gradient-preview p {
  margin: 0;
  font-size: 16px;
}

.controls {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.presets {
  margin-bottom: 25px;
}

.presets h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-weight: 600;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preset-btn {
  padding: 8px 16px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #bbdefb;
}

.filter-controls {
  margin-bottom: 25px;
}

.filter-controls h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-weight: 600;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-weight: 500;
  color: #444;
}

.filter-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.filter-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2196f3;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.filter-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.unit {
  align-self: center;
  color: #666;
  font-size: 14px;
}

/* 渐变部分样式 */
.gradient-type,
.direction-control,
.radial-controls {
  margin-bottom: 20px;
}

.type-select,
.direction-select,
.shape-select,
.size-select,
.position-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.color-stops {
  margin-bottom: 25px;
}

.color-stops h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-weight: 600;
}

.color-stop-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-hex {
  width: 100px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.position-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.position-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.position-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.position-input {
  width: 60px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.remove-btn {
  width: 32px;
  height: 32px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #d32f2f;
}

.add-btn {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #43a047;
}

.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 结果部分 */
.result-section {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #eee;
}

.css-output {
  margin-bottom: 20px;
}

.css-output label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.css-code {
  width: 100%;
  min-height: 60px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #f5f5f5;
  resize: vertical;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.copy-btn {
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #1976d2;
}

.reset-btn {
  padding: 10px 20px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #f57c00;
}

.info-box {
  margin-top: 30px;
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
  .css-generator-tool {
    margin: 20px;
    padding: 20px;
  }

  .preview-area {
    flex-direction: column;
    gap: 20px;
  }

  .sample-image,
  .sample-text {
    min-width: auto;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .color-stop-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .position-control {
    width: 100%;
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>
