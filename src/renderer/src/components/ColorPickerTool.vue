<script setup>
import { ref, computed } from 'vue'

// 当前颜色值（默认白色）
const color = ref('#ffffff')
const alpha = ref(100) // 透明度 0-100%

// EyeDropper API 是否可用
const isEyeDropperSupported = 'EyeDropper' in window

// 使用 EyeDropper 取色
const useEyeDropper = async () => {
  if (!isEyeDropperSupported) return

  try {
    const eyeDropper = new window.EyeDropper()
    const result = await eyeDropper.open()
    // EyeDropper 返回的是 #RRGGBBAA 或 #RRGGBB 格式
    let hex = result.sRGBHex

    // 如果包含透明度
    if (hex.length === 9) {
      const a = parseInt(hex.slice(7, 9), 16)
      alpha.value = Math.round((a / 255) * 100)
      hex = hex.slice(0, 7)
    }

    color.value = hex
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('取色失败:', e)
    }
  }
}

// 颜色格式计算
const rgb = computed(() => {
  const r = parseInt(color.value.slice(1, 3), 16)
  const g = parseInt(color.value.slice(3, 5), 16)
  const b = parseInt(color.value.slice(5, 7), 16)
  return { r, g, b }
})

const rgba = computed(() => {
  const a = alpha.value / 100
  return `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, ${a.toFixed(2)})`
})

const hsl = computed(() => {
  const r = rgb.value.r / 255
  const g = rgb.value.g / 255
  const b = rgb.value.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
})

const hsla = computed(() => {
  const a = alpha.value / 100
  return `hsla(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%, ${a.toFixed(2)})`
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

// 重置为白色
const resetColor = () => {
  color.value = '#ffffff'
  alpha.value = 100
}
</script>

<template>
  <div class="color-picker-tool">
    <h1>🎨 颜色吸取器</h1>

    <div class="color-display">
      <div class="color-preview" :style="{ backgroundColor: rgba }"></div>
      <div class="color-info">
        <div class="current-color">{{ rgba }}</div>
        <div class="hex-value">{{ color.toUpperCase() }}</div>
      </div>
    </div>

    <div class="controls">
      <!-- 屏幕取色器（高级）-->
      <button v-if="isEyeDropperSupported" @click="useEyeDropper" class="eyedropper-btn">
        👁️ 屏幕取色
      </button>

      <!-- 传统颜色选择器 -->
      <div class="color-input-wrapper">
        <label>选择颜色：</label>
        <input type="color" v-model="color" class="color-input" />
      </div>

      <!-- 透明度滑块 -->
      <div class="alpha-control">
        <label>透明度 {{ alpha }}%</label>
        <input type="range" v-model="alpha" min="0" max="100" step="1" class="alpha-slider" />
      </div>
    </div>

    <!-- 颜色格式展示 -->
    <div class="formats-grid">
      <div class="format-item">
        <label>HEX</label>
        <div class="value-display">{{ color.toUpperCase() }}</div>
        <button @click="copyToClipboard(color, 'HEX')" class="copy-btn">📋</button>
      </div>

      <div class="format-item">
        <label>RGB</label>
        <div class="value-display">rgb({{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }})</div>
        <button
          @click="copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')"
          class="copy-btn"
        >
          📋
        </button>
      </div>

      <div class="format-item">
        <label>RGBA</label>
        <div class="value-display">{{ rgba }}</div>
        <button @click="copyToClipboard(rgba, 'RGBA')" class="copy-btn">📋</button>
      </div>

      <div class="format-item">
        <label>HSL</label>
        <div class="value-display">hsl({{ hsl.h }}, {{ hsl.s }}%, {{ hsl.l }}%)</div>
        <button
          @click="copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')"
          class="copy-btn"
        >
          📋
        </button>
      </div>

      <div class="format-item">
        <label>HSLA</label>
        <div class="value-display">{{ hsla }}</div>
        <button @click="copyToClipboard(hsla, 'HSLA')" class="copy-btn">📋</button>
      </div>
    </div>

    <div class="action-bar">
      <button @click="resetColor" class="reset-btn">🔄 重置为白色</button>
    </div>

    <div class="info-box">
      <p>📌 支持屏幕取色（Chrome/Edge 95+）</p>
      <p>📌 实时显示 HEX / RGB / RGBA / HSL / HSLA</p>
      <p>📌 支持透明度调整</p>
      <p>📌 一键复制任意格式</p>
      <p v-if="!isEyeDropperSupported" style="color: #d32f2f">
        ⚠️ 当前浏览器不支持屏幕取色器，可使用颜色选择器
      </p>
    </div>
  </div>
</template>

<style scoped>
.color-picker-tool {
  max-width: 900px; /* 🚀 页面宽度增大 */
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

.color-display {
  display: flex;
  align-items: center;
  gap: 30px; /* 稍微增大间距 */
  margin-bottom: 30px;
  padding: 24px; /* 内边距稍大 */
  background: #f8f9fa;
  border-radius: 12px;
}

.color-preview {
  width: 100px; /* 🚀 色块增大 */
  height: 100px;
  border-radius: 12px; /* 圆角更柔和 */
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-info {
  flex: 1;
}

.current-color {
  font-size: 22px; /* 🚀 字体增大 */
  font-weight: 700;
  color: #333;
  font-family: 'Courier New', monospace;
}

.hex-value {
  font-size: 16px; /* 🚀 字体增大 */
  color: #666;
  margin-top: 6px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 24px; /* 🚀 间距增大 */
  margin-bottom: 30px;
  align-items: center;
  padding: 24px; /* 内边距增大 */
  background: #f0f7ff;
  border-radius: 12px;
}

.eyedropper-btn {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.eyedropper-btn:hover {
  background: #1976d2;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.alpha-control {
  flex: 1;
  min-width: 220px;
}

.alpha-control label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.alpha-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.alpha-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2196f3;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.formats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); /* 🚀 列宽增大 */
  gap: 24px; /* 🚀 间距增大 */
  margin-bottom: 30px;
}

.format-item {
  background: #fafafa;
  padding: 20px; /* 内边距稍大 */
  border-radius: 10px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 16px; /* 间距稍大 */
}

.format-item label {
  min-width: 70px; /* 标签稍宽 */
  font-weight: 600;
  color: #555;
}

.value-display {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 15px; /* 字体稍大 */
  color: #333;
  background: white;
  padding: 10px 14px; /* 内边距增大 */
  border-radius: 6px;
  border: 1px solid #eee;
}

.copy-btn {
  padding: 8px 12px;
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

.action-bar {
  text-align: center;
  margin: 30px 0;
}

.reset-btn {
  padding: 12px 28px; /* 按钮稍大 */
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px; /* 字体稍大 */
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #f57c00;
}

.info-box {
  padding: 20px; /* 内边距增大 */
  background: #e8f5e8;
  border-radius: 8px;
  font-size: 14px;
  color: #2e7d32;
  line-height: 1.6;
}

.info-box p {
  margin: 6px 0; /* 间距稍大 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .color-picker-tool {
    margin: 20px;
    padding: 20px;
  }

  .color-display {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 20px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }

  .alpha-control {
    min-width: auto;
  }

  .formats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .format-item {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }

  .format-item label {
    text-align: left;
  }

  .value-display {
    width: 100%;
  }

  .current-color {
    font-size: 18px;
  }

  .hex-value {
    font-size: 14px;
  }
}
</style>
