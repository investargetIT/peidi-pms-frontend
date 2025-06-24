<template>
  <div class="file-uploader">
    <!-- 上传按钮 -->
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm font-medium text-gray-900">{{ label }}</span>
      <el-upload
        v-if="!readonly"
        ref="uploadRef"
        v-model:file-list="fileList"
        class="upload-demo"
        :action="postUrl"
        :data="getUploadData"
        :before-remove="handleRemove"
        :with-credentials="false"
        :accept="accept"
        :on-change="handleChange"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :on-success="uploadSuccess"
        :auto-upload="false"
        :on-preview="handlePreview"
        list-type="text"
        :show-file-list="false"
        :disabled="disabled"
      >
        <el-button size="small" type="primary" plain :disabled="disabled">
          {{ buttonText }}
        </el-button>
      </el-upload>
    </div>

    <!-- 文件列表 -->
    <div class="space-y-2">
      <div v-if="fileList && fileList.length > 0" class="space-y-2">
        <div
          v-for="(file, index) in fileList"
          :key="file.uid || index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded"
        >
          <div class="flex items-center gap-3">
            <el-icon class="text-gray-400"><Document /></el-icon>
            <div>
              <div class="font-medium text-sm">
                {{ getFileName(file) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ getFileSize(file) }} · {{ getFileDate(file) }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <el-button
              size="small"
              text
              @click="downloadFile(file)"
              :disabled="!canDownload(file)"
            >
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button
              v-if="!readonly"
              size="small"
              text
              type="danger"
              @click="removeFile(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        <el-icon class="text-4xl mb-2 opacity-50"><Document /></el-icon>
        <p class="text-sm">{{ emptyText }}</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="hasUploadingFiles" class="text-center py-4">
      <el-icon class="animate-spin text-blue-500"><Loading /></el-icon>
      <span class="ml-2 text-sm text-gray-600">上传中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { Document, Download, Delete, Loading } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  testAllIPs,
  default_upload_url,
  chaohuiDownload
} from "@/utils/chaohuiapi";

const props = defineProps({
  // v-model 支持
  modelValue: {
    type: Array,
    default: () => []
  },
  // 组件标签
  label: {
    type: String,
    default: "附件"
  },
  // 只读模式
  readonly: {
    type: Boolean,
    default: false
  },
  // 禁用状态
  disabled: {
    type: Boolean,
    default: false
  },
  // 按钮文字
  buttonText: {
    type: String,
    default: "选择文件"
  },
  // 空状态文字
  emptyText: {
    type: String,
    default: "暂无附件"
  },
  // 接受的文件类型
  accept: {
    type: String,
    default: "*"
  },
  // 最大文件数量
  maxCount: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits([
  "update:modelValue",
  "change",
  "upload-success",
  "upload-error"
]);

// 响应式数据
const uploadRef = ref(null);
const sid = ref("");
const postUrl = ref("/api/upload");
const isUploading = ref(false);

// 内部文件列表
const fileList = ref([]);

// 上传数据函数
const getUploadData = {
  path: default_upload_url,
  create_parents: false
};

// 计算属性：检查是否有正在上传的文件
const hasUploadingFiles = computed(() => {
  // 优先使用简单的状态追踪
  if (isUploading.value) {
    return true;
  }

  // 检查 el-upload 组件的文件列表
  if (uploadRef.value && uploadRef.value.uploadFiles) {
    return uploadRef.value.uploadFiles.some(
      file => file.status === "uploading"
    );
  }

  // 备用检查我们自己的文件列表
  return fileList.value.some(file => file.status === "uploading");
});

// 初始化上传服务
onMounted(() => {
  initUploadService();
});

const initUploadService = async () => {
  try {
    const res = await testAllIPs();
    if (res.sid) {
      sid.value = res.sid;
      postUrl.value = res.postUrl;
      console.log("Upload URL initialized:", postUrl.value);
    }
  } catch (err) {
    console.error("Failed to initialize upload URL:", err);
    postUrl.value = "/api/upload";
  }
};

// 格式化文件列表为 el-upload 兼容格式
const formatFileList = files => {
  if (!Array.isArray(files)) return [];

  return files.map((item, index) => {
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
  });
};

// 用于防止递归更新的标志
let isInternalUpdate = false;

// 监听 modelValue 变化，同步到内部文件列表
watch(
  () => props.modelValue,
  newVal => {
    // 如果是内部更新触发的，跳过
    if (isInternalUpdate) return;

    const formattedList =
      newVal && Array.isArray(newVal) ? formatFileList(newVal) : [];
    fileList.value = formattedList;
    console.log("FileUploader: Updated from parent modelValue:", newVal);
  },
  { immediate: true }
);

// 内部方法：更新文件列表并通知父组件
const updateFileList = newFileList => {
  fileList.value = newFileList;
  const fileNames = getFileNames(newFileList);

  // 设置标志防止递归更新
  isInternalUpdate = true;
  emit("update:modelValue", fileNames);
  emit("change", fileNames);

  // 在下一个 tick 重置标志
  nextTick(() => {
    isInternalUpdate = false;
  });
};

// 上传相关方法
const handleRemove = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(`确认删除该文件吗?`).then(
    () => true,
    () => false
  );
};

const handleChange = file => {
  console.log("handleChange called with file:", file);

  if (file.response) {
    return;
  }

  // 检查文件数量限制
  if (fileList.value.length >= props.maxCount) {
    ElMessage.warning(`最多只能上传 ${props.maxCount} 个文件`);
    return;
  }

  const { name, type, size, lastModified } = file;
  const dotIndex = file.name.lastIndexOf(".");
  const fileNameWithoutExtension = file.name.slice(0, dotIndex);
  const fileExtension = file.name.slice(dotIndex);
  let fileName = `${fileNameWithoutExtension}_${Date.now()}${fileExtension}`;

  let f = new File([file.raw], fileName, {
    type: type,
    lastModified: lastModified
  });
  f.uid = file.uid;
  file.raw = f;

  uploadRef.value.submit();
  isUploading.value = true;

  console.log(file.raw);
};

const beforeUpload = file => {
  console.log("beforeUpload called for file:", file.name);
  return true;
};

const uploadSuccess = res => {
  isUploading.value = false;
  console.log("uploadSuccess", res, fileList.value);

  // 更新文件的 realFileName 和 response
  fileList.value.map(item => {
    if (item.raw && item.raw.name) {
      item.realFileName = item.raw.name;
      item.response = res;
    }
  });

  // 更新文件列表并通知父组件
  updateFileList([...fileList.value]);

  const { success, error } = res;
};

const handleError = () => {
  ElMessage.error("上传失败");
};

const handlePreview = file => {
  console.log("preview file:", file);
  downloadFile(file);
};

// 工具方法
const getFileName = file => {
  if (typeof file === "string") {
    if (file === "string") return "附件文件";
    const parts = file.split("/");
    return parts[parts.length - 1] || "附件文件";
  }

  if (file && typeof file === "object") {
    return file.realFileName || file.raw?.name || file.name || "附件文件";
  }

  return "附件文件";
};

const getFileSize = file => {
  if (file && file.raw && file.raw.size) {
    const size = file.raw.size;
    if (size < 1024) {
      return size + "B";
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + "KB";
    } else {
      return (size / (1024 * 1024)).toFixed(1) + "MB";
    }
  }
  return "未知大小";
};

const getFileDate = file => {
  if (file && file.raw && file.raw.lastModified) {
    return new Date(file.raw.lastModified).toLocaleDateString("zh-CN");
  }
  return new Date().toLocaleDateString("zh-CN");
};

const canDownload = file => {
  return file && (file.url || file.realFileName || file.raw?.name || file.name);
};

const downloadFile = file => {
  const fileName = file.realFileName || file.raw?.name || file.name || file;
  if (fileName && fileName !== "string") {
    chaohuiDownload(fileName);
  }
};

const removeFile = index => {
  if (fileList.value && fileList.value[index]) {
    const updatedList = [...fileList.value];
    updatedList.splice(index, 1);
    updateFileList(updatedList);
  }
};

const getFileNames = arr => {
  let names = [];
  arr.map(item => {
    if (item.response?.success) {
      names.push(item.raw?.name || item.realFileName || item.name);
    }
    if (!item.response?.success && item.response?.error?.code == 414) {
      names.push(item.raw?.name || item.realFileName || item.name);
    }
  });
  return names;
};

// 暴露方法给父组件
defineExpose({
  uploadRef,
  clearFiles: () => {
    updateFileList([]);
  },
  getFileNames: () => getFileNames(fileList.value)
});
</script>

<style scoped>
.space-y-2 > * + * {
  margin-top: 0.5rem;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
