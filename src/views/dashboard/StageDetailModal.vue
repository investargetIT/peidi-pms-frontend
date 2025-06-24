<template>
  <el-dialog
    v-model="dialogVisible"
    :title="props.stage?.stageName"
    width="800px"
    :before-close="handleClose"
    class="stage-detail-modal"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="text-xl font-medium">{{ props.stage?.statusName }}</span>
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
            v-model="editedStage.statusId"
            placeholder="选择状态"
            style="width: 200px"
          >
            <el-option
              v-for="item in stageStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-tag
            v-else
            :type="getStatusType(props.stage?.statusName)"
            size="default"
          >
            {{ getStatusText(props.stage?.statusName) }}
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
              <span class="text-sm">{{
                props.stage?.deadlineDate || "未设置"
              }}</span>
            </div>
          </el-form-item>
        </div>

        <div v-if="shouldShowFinishDate">
          <el-form-item label="完成日期">
            <div class="flex items-center gap-2">
              <el-icon class="text-green-500"><Calendar /></el-icon>
              <span class="text-sm">{{ displayFinishDate }}</span>
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 负责人 -->
      <div>
        <PersonSelector
          label="负责人"
          :model-value="editedStage.chargeIds || []"
          @update:model-value="handleAssigneesChange"
          :readonly="!isEditing"
          :show-avatar="true"
          size="default"
          data-format="system"
          class="stage-person-selector"
        />
      </div>

      <!-- 附件 -->
      <div>
        <FileUploader
          v-model="editedStage.fileUrlList"
          label="附件"
          :readonly="!isEditing"
          :disabled="loading"
          button-text="选择文件"
          empty-text="暂无附件"
          accept="*"
          :max-count="10"
          @upload-success="handleFileUploadSuccess"
          @upload-error="handleFileUploadError"
          @change="handleFileListChange"
        />
      </div>

      <!-- 备注 -->
      <div>
        <!-- 备注标题 -->
        <div class="mb-4">
          <span class="text-sm font-medium text-gray-900">备注</span>
        </div>

        <!-- 备注内容 -->
        <div v-if="isEditing">
          <el-input
            v-model="editedStage.remark"
            type="textarea"
            :rows="3"
            placeholder="添加备注信息..."
            style="width: 100%"
          />
        </div>
        <div v-else class="w-full">
          <div v-if="displayRemark" class="p-3 bg-gray-50 rounded w-full">
            <p class="text-sm text-gray-900 whitespace-pre-wrap">
              {{ displayRemark }}
            </p>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">暂无备注</p>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { Close, Check, Calendar } from "@element-plus/icons-vue";
import { ElLoading, ElMessageBox, ElMessage } from "element-plus";
import PersonSelector from "@/components/PersonSelector.vue";
import FileUploader from "@/components/FileUploader.vue";

const props = defineProps({
  stage: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  stageStatusList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:visible", "save"]);

// 响应式数据
const dialogVisible = ref(false);
const isEditing = ref(false);
const editedStage = ref(null);
const loading = ref(false);

// 监听visible变化
watch(
  () => props.visible,
  newVal => {
    console.log("StageDetailModal visible changed:", newVal);
    console.log("props.stage:", props.stage);
    dialogVisible.value = newVal;
    if (newVal && props.stage) {
      editedStage.value = JSON.parse(JSON.stringify(props.stage));
      // 默认状态为待开始
      editedStage.value.statusId = props.stage.statusId ?? 115;

      // 转换为 system 格式 {dingId, userName, avatarUrl}
      editedStage.value.chargeIds =
        props.stage?.chargeDingUser?.map(item => ({
          dingId: item?.dingId,
          userName: item?.userName,
          avatarUrl: item?.avatarUrl || ""
        })) || [];

      // 确保 fileUrlList 是数组
      if (!Array.isArray(editedStage.value.fileUrlList)) {
        editedStage.value.fileUrlList = [];
      }

      isEditing.value = false;
      console.log("editedStage set to:", editedStage.value);
    }
  },
  { immediate: true }
);

watch(dialogVisible, newVal => {
  console.log("dialogVisible changed:", newVal);
  if (!newVal) {
    emit("update:visible", false);
    isEditing.value = false;
  }
});

// 监听statusId变化，当为117时设置完成日期
watch(
  () => editedStage.value?.statusId,
  newStatusId => {
    if (newStatusId === 117) {
      // 设置完成日期为当前时间
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD格式
      if (editedStage.value) {
        editedStage.value.finishDate = currentDate;
      }
    } else {
      // 如果不是117，清除完成日期
      if (editedStage.value) {
        editedStage.value.finishDate = null;
      }
    }
  }
);

// 方法
const getStatusType = statusName => {
  switch (statusName) {
    case "已完成":
      return "success";
    case "进行中":
      return "primary";
    case "延期":
      return "danger";
    case "待开始":
    default:
      return "info";
  }
};

const getStatusText = statusName => {
  return statusName || "待开始";
};

const startEdit = () => {
  isEditing.value = true;
  console.log("Started editing mode, isEditing:", isEditing.value);
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
};

const handleClose = () => {
  if (isEditing.value) {
    ElMessage.warning("请先保存或取消编辑");
    return false;
  }
  dialogVisible.value = false;
};

const handleAssigneesChange = assignees => {
  console.log("负责人变更:", assignees);
  // assignees 已经是 system 格式 {dingId, userName, avatarUrl}
  editedStage.value.chargeIds = assignees;
};

// 文件上传相关方法
const handleFileUploadSuccess = ({ file, response, warning }) => {
  console.log("File upload success:", file, response);
  if (warning) {
    console.log("Upload completed with warning");
  }
};

const handleFileUploadError = ({ file, error }) => {
  console.error("File upload error:", file, error);
};

const handleFileListChange = fileNames => {
  console.log("File list changed:", fileNames);
  if (editedStage.value) {
    editedStage.value.fileUrlList = fileNames;
  }
};

// 计算属性
const shouldShowFinishDate = computed(() => {
  // 在编辑模式下检查editedStage，否则检查props.stage
  const currentStage = isEditing.value ? editedStage.value : props.stage;
  return currentStage?.statusId === 117;
});

const displayFinishDate = computed(() => {
  // 在编辑模式下检查editedStage，否则检查props.stage
  const currentStage = isEditing.value ? editedStage.value : props.stage;
  return currentStage?.finishDate || "未设置";
});

const displayRemark = computed(() => {
  // 在编辑模式下检查editedStage，否则检查props.stage
  const currentStage = isEditing.value ? editedStage.value : props.stage;
  const remark = currentStage?.remark;

  // 确保remark是字符串类型且不为空
  if (remark && typeof remark === "string" && remark.trim() !== "") {
    return remark.trim();
  }

  return "";
});
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

.stage-person-selector :deep(.person-selector-container) {
  width: 100%;
}
</style>
