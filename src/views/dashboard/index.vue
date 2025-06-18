<template>
  <div>
    <!-- 页面头部 -->
    <div class="page-header flex justify-between items-center mb-6">
      <div class="header-left">
        <h1 class="text-2xl font-bold">项目进度管理系统</h1>
        <p class="text-gray-600 mt-1">产品开发全流程跟踪与管理</p>
      </div>
      <div class="header-right flex items-center gap-3">
        <el-button class="flex items-center gap-2">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button
          type="primary"
          class="flex items-center gap-2"
          color="#1a1a1a"
        >
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </div>
    <!-- 统计面板 -->
    <div class="statistics-panel flex gap-4 mb-6">
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-600">总项目数</div>
        <div class="text-3xl font-bold mt-2">3</div>
        <div class="absolute right-4 top-4">
          <el-icon class="text-blue-400"><Calendar /></el-icon>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-600">开发中</div>
        <div class="text-3xl font-bold mt-2 text-blue-500">2</div>
        <div class="absolute right-4 top-4">
          <el-icon class="text-blue-400"><Loading /></el-icon>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-600">已上市</div>
        <div class="text-3xl font-bold mt-2 text-green-500">1</div>
        <div class="absolute right-4 top-4">
          <el-icon class="text-green-400"><Check /></el-icon>
        </div>
      </div>
    </div>
    <!-- 新增产品按钮 -->
    <div class="flex justify-between items-center">
      <div class="container">
        <h2 class="text-2xl font-bold mb-4">产品维护列表</h2>
        <div class="search-wrapper flex items-center gap-4">
          <el-input
            v-model="searchInfo.keyword"
            style="width: 400px"
            placeholder="搜索产品名称、品牌、系列、PM负责人或NPD负责人..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            style="width: 120px"
            v-model="searchInfo.status"
            placeholder="全部状态"
            clearable
          >
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <el-button type="primary" color="#161718" @click="handleAddProduct"
        >新增产品</el-button
      >
    </div>
    <!-- 产品列表 -->
    <productList
      ref="listRef"
      :searchInfo="searchInfo"
      :statusList="statusList"
    />
    <!-- 新增产品弹窗 -->
    <addProduct
      v-if="showModal"
      v-model:visible="showModal"
      :factories="factories"
      @refresh="refreshList"
      :saveProduct="saveProduct"
    ></addProduct>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { fetchStatusList } from "@/api/pmApi.ts";
import { ElMessage } from "element-plus";
import {
  Calendar,
  Loading,
  Check,
  Search,
  Download,
  Plus
} from "@element-plus/icons-vue";
import factories from "./const";
import addProduct from "./addProduct.vue";
import productList from "./productList.vue";
const showModal = ref(false);
const statusList = ref([]);
const listRef = ref(null);
const searchInfo = ref({
  status: "",
  productNo: "",
  productName: "",
  keyword: ""
});

const handleAddProduct = () => {
  showModal.value = true;
  searchInfo.value = {
    status: "",
    productNo: "",
    productName: "",
    keyword: ""
  };
};

const getStatusList = () => {
  fetchStatusList().then(res => {
    if (res.code === 200) {
      statusList.value = res.data?.map(item => {
        return {
          label: item.value,
          value: item.id
        };
      });
    }
  });
};
getStatusList();
const saveProduct = () => {
  // 保存产品逻辑
  console.log("保存产品:", newProduct.value);
  ElMessage.success("产品保存成功");
  showModal.value = false;
};

const refreshList = () => {
  listRef.value.fetchProductList();
};
</script>

<style scoped>
.page-header {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.dialog-footer {
  text-align: right;
}

.container {
  display: flex;
  gap: 20px;

  .el-select {
    margin-left: 10px;
  }
}

.statistics-panel {
  .stat-card {
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
      transform: translateY(-2px);
    }
  }
}
</style>
