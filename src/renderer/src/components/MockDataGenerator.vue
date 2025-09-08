<script setup>
import { ref, computed, watch } from 'vue' // 🔧 修改：添加 watch
import { faker } from '@faker-js/faker'

// 数据模型配置
const schemaConfig = ref({
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: '用户ID'
    },
    name: {
      type: 'string',
      faker: 'person.fullName',
      description: '用户名'
    },
    email: {
      type: 'string',
      format: 'email',
      description: '邮箱地址'
    },
    age: {
      type: 'integer',
      minimum: 18,
      maximum: 80,
      description: '年龄'
    },
    isActive: {
      type: 'boolean',
      description: '是否激活'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: '创建时间'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['admin', 'user', 'vip', 'guest']
      },
      minItems: 1,
      maxItems: 3,
      description: '标签'
    },
    profile: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          faker: 'image.avatar',
          description: '头像URL'
        },
        bio: {
          type: 'string',
          faker: 'lorem.paragraph',
          maxLength: 200,
          description: '个人简介'
        }
      },
      required: ['avatar', 'bio'],
      description: '个人资料'
    }
  },
  required: ['id', 'name', 'email', 'age'],
  description: '用户对象'
})

// 🔧 新增：Schema 文本表示
const schemaText = ref('')

// 生成配置
const generateConfig = ref({
  count: 10, // 生成数量
  outputFormat: 'json', // json, csv, sql
  tableName: 'users', // SQL 表名
  indent: 2 // JSON 缩进
})

// 生成的数据
const generatedData = ref([])

// 错误信息
const error = ref('')

// 🔧 监听 schemaConfig 变化，更新 schemaText
watch(
  schemaConfig,
  (newConfig) => {
    try {
      schemaText.value = JSON.stringify(newConfig, null, 2)
    } catch (e) {
      console.error('转换为字符串失败:', e)
    }
  },
  { deep: true, immediate: true }
)

// 🔧 处理文本框输入
const handleSchemaInput = (event) => {
  const newText = event.target.value
  schemaText.value = newText

  try {
    const newConfig = JSON.parse(newText)
    // 验证是否为对象
    if (newConfig && typeof newConfig === 'object') {
      schemaConfig.value = newConfig
      error.value = ''
    }
  } catch (e) {
    // JSON 解析失败，不更新 schemaConfig
    console.log('JSON 格式错误，暂不更新配置')
  }
}

// 生成数据
const generateData = () => {
  try {
    error.value = ''
    generatedData.value = []

    for (let i = 0; i < generateConfig.value.count; i++) {
      const item = generateFromSchema(schemaConfig.value)
      generatedData.value.push(item)
    }
  } catch (e) {
    error.value = '生成失败: ' + e.message
  }
}

// 根据 Schema 生成数据
const generateFromSchema = (schema) => {
  if (schema.type === 'object') {
    const obj = {}
    for (const [key, propSchema] of Object.entries(schema.properties || {})) {
      obj[key] = generateFromSchema(propSchema)
    }
    return obj
  } else if (schema.type === 'array') {
    const minItems = schema.minItems || 0
    const maxItems = schema.maxItems || 5
    const length = faker.number.int({ min: minItems, max: maxItems })
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(generateFromSchema(schema.items))
    }
    return arr
  } else if (schema.type === 'string') {
    if (schema.faker) {
      return generateFakerData(schema.faker)
    } else if (schema.format === 'uuid') {
      return faker.string.uuid()
    } else if (schema.format === 'email') {
      return faker.internet.email()
    } else if (schema.format === 'date-time') {
      return faker.date.past().toISOString()
    } else if (schema.enum) {
      return faker.helpers.arrayElement(schema.enum)
    } else {
      const minLength = schema.minLength || 5
      const maxLength = schema.maxLength || 20
      const length = faker.number.int({ min: minLength, max: maxLength })
      return faker.string.alpha({ length })
    }
  } else if (schema.type === 'integer' || schema.type === 'number') {
    const min = schema.minimum || 0
    const max = schema.maximum || 100
    return faker.number.int({ min, max })
  } else if (schema.type === 'boolean') {
    return faker.datatype.boolean()
  }

  return null
}

// 生成 Faker 数据
const generateFakerData = (fakerPath) => {
  try {
    const parts = fakerPath.split('.')
    let current = faker
    for (const part of parts) {
      current = current[part]
    }
    return typeof current === 'function' ? current() : current
  } catch (e) {
    return 'unknown'
  }
}

// 获取输出结果
const outputResult = computed(() => {
  if (generatedData.value.length === 0) return ''

  if (generateConfig.value.outputFormat === 'json') {
    return JSON.stringify(generatedData.value, null, generateConfig.value.indent)
  } else if (generateConfig.value.outputFormat === 'csv') {
    if (generatedData.value.length === 0) return ''

    // 获取所有字段
    const headers = new Set()
    generatedData.value.forEach((item) => {
      collectKeys(item, '', headers)
    })

    const headerArray = Array.from(headers).sort()
    let csv = headerArray.join(',') + '\n'

    generatedData.value.forEach((item) => {
      const row = headerArray.map((key) => {
        const value = getNestedValue(item, key)
        if (value === null || value === undefined) return ''
        if (typeof value === 'string') {
          return `"${value.toString().replace(/"/g, '""')}"`
        }
        return value.toString()
      })
      csv += row.join(',') + '\n'
    })

    return csv
  } else if (generateConfig.value.outputFormat === 'sql') {
    if (generatedData.value.length === 0) return ''

    let sql = ''
    generatedData.value.forEach((item, index) => {
      const keys = Object.keys(item)
      const values = keys.map((key) => {
        const value = item[key]
        if (value === null || value === undefined) return 'NULL'
        if (typeof value === 'string') {
          return `'${value.toString().replace(/'/g, "''")}'`
        }
        return value.toString()
      })

      sql += `INSERT INTO ${generateConfig.value.tableName} (${keys.join(', ')}) VALUES (${values.join(', ')});`
      if (index < generatedData.value.length - 1) {
        sql += '\n'
      }
    })

    return sql
  }

  return ''
})

// 收集所有嵌套键
const collectKeys = (obj, prefix, keys) => {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    keys.add(fullKey)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      collectKeys(value, fullKey, keys)
    }
  }
}

// 获取嵌套值
const getNestedValue = (obj, path) => {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current && typeof current === 'object') {
      current = current[key]
    } else {
      return undefined
    }
  }
  return current
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

// 导入配置
const importConfig = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result)
      if (config.schema) {
        schemaConfig.value = config.schema
      }
      if (config.settings) {
        Object.assign(generateConfig.value, config.settings)
      }
    } catch (e) {
      alert('导入失败：文件格式不正确')
    }
  }
  reader.readAsText(file)
}

// 导出配置
const exportConfig = () => {
  const config = {
    schema: schemaConfig.value,
    settings: generateConfig.value
  }
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mock-config.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 加载预设
const loadPreset = (type) => {
  if (type === 'user') {
    schemaConfig.value = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', faker: 'person.fullName' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', faker: 'phone.number' },
        age: { type: 'integer', minimum: 18, maximum: 80 },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', faker: 'location.streetAddress' },
            city: { type: 'string', faker: 'location.city' },
            country: { type: 'string', faker: 'location.country' }
          }
        },
        tags: {
          type: 'array',
          items: { type: 'string', enum: ['admin', 'user', 'vip'] },
          minItems: 1,
          maxItems: 3
        },
        createdAt: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'name', 'email']
    }
  } else if (type === 'product') {
    schemaConfig.value = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', faker: 'commerce.productName' },
        price: { type: 'number', minimum: 1, maximum: 1000, multipleOf: 0.01 },
        category: { type: 'string', faker: 'commerce.department' },
        description: { type: 'string', faker: 'commerce.productDescription', maxLength: 200 },
        inStock: { type: 'boolean' },
        tags: {
          type: 'array',
          items: { type: 'string', enum: ['new', 'sale', 'featured', 'popular'] },
          minItems: 0,
          maxItems: 3
        },
        images: {
          type: 'array',
          items: { type: 'string', faker: 'image.url' },
          minItems: 1,
          maxItems: 5
        },
        createdAt: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'name', 'price', 'category']
    }
  } else if (type === 'order') {
    schemaConfig.value = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        orderId: { type: 'string', faker: 'finance.transactionDescription' },
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string', faker: 'person.fullName' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', faker: 'phone.number' }
          }
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', format: 'uuid' },
              name: { type: 'string', faker: 'commerce.productName' },
              price: { type: 'number', minimum: 1, maximum: 500 },
              quantity: { type: 'integer', minimum: 1, maximum: 10 }
            }
          },
          minItems: 1,
          maxItems: 5
        },
        total: { type: 'number', minimum: 10, maximum: 5000 },
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'orderId', 'customer', 'items', 'total', 'status']
    }
  }
}

// 清空
const clearAll = () => {
  generatedData.value = []
  error.value = ''
}
</script>

<template>
  <div class="mock-data-generator">
    <h1>🎲 Mock 数据生成器（进阶版）</h1>

    <div v-if="error" class="error-box">❌ {{ error }}</div>

    <div class="config-section">
      <h2>⚙️ 配置</h2>

      <!-- 生成设置 -->
      <div class="config-group">
        <h3>生成设置</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>生成数量</label>
            <input
              v-model="generateConfig.count"
              type="number"
              min="1"
              max="1000"
              class="config-input"
            />
          </div>
          <div class="config-item">
            <label>输出格式</label>
            <select v-model="generateConfig.outputFormat" class="config-select">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="sql">SQL</option>
            </select>
          </div>
          <div v-if="generateConfig.outputFormat === 'sql'" class="config-item">
            <label>表名</label>
            <input
              v-model="generateConfig.tableName"
              type="text"
              class="config-input"
              placeholder="users"
            />
          </div>
          <div v-if="generateConfig.outputFormat === 'json'" class="config-item">
            <label>JSON 缩进</label>
            <input
              v-model="generateConfig.indent"
              type="number"
              min="0"
              max="4"
              class="config-input"
            />
          </div>
        </div>
      </div>

      <!-- Schema 编辑 -->
      <div class="config-group">
        <div class="schema-header">
          <h3>JSON Schema</h3>
          <div class="schema-actions">
            <label class="import-btn">
              📥 导入配置
              <input type="file" @change="importConfig" accept=".json" class="file-input" />
            </label>
            <button @click="exportConfig" class="export-btn">📤 导出配置</button>
          </div>
        </div>

        <div class="presets">
          <button @click="loadPreset('user')" class="preset-btn">👤 用户示例</button>
          <button @click="loadPreset('product')" class="preset-btn">🛍️ 商品示例</button>
          <button @click="loadPreset('order')" class="preset-btn">📦 订单示例</button>
        </div>

        <!-- 🔧 修复：使用 :value + @input 替代 v-model -->
        <textarea
          :value="schemaText"
          @input="handleSchemaInput"
          class="schema-input"
          rows="20"
          placeholder="编辑 JSON Schema..."
        ></textarea>
      </div>
    </div>

    <div class="action-section">
      <button @click="generateData" class="generate-btn">🎲 生成数据</button>
      <button @click="clearAll" class="clear-btn">🗑️ 清空结果</button>
    </div>

    <div v-if="generatedData.length > 0" class="output-section">
      <div class="output-header">
        <h3>📋 生成结果 ({{ generatedData.length }} 条)</h3>
        <button @click="copyToClipboard(outputResult, '生成数据')" class="copy-btn">📋 复制</button>
      </div>
      <pre class="output-code"><code>{{ outputResult }}</code></pre>
    </div>

    <div class="info-box">
      <p>📌 支持 JSON Schema 格式，自动生成符合结构的数据</p>
      <p>📌 支持多种数据类型：字符串、数字、布尔值、数组、对象、日期等</p>
      <p>📌 支持 Faker.js 生成真实感数据（姓名、邮箱、地址等）</p>
      <p>📌 可导出为 JSON、CSV、SQL 格式</p>
      <p>📌 提供常用数据模型示例</p>
    </div>
  </div>
</template>

<style scoped>
.mock-data-generator {
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

.error-box {
  background: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-weight: 500;
  border: 1px solid #ef9a9a;
}

.config-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 30px;
}

.config-section h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
}

.config-group {
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.config-group h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
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

.schema-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.schema-actions {
  display: flex;
  gap: 15px;
}

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #9c27b0;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.import-btn:hover {
  background: #7b1fa2;
}

.file-input {
  display: none;
}

.export-btn {
  padding: 8px 16px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #f57c00;
}

.presets {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 8px 16px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #bbdefb;
}

.schema-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  line-height: 1.5;
  min-height: 300px;
}

.schema-input:focus {
  border-color: #2196f3;
}

.action-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.generate-btn {
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.generate-btn:hover {
  background: #43a047;
}

.clear-btn {
  padding: 12px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #d32f2f;
}

.output-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.output-header h3 {
  color: #333;
  margin: 0;
  font-weight: 600;
  font-size: 22px;
}

.copy-btn {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #1976d2;
}

.output-code {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}

.output-code code {
  color: #333;
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
  .mock-data-generator {
    margin: 20px;
    padding: 20px;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .schema-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .presets {
    justify-content: center;
  }

  .action-section {
    flex-direction: column;
    align-items: stretch;
  }

  .generate-btn,
  .clear-btn {
    width: 100%;
  }

  .output-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .copy-btn {
    width: 100%;
    padding: 10px;
  }
}
</style>
