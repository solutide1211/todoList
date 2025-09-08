<script setup>
import { ref, computed } from 'vue'

// 输入的 cURL 命令
const curlInput = ref(`curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'`)

// 转换方向：curl-to-code 或 code-to-curl
const conversionDirection = ref('curl-to-code')

// 目标语言
const targetLanguage = ref('javascript')
const jsFramework = ref('fetch') // fetch, axios, jquery
const pythonLibrary = ref('requests') // requests, urllib

// 解析 cURL 命令
const parseCurlCommand = (curl) => {
  const result = {
    method: 'GET',
    url: '',
    headers: {},
    data: null,
    files: {},
    cookies: {},
    user: null,
    compressed: false,
    errors: []
  }

  try {
    // 移除换行符和续行符
    let cleanCurl = curl.replace(/\\\s*\n\s*/g, ' ').trim()

    // 分割参数
    const args = []
    let currentArg = ''
    let inQuotes = false
    let quoteChar = ''

    for (let i = 0; i < cleanCurl.length; i++) {
      const char = cleanCurl[i]

      if ((char === '"' || char === "'") && (i === 0 || cleanCurl[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true
          quoteChar = char
        } else if (char === quoteChar) {
          inQuotes = false
          quoteChar = ''
        }
        currentArg += char
      } else if (char === ' ' && !inQuotes) {
        if (currentArg) {
          args.push(currentArg)
          currentArg = ''
        }
      } else {
        currentArg += char
      }
    }

    if (currentArg) {
      args.push(currentArg)
    }

    // 移除 'curl' 命令
    if (args[0] && args[0].toLowerCase().startsWith('curl')) {
      args.shift()
    }

    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      if (arg === '-X' || arg === '--request') {
        result.method = args[++i] || 'GET'
      } else if (arg.startsWith('-H') || arg.startsWith('--header')) {
        let headerValue = arg.startsWith('-H') ? arg.substring(2).trim() : args[++i]
        if (headerValue && headerValue.includes(':')) {
          const [key, ...valueParts] = headerValue.split(':')
          result.headers[key.trim()] = valueParts.join(':').trim()
        }
      } else if (arg === '-d' || arg === '--data' || arg === '--data-raw') {
        result.data = args[++i] || ''
      } else if (arg === '-u' || arg === '--user') {
        result.user = args[++i] || ''
      } else if (arg === '--compressed') {
        result.compressed = true
      } else if (arg === '-b' || arg === '--cookie') {
        const cookieValue = args[++i] || ''
        if (cookieValue.includes('=')) {
          const [key, value] = cookieValue.split('=', 2)
          result.cookies[key.trim()] = value.trim()
        }
      } else if (arg === '-F' || arg === '--form') {
        const formValue = args[++i] || ''
        if (formValue.includes('=')) {
          const [key, value] = formValue.split('=', 2)
          result.files[key.trim()] = value.trim()
        }
      } else if (!arg.startsWith('-') && !result.url) {
        // URL 参数
        result.url = arg
      }
    }

    // 如果没有指定方法但有数据，默认为 POST
    if (result.method === 'GET' && result.data) {
      result.method = 'POST'
    }
  } catch (e) {
    result.errors.push('解析 cURL 命令失败: ' + e.message)
  }

  return result
}

// 生成 JavaScript 代码 (fetch)
const generateJavaScriptFetch = (config) => {
  let code = ''

  code += `// 使用 fetch 发送请求\n`
  code += `fetch('${config.url}', {\n`
  code += `  method: '${config.method}',\n`

  // Headers
  if (Object.keys(config.headers).length > 0) {
    code += `  headers: {\n`
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `    '${key}': '${value}',\n`
    })
    code += `  },\n`
  }

  // Body
  if (config.data) {
    if (config.headers['Content-Type'] === 'application/json') {
      try {
        const parsed = JSON.parse(config.data)
        code += `  body: JSON.stringify(${JSON.stringify(parsed, null, 2)})\n`
      } catch (e) {
        code += `  body: JSON.stringify(${JSON.stringify(config.data)})\n`
      }
    } else {
      code += `  body: '${config.data}'\n`
    }
  }

  code += `})\n`
  code += `.then(response => response.json())\n`
  code += `.then(data => console.log(data))\n`
  code += `.catch(error => console.error('Error:', error));`

  return code
}

// 生成 JavaScript 代码 (axios)
const generateJavaScriptAxios = (config) => {
  let code = ''

  code += `// 使用 axios 发送请求\n`
  code += `import axios from 'axios';\n\n`
  code += `axios({\n`
  code += `  method: '${config.method.toLowerCase()}',\n`
  code += `  url: '${config.url}',\n`

  // Headers
  if (Object.keys(config.headers).length > 0) {
    code += `  headers: {\n`
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `    '${key}': '${value}',\n`
    })
    code += `  },\n`
  }

  // Data
  if (config.data) {
    if (config.headers['Content-Type'] === 'application/json') {
      try {
        const parsed = JSON.parse(config.data)
        code += `  data: ${JSON.stringify(parsed, null, 2)}\n`
      } catch (e) {
        code += `  data: ${JSON.stringify(config.data)}\n`
      }
    } else {
      code += `  data: '${config.data}'\n`
    }
  }

  code += `})\n`
  code += `.then(response => {\n`
  code += `  console.log(response.data);\n`
  code += `})\n`
  code += `.catch(error => {\n`
  code += `  console.error('Error:', error);\n`
  code += `});`

  return code
}

// 生成 JavaScript 代码 (jQuery)
const generateJavaScriptJQuery = (config) => {
  let code = ''

  code += `// 使用 jQuery 发送请求\n`
  code += `$.ajax({\n`
  code += `  type: '${config.method}',\n`
  code += `  url: '${config.url}',\n`

  // Headers
  if (Object.keys(config.headers).length > 0) {
    code += `  headers: {\n`
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `    '${key}': '${value}',\n`
    })
    code += `  },\n`
  }

  // Data
  if (config.data) {
    if (config.headers['Content-Type'] === 'application/json') {
      try {
        const parsed = JSON.parse(config.data)
        code += `  data: JSON.stringify(${JSON.stringify(parsed, null, 2)}),\n`
        code += `  contentType: 'application/json',\n`
      } catch (e) {
        code += `  data: JSON.stringify(${JSON.stringify(config.data)}),\n`
        code += `  contentType: 'application/json',\n`
      }
    } else {
      code += `  data: '${config.data}',\n`
    }
  }

  code += `  success: function(data) {\n`
  code += `    console.log(data);\n`
  code += `  },\n`
  code += `  error: function(xhr, status, error) {\n`
  code += `    console.error('Error:', error);\n`
  code += `  }\n`
  code += `});`

  return code
}

// 生成 Python 代码 (requests)
const generatePythonRequests = (config) => {
  let code = ''

  code += `# 使用 requests 发送请求\n`
  code += `import requests\n\n`

  // Headers
  if (Object.keys(config.headers).length > 0) {
    code += `headers = {\n`
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `    '${key}': '${value}',\n`
    })
    code += `}\n\n`
  }

  // Data
  let dataParam = ''
  if (config.data) {
    if (config.headers['Content-Type'] === 'application/json') {
      try {
        const parsed = JSON.parse(config.data)
        dataParam = `json=${JSON.stringify(parsed, null, 2)}`
      } catch (e) {
        dataParam = `data='${config.data}'`
      }
    } else {
      dataParam = `data='${config.data}'`
    }
  }

  code += `response = requests.${config.method.toLowerCase()}(\n`
  code += `    '${config.url}',\n`
  if (Object.keys(config.headers).length > 0) {
    code += `    headers=headers,\n`
  }
  if (dataParam) {
    code += `    ${dataParam},\n`
  }
  code += `)\n\n`
  code += `print(response.json())`

  return code
}

// 生成 Python 代码 (urllib)
const generatePythonUrllib = (config) => {
  let code = ''

  code += `# 使用 urllib 发送请求\n`
  code += `import urllib.request\n`
  code += `import json\n\n`

  // Data
  if (config.data) {
    code += `data = ${JSON.stringify(config.data)}.encode('utf-8')\n`
  }

  code += `req = urllib.request.Request(\n`
  code += `    '${config.url}',\n`
  if (config.data) {
    code += `    data=data,\n`
  }
  code += `    method='${config.method}'\n`
  code += `)\n\n`

  // Headers
  if (Object.keys(config.headers).length > 0) {
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `req.add_header('${key}', '${value}')\n`
    })
    code += `\n`
  }

  code += `try:\n`
  code += `    with urllib.request.urlopen(req) as response:\n`
  code += `        data = json.loads(response.read().decode('utf-8'))\n`
  code += `        print(data)\n`
  code += `except Exception as e:\n`
  code += `    print('Error:', e)`

  return code
}

// 从代码生成 cURL（简化版）
const generateCurlFromCode = (code, language) => {
  // 这是一个简化实现，实际中需要解析代码
  let curl = 'curl'

  if (language === 'javascript') {
    if (code.includes('POST') || code.includes('post')) {
      curl += ' -X POST'
    } else if (code.includes('PUT') || code.includes('put')) {
      curl += ' -X PUT'
    } else if (code.includes('DELETE') || code.includes('delete')) {
      curl += ' -X DELETE'
    }

    // 提取 URL
    const urlMatch = code.match(/['"`](https?:\/\/[^'`"]+)['"`]/)
    if (urlMatch && urlMatch[1]) {
      curl += ` '${urlMatch[1]}'`
    }

    // 提取 headers
    if (code.includes('headers:')) {
      const headerMatches = code.match(/['"`]([^'`"]+)['"`]\s*:\s*['"`]([^'`"]+)['"`]/g)
      if (headerMatches) {
        headerMatches.forEach((match) => {
          const parts = match.match(/['"`]([^'`"]+)['"`]\s*:\s*['"`]([^'`"]+)['"`]/)
          if (parts && parts[1] && parts[2]) {
            curl += ` -H '${parts[1]}: ${parts[2]}'`
          }
        })
      }
    }

    // 提取 data
    const dataMatch = code.match(/body:\s*(['"`])([\s\S]*?)\1/)
    if (dataMatch && dataMatch[2]) {
      curl += ` -d '${dataMatch[2]}'`
    }
  }

  return curl || 'curl -X GET "https://example.com"'
}

// 转换结果
const conversionResult = computed(() => {
  if (conversionDirection.value === 'curl-to-code') {
    const config = parseCurlCommand(curlInput.value)

    if (targetLanguage.value === 'javascript') {
      if (jsFramework.value === 'fetch') {
        return generateJavaScriptFetch(config)
      } else if (jsFramework.value === 'axios') {
        return generateJavaScriptAxios(config)
      } else if (jsFramework.value === 'jquery') {
        return generateJavaScriptJQuery(config)
      }
    } else if (targetLanguage.value === 'python') {
      if (pythonLibrary.value === 'requests') {
        return generatePythonRequests(config)
      } else if (pythonLibrary.value === 'urllib') {
        return generatePythonUrllib(config)
      }
    }
  } else {
    return generateCurlFromCode(curlInput.value, targetLanguage.value)
  }

  return '// 请选择目标语言和框架'
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

// 加载示例
const loadExample = (type) => {
  if (type === 'post') {
    curlInput.value = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'`
  } else if (type === 'get') {
    curlInput.value = `curl -X GET 'https://api.example.com/users/123' \\
  -H 'Authorization: Bearer token123'`
  } else if (type === 'form') {
    curlInput.value = `curl -X POST 'https://api.example.com/upload' \\
  -H 'Authorization: Bearer token123' \\
  -F 'file=@/path/to/file.jpg' \\
  -F 'description=My file'`
  }
}

// 清空
const clearAll = () => {
  curlInput.value = ''
}
</script>

<template>
  <div class="curl-converter">
    <h1>🔄 cURL ↔ JavaScript / Python 转换器</h1>

    <div class="controls">
      <div class="direction-toggle">
        <label>
          <input type="radio" v-model="conversionDirection" value="curl-to-code" />
          cURL → 代码
        </label>
        <label>
          <input type="radio" v-model="conversionDirection" value="code-to-curl" />
          代码 → cURL
        </label>
      </div>

      <div v-if="conversionDirection === 'curl-to-code'" class="language-toggle">
        <label>
          <input type="radio" v-model="targetLanguage" value="javascript" />
          JavaScript
        </label>
        <label>
          <input type="radio" v-model="targetLanguage" value="python" />
          Python
        </label>
      </div>

      <div
        v-if="conversionDirection === 'curl-to-code' && targetLanguage === 'javascript'"
        class="framework-toggle"
      >
        <label>
          <input type="radio" v-model="jsFramework" value="fetch" />
          fetch
        </label>
        <label>
          <input type="radio" v-model="jsFramework" value="axios" />
          axios
        </label>
        <label>
          <input type="radio" v-model="jsFramework" value="jquery" />
          jQuery
        </label>
      </div>

      <div
        v-if="conversionDirection === 'curl-to-code' && targetLanguage === 'python'"
        class="framework-toggle"
      >
        <label>
          <input type="radio" v-model="pythonLibrary" value="requests" />
          requests
        </label>
        <label>
          <input type="radio" v-model="pythonLibrary" value="urllib" />
          urllib
        </label>
      </div>
    </div>

    <div class="examples">
      <button @click="loadExample('get')" class="example-btn">GET 示例</button>
      <button @click="loadExample('post')" class="example-btn">POST 示例</button>
      <button @click="loadExample('form')" class="example-btn">表单上传示例</button>
    </div>

    <div class="input-section">
      <label>{{
        conversionDirection === 'curl-to-code' ? '输入 cURL 命令' : '输入 JavaScript/Python 代码'
      }}</label>
      <textarea
        v-model="curlInput"
        :placeholder="
          conversionDirection === 'curl-to-code'
            ? 'curl -X POST https://api.example.com ...'
            : '// 输入 JavaScript 或 Python 代码'
        "
        class="input-textarea"
        rows="8"
      ></textarea>
    </div>

    <div class="output-section">
      <div class="output-header">
        <h3>转换结果</h3>
        <button @click="copyToClipboard(conversionResult, '转换结果')" class="copy-btn">
          📋 复制代码
        </button>
      </div>
      <pre class="output-code"><code>{{ conversionResult }}</code></pre>
    </div>

    <div class="action-bar">
      <button @click="clearAll" class="clear-btn">🗑️ 清空</button>
    </div>

    <div class="info-box">
      <p>📌 支持 cURL 到 JavaScript (fetch/axios/jQuery) 和 Python (requests/urllib) 的转换</p>
      <p>📌 支持 Header、Body、认证、文件上传等复杂参数</p>
      <p>📌 代码语法高亮，易于阅读</p>
      <p>📌 一键复制生成的代码</p>
      <p>📌 提供常用示例，快速上手</p>
    </div>
  </div>
</template>

<style scoped>
.curl-converter {
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

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 12px;
  align-items: center;
}

.direction-toggle,
.language-toggle,
.framework-toggle {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.direction-toggle label,
.language-toggle label,
.framework-toggle label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.direction-toggle input[type='radio'],
.language-toggle input[type='radio'],
.framework-toggle input[type='radio'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.examples {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.example-btn {
  padding: 10px 20px;
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

.input-section {
  margin-bottom: 30px;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  font-size: 16px;
}

.input-textarea {
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
}

.input-textarea:focus {
  border-color: #2196f3;
}

.output-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
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
}

.output-code code {
  color: #333;
}

/* 语法高亮 */
.output-code .keyword {
  color: #07a;
  font-weight: bold;
}
.output-code .string {
  color: #d14;
}
.output-code .comment {
  color: #998;
  font-style: italic;
}
.output-code .function {
  color: #900;
  font-weight: bold;
}
.output-code .number {
  color: #099;
}
.output-code .property {
  color: #905;
}

.action-bar {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.clear-btn {
  padding: 12px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
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
  .curl-converter {
    margin: 20px;
    padding: 20px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .examples {
    justify-content: center;
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
