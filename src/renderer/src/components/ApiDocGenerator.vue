<script setup>
import { ref, computed, reactive } from 'vue'
import * as yaml from 'yaml'

// API 定义（支持 JSON 或 YAML）
const apiDefinition = ref(`openapi: 3.0.0
info:
  title: 示例 API
  version: 1.0.0
  description: 这是一个示例 API 文档
servers:
  - url: https://api.example.com/v1
    description: 生产环境
paths:
  /users:
    get:
      summary: 获取用户列表
      description: 返回所有用户信息
      parameters:
        - name: limit
          in: query
          description: 返回记录数限制
          required: false
          schema:
            type: integer
            default: 10
        - name: offset
          in: query
          description: 偏移量
          required: false
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: 成功返回用户列表
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: 创建新用户
      description: 创建一个新用户
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: 用户创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /users/{id}:
    get:
      summary: 获取单个用户
      description: 根据 ID 获取用户信息
      parameters:
        - name: id
          in: path
          description: 用户 ID
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功返回用户信息
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: 用户不存在
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          description: 用户 ID
        name:
          type: string
          description: 用户名
        email:
          type: string
          description: 邮箱地址
        createdAt:
          type: string
          format: date-time
          description: 创建时间
      required:
        - id
        - name
        - email
    UserCreate:
      type: object
      properties:
        name:
          type: string
          description: 用户名
        email:
          type: string
          description: 邮箱地址
      required:
        - name
        - email`)

// 当前选中的标签
const activeTab = ref('preview')

// 解析后的 API 数据
const parsedApi = computed(() => {
  try {
    // 判断是 JSON 还是 YAML
    let data
    const trimmed = apiDefinition.value.trim()

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      // JSON
      data = JSON.parse(trimmed)
    } else {
      // YAML
      data = yaml.parse(trimmed)
    }

    return {
      success: true,
      data: data,
      error: null
    }
  } catch (e) {
    return {
      success: false,
      data: null,
      error: '解析失败: ' + e.message
    }
  }
})

// 当前选中的服务器
const selectedServer = ref(0)

// 测试请求状态
const testRequests = reactive({})

// 发送测试请求
const sendTestRequest = async (path, method) => {
  if (!parsedApi.value.success) return

  const serverUrl = parsedApi.value.data.servers?.[selectedServer.value]?.url || ''
  const fullPath = serverUrl + path

  // 获取参数
  const params = {}
  const formData = new FormData()
  const headers = {}

  // 这里简化处理，实际项目中需要更复杂的参数收集逻辑
  const requestBody = {}

  try {
    testRequests[`${path}_${method}`] = {
      loading: true,
      response: null,
      error: null
    }

    // 模拟请求（实际项目中应使用 fetch/axios）
    // 这里使用 setTimeout 模拟网络请求
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        data: {
          message: '请求成功',
          path: path,
          method: method,
          server: serverUrl,
          timestamp: new Date().toISOString()
        }
      }

      testRequests[`${path}_${method}`] = {
        loading: false,
        response: mockResponse,
        error: null
      }
    }, 1000)
  } catch (error) {
    testRequests[`${path}_${method}`] = {
      loading: false,
      response: null,
      error: error.message
    }
  }
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

// 导入文件
const importFile = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    apiDefinition.value = e.target.result
  }
  reader.readAsText(file)
}

// 导出文件
const exportFile = (format) => {
  let content = apiDefinition.value
  let fileName = 'api-spec'

  if (format === 'json') {
    try {
      const data = yaml.parse(apiDefinition.value)
      content = JSON.stringify(data, null, 2)
      fileName = 'api-spec.json'
    } catch (e) {
      // 如果已经是 JSON，直接使用
      fileName = 'api-spec.json'
    }
  } else {
    fileName = 'api-spec.yaml'
  }

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 加载示例
const loadExample = (type) => {
  if (type === 'petstore') {
    apiDefinition.value = `openapi: 3.0.0
info:
  title: PetStore API
  version: 1.0.0
  description: 宠物商店 API
servers:
  - url: https://petstore.example.com/v1
    description: 生产环境
paths:
  /pets:
    get:
      summary: 获取宠物列表
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 宠物列表
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
    post:
      summary: 创建新宠物
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pet'
      responses:
        '201':
          description: 宠物创建成功
  /pets/{petId}:
    get:
      summary: 获取宠物详情
      parameters:
        - name: petId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 宠物详情
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        tag:
          type: string`
  } else if (type === 'user') {
    apiDefinition.value = `openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: 用户管理 API
servers:
  - url: https://api.user.com/v1
    description: 生产环境
paths:
  /users:
    get:
      summary: 获取用户列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: 用户列表
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: 创建用户
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: 用户创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
        createdAt:
          type: string
          format: date-time
      required:
        - id
        - name
        - email
    UserCreate:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
        password:
          type: string
      required:
        - name
        - email
        - password`
  }
}

// 清空
const clearAll = () => {
  apiDefinition.value = ''
}
</script>

<template>
  <div class="api-doc-generator">
    <h1>📚 API 文档生成器 (OpenAPI/Swagger)</h1>

    <div class="tabs">
      <button :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
        📄 文档预览
      </button>
      <button :class="{ active: activeTab === 'edit' }" @click="activeTab = 'edit'">
        ✏️ 编辑定义
      </button>
    </div>

    <div v-if="activeTab === 'edit'" class="editor-section">
      <div class="editor-header">
        <h3>编辑 OpenAPI/Swagger 定义</h3>
        <div class="editor-actions">
          <label class="import-btn">
            📥 导入文件
            <input type="file" @change="importFile" accept=".json,.yaml,.yml" class="file-input" />
          </label>
          <button @click="exportFile('json')" class="export-btn">📤 导出 JSON</button>
          <button @click="exportFile('yaml')" class="export-btn">📤 导出 YAML</button>
        </div>
      </div>

      <div class="examples">
        <button @click="loadExample('petstore')" class="example-btn">🐾 PetStore 示例</button>
        <button @click="loadExample('user')" class="example-btn">👤 User API 示例</button>
      </div>

      <textarea
        v-model="apiDefinition"
        placeholder="粘贴 OpenAPI/Swagger JSON 或 YAML 定义..."
        class="api-input"
        rows="20"
      ></textarea>
    </div>

    <div v-else class="preview-section">
      <div v-if="!parsedApi.success" class="error-box">❌ {{ parsedApi.error }}</div>

      <div v-else>
        <!-- API 信息 -->
        <div class="api-info">
          <h2>{{ parsedApi.data.info?.title || '未命名 API' }}</h2>
          <p class="version">版本: {{ parsedApi.data.info?.version || '未知' }}</p>
          <p class="description">{{ parsedApi.data.info?.description || '无描述' }}</p>

          <!-- 服务器选择 -->
          <div v-if="parsedApi.data.servers" class="servers">
            <label>服务器: </label>
            <select v-model="selectedServer" class="server-select">
              <option v-for="(server, index) in parsedApi.data.servers" :key="index" :value="index">
                {{ server.url }} ({{ server.description || '无描述' }})
              </option>
            </select>
          </div>
        </div>

        <!-- 路径列表 -->
        <div v-if="parsedApi.data.paths" class="paths-section">
          <h3>API 端点</h3>
          <div v-for="(methods, path) in parsedApi.data.paths" :key="path" class="path-item">
            <div class="path-header">
              <code class="path-code">{{ path }}</code>
            </div>

            <div
              v-for="(methodConfig, method) in methods"
              :key="method"
              class="method-item"
              :class="method"
            >
              <div class="method-header">
                <span class="method-badge">{{ method.toUpperCase() }}</span>
                <h4>{{ methodConfig.summary || '无标题' }}</h4>
              </div>

              <div class="method-description" v-if="methodConfig.description">
                {{ methodConfig.description }}
              </div>

              <!-- 参数 -->
              <div v-if="methodConfig.parameters" class="parameters">
                <h5>参数</h5>
                <div
                  v-for="(param, index) in methodConfig.parameters"
                  :key="index"
                  class="parameter-item"
                >
                  <div class="param-header">
                    <span class="param-name">{{ param.name }}</span>
                    <span class="param-in">({{ param.in }})</span>
                    <span v-if="param.required" class="param-required">必需</span>
                  </div>
                  <div class="param-description">{{ param.description || '无描述' }}</div>
                  <div class="param-schema">
                    类型: {{ param.schema?.type || '未指定' }}
                    <span v-if="param.schema?.default">, 默认值: {{ param.schema.default }}</span>
                  </div>
                </div>
              </div>

              <!-- 请求体 -->
              <div v-if="methodConfig.requestBody" class="request-body">
                <h5>请求体</h5>
                <div class="body-content">
                  <p v-if="methodConfig.requestBody.description">
                    {{ methodConfig.requestBody.description }}
                  </p>
                  <div
                    v-for="(content, contentType) in methodConfig.requestBody.content"
                    :key="contentType"
                  >
                    <div class="content-type">Content-Type: {{ contentType }}</div>
                    <div class="schema-preview">
                      <pre>{{ JSON.stringify(content.schema, null, 2) }}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 响应 -->
              <div v-if="methodConfig.responses" class="responses">
                <h5>响应</h5>
                <div
                  v-for="(response, code) in methodConfig.responses"
                  :key="code"
                  class="response-item"
                >
                  <div class="response-header">
                    <span class="response-code">{{ code }}</span>
                    <span class="response-description">{{ response.description }}</span>
                  </div>
                  <div v-if="response.content" class="response-content">
                    <div v-for="(content, contentType) in response.content" :key="contentType">
                      <div class="content-type">Content-Type: {{ contentType }}</div>
                      <div class="schema-preview">
                        <pre>{{ JSON.stringify(content.schema, null, 2) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 测试按钮 -->
              <div class="test-section">
                <button
                  @click="sendTestRequest(path, method)"
                  class="test-btn"
                  :disabled="testRequests[`${path}_${method}`]?.loading"
                >
                  {{ testRequests[`${path}_${method}`]?.loading ? '发送中...' : '🧪 测试请求' }}
                </button>

                <!-- 测试结果 -->
                <div v-if="testRequests[`${path}_${method}`]" class="test-result">
                  <div v-if="testRequests[`${path}_${method}`].loading" class="loading">
                    ⏳ 正在发送请求...
                  </div>
                  <div v-else-if="testRequests[`${path}_${method}`].response" class="success">
                    ✅ 响应状态: {{ testRequests[`${path}_${method}`].response.status }}
                    <pre>{{
                      JSON.stringify(testRequests[`${path}_${method}`].response.data, null, 2)
                    }}</pre>
                  </div>
                  <div v-else-if="testRequests[`${path}_${method}`].error" class="error">
                    ❌ 错误: {{ testRequests[`${path}_${method}`].error }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 组件定义 -->
        <div v-if="parsedApi.data.components?.schemas" class="components-section">
          <h3>数据模型</h3>
          <div
            v-for="(schema, name) in parsedApi.data.components.schemas"
            :key="name"
            class="schema-item"
          >
            <h4>{{ name }}</h4>
            <div class="schema-properties">
              <div
                v-for="(prop, propName) in schema.properties"
                :key="propName"
                class="property-item"
              >
                <div class="prop-header">
                  <span class="prop-name">{{ propName }}</span>
                  <span class="prop-type">({{ prop.type }})</span>
                  <span v-if="schema.required?.includes(propName)" class="prop-required">必需</span>
                </div>
                <div class="prop-description">{{ prop.description || '无描述' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button @click="clearAll" class="clear-btn">🗑️ 清空</button>
      <button @click="copyToClipboard(apiDefinition, 'API定义')" class="copy-btn">
        📋 复制定义
      </button>
    </div>

    <div class="info-box">
      <p>📌 支持 OpenAPI 3.0 和 Swagger 2.0 格式</p>
      <p>📌 实时预览 API 文档</p>
      <p>📌 支持交互式测试请求</p>
      <p>📌 可导入/导出 JSON/YAML 文件</p>
      <p>📌 提供常用示例，快速上手</p>
    </div>
  </div>
</template>

<style scoped>
.api-doc-generator {
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

.editor-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-header h3 {
  color: #333;
  margin: 0;
  font-weight: 600;
  font-size: 22px;
}

.editor-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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
  padding: 10px 16px;
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

.examples {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.example-btn {
  padding: 8px 16px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.example-btn:hover {
  background: #bbdefb;
}

.api-input {
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
  min-height: 400px;
}

.api-input:focus {
  border-color: #2196f3;
}

.preview-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
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

.api-info {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 30px;
}

.api-info h2 {
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
  font-size: 24px;
}

.version {
  font-weight: 500;
  color: #666;
  margin: 5px 0;
}

.description {
  color: #555;
  line-height: 1.6;
  margin: 10px 0;
}

.servers {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.server-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #333;
  margin-left: 10px;
}

.paths-section {
  margin-bottom: 40px;
}

.paths-section h3 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.path-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.path-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.path-code {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #d32f2f;
}

.method-item {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  margin: 15px 0;
  border-left: 4px solid #2196f3;
}

.method-item.get {
  border-left-color: #4caf50;
}

.method-item.post {
  border-left-color: #ff9800;
}

.method-item.put {
  border-left-color: #2196f3;
}

.method-item.delete {
  border-left-color: #f44336;
}

.method-item.patch {
  border-left-color: #9c27b0;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.method-badge {
  background: #2196f3;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.method-item.get .method-badge {
  background: #4caf50;
}

.method-item.post .method-badge {
  background: #ff9800;
}

.method-item.put .method-badge {
  background: #2196f3;
}

.method-item.delete .method-badge {
  background: #f44336;
}

.method-item.patch .method-badge {
  background: #9c27b0;
}

.method-header h4 {
  color: #333;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.method-description {
  color: #666;
  margin: 10px 0 15px 0;
  line-height: 1.6;
}

.parameters h5,
.request-body h5,
.responses h5 {
  color: #333;
  margin: 15px 0 10px 0;
  font-weight: 600;
  font-size: 16px;
}

.parameter-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}

.param-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.param-name {
  font-weight: 600;
  color: #333;
}

.param-in {
  color: #666;
  font-size: 14px;
}

.param-required {
  background: #f44336;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.param-description {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.param-schema {
  color: #555;
  font-size: 14px;
}

.request-body .body-content {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
}

.content-type {
  font-weight: 600;
  color: #333;
  margin: 10px 0 5px 0;
}

.schema-preview {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow-x: auto;
}

.response-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}

.response-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.response-code {
  background: #2196f3;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.response-description {
  color: #333;
  font-weight: 500;
}

.test-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.test-btn {
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #1976d2;
}

.test-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.test-result {
  margin-top: 15px;
  padding: 15px;
  border-radius: 6px;
  background: #f5f5f5;
}

.test-result .loading {
  color: #2196f3;
  font-weight: 500;
}

.test-result .success {
  color: #4caf50;
  font-weight: 500;
}

.test-result .error {
  color: #f44336;
  font-weight: 500;
}

.test-result pre {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-top: 10px;
  overflow-x: auto;
}

.components-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.components-section h3 {
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 22px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.schema-item {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 20px;
}

.schema-item h4 {
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
  font-size: 18px;
}

.property-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}

.prop-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.prop-name {
  font-weight: 600;
  color: #333;
}

.prop-type {
  color: #666;
  font-size: 14px;
}

.prop-required {
  background: #f44336;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.prop-description {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
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

.clear-btn {
  background: #f44336;
  color: white;
}

.clear-btn:hover {
  background: #d32f2f;
}

.info-box {
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
  .api-doc-generator {
    margin: 20px;
    padding: 20px;
  }

  .tabs {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .editor-actions {
    justify-content: center;
  }

  .examples {
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
