<template>
  <div class="dashboard-container p-4">
    <!-- 调试信息 -->
    <div
      style="
        padding: 6px 12px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #fff;
        background: #222;
        border-radius: 6px;
      "
    >
      <strong>调试：</strong> isMobile =
      {{ isMobile ? "true (移动端)" : "false (桌面端)" }}
    </div>
    <!-- 页面头部 -->
    <div class="page-header flex justify-between items-center mb-4">
      <div class="header-left">
        <h1 class="text-2xl font-semibold">项目进度管理系统</h1>
        <p class="text-gray-500 mt-1 text-base">产品开发全流程跟踪与管理</p>
      </div>
      <div class="header-right flex items-center gap-3">
        <el-button class="flex items-center gap-2 px-4 h-9">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button
          type="primary"
          class="flex items-center gap-2 px-4 h-9"
          color="#1a1a1a"
          @click="handleAddProduct"
        >
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </div>

    <!-- 统计面板 -->
    <div class="statistics-panel grid grid-cols-3 gap-6 mb-4">
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-500 text-base">总项目数</div>
        <div class="text-3xl font-semibold mt-2">{{ totalProjectCount }}</div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <div
            class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <LucideCalendar class="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-500 text-base">开发中</div>
        <div class="text-3xl font-semibold mt-2 text-blue-500">
          {{ developingCount }}
        </div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <div
            class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <div class="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-500 text-base">已上市</div>
        <div class="text-3xl font-semibold mt-2 text-green-500">
          {{ listedCount }}
        </div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <div
            class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
          >
            <div class="w-3 h-3 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area w-full bg-white rounded-lg shadow-sm mb-4">
      <div class="w-full p-4">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <!-- 第一行：产品名称、品牌、状态 -->
          <div class="search-row flex items-center gap-4 mb-3">
            <el-form-item
              prop="productName"
              label="产品名称"
              class="flex-1 mb-0"
            >
              <el-input
                v-model="searchForm.productName"
                class="custom-search-input"
                placeholder="产品名称"
                clearable
              >
                <template #prefix>
                  <el-icon class="text-gray-400"><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="brand" label="品牌" class="flex-1 mb-0">
              <el-select
                v-model="searchForm.brandId"
                class="custom-select"
                placeholder="品牌"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in brandList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item prop="statusId" label="状态" class="flex-1 mb-0">
              <el-select
                v-model="searchForm.statusId"
                placeholder="全部状态"
                clearable
                class="custom-select"
                style="width: 100%"
              >
                <el-option
                  v-for="item in infoList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 第二行：PM负责人和NPD负责人 -->
          <div class="search-row flex items-center gap-4">
            <el-form-item
              prop="pmUserName"
              label="PM负责人"
              class="flex-1 mb-0 person-form-item"
            >
              <PersonSelector
                label="PM负责人"
                v-model="searchForm.pmUserName"
                display-mode="simple"
              />
            </el-form-item>
            <el-form-item
              prop="npdUserName"
              label="NPD负责人"
              class="flex-1 mb-0 person-form-item"
            >
              <PersonSelector
                label="NPD负责人"
                v-model="searchForm.npdUserName"
                display-mode="simple"
              />
            </el-form-item>
            <el-form-item class="flex-1 mb-0">
              <!-- 预留第三列位置，保持布局对称 -->
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content flex gap-4 items-start">
      <!-- 左侧产品列表 -->
      <div class="left-panel flex-1 panel-container">
        <div class="panel-header">
          <h3 class="panel-title">产品进度列表</h3>
        </div>
        <productList
          ref="listRef"
          :searchInfo="searchForm"
          :statusList="statusList"
          :selectedProject="selectedProject"
          @selectProject="handleSelectProject"
          @updateTableData="handleUpdateTableData"
        />
      </div>

      <!-- 右侧项目详情（仅桌面端显示） -->
      <div v-if="!isMobile" class="panel-container right-panel hidden-mobile">
        <ProjectDetail
          :selectedProject="selectedProject"
          :stageList="stageList"
          :stageStatusList="stageStatusList"
          @refreshList="refreshList"
        />
      </div>
    </div>

    <!-- 新增产品弹窗 -->
    <CreateProjectModal
      v-model:visible="showModal"
      @save="handleSaveProject"
      :brandList="brandList"
      :priorityList="priorityList"
    />
  </div>
</template>

<script setup>
import {
  Calendar as LucideCalendar,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Minus,
  AlertTriangle,
  Flag
} from "lucide-vue-next";
import { ref, computed, onMounted, onUnmounted } from "vue";

import { fetchStatusList } from "@/api/pmApi.ts";

import { ElMessage } from "element-plus";
import {
  Calendar as ElementCalendar,
  Loading,
  Check,
  Search as ElementSearch
} from "@element-plus/icons-vue";
import factories from "./const";
import productList from "./productList.vue";
import ProjectDetail from "./ProjectDetail.vue";
import CreateProjectModal from "./CreateProjectModal.vue";
import PersonSelector from "@/components/PersonSelector.vue";
const showModal = ref(false);
const statusList = ref([]);
const priorityList = ref([]);
const stageList = ref([]);
const stageStatusList = ref([]);
const infoList = ref([]);
const brandList = ref([]);
const listRef = ref(null);
const selectedProject = ref(null);
const tableData = ref([]);
const searchForm = ref({
  productName: "",
  brandId: "",
  keyword: "",
  statusId: "",
  productNo: "",
  pmUserName: [],
  npdUserName: []
});

const handleAddProduct = () => {
  showModal.value = true;
};

const handleSaveProject = newProject => {
  // 这里可以调用API保存项目数据
  console.log("保存新项目:", newProject);

  // 刷新列表
  refreshList();
};

const getTypeList = () => {
  Promise.all([
    fetchStatusList("pmPriority"),
    fetchStatusList("pmStage"),
    fetchStatusList("pmStageStatus"),
    fetchStatusList("pmInfoStatus"),
    fetchStatusList("pmBrand")
  ]).then(
    ([priorityRes, stageRes, stageStatusRes, infoStatusRes, brandRes]) => {
      if (priorityRes.code === 200) {
        // 优先级
        priorityList.value = priorityRes.data?.map(item => {
          return {
            label: item.value,
            value: item.id
          };
        });
      }
      if (stageRes.code === 200) {
        // 阶段任务状态
        stageList.value = stageRes.data?.map(item => {
          return {
            label: item.value,
            value: item.id
          };
        });
      }
      if (stageStatusRes.code === 200) {
        // 阶段任务状态
        stageStatusList.value = stageStatusRes.data?.map(item => {
          return {
            label: item.value,
            value: item.id
          };
        });
      }
      if (infoStatusRes.code === 200) {
        // 阶段任务状态
        infoList.value = infoStatusRes.data?.map(item => {
          return {
            label: item.value,
            value: item.id
          };
        });
      }
      if (brandRes.code === 200) {
        // 阶段任务状态
        brandList.value = brandRes.data?.map(item => {
          return {
            label: item.value,
            value: item.id
          };
        });
      }
    }
  );
};

getTypeList();

const refreshList = () => {
  listRef.value.fetchProductList();
};

const handleSelectProject = project => {
  selectedProject.value = project;
  console.log("选中的项目:", project);
};

const handleUpdateTableData = data => {
  tableData.value = data;
  console.log("接收到的表格数据:", data);
};

// 计算项目统计数据
const totalProjectCount = computed(() => {
  return tableData.value?.length || 0;
});

const developingCount = computed(() => {
  return tableData.value.filter(item => item.statusId == 113)?.length || 0;
});

const listedCount = computed(() => {
  // 兼容id字符与整型
  return tableData.value.filter(item => item.statusId == 114).length;
});

const isMobile = ref(false);
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});
onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style scoped>
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 #2563eb44;
  }

  70% {
    box-shadow: 0 0 0 8px #2563eb00;
  }

  100% {
    box-shadow: 0 0 0 0 #2563eb00;
  }
}

@media (width <= 768px) {
  .hidden-mobile {
    display: none !important;
  }

  .main-content {
    flex-direction: column;
  }

  .left-panel {
    align-self: stretch;
    width: 100%;
  }

  .statistics-panel {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
    gap: 10px !important;
    margin-bottom: 12px !important;
  }

  .statistics-panel .stat-card {
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  .search-area .search-row {
    flex-direction: column;
    gap: 12px;
  }

  .search-area .el-form-item {
    width: 100%;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    justify-content: flex-start;
    width: 100%;
  }
}

@media (width <= 480px) {
  .dashboard-container {
    padding: 12px;
  }

  .statistics-panel .stat-card {
    padding: 12px;
  }

  .panel-container {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .page-header p {
    font-size: 14px;
  }

  .header-right .el-button {
    height: 36px;
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (width <= 768px) {
  /* 统计卡片竖排，每行一个 */
  .statistics-panel {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
    gap: 10px !important;
    margin-bottom: 12px !important;
  }

  .statistics-panel .stat-card {
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  /* 筛选区表单项横向排列，label和输入框/按钮同一行 */
  .search-form,
  .search-row {
    flex-direction: column !important;
    gap: 0 !important;
    width: 100% !important;
  }

  .search-area .el-form-item {
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    width: 100% !important;
    padding-bottom: 0 !important;
    margin-bottom: 8px !important;
  }

  .search-area .el-form-item__label {
    flex: 0 0 80px !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
    color: #222 !important;
    text-align: left !important;
  }

  .search-area .el-form-item__content {
    display: flex !important;
    flex: 1 1 0%;
    gap: 0 !important;
    align-items: center !important;
    width: 100% !important;
    margin-left: 8px !important;
  }

  .custom-search-input :deep(.el-input__wrapper),
  .custom-select :deep(.el-input__wrapper) {
    height: 32px !important;
    min-height: 32px !important;
    padding: 2px 8px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
  }

  .custom-select :deep(.el-input__inner) {
    height: 28px !important;
    font-size: 14px !important;
    line-height: 28px !important;
  }

  .person-form-item {
    margin-bottom: 0 !important;
  }

  .person-form-item :deep(.el-button) {
    float: right;
    width: auto !important;
    min-width: 0 !important;
    height: 28px !important;
    padding: 0 10px !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    margin-left: 8px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
  }

  .person-form-item .el-form-item__content {
    justify-content: flex-end !important;
  }
}

.dashboard-container {
  background-color: #f5f5f5;
}

.page-header {
  h1 {
    letter-spacing: 0.5px;
  }
}

.statistics-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 90px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 10%),
    0 1px 2px -1px rgb(0 0 0 / 10%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  margin-bottom: 2px;
  font-size: 15px;
  color: #6b7280;
}

.stat-value {
  margin-top: 2px;
  font-size: 28px;
  font-weight: 600;
  color: #222;
}

.stat-value.developing {
  color: #2563eb;
}

.stat-value.listed {
  color: #22c55e;
}

.stat-icon-abs {
  position: absolute;
  top: 50%;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transform: translateY(-50%);
}

.stat-dot {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background: #e0e7ff;
  border-radius: 50%;
}

.stat-dot.blue::after {
  position: absolute;
  top: 4px;
  left: 4px;
  display: block;
  width: 10px;
  height: 10px;
  content: "";
  background: #2563eb;
  border-radius: 50%;
  animation: pulse 1.2s infinite;
}

.stat-dot.green {
  background: #bbf7d0;
}

.stat-dot.green::after {
  position: absolute;
  top: 4px;
  left: 4px;
  display: block;
  width: 10px;
  height: 10px;
  content: "";
  background: #22c55e;
  border-radius: 50%;
}

.container {
  .el-input {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px #e5e7eb;

      &:hover {
        box-shadow: 0 0 0 1px #d1d5db;
      }
    }
  }
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
  }

  .el-form-item__content {
    display: flex;
    align-items: center;
  }
}

.custom-search-input {
  :deep(.el-input__wrapper) {
    height: 32px;
    padding: 4px 12px;
    background-color: white;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%) !important;
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: #e5e7eb;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%) !important;
  }
}

.custom-select {
  :deep(.el-input__wrapper) {
    height: 40px;
    padding: 4px 12px;
    background-color: white;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%) !important;
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: #e5e7eb;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%) !important;
  }

  :deep(.el-input__inner) {
    height: 30px;
    line-height: 30px;
  }

  :deep(.el-input) {
    height: 40px;
  }
}

.person-form-item {
  :deep(.el-form-item__label) {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 1;
  }

  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    height: 40px;
  }

  :deep(.person-label) {
    display: none;
  }

  :deep(.person-tags) {
    margin-left: 0;
  }

  :deep(.person-selector) {
    width: 100%;
  }

  :deep(.person-row) {
    align-items: center;
    min-height: 40px;
  }

  :deep(.el-button) {
    height: 40px;
    padding: 8px 12px;
    font-size: 13px;
  }

  :deep(.el-button span) {
    font-size: 13px;
  }
}

.panel-container {
  padding: 16px;
  overflow: hidden;
  background-color: white;
  border-radius: 12px;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 10%),
    0 1px 2px -1px rgb(0 0 0 / 10%);
}

.left-panel {
  align-self: flex-start; /* 高度自适应内容，不随右侧变化 */
}

.main-content {
  align-items: flex-start !important;
}

.panel-container :deep(.el-table) {
  border-radius: 8px;
}

.panel-container :deep(.el-card) {
  border-radius: 12px;
}

.left-panel :deep(.mt-3) {
  margin-top: 0;
}

.right-panel {
  width: 320px; /* 设置右侧面板固定宽度 */
  height: fit-content; /* 高度自适应内容 */
  padding: 0;
}

.right-panel :deep(.el-card) {
  margin: 0;
  border-radius: 12px;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
</style>
