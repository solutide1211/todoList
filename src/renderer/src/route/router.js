import { createMemoryHistory, createRouter } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import TodoListPage from '../components/TodoListPage.vue'
import AboutPage from '../components/AboutPage.vue'
import JsonPage from '../components/JsonPage.vue'
import TextDiffPage from '../components/TextDiffPage.vue'
import BaseConverter from '../components/BaseConverter.vue'
import TimestampConverter from '../components/TimestampConverter.vue'
import JwtParser from '../components/JwtParser.vue'
import Base64Tool from '../components/Base64Tool.vue'
import ColorPickerTool from '../components/ColorPickerTool.vue'
import CssFilterGradientTool from '../components/CssFilterGradientTool.vue'
import RegexTester from '../components/RegexTester.vue'
import CssThemeGenerator from '../components/CssThemeGenerator.vue'
import UrlParamEditor from '../components/UrlParamEditor.vue'
import CssAnimationGenerator from '../components/CssAnimationGenerator.vue'
import CurlConverter from '../components/CurlConverter.vue'
import ApiDocGenerator from '../components/ApiDocGenerator.vue'
import MockDataGenerator from '../components/MockDataGenerator.vue'
const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/createTodo', name: '/todos', component: TodoListPage },
  { path: '/json', name: '/json', component: JsonPage },
  { path: '/diff', name: '/diff', component: TextDiffPage },
  { path: '/converter', name: '/converter', component: BaseConverter },
  { path: '/TimestampConverter', name: '/TimestampConverter', component: TimestampConverter },
  { path: '/jwt', name: '/jwt', component: JwtParser },
  { path: '/base64', name: '/base64', component: Base64Tool },
  { path: '/ColorPickerTool', name: '/ColorPickerTool', component: ColorPickerTool },
  { path: '/CssFilter', name: 'CssFilter', component: CssFilterGradientTool },
  { path: '/RegexTester', name: 'RegexTester', component: RegexTester },
  { path: '/CssThemeGenerator', name: 'CssThemeGenerator', component: CssThemeGenerator },
  { path: '/UrlParamEditor', name: 'UrlParamEditor', component: UrlParamEditor },
  {
    path: '/CssAnimationGenerator',
    name: 'CssAnimationGenerator',
    component: CssAnimationGenerator
  },
  {
    path: '/CurlConverter',
    name: 'CurlConverter',
    component: CurlConverter
  },
  {
    path: '/ApiDocGenerator',
    name: 'ApiDocGenerator',
    component: ApiDocGenerator
  },
  { path: '/about', name: '/about', component: AboutPage },
  { path: '/MockDataGenerator', name: 'MockDataGenerator', component: MockDataGenerator }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
