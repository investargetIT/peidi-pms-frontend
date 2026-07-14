<template>
  <div class="project-detail-panel">
    <!-- 空状态 -->
    <div v-if="!selectedProject" class="empty-state">
      <div class="empty-icon">
        <el-icon size="64" color="#e5e7eb">
          <View />
        </el-icon>
      </div>
      <p class="empty-text">选择一个产品查看详细信息</p>
    </div>

    <!-- 项目详情 -->
    <div v-else class="detail-content">
      <!-- 头部区域 - 产品信息 -->
      <div class="header-section">
        <div class="header-top">
          <div class="product-name">{{ selectedProject.productName }}</div>
          <div class="header-actions">
            <template v-if="!isEditing">
              <el-button type="primary" size="small" @click="startEditing">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </template>
            <template v-else>
              <el-button size="small" @click="cancelEditing" :disabled="isSaving">取消</el-button>
              <el-button type="primary" size="small" @click="handleSaveAllStages" :loading="isSaving">
                <el-icon><Check /></el-icon>
                保存
              </el-button>
            </template>
          </div>
        </div>
        <div class="product-meta">
          <span class="brand">{{ selectedProject.brandName }}</span>
          <span class="separator">·</span>
          <span class="priority" :class="getPriorityColor(selectedProject.priorityName)">
            {{ selectedProject.priorityName }}
          </span>
        </div>
      </div>


      <!-- 进度条区域 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">整体进度</span>
          <span class="progress-value">{{ Math.round(selectedProject.progress) }}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: `${Math.min(selectedProject.progress, 100)}%` }"></div>
        </div>
      </div>

      <!-- 阶段区域 -->
      <div class="stages-section">
        <div class="stages-header">
          <div class="stages-title">阶段进度</div>
          <div v-if="isEditing" class="stages-actions">
            <el-button type="primary" link @click="handleAddStage">
              <el-icon><Plus /></el-icon>
              添加阶段
            </el-button>
          </div>
        </div>

        <div ref="stagesContainer" class="stages-list">
          <div
            v-for="(stage, index) in editableStages"
            :key="stage.stageId || `new-${index}`"
            class="stage-card"
            :class="{ 'editing': isEditing }"
          >
            <!-- 拖拽手柄 -->
            <div v-if="isEditing" class="drag-handle">
              <el-icon><Rank /></el-icon>
            </div>

            <!-- 阶段内容 -->
            <div class="stage-content" @click="!isEditing && openStageDetail(stage)">
              <!-- 阶段名称 -->
              <div class="stage-header">
                <template v-if="isEditing">
                  <input
                    v-model="stage.stageName"
                    class="stage-name-input"
                    placeholder="阶段名称"
                  />
                </template>
                <template v-else>
                  <div class="stage-name">{{ stage.stageName }}</div>
                </template>

                <!-- 状态标签 -->
                <template v-if="!isEditing">
                  <span class="status-badge" :class="getStatusColor(stage.statusName)">
                    {{ stage.statusName }}
                  </span>
                </template>

                <!-- 删除按钮 -->
                <button v-if="isEditing" class="btn-delete" @click.stop="handleDeleteStage(index)">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>

              <!-- 阶段详情 -->
              <template v-if="!isEditing">
                <div class="stage-details">
                  <!-- 负责人 -->
                  <div v-if="stage.chargeDingUser && stage.chargeDingUser.length > 0" class="detail-item">
                    <span class="detail-label">负责人</span>
                    <div class="detail-value">
                      <span
                        v-for="user in stage.chargeDingUser"
                        :key="user.dingId || user.emplId"
                        class="user-tag"
                      >
                        {{ user.userName || user.name }}
                      </span>
                    </div>
                  </div>

                  <!-- 截止日期 -->
                  <div v-if="stage.deadlineDate" class="detail-item">
                    <span class="detail-label">截止日期</span>
                    <span class="detail-value">{{ stage.deadlineDate }}</span>
                  </div>

                  <!-- 附件 -->
                  <div v-if="stage.fileUrlList && stage.fileUrlList.length > 0" class="detail-item">
                    <span class="detail-label">附件</span>
                    <span class="detail-value">{{ stage.fileUrlList.length }} 个文件</span>
                  </div>
                </div>

                <!-- 查看详情按钮 -->
                <button class="btn-view-detail" @click.stop="openStageDetail(stage)">
                  查看详情
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 阶段详情弹窗 -->
    <StageDetailModal
      :stage="selectedStage"
      v-model:visible="stageDialogVisible"
      @save="handleSaveStage"
      :stageStatusList="stageStatusList"
      :isSaving="isSavingStage"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { View, Paperclip, Plus, Delete, Rank, Edit, Check } from "@element-plus/icons-vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { AlertTriangle, Flag } from "lucide-vue-next";
import Sortable from "sortablejs";
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
const isEditing = ref(false);
const stageListConfig = ref([]);
const editableStages = ref([]);
const stagesContainer = ref(null);
let sortableInstance = null;
let scrollContainer = null;

// 获取最近的可滚动父级容器
const getScrollParent = (node) => {
  if (!node) return null;
  let parent = node.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

// 手动处理鼠标滚轮事件
const handleWheel = (e) => {
  e.preventDefault(); // 阻止默认的页面滚动
  if (scrollContainer) {
    // 根据滚轮方向修改滚动条的 scrollTop
    scrollContainer.scrollTop += e.deltaY;
  }
};

// 锁定页面滚动 (防止触摸滑动导致底层页面动)
let originalOverflow = '';
let originalHtmlOverflow = '';
const lockScroll = () => {
  originalOverflow = document.body.style.overflow;
  originalHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.body.addEventListener('touchmove', preventDefault, { passive: false });
};

// 解锁页面滚动
const unlockScroll = () => {
  document.body.style.overflow = originalOverflow;
  document.documentElement.style.overflow = originalHtmlOverflow;
  document.body.removeEventListener('touchmove', preventDefault);
};

const preventDefault = (e) => {
  e.preventDefault();
};

const fetchStageConfigList = async () => {
  if (!props.selectedProject?.id) return;
  getProjectStageList({ infoId: props.selectedProject.id }).then(res => {
    if (res?.code === 200) {
      stageListConfig.value = res.data;
      if (!isEditing.value) {
        editableStages.value = JSON.parse(JSON.stringify(res.data));
      }
    }
  });
};

watch(
  () => props.selectedProject,
  newVal => {
    isEditing.value = false;
    fetchStageConfigList();
  },
  { immediate: true, deep: true }
);

// 计算属性
const displayStages = computed(() => {
  if (!stageListConfig.value || stageListConfig.value.length === 0) {
    // 如果没有配置数据，则使用默认的stageList
    if (!props.stageList || props.stageList.length === 0) {
      return [];
    }
    return props.stageList.map(stage => ({
      stageId: stage.id,
      stageName: stage.value,
      status: "pending",
      statusId: 115, // 默认待开始
      statusName: "待开始",
      chargeDingUser: [],
      fileUrlList: [],
      deadlineDate: null,
      finishDate: null,
      remark: ""
    }));
  }

  return stageListConfig.value.map(stage => {
    let statusId = stage.statusId;

    // 如果 statusId 为 0 或不存在，根据 statusName 查找或使用默认值
    if ((!statusId || statusId === 0) && props.stageStatusList?.length > 0) {
      const statusName = stage.statusName || "待开始";
      const statusItem = props.stageStatusList.find(item => item.label === statusName);
      statusId = statusItem ? statusItem.value : 115; // 找不到就默认待开始
    }

    return {
      stageId: stage.stageId,
      stageName: stage.stageName,
      status: getStatusFromName(stage.statusName || "待开始"),
      statusId: statusId,
      statusName: stage.statusName || "待开始",
      chargeDingUser: stage.chargeDingUser || [],
      fileUrlList: stage.fileUrlList || [],
      deadlineDate: stage.deadlineDate,
      finishDate: stage.finishDate,
      remark: stage.remark
    };
  });
});

// 初始化拖拽功能
const initSortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy();
  }

  nextTick(() => {
    if (stagesContainer.value && isEditing.value) {
      sortableInstance = Sortable.create(stagesContainer.value, {
        animation: 150,
        handle: ".drag-handle",
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        fallbackOnBody: true,
        swapThreshold: 0.65,
        scroll: true,
        bubbleScroll: false, // 关闭冒泡自动滚动，全靠手动滚轮控制
        onStart: () => {
          // 锁死底层页面，防止抖动
          lockScroll();
          // 找到抽屉内的滚动容器 (通常是 .el-drawer__body 或 .project-detail-panel)
          scrollContainer = getScrollParent(stagesContainer.value);
          if (scrollContainer) {
            // 监听鼠标滚轮事件，passive: false 允许我们 preventDefault
            scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
          }
        },
        onEnd: evt => {
          // 拖拽结束，解锁底层页面
          unlockScroll();
          // 移除滚轮监听
          if (scrollContainer) {
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer = null;
          }
          const { oldIndex, newIndex } = evt;
          if (oldIndex !== newIndex) {
            const movedItem = editableStages.value.splice(oldIndex, 1)[0];
            editableStages.value.splice(newIndex, 0, movedItem);
          }
        }
      });
    }
  });
};

// 开始编辑
const startEditing = () => {
  isEditing.value = true;
  editableStages.value = JSON.parse(JSON.stringify(stageListConfig.value));
  nextTick(() => {
    initSortable();
  });
};

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
  editableStages.value = JSON.parse(JSON.stringify(stageListConfig.value));
  // 清理滚轮监听和恢复滚动
  unlockScroll();
  if (scrollContainer) {
    scrollContainer.removeEventListener('wheel', handleWheel);
    scrollContainer = null;
  }
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
};

// 新增阶段
const handleAddStage = () => {
  editableStages.value.push({
    stageId: null,
    progressName: "新节点",
    stageName: "新节点",
    statusId: null,
    statusName: "待开始",
    chargeDingUser: [],
    fileUrlList: [],
    startTime: "",
    deadlineDate: null,
    finishDate: null,
    remark: "",
    sort: editableStages.value.length + 1
  });
};

// 删除阶段
const handleDeleteStage = index => {
  ElMessageBox.confirm("确定要删除这个阶段吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      editableStages.value.splice(index, 1);
    })
    .catch(() => {});
};

// 保存按钮的加载状态
const isSaving = ref(false);

// 保存所有阶段
const handleSaveAllStages = async () => {
  if (!props.selectedProject?.id) {
    ElMessage.error("项目信息不完整");
    return;
  }

  if (isSaving.value) return; // 防止重复点击
  isSaving.value = true;

  try {
    // 构建阶段数组
    const stagesArray = editableStages.value.map((stage, index) => ({
      infoId: props.selectedProject.id,
      id: stage.id || undefined, // 如果有id就传id
      stageId: stage.stageId || 0,
      progressName: stage.stageName || stage.progressName, // 优先使用修改后的stageName
      sort: index + 1,
      statusId: stage.statusId || 0,
      startTime: stage.startTime || "",
      deadlineDate: stage.deadlineDate || "",
      finishDate: stage.finishDate || "",
      remark: stage.remark || "",
      chargeIds: (stage.chargeDingUser || []).map(
        user => user.emplId || user.dingId
      ),
      fileUrlList: stage.fileUrlList || []
    }));

    // 直接传递数组给接口
    const res = await updateProjectStateProgress(stagesArray);

    if (res?.code === 200) {
      ElMessage.success("保存成功");
      isEditing.value = false;
      await fetchStageConfigList();
      emit("refreshList");
      if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
      }
    } else {
      ElMessage.error(res?.msg || "保存失败，请重试");
    }
  } catch (error) {
    console.error("保存阶段数据异常:", error);
    ElMessage.error("网络错误，请检查网络连接后重试");
  } finally {
    isSaving.value = false;
  }
};

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
      return "status-in-progress";
    case "已上市":
    case "已完成":
      return "status-completed";
    case "待开始":
      return "status-pending";
    case "延期":
      return "status-delayed";
    default:
      return "status-default";
  }
};

const getPriorityColor = priority => {
  switch (priority) {
    case "高":
      return "priority-high";
    case "中":
      return "priority-medium";
    case "低":
      return "priority-low";
    default:
      return "priority-default";
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
  selectedStage.value = stage;
  stageDialogVisible.value = true;
};

// 单个阶段保存的加载状态
const isSavingStage = ref(false);

const handleSaveStage = async updatedStage => {
  try {
    if (!updatedStage.stageId) {
      ElMessage.error("阶段ID不能为空");
      return;
    }

    if (!props.selectedProject?.id) {
      ElMessage.error("项目信息不完整");
      return;
    }

    if (isSavingStage.value) return; // 防止重复点击
    isSavingStage.value = true;

    try {
      const requestData = {
        infoId: props.selectedProject.id,
        id: updatedStage.id || undefined, // 如果有id就传id
        stageId: updatedStage.stageId,
        statusId: updatedStage.statusId,
        startTime: updatedStage.startTime || "",
        deadlineDate: updatedStage.deadlineDate,
        remark: updatedStage.remark,
        chargeIds:
          updatedStage.chargeIds?.map(user => user.emplId || user.dingId) || [],
        fileUrlList: updatedStage.fileUrlList || []
      };
      if (updatedStage.finishDate) {
        requestData.finishDate = updatedStage.finishDate;
      }

      const res = await updateProjectStateProgress(requestData);

      if (res?.code === 200) {
        await fetchStageConfigList();
        ElMessage.success("保存成功");
        stageDialogVisible.value = false;
        emit("refreshList");
      } else {
        ElMessage.error(res?.msg || "保存失败，请重试");
      }
    } catch (apiError) {
      console.error("保存阶段数据API调用失败:", apiError);
      ElMessage.error("网络错误，请检查网络连接后重试");
    } finally {
      isSavingStage.value = false;
    }
  } catch (error) {
    console.error("保存阶段数据异常:", error);
    ElMessage.error("保存过程中发生错误，请重试");
    isSavingStage.value = false;
  }
};

const handleAutoSaveStageAssignees = async saveData => {
  try {
    if (!saveData.stageId) {
      ElMessage.error("阶段ID不能为空");
      return;
    }

    if (!saveData.infoId) {
      ElMessage.error("项目信息不完整");
      return;
    }

    const currentStage = displayStages.value.find(
      s => s.stageId === saveData.stageId
    );

    const requestData = {
      infoId: saveData.infoId,
      stageId: saveData.stageId,
      statusId: currentStage?.statusId ?? saveData.statusId ?? 115,
      deadlineDate: currentStage?.deadlineDate ?? saveData.deadlineDate,
      remark: currentStage?.remark ?? saveData.remark ?? "",
      chargeIds:
        saveData.assignees?.map(user => user.emplId || user.dingId) || [],
      fileUrlList: currentStage?.fileUrlList ?? saveData.fileUrlList ?? []
    };

    const finishDate = currentStage?.finishDate ?? saveData.finishDate;
    if (finishDate) {
      requestData.finishDate = finishDate;
    }

    const res = await updateProjectStateProgress(requestData);

    if (res?.code === 200) {
      await fetchStageConfigList();
      ElMessage.success("负责人更新成功");
      emit("refreshList");
    } else {
      ElMessage.error(res?.msg || "负责人更新失败，请重试");
    }
  } catch (error) {
    console.error("保存阶段负责人数据异常:", error);
    ElMessage.error("网络错误，请检查网络连接后重试");
  }
};

// 组件卸载时清理
onUnmounted(() => {
  unlockScroll();
  if (scrollContainer) {
    scrollContainer.removeEventListener('wheel', handleWheel);
  }
  if (sortableInstance) {
    sortableInstance.destroy();
  }
});
</script>

<style scoped>
/* 新的样式 */
.project-detail-panel {
  height: 100%;
  padding: 16px;
  padding-top: 8px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #9ca3af;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.brand {
  color: #6b7280;
}

.separator {
  color: #d1d5db;
}

.priority {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.priority-high {
  color: #dc2626;
  background-color: #fef2f2;
}

.priority-medium {
  color: #d97706;
  background-color: #fffbeb;
}

.priority-low {
  color: #059669;
  background-color: #ecfdf5;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.progress-value {
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stages-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stages-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  min-height: 50px;
}

.stage-card {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.stage-card:hover {
  border-color: #d1d5db;
  background-color: #f3f4f6;
}

.stage-card.editing {
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1);
  cursor: default;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  color: #9ca3af;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle .el-icon {
  font-size: 18px;
}

.sortable-ghost {
  opacity: 0.4;
  background-color: #e5e7eb !important;
}

.sortable-drag {
  opacity: 1;
  background-color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stage-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stage-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.stage-name-input {
  flex: 1;
  padding: 8px 12px;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

.stage-name-input:focus {
  border-color: #2563eb;
  background-color: white;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.status-in-progress {
  color: #2563eb;
  background-color: #dbeafe;
}

.status-completed {
  color: #059669;
  background-color: #d1fae5;
}

.status-pending {
  color: #6b7280;
  background-color: #f3f4f6;
}

.status-delayed {
  color: #dc2626;
  background-color: #fee2e2;
}

.status-default {
  color: #6b7280;
  background-color: #f3f4f6;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: #ef4444;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background-color: #fef2f2;
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  gap: 6px;
  font-size: 12px;
}

.detail-label {
  min-width: 60px;
  color: #9ca3af;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #374151;
}

.user-tag {
  display: inline-block;
  padding: 1px 6px;
  margin-right: 4px;
  margin-bottom: 2px;
  background-color: #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  color: #374151;
}

.btn-view-detail {
  align-self: flex-start;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view-detail:hover {
  background-color: #eff6ff;
}

/* 旧的样式，保留 */
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
