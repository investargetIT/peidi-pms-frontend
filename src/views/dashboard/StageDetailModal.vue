<template>
  <el-dialog
    v-model="dialogVisible"
    :title="stage?.stateName"
    width="800px"
    :before-close="handleClose"
    class="stage-detail-modal"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-xl font-medium">{{ stage?.stateName }}</span>
        <div class="flex items-center gap-2">
          <el-button v-if="!isEditing" size="small" @click="startEdit">
            编辑
          </el-button>
          <template v-else>
            <el-button size="small" @click="cancelEdit">
              <el-icon><Close /></el-icon>
            </el-button>
            <el-button type="primary" size="small" @click="handleSave">
              <el-icon><Check /></el-icon>
              保存
            </el-button>
          </template>
        </div>
      </div>
    </template>

    <div v-if="editedStage" class="space-y-6">
      <!-- 基本信息 -->
      <div>
        <el-form-item label="状态">
          <el-select
            v-if="isEditing"
            v-model="editedStage.status"
            placeholder="选择状态"
            style="width: 200px"
          >
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="延期" value="delayed" />
          </el-select>
          <el-tag v-else :type="getStatusType(stage?.status)" size="default">
            {{ getStatusText(stage?.status) }}
          </el-tag>
        </el-form-item>
      </div>

      <!-- 时间信息 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <el-form-item label="截止日期">
            <el-date-picker
              v-if="isEditing"
              v-model="editedStage.deadlineDate"
              type="date"
              placeholder="选择截止日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
            <div v-else class="flex items-center gap-2">
              <el-icon class="text-gray-400"><Calendar /></el-icon>
              <span class="text-sm">{{ stage?.deadlineDate || "未设置" }}</span>
            </div>
          </el-form-item>
        </div>

        <div v-if="stage?.finishDate">
          <el-form-item label="完成日期">
            <div class="flex items-center gap-2">
              <el-icon class="text-green-500"><Calendar /></el-icon>
              <span class="text-sm">{{ stage.finishDate }}</span>
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 负责人 -->
      <div>
        <el-form-item label="负责人">
          <div v-if="isEditing" class="assignee-editor">
            <div class="flex flex-wrap gap-2 mb-2">
              <el-tag
                v-for="assignee in editedStage.chargeDingUser"
                :key="assignee.dingId"
                closable
                @close="removeAssignee(assignee.dingId)"
                class="assignee-tag"
              >
                <div class="flex items-center gap-1">
                  <el-avatar
                    :size="20"
                    :src="assignee.avatarUrl"
                    class="text-xs"
                  >
                    {{ assignee.userName.charAt(0) }}
                  </el-avatar>
                  {{ assignee.userName }}
                </div>
              </el-tag>
            </div>
            <el-popover placement="bottom-start" :width="300" trigger="click">
              <template #reference>
                <el-button size="small" type="primary" plain>
                  <el-icon><Plus /></el-icon>
                  添加负责人
                </el-button>
              </template>
              <div class="assignee-selector">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索人员..."
                  size="small"
                  class="mb-2"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-for="user in filteredUsers"
                    :key="user.id"
                    class="user-option flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    @click="addAssignee(user)"
                  >
                    <el-avatar :size="24" class="text-xs">
                      {{ user.name.charAt(0) }}
                    </el-avatar>
                    <div class="flex-1">
                      <p class="text-sm font-medium">{{ user.name }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
          <div v-else class="assignee-display">
            <div
              v-if="stage?.chargeDingUser && stage.chargeDingUser.length > 0"
              class="flex flex-wrap gap-2"
            >
              <el-tag
                v-for="assignee in stage.chargeDingUser"
                :key="assignee.dingId"
                class="assignee-tag"
              >
                <div class="flex items-center gap-1">
                  <el-avatar
                    :size="20"
                    :src="assignee.avatarUrl"
                    class="text-xs"
                  >
                    {{ assignee.userName.charAt(0) }}
                  </el-avatar>
                  {{ assignee.userName }}
                </div>
              </el-tag>
            </div>
            <span v-else class="text-gray-500 text-sm">暂无负责人</span>
            <div class="mt-2 text-xs text-gray-500">
              点击编辑按钮可修改负责人
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- 附件 -->
      <div>
        <el-form-item>
          <template #label>
            <div class="flex items-center justify-between w-full">
              <span>附件</span>
              <el-button
                v-if="isEditing"
                size="small"
                type="primary"
                plain
                @click="triggerFileUpload"
              >
                <el-icon><Upload /></el-icon>
                上传文件
              </el-button>
            </div>
          </template>

          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="*/*"
            style="display: none"
            @change="handleFileUpload"
          />

          <div class="space-y-2">
            <div
              v-if="
                editedStage.attachments &&
                editedStage.attachments.length > 0 &&
                editedStage.attachments[0] !== 'string'
              "
              class="space-y-2"
            >
              <div
                v-for="(attachment, index) in editedStage.attachments"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div class="flex items-center gap-3">
                  <el-icon class="text-gray-400"><Document /></el-icon>
                  <div>
                    <div class="font-medium text-sm">
                      {{ getFileName(attachment) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ getFileSize(attachment) }} · {{ getCurrentDate() }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <el-button
                    size="small"
                    text
                    @click="downloadAttachment(attachment)"
                  >
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <el-button
                    v-if="isEditing"
                    size="small"
                    text
                    type="danger"
                    @click="removeAttachment(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              <el-icon class="text-4xl mb-2 opacity-50"><Document /></el-icon>
              <p class="text-sm">暂无附件</p>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- 备注 -->
      <div>
        <el-form-item label="备注">
          <el-input
            v-if="isEditing"
            v-model="editedStage.remark"
            type="textarea"
            :rows="3"
            placeholder="添加备注信息..."
          />
          <div v-else class="p-3 bg-gray-50 rounded min-h-20">
            <p v-if="stage?.remark" class="text-sm">{{ stage.remark }}</p>
            <p v-else class="text-sm text-gray-500">暂无备注</p>
          </div>
        </el-form-item>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import {
  Close,
  Check,
  Calendar,
  Plus,
  Search,
  Upload,
  Download,
  Delete,
  Document
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  stage: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:visible", "save"]);

// 响应式数据
const dialogVisible = ref(false);
const isEditing = ref(false);
const editedStage = ref(null);
const searchKeyword = ref("");
const fileInputRef = ref(null);

// 模拟用户数据
const mockUsers = ref([
  { id: "u1", name: "张三", email: "zhang@company.com" },
  { id: "u2", name: "李四", email: "li@company.com" },
  { id: "u3", name: "王五", email: "wang@company.com" },
  { id: "u4", name: "赵六", email: "zhao@company.com" }
]);

// 监听visible变化
watch(
  () => props.visible,
  newVal => {
    dialogVisible.value = newVal;
    if (newVal && props.stage) {
      editedStage.value = JSON.parse(JSON.stringify(props.stage));
      isEditing.value = false;
    }
  }
);

watch(dialogVisible, newVal => {
  if (!newVal) {
    emit("update:visible", false);
    isEditing.value = false;
  }
});

// 计算属性
const filteredUsers = computed(() => {
  const assignedIds =
    editedStage.value?.chargeDingUser?.map(a => a.dingId) || [];
  return mockUsers.value.filter(
    user =>
      !assignedIds.includes(user.id) &&
      user.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 方法
const getStatusType = status => {
  switch (status) {
    case "completed":
      return "success";
    case "in-progress":
      return "primary";
    case "delayed":
      return "danger";
    default:
      return "info";
  }
};

const getStatusText = status => {
  switch (status) {
    case "completed":
      return "已完成";
    case "in-progress":
      return "进行中";
    case "delayed":
      return "延期";
    default:
      return "待开始";
  }
};

const startEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editedStage.value = JSON.parse(JSON.stringify(props.stage));
};

const handleSave = () => {
  // 确保传递正确的数据结构
  const stageData = {
    ...editedStage.value,
    // 确保ID字段正确
    stageId: editedStage.value.stageId
  };
  emit("save", stageData);
  isEditing.value = false;
  ElMessage.success("保存成功");
};

const handleClose = () => {
  if (isEditing.value) {
    ElMessage.warning("请先保存或取消编辑");
    return false;
  }
  dialogVisible.value = false;
};

const addAssignee = user => {
  if (!editedStage.value.chargeDingUser) {
    editedStage.value.chargeDingUser = [];
  }
  editedStage.value.chargeDingUser.push({
    dingId: user.id,
    userName: user.name,
    avatarUrl: ""
  });
  searchKeyword.value = "";
};

const removeAssignee = dingId => {
  editedStage.value.chargeDingUser = editedStage.value.chargeDingUser.filter(
    a => a.dingId !== dingId
  );
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = event => {
  const files = event.target.files;
  if (files && files.length > 0) {
    if (!editedStage.value.attachments) {
      editedStage.value.attachments = [];
    }

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      editedStage.value.attachments.push(url);
    });

    // 重置input
    event.target.value = "";
    ElMessage.success(`已添加 ${files.length} 个文件`);
  }
};

const removeAttachment = index => {
  editedStage.value.attachments.splice(index, 1);
};

const downloadAttachment = url => {
  if (url && url !== "string") {
    window.open(url, "_blank");
  }
};

const getFileName = url => {
  if (!url || url === "string") return "附件文件";
  const parts = url.split("/");
  return parts[parts.length - 1] || "附件文件";
};

const getFileSize = url => {
  // 模拟文件大小
  return "1.2MB";
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString("zh-CN");
};
</script>

<style scoped>
.stage-detail-modal :deep(.el-dialog__header) {
  padding: 20px 20px 0;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.assignee-tag {
  background-color: #e6f4ff;
  border-color: #91caff;
}

.user-option:hover {
  background-color: #f5f5f5;
}

.assignee-display {
  min-height: 40px;
}

.min-h-20 {
  min-height: 5rem;
}
</style>
