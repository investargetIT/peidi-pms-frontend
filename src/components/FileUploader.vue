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
        :data="{
          path: default_upload_url,
          create_parents: false
        }"
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
    <div v-if="loading" class="text-center py-4">
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
const loading = ref(false);
const sid = ref("");
const postUrl = ref("/api/upload");

// 内部文件列表
const fileList = ref([]);

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

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newVal => {
    if (newVal && Array.isArray(newVal)) {
      fileList.value = formatFileList(newVal);
    } else {
      fileList.value = [];
    }
  },
  { immediate: true, deep: true }
);

// 监听内部文件列表变化
watch(
  fileList,
  newVal => {
    const fileNames = getFileNames(newVal);
    emit("update:modelValue", fileNames);
    emit("change", fileNames);
  },
  { deep: true }
);

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

// 上传相关方法
const handleRemove = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(`确认删除该文件吗?`).then(
    () => true,
    () => false
  );
};

const handleChange = file => {
  console.log("handleChange called with file:", file);
  console.log("File status:", file.status);
  console.log("File response:", file.response);

  // 如果文件已经有响应（已上传），则不处理
  if (file.response) {
    console.log("File already has response, skipping");
    return;
  }

  // 如果文件状态不是ready，说明已经在上传过程中或已处理
  if (file.status !== "ready") {
    console.log("File status is not ready, current status:", file.status);
    return;
  }

  // 检查文件数量限制
  if (fileList.value.length >= props.maxCount) {
    ElMessage.warning(`最多只能上传 ${props.maxCount} 个文件`);
    return;
  }

  console.log("Processing file for upload:", file.name);

  try {
    const { name, type, size, lastModified } = file;

    // 生成唯一文件名，避免重名冲突
    const dotIndex = file.name.lastIndexOf(".");
    const fileNameWithoutExtension = file.name.slice(0, dotIndex);
    const fileExtension = file.name.slice(dotIndex);
    const timestamp = Date.now();
    let fileName = `${fileNameWithoutExtension}_${timestamp}${fileExtension}`;

    // 创建新的文件对象
    let f = new File([file.raw], fileName, {
      type: type,
      lastModified: lastModified
    });
    f.uid = file.uid;
    file.raw = f;

    // 更新文件状态
    file.status = "uploading";
    loading.value = true;

    console.log("Starting manual upload for:", file.raw.name);
    console.log("Original file size:", (size / 1024 / 1024).toFixed(2) + "MB");

    // 使用 nextTick 确保文件信息更新后再上传
    nextTick(() => {
      if (uploadRef.value) {
        uploadRef.value.submit();
      } else {
        console.error("Upload ref is not available");
        loading.value = false;
        ElMessage.error("上传组件未就绪，请重试");
      }
    });
  } catch (error) {
    console.error("Error processing file for upload:", error);
    loading.value = false;
    ElMessage.error("文件处理失败，请重试");
  }
};

const beforeUpload = file => {
  console.log("beforeUpload called for file:", file.name);
  console.log("File size:", (file.size / 1024 / 1024).toFixed(2) + "MB");

  // 基本文件检查
  if (!file) {
    ElMessage.error("文件不存在");
    return false;
  }

  if (!file.name) {
    ElMessage.error("文件名不能为空");
    return false;
  }

  console.log("File validation passed, proceeding with upload");
  return true;
};

const uploadSuccess = (res, file) => {
  loading.value = false;
  console.log("uploadSuccess called with response:", res);
  console.log("uploadSuccess called with file:", file);

  try {
    // 检查多种成功条件
    const isSuccess =
      res &&
      (res.success ||
        res.code === 200 ||
        (!res.error && !res.success === false));

    if (isSuccess) {
      // 上传成功，更新文件信息
      const fileIndex = fileList.value.findIndex(item => item.uid === file.uid);
      if (fileIndex !== -1) {
        fileList.value[fileIndex].realFileName = file.raw?.name || file.name;
        fileList.value[fileIndex].response = res;
        fileList.value[fileIndex].status = "success";
        fileList.value[fileIndex].url = res.url || res.data?.url || "";

        console.log("Updated file info:", fileList.value[fileIndex]);
      }

      const fileName = file.raw?.name || file.name;
      ElMessage.success(`文件 "${fileName}" 上传成功`);
      console.log("File uploaded successfully:", fileName);

      emit("upload-success", { file, response: res });
    } else {
      // 上传失败，但仍然有一些错误码可能表示部分成功
      const isPartialSuccess = res?.error?.code === 414;

      if (isPartialSuccess) {
        // 部分成功情况的处理
        const fileIndex = fileList.value.findIndex(
          item => item.uid === file.uid
        );
        if (fileIndex !== -1) {
          fileList.value[fileIndex].realFileName = file.raw?.name || file.name;
          fileList.value[fileIndex].response = res;
          fileList.value[fileIndex].status = "success";
        }

        const fileName = file.raw?.name || file.name;
        ElMessage.warning(`文件 "${fileName}" 上传完成（有警告）`);
        console.log("File uploaded with warning:", fileName, res);

        emit("upload-success", { file, response: res, warning: true });
      } else {
        // 完全失败
        const errorMessage =
          res?.error?.message || res?.msg || res?.message || "文件上传失败";
        ElMessage.error(errorMessage);
        console.error("File upload failed:", res);

        // 移除失败的文件
        const fileIndex = fileList.value.findIndex(
          item => item.uid === file.uid
        );
        if (fileIndex !== -1) {
          fileList.value.splice(fileIndex, 1);
        }

        emit("upload-error", { file, error: res });
      }
    }
  } catch (error) {
    console.error("Error in uploadSuccess:", error);
    ElMessage.error("处理上传结果时发生错误");
    emit("upload-error", { file, error });
  }
};

const handleError = (error, file) => {
  loading.value = false;
  console.error("Upload error:", error);
  console.error("Failed file:", file);

  // 移除失败的文件
  if (file) {
    const fileIndex = fileList.value.findIndex(item => item.uid === file.uid);
    if (fileIndex !== -1) {
      fileList.value.splice(fileIndex, 1);
    }
  }

  const fileName = file?.raw?.name || file?.name || "未知文件";
  const errorMessage = error?.message || error?.msg || "网络错误或服务器异常";

  ElMessage.error(`文件 "${fileName}" 上传失败: ${errorMessage}`);
  emit("upload-error", { file, error });
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
    fileList.value.splice(index, 1);
  }
};

const getFileNames = files => {
  if (!files || !Array.isArray(files)) {
    console.log("getFileNames: Invalid fileList", files);
    return [];
  }

  console.log("getFileNames: Processing fileList", files);

  return files
    .filter(item => {
      // 过滤成功上传的文件，包括多种成功条件
      const isSuccess =
        item.response?.success ||
        item.response?.code === 200 ||
        item.status === "success" ||
        item.response?.error?.code === 414;

      console.log("getFileNames: File filter result", {
        fileName: item.realFileName || item.raw?.name || item.name,
        isSuccess,
        response: item.response,
        status: item.status
      });

      return isSuccess;
    })
    .map(item => {
      // 提取文件名，优先使用 realFileName
      const fileName = item.realFileName || item.raw?.name || item.name;
      console.log("getFileNames: Extracted fileName", fileName);
      return fileName;
    })
    .filter(name => {
      // 过滤无效文件名
      const isValid =
        name &&
        typeof name === "string" &&
        name.trim() !== "" &&
        name !== "string";
      console.log("getFileNames: FileName validation", { name, isValid });
      return isValid;
    });
};

// 暴露方法给父组件
defineExpose({
  uploadRef,
  clearFiles: () => {
    fileList.value = [];
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
