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
        <div class="text-3xl font-semibold mt-2">3</div>
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
        <div class="text-3xl font-semibold mt-2 text-blue-500">2</div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <div
            class="w-6 h-6 rounded-full bg-blue-50/50 flex items-center justify-center"
          >
            <el-icon class="text-blue-400" style="font-size: 14px"
              ><Loading
            /></el-icon>
          </div>
        </div>
      </div>
      <div class="stat-card bg-white rounded-lg p-4 flex-1 shadow-sm">
        <div class="text-gray-500 text-base">已上市</div>
        <div class="text-3xl font-semibold mt-2 text-green-500">1</div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <div
            class="w-6 h-6 rounded-full bg-green-50/50 flex items-center justify-center"
          >
            <el-icon class="text-green-400" style="font-size: 14px"
              ><Check
            /></el-icon>
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
              <el-input
                v-model="searchForm.brand"
                class="custom-search-input"
                placeholder="品牌"
                clearable
              >
                <template #prefix>
                  <el-icon class="text-gray-400"><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="status" label="状态" class="flex-1 mb-0">
              <el-select
                v-model="searchForm.status"
                placeholder="全部状态"
                clearable
                class="custom-select"
                style="width: 100%"
              >
                <el-option
                  v-for="item in statusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 第二行：PM负责人和NPD负责人 -->
          <div class="search-row flex items-start gap-4">
            <div class="person-selector flex-1">
              <div class="person-row flex items-center">
                <div class="person-label">需求发起人</div>
                <div class="person-tags flex-1 ml-4">
                  <el-tag
                    v-for="tag in searchForm.requester"
                    :key="tag.emplId"
                    :disable-transitions="false"
                    closable
                    @close="removeRequester(tag)"
                    class="mr-2"
                  >
                    {{ tag.name }}
                  </el-tag>
                  <el-button
                    class="add-person-btn"
                    size="small"
                    @click="choosePerson('contacter')"
                  >
                    + 需求发起人
                  </el-button>
                </div>
              </div>
            </div>
            <div class="person-selector flex-1">
              <div class="person-row flex items-center">
                <div class="person-label">承接人</div>
                <div class="person-tags flex-1 ml-4">
                  <el-tag
                    v-for="tag in searchForm.assignee"
                    :key="tag.emplId"
                    :disable-transitions="false"
                    closable
                    @close="removeAssignee(tag)"
                    class="mr-2"
                  >
                    {{ tag.name }}
                  </el-tag>
                  <el-button
                    class="add-person-btn"
                    size="small"
                    @click="choosePerson('worker')"
                  >
                    + 承接人
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 产品列表 -->
    <productList
      ref="listRef"
      :searchInfo="searchForm"
      :statusList="statusList"
    />

    <!-- 新增产品弹窗 -->
    <addProduct
      v-if="showModal"
      v-model:visible="showModal"
      :factories="factories"
      @refresh="refreshList"
      :saveProduct="saveProduct"
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
import { ref } from "vue";
import { initDingH5RemoteDebug } from "dingtalk-h5-remote-debug";
import { fetchStatusList } from "@/api/pmApi.ts";
import { ElMessage } from "element-plus";
import {
  Calendar as ElementCalendar,
  Loading,
  Check,
  Search as ElementSearch
} from "@element-plus/icons-vue";
import factories from "./const";
import addProduct from "./addProduct.vue";
import productList from "./productList.vue";
const showModal = ref(false);
const statusList = ref([]);
const listRef = ref(null);
const searchForm = ref({
  productName: "",
  brand: "",
  keyword: "",
  status: "",
  productNo: "",
  requester: [],
  assignee: []
});
const DINGTALK_CORP_ID = "dingfc722e531a4125b735c2f4657eb6378f";
setTimeout(() => {
  initDingH5RemoteDebug();
}, 100);
const choosePerson = type => {
  let data_this =
    type == "contacter"
      ? searchForm.value.requester
      : searchForm.value.assignee;
  // let test = [{ "avatar": "", "name": "台江鹏", "emplId": "474805081221550528" }];
  // if (type == 'contacter') {
  //   form.value.requester = (test)
  // }
  // if (type == 'worker') {
  //   form.value.assignee = (test)
  // }
  // return
  dd.biz.contact.choose({
    multiple: true, //是否多选：true多选 false单选； 默认true
    users: extractEmplId(data_this), //默认选中的用户列表，员工userid；成功回调中应包含该信息
    corpId: DINGTALK_CORP_ID, //企业id
    max: 10, //人数限制，当multiple为true才生效，可选范围1-1500
    onSuccess: function (data) {
      console.log("data", data);
      if (type == "contacter") {
        searchForm.value.requester = data;
      }
      if (type == "worker") {
        searchForm.value.assignee = data;
      }
      // alert("dd successs: " + JSON.stringify(data));
    },
    onFail: function (err) {}
  });
};

const extractEmplId = users => {
  return users.map(user => user.emplId);
};

const removeRequester = tag => {
  const index = searchForm.value.requester.findIndex(
    item => item.emplId === tag.emplId
  );
  if (index > -1) {
    searchForm.value.requester.splice(index, 1);
  }
};

const removeAssignee = tag => {
  const index = searchForm.value.assignee.findIndex(
    item => item.emplId === tag.emplId
  );
  if (index > -1) {
    searchForm.value.assignee.splice(index, 1);
  }
};

const handleAddProduct = () => {
  showModal.value = true;
  searchForm.value = {
    productName: "",
    brand: "",
    keyword: "",
    status: "",
    productNo: "",
    contacters: [],
    workers: []
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

.person-selector {
  .person-label {
    min-width: 80px;
    font-size: 14px;
    color: #666;
    white-space: nowrap;
  }

  .person-row {
    align-items: center;
  }

  .person-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .add-person-btn {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
    color: #666;
    background: transparent;
    border: 1px dashed #d9d9d9;

    &:hover {
      color: #1890ff;
      border-color: #1890ff;
    }
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
