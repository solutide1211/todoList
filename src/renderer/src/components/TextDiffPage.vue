<script setup>
import { ref, computed, nextTick } from 'vue'
import { diffArrays } from 'diff'

const leftText = ref(`第一行内容
第二行原始内容
第三行将被修改
第四行保留不变
第五行即将删除`)

const rightText = ref(`第一行内容
第二行修改后的内容
第三行被改动了
第四行保留不变
新增第六行内容`)

// 同步滚动功能
const leftScrollTop = ref(0)
const rightScrollTop = ref(0)
const enableSyncScroll = ref(true)

const handleLeftScroll = (e) => {
  if (enableSyncScroll.value) {
    rightScrollTop.value = e.target.scrollTop
  }
}

const handleRightScroll = (e) => {
  if (enableSyncScroll.value) {
    leftScrollTop.value = e.target.scrollTop
  }
}

// 计算差异
const diffResult = computed(() => {
  const leftLines = leftText.value.split('\n')
  const rightLines = rightText.value.split('\n')

  const differences = diffArrays(leftLines, rightLines)

  let leftOutput = []
  let rightOutput = []

  differences.forEach((part) => {
    const lines = part.value
    if (part.added) {
      lines.forEach((line) => {
        rightOutput.push({ type: 'added', content: line })
        leftOutput.push({ type: 'empty', content: '' })
      })
    } else if (part.removed) {
      lines.forEach((line) => {
        leftOutput.push({ type: 'removed', content: line })
        rightOutput.push({ type: 'empty', content: '' })
      })
    } else {
      lines.forEach((line) => {
        leftOutput.push({ type: 'common', content: line })
        rightOutput.push({ type: 'common', content: line })
      })
    }
  })

  return { left: leftOutput, right: rightOutput }
})

// 获取差异统计
const diffStats = computed(() => {
  let added = 0,
    removed = 0,
    common = 0
  diffResult.value.left.forEach((item) => {
    if (item.type === 'removed') removed++
    else if (item.type === 'common') common++
  })
  diffResult.value.right.forEach((item) => {
    if (item.type === 'added') added++
  })
  return { added, removed, common }
})

// 复制差异摘要
const copyDiffSummary = async () => {
  const summary = `📊 文本比对结果：
✅ 相同行：${diffStats.value.common}
🟢 新增行：${diffStats.value.added}
🔴 删除行：${diffStats.value.removed}

📝 说明：
- 红色：仅左侧存在（被删除）
- 绿色：仅右侧存在（新增）
- 灰色：两侧相同`

  try {
    await navigator.clipboard.writeText(summary)
    alert('📋 差异摘要已复制到剪贴板！')
  } catch (e) {
    alert('❌ 复制失败，请手动选择复制')
  }
}
</script>

<template>
  <div class="text-diff-container">
    <div class="header">
      <h2>📋 文本比对工具</h2>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="enableSyncScroll" />
          同步滚动
        </label>
        <button class="copy-btn" @click="copyDiffSummary">📊 复制差异摘要</button>
      </div>
    </div>

    <div class="stats">
      <span>🟢 新增: {{ diffStats.added }}</span>
      <span>🔴 删除: {{ diffStats.removed }}</span>
      <span>✅ 相同: {{ diffStats.common }}</span>
    </div>

    <div class="diff-panels">
      <!-- 左侧面板 -->
      <div class="panel left-panel">
        <h3>原文本（左）</h3>
        <textarea
          v-model="leftText"
          @scroll="handleLeftScroll"
          :scrollTop="leftScrollTop"
          placeholder="请输入原始文本..."
          class="diff-input"
        ></textarea>
      </div>

      <!-- 右侧面板 -->
      <div class="panel right-panel">
        <h3>对比文本（右）</h3>
        <textarea
          v-model="rightText"
          @scroll="handleRightScroll"
          :scrollTop="rightScrollTop"
          placeholder="请输入对比文本..."
          class="diff-input"
        ></textarea>
      </div>
    </div>

    <!-- 差异高亮显示区 -->
    <div class="diff-result">
      <h3>🔍 差异对比结果</h3>
      <div class="diff-lines">
        <div
          v-for="(line, index) in diffResult.left"
          :key="index"
          class="diff-line"
          :class="line.type"
        >
          <span class="line-number">{{ index + 1 }}</span>
          <span class="line-content">{{ line.content }}</span>
        </div>
      </div>

      <div class="diff-lines right-view">
        <div
          v-for="(line, index) in diffResult.right"
          :key="index"
          class="diff-line"
          :class="line.type"
        >
          <span class="line-number">{{ index + 1 }}</span>
          <span class="line-content">{{ line.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-diff-container {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.copy-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:hover {
  background: #0056b3;
}

.stats {
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  font-weight: 500;
}

.stats span {
  padding: 4px 8px;
  border-radius: 4px;
}

.stats span:nth-child(1) {
  background: #d4edda;
  color: #155724;
}

.stats span:nth-child(2) {
  background: #f8d7da;
  color: #721c24;
}

.stats span:nth-child(3) {
  background: #e2e3e5;
  color: #383d41;
}

.diff-panels {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
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

.diff-input {
  flex: 1;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  resize: vertical;
  margin-top: 10px;
}

.diff-result {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.diff-result h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.diff-lines {
  display: inline-block;
  width: 48%;
  vertical-align: top;
  background: #fafafa;
  border-radius: 6px;
  padding: 10px;
  margin-right: 2%;
}

.diff-lines.right-view {
  margin-right: 0;
}

.diff-line {
  padding: 4px 8px;
  margin: 2px 0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  white-space: pre-wrap;
}

.diff-line.added {
  background: #d4edda;
  color: #155724;
  border-left: 3px solid #28a745;
}

.diff-line.removed {
  background: #f8d7da;
  color: #721c24;
  border-left: 3px solid #dc3545;
}

.diff-line.common {
  background: #e9ecef;
  color: #495057;
}

.diff-line.empty {
  background: #f8f9fa;
  color: #adb5bd;
  font-style: italic;
}

.line-number {
  display: inline-block;
  width: 40px;
  color: #888;
  text-align: right;
  margin-right: 10px;
  user-select: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .diff-panels {
    flex-direction: column;
  }

  .diff-lines {
    width: 100%;
    margin-right: 0;
    margin-bottom: 15px;
  }

  .diff-lines.right-view {
    margin-bottom: 0;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .controls {
    flex-wrap: wrap;
  }
}
</style>
