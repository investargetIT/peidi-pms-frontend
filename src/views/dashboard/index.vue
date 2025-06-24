<template>
  <div class="dashboard-container p-6">
    <!-- 页面头部 -->
    <div class="page-header flex justify-between items-center mb-8">
      <div class="header-left">
        <h1 class="text-2xl font-semibold">项目进度管理系统</h1>
        <p class="text-gray-500 mt-2 text-base">产品开发全流程跟踪与管理</p>
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
    <div class="statistics-panel grid grid-cols-3 gap-6 mb-8">
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-500 text-base">总项目数</div>
        <div class="text-3xl font-semibold mt-2">{{ totalProjectCount }}</div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <div
            class="w-15 h-15 rounded-full bg-blue-50/50 flex items-center justify-center"
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
    <div class="search-area w-full bg-white rounded-lg shadow-sm mb-6">
      <div class="w-full p-4">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <!-- 第一行：产品名称、品牌、状态 -->
          <div class="search-row flex items-center gap-4 mb-4">
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
          <div class="search-row flex items-start gap-4">
            <PersonSelector label="PM负责人" v-model="searchForm.pmUserName" />
            <PersonSelector
              label="NPD负责人"
              v-model="searchForm.npdUserName"
            />
          </div>
        </el-form>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content flex gap-6">
      <!-- 左侧产品列表 -->
      <div class="left-panel flex-1">
        <productList
          ref="listRef"
          :searchInfo="searchForm"
          :statusList="statusList"
          @selectProject="handleSelectProject"
          @updateTableData="handleUpdateTableData"
        />
      </div>

      <!-- 右侧项目详情 -->
      <ProjectDetail
        :selectedProject="selectedProject"
        :stageList="stageList"
        :stageStatusList="stageStatusList"
      />
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
import { ref, computed } from "vue";

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
  return tableData.value.filter(item => item.statusId === 113)?.length || 0;
});

const listedCount = computed(() => {
  return tableData.value.filter(item => item.statusId === 114).length;
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  h1 {
    letter-spacing: 0.5px;
  }
}

.statistics-panel {
  .stat-card {
    position: relative;
    border: 1px solid #eee;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
      transform: translateY(-2px);
    }
  }
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
</style>
