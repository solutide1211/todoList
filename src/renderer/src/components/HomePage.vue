<template>
  <div class="home-page">
    <!-- 2. 日历组件：高度缩小，宽度占满 -->
    <el-calendar v-model="currentDate" class="custom-calendar"></el-calendar>

    <!-- 3. 添加按钮 -->
    <div class="add-section">
      <el-button type="primary" class="add-btn" @click="openDialog"> + 添加待办事项</el-button>
    </div>

    <!-- 4. 添加待办事项弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加待办事项"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="事项名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入待办事项" />
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="紧急程度" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择紧急程度" style="width: 100%">
            <el-option label="紧急" value="high" />
            <el-option label="中度紧急" value="medium" />
            <el-option label="轻度紧急" value="low" />
            <el-option label="默认" value="normal" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. 待办事项列表 -->
    <div class="task-list">
      <h3>待办事项</h3>
      <el-card v-for="task in tasks" :key="task.id" shadow="hover" class="task-item">
        <div class="task-header">
          <span class="task-name">{{ task.name }}</span>
          <el-tag :type="getPriorityType(task.priority)" size="small">
            {{ getPriorityLabel(task.priority) }}
          </el-tag>
        </div>
        <div class="task-time">开始时间：{{ formatTime(task.startTime) }}</div>
      </el-card>

      <div v-if="tasks.length === 0" class="empty">暂无待办事项</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

// 当前日历选中日期
const currentDate = ref(new Date())
console.log(currentDate.value)
// 弹窗控制
const dialogVisible = ref(false)

// 表单数据
const form = reactive({
  name: '',
  startTime: '',
  priority: 'normal' // 默认值
})

// 表单验证
const rules = {
  name: [{ required: true, message: '请输入事项名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  priority: [{ required: true, message: '请选择紧急程度', trigger: 'change' }]
}

// 表单实例
const formRef = ref(null)

// 待办事项列表
const tasks = ref([])

// 默认时间：当前时间 + 1 小时
const defaultTime = () => {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  return now
}

// 打开弹窗
const openDialog = () => {
  form.name = ''
  form.startTime = defaultTime()
  form.priority = 'normal'
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const newTask = {
        id: Date.now(),
        name: form.name,
        startTime: form.startTime,
        priority: form.priority
      }
      tasks.value.push(newTask)
      dialogVisible.value = false
      ElNotification({
        title: '成功',
        message: `已添加 "${form.name}"`,
        type: 'success'
      })
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

// 格式化时间显示
const formatTime = (timeStr) => {
  return timeStr?.replace('T', ' ').replace(/\.\d+Z?$/, '') || ''
}

// 紧急程度标签类型
const getPriorityType = (priority) => {
  return { high: 'danger', medium: 'warning', low: 'info', normal: 'primary' }[priority] || 'info'
}

// 紧急程度文字
const getPriorityLabel = (priority) => {
  return { high: '紧急', medium: '中度紧急', low: '轻度紧急', normal: '默认' }[priority]
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.page-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

/* 日历样式：高度缩小，宽度占满 */
.custom-calendar {
  width: 100%;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.custom-calendar .el-calendar__header) {
  padding: 10px;
  background-color: #f5f5f5;
}

:deep(.custom-calendar .el-calendar__body) {
  padding: 8px;
}

:deep(.custom-calendar .el-calendar-day) {
  height: 36px;
  line-height: 36px;
  padding: 2px 0;
  font-size: 13px;
}

:deep(.custom-calendar .el-calendar-table thead th) {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  padding: 4px 0;
}

/* 日期单元格自定义 */
.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.day {
  font-size: 13px;
  font-weight: 500;
}

.task-badge {
  font-size: 10px;
  color: white;
  background: #ff4d4f;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

/* 添加按钮 */
.add-section {
  padding: 10px 0;
}

.add-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  letter-spacing: 1px;
}

/* 任务列表 */
.task-list {
  flex: 1;
}

.task-item {
  margin-bottom: 10px;
  border-left: 4px solid #409eff;
  transition: box-shadow 0.2s;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-name {
  font-weight: 500;
  font-size: 15px;
  color: #333;
}

.task-time {
  font-size: 13px;
  color: #666;
}

.empty {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px 0;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
  padding-top: 10px;
}
</style>
