<script setup>
import { ref, computed } from 'vue'
import {
  House,
  InfoFilled,
  DataAnalysis,
  Tools,
  Document,
  Setting,
  Menu as MenuIcon
} from '@element-plus/icons-vue'

// 窗口控制
const isMaximized = ref(false)
const minimizeWindow = () => {
  if (window.todoApp) window.todoApp.minimizeApp()
}
const toggleMaximize = () => {
  if (window.todoApp) window.todoApp.maximizeApp()
}
const closeWindow = () => {
  if (window.todoApp) window.todoApp.closeWindow()
}

// 侧边栏折叠状态（响应式）
const isCollapse = ref(false)

// 菜单分组配置
const menuGroups = computed(() => [
  {
    title: '🏠 基础工具',
    items: [{ index: '/', icon: House, label: '首页' }]
  },
  {
    title: '📊 数据处理',
    items: [
      { index: '/json', icon: Document, label: 'JSON 工具' },
      { index: '/diff', icon: Document, label: '文本比对' },
      { index: '/converter', icon: DataAnalysis, label: '进制转换' },
      { index: '/TimestampConverter', icon: DataAnalysis, label: '时间戳转换' },
      { index: '/jwt', icon: Document, label: 'JWT 解析器' },
      { index: '/base64', icon: Tools, label: 'Base64 工具' },
      { index: '/RegexTester', icon: Tools, label: '正则测试器' },
      { index: '/MockDataGenerator', icon: Tools, label: 'Mock 数据生成器' }
    ]
  },
  {
    title: '🎨 样式工具',
    items: [
      { index: '/ColorPickerTool', icon: Tools, label: '颜色吸取器' },
      { index: '/CssFilter', icon: Tools, label: 'CSS 过滤器' },
      { index: '/CssThemeGenerator', icon: Tools, label: 'CSS 主题生成器' },
      { index: '/CssAnimationGenerator', icon: Tools, label: 'CSS 动画生成器' }
    ]
  },
  {
    title: '🌐 网络工具',
    items: [
      { index: '/UrlParamEditor', icon: Document, label: 'URL 参数解析器' },
      { index: '/CurlConverter', icon: Tools, label: 'cURL 转换器' },
      { index: '/ApiDocGenerator', icon: Document, label: 'API 文档生成器' }
    ]
  },
  {
    title: '⚙️ 系统设置',
    items: [{ index: '/about', icon: InfoFilled, label: '关于' }]
  }
])
</script>

<template>
  <div class="common-layout">
    <el-container class="full-height">
      <el-header>
        <div class="header-content">
          <div class="logo-section">
            <span class="logo">Tools</span>
            <!-- 移动端菜单按钮 -->
            <el-button
              :icon="MenuIcon"
              circle
              size="small"
              class="mobile-menu-btn"
              @click="isCollapse = !isCollapse"
            />
          </div>
          <div class="tool">
            <el-tooltip content="最小化" placement="bottom">
              <el-button icon="el-icon-minus" circle size="small" @click="minimizeWindow" />
            </el-tooltip>
            <el-tooltip :content="isMaximized ? '还原' : '最大化'" placement="bottom">
              <el-button
                :icon="isMaximized ? 'el-icon-copy-document' : 'el-icon-full-screen'"
                circle
                size="small"
                @click="toggleMaximize"
              />
            </el-tooltip>
            <el-tooltip content="关闭" placement="bottom">
              <el-button
                icon="el-icon-close"
                type="danger"
                circle
                size="small"
                @click="closeWindow"
              />
            </el-tooltip>
          </div>
        </div>
      </el-header>

      <el-container>
        <el-aside :width="isCollapse ? '60px' : '220px'" class="sidebar">
          <div class="menu-wrapper">
            <el-menu
              :default-active="$route.path"
              background-color="#fff"
              text-color="#333"
              active-text-color="#409EFF"
              router
              :collapse="isCollapse"
              :collapse-transition="false"
              class="el-menu-vertical"
            >
              <template v-for="group in menuGroups" :key="group.title">
                <div v-if="!isCollapse" class="menu-group-title">
                  {{ group.title }}
                </div>
                <el-menu-item
                  v-for="item in group.items"
                  :key="item.index"
                  :index="item.index"
                  :class="{ 'active-item': $route.path === item.index }"
                >
                  <el-icon>
                    <component :is="item.icon" />
                  </el-icon>
                  <template #title>
                    <span>{{ item.label }}</span>
                  </template>
                </el-menu-item>
                <el-divider v-if="!isCollapse" />
              </template>
            </el-menu>
          </div>
        </el-aside>

        <el-main class="main-content">
          <keep-alive>
            <router-view />
          </keep-alive>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.common-layout .full-height {
  height: 100%;
}

:deep(.el-container) {
  min-height: 0;
}

:deep(.el-header) {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0;
  user-select: none;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-weight: bold;
  color: #333;
  font-size: 18px;
}

.mobile-menu-btn {
  display: none;
}

:deep(.el-header .el-button .el-icon) {
  color: #000 !important;
}

:deep(.el-header .el-button:hover .el-icon) {
  color: #333 !important;
}

/* 侧边栏样式 */
.sidebar {
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  overflow-x: hidden;
}

.menu-wrapper {
  height: 100%;
  overflow-y: auto;
}

:deep(.el-menu-vertical) {
  border: none;
  height: 100%;
}

:deep(.el-menu-vertical .el-menu-item) {
  padding-left: 20px !important;
  transition: all 0.2s;
}

:deep(.el-menu-vertical .el-menu-item:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-menu-vertical .el-menu-item.is-active) {
  background-color: #ecf5ff !important;
  border-right: 3px solid #409eff;
}

/* 自定义激活状态 */
.active-item {
  background-color: #ecf5ff !important;
  border-right: 3px solid #409eff !important;
}

/* 菜单分组标题 */
.menu-group-title {
  padding: 12px 20px 8px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.el-divider) {
  margin: 8px 0;
  background-color: #ebeef5;
}

/* 主内容区 */
.main-content {
  padding: 20px;
  background: #f8f9fa;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 40px;
    left: 0;
    z-index: 1000;
    height: calc(100vh - 40px);
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  }

  .main-content {
    padding: 15px;
  }

  :deep(.el-menu-vertical .el-menu-item) {
    padding-left: 16px !important;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 16px;
  }

  .header-content {
    padding: 0 12px;
  }

  .main-content {
    padding: 10px;
  }
}
</style>
