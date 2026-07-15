<template>
  <div class="classify-container">
    <!-- 页面头部 -->
    <div class="page-header flex justify-between items-center mb-4">
      <div class="header-left">
        <h1 class="text-2xl font-semibold">产品维护管理</h1>
        <p class="text-gray-500 mt-1 text-base">产品基础信息维护与管理</p>
      </div>
      <div class="header-right flex items-center gap-3">
        <el-button
          type="primary"
          class="flex items-center gap-2 px-4 h-9"
          color="#1a1a1a"
          @click="handleAddProduct"
          :disabled="!useAuthStoreHook().isAdmin"
        >
          <el-icon><Plus /></el-icon>
          新增产品
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div
      class="search-area px-6 py-5 rounded-2xl bg-white shadow-md mb-6 border border-gray-100"
    >
      <div class="mb-4 flex items-center gap-2">
        <el-icon class="text-blue-500 text-xl"><Search /></el-icon>
        <h3 class="text-lg font-semibold text-gray-700">筛选条件</h3>
      </div>
      <el-form :model="searchInfo" :inline="true" class="search-form">
        <div
          class="search-row flex flex-col gap-3 md:grid md:grid-cols-4 md:gap-4 mb-4"
        >
          <el-form-item prop="status" label="状态" class="w-full mb-0">
            <el-select
              v-model="searchInfo.status"
              placeholder="请选择状态"
              clearable
              class="custom-select"
              style="width: 100%"
            >
              <el-option
                v-for="item in statusList"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="productNo" label="产品编号" class="w-full mb-0">
            <el-input
              v-model="searchInfo.productNo"
              class="custom-search-input"
              placeholder="请输入产品编号"
              clearable
            />
          </el-form-item>
          <el-form-item prop="productName" label="产品名称" class="w-full mb-0">
            <el-input
              v-model="searchInfo.productName"
              class="custom-search-input"
              placeholder="请输入产品名称"
              clearable
            />
          </el-form-item>
          <el-form-item prop="spuId" label="SPU" class="w-full mb-0">
            <el-select
              v-model="searchInfo.spuId"
              placeholder="请选择SPU"
              clearable
              class="custom-select"
              style="width: 100%"
            >
              <el-option
                v-for="item in spuList"
                :label="item.value"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-row flex justify-end">
          <el-form-item class="w-full mb-0 flex items-end gap-2">
            <el-button
              type="primary"
              @click="handleSearch"
              :loading="loading"
              class="h-10 px-6"
            >
              <el-icon class="mr-1"><Search /></el-icon>
              搜索
            </el-button>
            <el-button
              @click="handleReset"
              :loading="loading"
              class="h-10 px-6"
            >
              <el-icon class="mr-1"><RefreshCcw /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 主要内容区域 -->
    <div class="classify-main-content">
      <!-- 产品列表 -->
      <div class="panel-container">
        <div class="panel-header">
          <h3 class="panel-title">产品列表</h3>
        </div>
        <productList
          ref="listRef"
          :searchInfo="searchInfo"
          :statusList="statusList"
        />
      </div>
    </div>

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
import { ref, onMounted, provide, nextTick } from "vue";
import { Search, Plus, RefreshCcw } from "lucide-vue-next";
import { fetchStatusList, getEnumList } from "@/api/pmApi.ts";
import { ElMessage } from "element-plus";
import factories from "./const";
import addProduct from "./addProduct.vue";
import productList from "./productList.vue";
import { useAuthStoreHook } from "@/store/modules/auth";
import { updateProductMaintainList } from "@/utils/permission";
const showModal = ref(false);
const statusList = ref([]);
const listRef = ref(null);
const loading = ref(false);
const initialSearchInfo = {
  status: "",
  productNo: "",
  productName: "",
  spuId: ""
};
const searchInfo = ref({ ...initialSearchInfo });

const handleAddProduct = () => {
  showModal.value = true;
  searchInfo.value = {
    status: "",
    productNo: "",
    productName: "",
    spuId: ""
  };
};

const handleSearch = () => {
  if (loading.value) return;
  loading.value = true;
  refreshList().finally(() => {
    loading.value = false;
  });
};

const handleReset = () => {
  if (loading.value) return;

  // 完全重置搜索表单
  searchInfo.value = { ...initialSearchInfo };

  // 等待 DOM 更新后再刷新列表
  nextTick(() => {
    loading.value = true;
    refreshList()
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        loading.value = false;
      });
  });
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
  if (listRef.value && listRef.value.fetchProductList) {
    return listRef.value.fetchProductList();
  }
  return Promise.resolve();
};

//#region SPU相关
const spuList = ref([]);
//#endregion

//#region 请求逻辑
// 获取枚举列表
const fetchEnumList = type => {
  getEnumList({ type })
    .then(res => {
      if (res.code === 200) {
        spuList.value = res.data || [];
      } else {
        ElMessage.error("获取枚举列表失败--" + res.msg);
      }
    })
    .catch(err => {
      ElMessage.error("获取枚举列表失败--" + err.message);
    });
};

// 依赖注入
provide("spuList", spuList);
//#endregion

onMounted(() => {
  fetchEnumList("spu");

  try {
    if (updateProductMaintainList()) {
      useAuthStoreHook().setIsAdmin(true);
    }
  } catch (error) {
    console.error("更新产品维护列表权限失败:", error);
  }
});
</script>

<style scoped>
.search-area {
  box-sizing: border-box;
}

.classify-main-content {
  box-sizing: border-box;
}

@media (width <= 768px) {
  .hidden-mobile {
    display: none !important;
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

  :deep(.search-area) {
    padding-right: 16px !important;
    padding-left: 20px !important;
  }
}

@media (width <= 480px) {
  .classify-container {
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
}

.classify-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 20px;
  overflow-x: hidden;
  background-color: #f5f5f5;
}

.page-header {
  h1 {
    letter-spacing: 0.5px;
  }
}

.search-form {
  .el-form-item {
    display: flex;
    align-items: flex-end;
    margin-bottom: 0;
  }

  .el-form-item__content {
    display: flex;
    align-items: center;
  }

  .el-form-item__label {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 1;
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

.panel-container {
  box-sizing: border-box;
  padding: 20px;
  overflow: hidden;
  background-color: white;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -2px rgb(0 0 0 / 10%);
}

.panel-container :deep(.el-table) {
  border-radius: 12px;
}

.panel-container :deep(.el-card) {
  border-radius: 12px;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}
</style>
