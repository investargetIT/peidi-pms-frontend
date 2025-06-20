<template>
  <div class="right-panel w-80">
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
              :key="stage.id"
              class="stage-item p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="openStageDetail(stage)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">{{ stage.name }}</span>
                <el-tag :type="getStageStatusType(stage.status)" size="small">
                  {{ getStageStatusText(stage.status) }}
                </el-tag>
              </div>

              <!-- 负责人区域 -->
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-1">
                  <!-- 已有负责人 -->
                  <div
                    v-if="stage.assignees && stage.assignees.length > 0"
                    class="flex flex-wrap gap-1"
                  >
                    <el-tag
                      v-for="assignee in stage.assignees"
                      :key="assignee.dingId"
                      size="small"
                      closable
                      @close="removeAssignee(stage.id, assignee.dingId)"
                      class="assignee-tag"
                    >
                      <div class="flex items-center gap-1">
                        <el-avatar
                          :size="16"
                          :src="assignee.avatarUrl"
                          class="text-xs"
                        >
                          {{ assignee.userName.charAt(0) }}
                        </el-avatar>
                        <span class="text-xs">{{ assignee.userName }}</span>
                      </div>
                    </el-tag>
                  </div>
                  <span v-else class="text-xs text-gray-500">暂无负责人</span>

                  <!-- 添加负责人按钮 -->
                  <el-popover
                    placement="bottom-start"
                    :width="250"
                    trigger="click"
                  >
                    <template #reference>
                      <el-button
                        size="small"
                        circle
                        class="add-assignee-btn"
                        @click.stop
                      >
                        <el-icon><Plus /></el-icon>
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
                          v-for="user in filteredUsers(stage)"
                          :key="user.id"
                          class="user-option flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          @click="addAssignee(stage.id, user)"
                        >
                          <el-avatar :size="24" class="text-xs">
                            {{ user.name.charAt(0) }}
                          </el-avatar>
                          <div class="flex-1">
                            <p class="text-sm font-medium">{{ user.name }}</p>
                            <p class="text-xs text-gray-500">
                              {{ user.email }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-popover>
                </div>

                <!-- 查看详情按钮 -->
                <el-button
                  size="small"
                  text
                  @click.stop="openStageDetail(stage)"
                >
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </div>

              <!-- 附件信息 -->
              <div
                v-if="
                  stage.attachments &&
                  stage.attachments.length > 0 &&
                  stage.attachments[0] !== 'string'
                "
                class="flex items-center gap-1 mt-2"
              >
                <el-icon class="text-gray-400"><Paperclip /></el-icon>
                <span class="text-xs text-gray-500"
                  >{{ stage.attachments.length }} 个附件</span
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
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { View, Plus, Search, Paperclip } from "@element-plus/icons-vue";
import { AlertTriangle, Flag } from "lucide-vue-next";
import { getProjectProgressList, getProjectStageList } from "@/api/progress";
import StageDetailModal from "./StageDetailModal.vue";

const props = defineProps({
  selectedProject: {
    type: Object,
    default: null
  },
  stageList: {
    type: Array,
    default: () => []
  }
});

// 响应式数据
const searchKeyword = ref("");
const stageDialogVisible = ref(false);
const selectedStage = ref(null);

const stageListConfig = ref([]);

const fetchStageConfigList = async () => {
  console.log("==fetchStageConfigList==");
  console.log(props.selectedProject);
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

// 模拟数据
const mockUsers = ref([
  { id: 1, name: "张三", email: "zhangsan@example.com" },
  { id: 2, name: "李四", email: "lisi@example.com" },
  { id: 3, name: "王五", email: "wangwu@example.com" },
  { id: 4, name: "赵六", email: "zhaoliu@example.com" }
]);

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
      id: stage.id,
      name: stage.value,
      status: "pending",
      statusName: "待开始",
      assignees: [],
      attachments: [],
      deadlineDate: null,
      finishDate: null,
      remark: ""
    }));
  }

  return stageListConfig.value.map(stage => ({
    id: stage.stageId,
    name: stage.stageName,
    status: getStatusFromName(stage.statusName),
    statusName: stage.statusName,
    assignees: stage.chargeDingUser || [],
    attachments: stage.fileUrlList || [],
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

const getStageStatusType = status => {
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

const getStageStatusText = status => {
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

const filteredUsers = stage => {
  const assignedIds = stage.assignees?.map(a => a.id) || [];
  return mockUsers.value.filter(
    user =>
      !assignedIds.includes(user.id) &&
      user.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
};

const addAssignee = (stageId, user) => {
  const stageIndex = stageListConfig.value.findIndex(
    s => s.stageId === stageId
  );
  if (stageIndex !== -1) {
    if (!stageListConfig.value[stageIndex].chargeDingUser) {
      stageListConfig.value[stageIndex].chargeDingUser = [];
    }
    stageListConfig.value[stageIndex].chargeDingUser.push({
      dingId: user.id.toString(),
      userName: user.name,
      avatarUrl: user.avatarUrl || ""
    });
  }
  searchKeyword.value = "";
};

const removeAssignee = (stageId, assigneeDingId) => {
  const stageIndex = stageListConfig.value.findIndex(
    s => s.stageId === stageId
  );
  if (stageIndex !== -1 && stageListConfig.value[stageIndex].chargeDingUser) {
    stageListConfig.value[stageIndex].chargeDingUser = stageListConfig.value[
      stageIndex
    ].chargeDingUser.filter(a => a.dingId !== assigneeDingId);
  }
};

const openStageDetail = stage => {
  selectedStage.value = stage;
  stageDialogVisible.value = true;
};

const handleSaveStage = updatedStage => {
  // 更新stageListConfig中对应的阶段数据
  const stageId = updatedStage.stageId || updatedStage.id;
  const stageIndex = stageListConfig.value.findIndex(
    s => s.stageId === stageId
  );
  if (stageIndex !== -1) {
    // 更新阶段配置
    stageListConfig.value[stageIndex] = {
      ...stageListConfig.value[stageIndex],
      statusName: getStatusNameFromCode(updatedStage.status),
      deadlineDate: updatedStage.deadlineDate,
      finishDate: updatedStage.finishDate,
      remark: updatedStage.remark,
      chargeDingUser: updatedStage.assignees || [],
      fileUrlList: updatedStage.attachments || []
    };
  }

  // 关闭弹窗
  stageDialogVisible.value = false;

  // 这里可以调用API保存数据
  console.log("保存阶段数据:", updatedStage);
};

const getStatusNameFromCode = statusCode => {
  switch (statusCode) {
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
</style>
