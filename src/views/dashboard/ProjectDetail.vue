<template>
  <div class="right-panel w-96">
    <el-card class="project-detail-card">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">项目详情</span>
        </div>
      </template>

      <div v-if="!selectedProject" class="empty-state text-center py-12">
        <el-icon class="text-6xl text-gray-300 mb-4">
          <View />
        </el-icon>
        <p class="text-gray-500 text-sm">选择一个产品查看详细信息</p>
      </div>

      <div v-else class="project-info space-y-4">
        <!-- 产品基本信息 -->
        <div class="product-header">
          <h3 class="font-medium text-gray-900 text-base mb-1">
            {{ selectedProject.productName }}
          </h3>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">{{ selectedProject.brandName }}</p>
            <div
              :class="getPriorityColor(selectedProject.priorityName)"
              class="priority-badge"
            >
              <div class="flex items-center">
                <component
                  :is="getPriorityIcon(selectedProject.priorityName)"
                  class="w-3 h-3 mr-1"
                />
                {{ selectedProject.priorityName }}
              </div>
            </div>
          </div>
        </div>

        <!-- 整体进度 -->
        <div class="progress-section">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">整体进度</span>
            <span class="font-medium">{{ selectedProject.progress }}%</span>
          </div>
          <el-progress
            :percentage="selectedProject.progress"
            :stroke-width="8"
            :show-text="false"
          />
        </div>

        <!-- 阶段进度 -->
        <div class="stages-section">
          <h4 class="font-medium text-gray-900 mb-3">阶段进度</h4>
          <div class="space-y-2">
            <div
              v-for="stage in displayStages"
              :key="stage.stageId"
              class="stage-item p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="openStageDetail(stage)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">{{ stage.stageName }}</span>
                <div
                  :class="getStatusColor(stage.statusName)"
                  class="status-badge"
                >
                  {{ stage.statusName }}
                </div>
              </div>

              <!-- 负责人区域 -->
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-1 flex-1" @click.stop>
                  <PersonSelector
                    label="负责人"
                    :model-value="stage.chargeDingUser || []"
                    @auto-save="handleAutoSaveStageAssignees"
                    :max-count="5"
                    :show-avatar="true"
                    size="small"
                    data-format="system"
                    display-mode="tag"
                    :auto-save="true"
                    :save-params="{
                      infoId: selectedProject.id,
                      stageId: stage.stageId,
                      statusId: stage.statusId,
                      deadlineDate: stage.deadlineDate,
                      finishDate: stage.finishDate,
                      remark: stage.remark,
                      fileUrlList: stage.fileUrlList || []
                    }"
                    class="stage-person-selector"
                  />
                </div>

                <!-- 查看详情按钮 -->
                <button
                  @click.stop="openStageDetail(stage)"
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-6 px-2 text-xs bg-transparent"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-3 h-3 mr-1"
                  >
                    <path
                      d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  详情
                </button>
              </div>

              <!-- 附件信息 -->
              <div
                v-if="stage.fileUrlList && stage.fileUrlList.length > 0"
                class="flex items-center gap-1 mt-2"
              >
                <el-icon class="text-gray-400"><Paperclip /></el-icon>
                <span class="text-xs text-gray-500"
                  >{{ stage.fileUrlList.length }} 个附件</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 阶段详情弹窗 -->
    <StageDetailModal
      :stage="selectedStage"
      v-model:visible="stageDialogVisible"
      @save="handleSaveStage"
      :stageStatusList="stageStatusList"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { View, Paperclip } from "@element-plus/icons-vue";
import { ElMessage, ElLoading } from "element-plus";
import { AlertTriangle, Flag } from "lucide-vue-next";
import {
  getProjectProgressList,
  getProjectStageList,
  updateProjectStateProgress
} from "@/api/progress";
import StageDetailModal from "./StageDetailModal.vue";
import PersonSelector from "@/components/PersonSelector.vue";

const props = defineProps({
  selectedProject: {
    type: Object,
    default: null
  },
  stageList: {
    type: Array,
    default: () => []
  },
  stageStatusList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["refreshList"]);

// 响应式数据
const stageDialogVisible = ref(false);
const selectedStage = ref(null);

const stageListConfig = ref([]);

const fetchStageConfigList = async () => {
  if (!props.selectedProject?.id) return;
  getProjectStageList({ infoId: props.selectedProject.id }).then(res => {
    if (res?.code === 200) {
      stageListConfig.value = res.data;
    }
  });
};

watch(
  () => props.selectedProject,
  newVal => {
    fetchStageConfigList();
  },
  { immediate: true, deep: true }
);

// 阶段数据管理
const stageData = ref({});

// 计算属性
const displayStages = computed(() => {
  if (!stageListConfig.value || stageListConfig.value.length === 0) {
    // 如果没有配置数据，则使用默认的stageList
    if (!props.stageList || props.stageList.length === 0) {
      return [];
    }
    return props.stageList.map(stage => ({
      stageId: stage.id,
      stateName: stage.value,
      status: "pending",
      statusName: "待开始",
      chargeDingUser: [],
      fileUrlList: [],
      deadlineDate: null,
      finishDate: null,
      remark: ""
    }));
  }

  return stageListConfig.value.map(stage => ({
    stageId: stage.stageId,
    stageName: stage.stageName,
    status: getStatusFromName(stage.statusName || "待开始"),
    statusId: stage.statusId,
    statusName: stage.statusName || "待开始",
    chargeDingUser: stage.chargeDingUser || [],
    fileUrlList: stage.fileUrlList || [],
    deadlineDate: stage.deadlineDate,
    finishDate: stage.finishDate,
    remark: stage.remark
  }));
});

// 方法
const getStatusFromName = statusName => {
  switch (statusName) {
    case "已完成":
      return "completed";
    case "进行中":
      return "in-progress";
    case "延期":
      return "delayed";
    case "待开始":
    default:
      return "pending";
  }
};

const getStatusColor = status => {
  switch (status) {
    case "开发中":
    case "进行中":
      return "status-developing";
    case "已上市":
    case "已完成":
      return "status-listed";
    case "待开始":
      return "status-pending";
    case "审核通过":
      return "status-approved";
    case "已上架":
      return "status-listed";
    case "已放弃":
      return "status-abandoned";
    case "延期":
      return "status-delayed";
    default:
      return "status-default";
  }
};

const getPriorityColor = priority => {
  switch (priority) {
    case "高":
      return "bg-red-50 text-red-600";
    case "中":
      return "bg-yellow-50 text-yellow-600";
    case "低":
      return "bg-green-50 text-green-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const getPriorityIcon = priority => {
  switch (priority) {
    case "高":
      return AlertTriangle;
    case "中":
    case "低":
      return Flag;
    default:
      return Flag;
  }
};

const openStageDetail = stage => {
  console.log("openStageDetail called with stage:", stage);
  console.log("stageDialogVisible before:", stageDialogVisible.value);
  selectedStage.value = stage;
  stageDialogVisible.value = true;
  console.log("stageDialogVisible after:", stageDialogVisible.value);
  console.log("selectedStage:", selectedStage.value);
};

const handleSaveStage = async updatedStage => {
  try {
    // 验证必要字段
    if (!updatedStage.stageId) {
      ElMessage.error("阶段ID不能为空");
      return;
    }

    if (!props.selectedProject?.id) {
      ElMessage.error("项目信息不完整");
      return;
    }

    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: "保存中...",
      background: "rgba(0, 0, 0, 0.7)"
    });

    console.log("updatedStage", updatedStage);

    try {
      // 构建API请求数据
      const requestData = {
        infoId: props.selectedProject.id,
        stageId: updatedStage.stageId,
        statusId: updatedStage.statusId,
        deadlineDate: updatedStage.deadlineDate,
        remark: updatedStage.remark,
        // 处理负责人数据，提取emplId
        chargeIds:
          updatedStage.chargeIds?.map(user => user.emplId || user.dingId) || [],
        // 处理文件列表数据
        fileUrlList: updatedStage.fileUrlList || []
      };
      if (updatedStage.finishDate) {
        requestData.finishDate = updatedStage.finishDate;
      }

      console.log("保存阶段数据请求:", requestData);

      // 调用API保存数据
      const res = await updateProjectStateProgress(requestData);

      if (res?.code === 200) {
        // API调用成功，重新获取最新数据
        await fetchStageConfigList();

        // 显示成功消息
        ElMessage.success("保存成功");

        // 关闭弹窗
        stageDialogVisible.value = false;

        console.log("阶段数据保存成功:", updatedStage);

        // 触发事件通知父组件更新列表数据
        emit("refreshList");
      } else {
        // API返回错误
        ElMessage.error(res?.msg || "保存失败，请重试");
        console.error("保存阶段数据失败:", res);
      }
    } catch (apiError) {
      // API调用异常
      console.error("保存阶段数据API调用失败:", apiError);
      ElMessage.error("网络错误，请检查网络连接后重试");
    } finally {
      // 关闭加载状态
      loading.close();
    }
  } catch (error) {
    // 其他异常
    console.error("保存阶段数据异常:", error);
    ElMessage.error("保存过程中发生错误，请重试");
  }
};

const handleAutoSaveStageAssignees = async saveData => {
  try {
    // 验证必要字段
    if (!saveData.stageId) {
      ElMessage.error("阶段ID不能为空");
      return;
    }

    if (!saveData.infoId) {
      ElMessage.error("项目信息不完整");
      return;
    }
    console.log("saveData", saveData);

    // 构建API请求数据，参考handleSaveStage的格式
    const requestData = {
      infoId: saveData.infoId,
      stageId: saveData.stageId,
      statusId: saveData.statusId,
      deadlineDate: saveData.deadlineDate,
      remark: saveData.remark,
      // 处理负责人数据，提取emplId或dingId
      chargeIds:
        saveData.assignees?.map(user => user.emplId || user.dingId) || [],
      // 处理文件列表数据
      fileUrlList: saveData.fileUrlList || []
    };

    if (saveData.finishDate) {
      requestData.finishDate = saveData.finishDate;
    }

    console.log("自动保存阶段负责人数据请求:", requestData);

    // 调用API保存数据
    const res = await updateProjectStateProgress(requestData);

    if (res?.code === 200) {
      // API调用成功，重新获取最新数据
      await fetchStageConfigList();

      // 显示成功消息
      ElMessage.success("负责人更新成功");

      console.log("阶段负责人数据保存成功:", saveData);

      // 触发事件通知父组件更新列表数据
      emit("refreshList");
    } else {
      // API返回错误
      ElMessage.error(res?.msg || "负责人更新失败，请重试");
      console.error("保存阶段负责人数据失败:", res);
    }
  } catch (error) {
    // API调用异常
    console.error("保存阶段负责人数据异常:", error);
    ElMessage.error("网络错误，请检查网络连接后重试");
  }
};
</script>

<style scoped>
.project-detail-card {
  height: fit-content;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 400;
  border-radius: 12px;
}

.status-badge {
  display: inline-block;
  min-width: 48px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
  border-radius: 12px;
}

.status-developing {
  color: #1890ff;
  background-color: #e6f4ff;
}

.status-listed {
  color: #52c41a;
  background-color: #f6ffed;
}

.status-pending {
  color: #8c8c8c;
  background-color: #f5f5f5;
}

.status-approved {
  color: #52c41a;
  background-color: #f6ffed;
}

.status-abandoned {
  color: #ff4d4f;
  background-color: #fff2f0;
}

.status-delayed {
  color: #ff4d4f;
  background-color: #fff2f0;
}

.status-default {
  color: #8c8c8c;
  background-color: #f5f5f5;
}

.stage-item {
  transition: all 0.2s ease;
}

.stage-item:hover {
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  transform: translateY(-1px);
}

.assignee-tag {
  background-color: #e6f4ff;
  border-color: #91caff;
}

.add-assignee-btn {
  width: 20px;
  height: 20px;
  background: transparent;
  border: 1px dashed #d9d9d9;
}

.add-assignee-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.user-option:hover {
  background-color: #f5f5f5;
}

.stage-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.stage-person-selector {
  flex: 1;
}

.stage-person-selector :deep(.person-label) {
  display: none;
}

.stage-person-selector :deep(.person-tags) {
  margin-left: 0;
}

.stage-person-selector :deep(.add-person-btn) {
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
}
</style>
