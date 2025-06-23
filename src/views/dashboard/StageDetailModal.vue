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
        <!-- 附件标题和上传按钮 -->
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-gray-900">附件</span>
          <el-upload
            v-if="isEditing"
            ref="uploadRef"
            v-model:file-list="editedStage.fileUrlList"
            class="upload-demo"
            :action="postUrl"
            :data="{
              path: default_upload_url,
              create_parents: false
            }"
            :before-remove="handleRemove"
            :with-credentials="false"
            :accept="'*'"
            :on-change="handleChange"
            :on-error="handleError"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess"
            :auto-upload="true"
            :on-preview="handlePreview"
            list-type="text"
            :show-file-list="false"
          >
            <el-button size="small" type="primary" plain>选择文件</el-button>
          </el-upload>
        </div>

        <!-- 附件列表 -->
        <div class="space-y-2">
          <div
            v-if="editedStage.fileUrlList && editedStage.fileUrlList.length > 0"
            class="space-y-2"
          >
            <div
              v-for="(attachment, index) in editedStage.fileUrlList"
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
import { ElLoading, ElMessageBox, ElMessage } from "element-plus";
import PersonSelector from "@/components/PersonSelector.vue";
import {
  testAllIPs,
  default_upload_url,
  chaohuiDownload
} from "@/utils/chaohuiapi";
import { message } from "@/utils/message";

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
const searchKeyword = ref("");
const fileInputRef = ref(null);
const uploadRef = ref(null);
const loading = ref(false);
const sid = ref("");
const postUrl = ref("/api/upload"); // 设置默认值，避免按钮不显示

testAllIPs()
  .then(res => {
    if (res.sid) {
      sid.value = res.sid;
      postUrl.value = res.postUrl;
      console.log("Upload URL initialized:", postUrl.value);
    }
  })
  .catch(err => {
    console.error("Failed to initialize upload URL:", err);
    // 设置一个默认的上传URL，避免空值导致按钮不显示
    postUrl.value = "/api/upload";
  });

const handleRemove = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(`确认删除该文件吗?`).then(
    () => true,
    () => false
  );
};

const handleChange = file => {
  console.log("hhhhhh", JSON.stringify(file));
  if (file.response) {
    return;
  }
  const { name, type, size, lastModified } = file;
  const dotIndex = file.name.lastIndexOf(".");
  const fileNameWithoutExtension = file.name.slice(0, dotIndex);
  const fileExtension = file.name.slice(dotIndex);
  let fileName = `${fileNameWithoutExtension}_${Date.now()}${fileExtension}`; // 如果可以上传多个文件，这里需要用fileList.forEach()处理
  let f = new File([file.raw], fileName, {
    type: type,
    lastModified: lastModified
  });
  f.uid = file.uid; // new File 没有uid属性，会导致组件底层报错，这里手动加上
  file.raw = f; // 用f替换file的数据
  uploadRef.value.submit();
  loading.value = true;
  console.log(file.raw);
};

const handleError = () => {
  loading.value = false;
  message("上传失败", { type: "error" });
};

const beforeUpload = file => {
  console.log("123");

  // const { name } = file;
  // const dotIndex = name.lastIndexOf('.');
  // const fileNameWithoutExtension = name.slice(0, dotIndex);
  // const fileExtension = name.slice(dotIndex);
  // console.log('1234');

  // const newFileName = `${fileNameWithoutExtension}_${Date.now()}${fileExtension}`;
  // console.log('1111', newFileName, file.name);
  // uploadFile
  return true;
};

const uploadSuccess = res => {
  loading.value = false;
  console.log("uploadSuccess", res, editedStage.value.fileUrlList);
  if (editedStage.value.fileUrlList) {
    editedStage.value.fileUrlList.map(item => {
      if (item.raw) {
        item.realFileName = item.raw.name;
      }
    });
  }
  const { success, error } = res;
};

const handlePreview = file => {
  console.log("preview file:", file);
  const fileName = file.realFileName || file.raw?.name || file.name;
  if (fileName) {
    chaohuiDownload(fileName);
  }
};

// 监听visible变化
watch(
  () => props.visible,
  newVal => {
    console.log("StageDetailModal visible changed:", newVal);
    console.log("props.stage:", props.stage);
    dialogVisible.value = newVal;
    if (newVal && props.stage) {
      editedStage.value = JSON.parse(JSON.stringify(props.stage));

      // 格式化fileUrlList为el-upload兼容的格式
      if (
        editedStage.value.fileUrlList &&
        Array.isArray(editedStage.value.fileUrlList)
      ) {
        editedStage.value.fileUrlList = editedStage.value.fileUrlList.map(
          (item, index) => {
            if (typeof item === "string") {
              return {
                name: item,
                url: item,
                status: "success",
                uid: Date.now() + index,
                response: { success: true }
              };
            } else if (item && typeof item === "object") {
              return {
                ...item,
                status: item.status || "success",
                uid: item.uid || Date.now() + index,
                response: item.response || { success: true }
              };
            }
            return item;
          }
        );
      } else {
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
  console.log("postUrl:", postUrl.value);
};

const cancelEdit = () => {
  isEditing.value = false;
  editedStage.value = JSON.parse(JSON.stringify(props.stage));
};

const getFileNames = fileList => {
  if (!fileList || !Array.isArray(fileList)) return [];

  return fileList
    .filter(item => {
      // 过滤成功上传的文件
      return item.response?.success || item.status === "success";
    })
    .map(item => {
      // 提取文件名
      return item.realFileName || item.raw?.name || item.name;
    })
    .filter(name => name && name !== "string"); // 过滤无效文件名
};

const handleSave = () => {
  // 确保传递正确的数据结构
  const stageData = {
    ...editedStage.value,
    // 确保ID字段正确
    stageId: editedStage.value.stageId,
    // 处理fileUrlList数据
    fileUrlList: getFileNames(editedStage.value.fileUrlList)
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

const handleAssigneesChange = assignees => {
  console.log("负责人变更:", assignees);
  editedStage.value.chargeIds = assignees;
};

const removeAttachment = index => {
  if (editedStage.value.fileUrlList) {
    editedStage.value.fileUrlList.splice(index, 1);
  }
};

const downloadAttachment = attachment => {
  const fileName =
    attachment.realFileName ||
    attachment.raw?.name ||
    attachment.name ||
    attachment;
  if (fileName && fileName !== "string") {
    chaohuiDownload(fileName);
  }
};

const getFileName = attachment => {
  if (typeof attachment === "string") {
    if (attachment === "string") return "附件文件";
    const parts = attachment.split("/");
    return parts[parts.length - 1] || "附件文件";
  }

  if (attachment && typeof attachment === "object") {
    return (
      attachment.realFileName ||
      attachment.raw?.name ||
      attachment.name ||
      "附件文件"
    );
  }

  return "附件文件";
};

const getFileSize = url => {
  // 模拟文件大小
  return "1.2MB";
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString("zh-CN");
};

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

.upload-demo {
  display: inline-block;
}

.upload-demo :deep(.el-upload) {
  display: inline-block;
}

.upload-demo :deep(.el-upload .el-button) {
  display: inline-block !important;
  visibility: visible !important;
}
</style>
