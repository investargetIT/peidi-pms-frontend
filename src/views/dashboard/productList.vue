<template>
  <div class="mt-3 rounded-sm table-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      :row-class-name="getRowClassName"
      :scrollbar-always-on="true"
    >
      <el-table-column prop="productName" label="产品信息" min-width="200">
        <template #default="scope">
          <div>
            <div class="text-base font-medium text-gray-900">
              {{ scope.row.productName }}
            </div>
            <div class="text-xs text-gray-500">{{ scope.row.brandName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="pmDingUser" label="PM负责人" min-width="160">
        <template #default="scope">
          <div
            v-for="item in scope.row.pmDingUser"
            :key="item.dingId"
            class="flex items-center gap-2 mb-2"
          >
            <span
              class="relative flex shrink-0 overflow-hidden rounded-full w-6 h-6"
            >
              <img
                v-if="item.avatarUrl"
                :src="item.avatarUrl"
                class="flex h-full w-full items-center justify-center rounded-full object-cover"
                :alt="item.userName"
              />
              <span
                v-else
                class="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600"
              >
                {{ item.userName ? item.userName.charAt(0) : "?" }}
              </span>
            </span>
            <span class="text-sm text-gray-900">{{ item.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="npdDingUser" label="NPD负责人" min-width="160">
        <template #default="scope">
          <div
            v-for="item in scope.row.npdDingUser"
            :key="item.dingId"
            class="flex items-center gap-2 mb-2"
          >
            <span
              class="relative flex shrink-0 overflow-hidden rounded-full w-6 h-6"
            >
              <img
                v-if="item.avatarUrl"
                :src="item.avatarUrl"
                class="flex h-full w-full items-center justify-center rounded-full object-cover"
                :alt="item.userName"
              />
              <span
                v-else
                class="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600"
              >
                {{ item.userName ? item.userName.charAt(0) : "?" }}
              </span>
            </span>
            <span class="text-sm text-gray-900">{{ item.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="statusName" label="状态" min-width="120">
        <template #default="scope">
          <div
            :class="getStatusColor(scope.row.statusName)"
            class="status-badge"
          >
            {{ scope.row.statusName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="priorityName" label="优先级" min-width="100">
        <template #default="scope">
          <div
            :class="getPriorityColor(scope.row.priorityName)"
            class="priority-badge"
          >
            <div class="flex items-center">
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
                v-if="scope.row.priorityName === '高'"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
                ></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
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
                v-else-if="scope.row.priorityName === '中'"
              >
                <path
                  d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                ></path>
                <line x1="4" x2="4" y1="22" y2="15"></line>
              </svg>
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
                v-else-if="scope.row.priorityName === '低'"
              >
                <path
                  d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                ></path>
                <line x1="4" x2="4" y1="22" y2="15"></line>
              </svg>
              {{ scope.row.priorityName }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度" min-width="160">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" />
        </template>
      </el-table-column>
      <el-table-column
        prop="expectedListingDate"
        label="预计上市"
        min-width="160"
      ></el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="scope">
          <button
            @click="handleShowDetails(scope.row)"
            class="inline-flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors p-1 bg-transparent border-none outline-none"
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
              class="w-4 h-4"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <el-pagination
      @current-change="handlePageChange"
      :current-page="pagination.pageNo"
      :page-size="pagination.pageSize"
      layout="total, prev, pager, next"
      :total="pagination.total"
      style="width: 100%; margin-top: 20px; text-align: center"
    ></el-pagination> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, readonly } from "vue";
import { Badge } from "lucide-vue-next";
import { getProjectProgressList } from "@/api/progress";
import { ElMessage } from "element-plus";
import { getProductList, deleteProduct } from "@/api/pmApi.ts";
import UpdateDialog from "./UpdateDialog.vue";
import { reverseMapping, mapping } from "./utils";
import { debounce, storageLocal } from "@pureadmin/utils";
import Avatar from "@/assets/user.jpg";
import { tr } from "element-plus/es/locale/index.mjs";
const tableData = ref([]);
const pagination = ref({
  pageNo: 1,
  pageSize: 10,
  total: 0
});
const dialogVisible = ref(false);
const recordDialogVisible = ref(false);
const selectedDetails = ref({});
// 在 computed 部分添加状态转换函数
const getStatusTags = computed(() => {
  return (statusName: string) => {
    if (!statusName) return [];
    return statusName
      .split(",")
      .map(item => item.trim())
      .map(item => {
        const [_, text, number] = item.match(/^([\p{Script=Han}]+)\((\d+)\)$/u);
        return {
          text,
          number
        };
      });
  };
});

const props = defineProps({
  searchInfo: {
    type: Object,
    default: () => ({
      sStatus: "",
      productNo: "",
      productName: ""
    })
  },
  statusList: {
    type: Array,
    default: () => []
  },
  selectedProject: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(["selectProject", "updateTableData"]);

interface IQueryParams {
  pageNo: number;
  pageSize: number;
  searchStr?: string;
}

const debouncedFetch = debounce(() => {
  fetchProductList();
}, 500);

watch(
  () => props.searchInfo,
  newVal => {
    debouncedFetch();
  },
  { immediate: true, deep: true }
);

const getStatusColor = (status: string) => {
  switch (status) {
    case "开发中":
      return "status-developing";
    case "已上市":
      return "status-listed";
    case "待开始":
      return "status-pending";
    case "审核通过":
      return "status-approved";
    case "已上架":
      return "status-listed";
    case "已放弃":
      return "status-abandoned";
    default:
      return "status-default";
  }
};

const getPriorityColor = (priority: string) => {
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

function extractEmplId(arr) {
  const result = [];
  for (const item of arr) {
    result.push(item.emplId || item.userId);
  }
  return result;
}

const fetchProductList = () => {
  const searchStr: any = [];
  const commonInfo = {} as any;
  const searchArr = [] as any;
  console.log("props.searchInfo:", props.searchInfo);
  Object.keys(props.searchInfo)?.forEach(key => {
    const searchParams = {} as any;
    const validKey = ["pmUserName", "npdUserName"];
    const isValidStringKey =
      props.searchInfo[key] && !Array.isArray(props.searchInfo[key]);
    const isValidArrKey =
      Array.isArray(props.searchInfo[key]) && props.searchInfo[key].length > 0;
    if (isValidStringKey || isValidArrKey) {
      searchParams.searchName = key;
      const keyMap = {
        pmUserName: "pm",
        npdUserName: "npd"
      };
      searchParams.searchName = keyMap[key] || key;
      searchParams.searchType = "like";
      if (validKey.includes(key)) {
        searchParams.searchValue = extractEmplId(props.searchInfo[key]).join(
          "&#&"
        );
      } else {
        searchParams.searchValue = props.searchInfo[key];
      }
      searchArr.push(searchParams);
    }
  });
  console.log("searchArr:", searchArr);
  commonInfo.searchStr = JSON.stringify(searchArr);
  getProjectProgressList(commonInfo).then(res => {
    tableData.value = res?.data || [];
    // pagination.value.total = res.data.total;

    // 将数据传递给父组件
    emit("updateTableData", tableData.value);
  });
};

const handlePageChange = (pageNo: number) => {
  pagination.value.pageNo = pageNo;
  fetchProductList();
};

const showDetails = row => {
  selectedDetails.value = { ...row };
  console.log("selectedDetails:", selectedDetails.value);

  dialogVisible.value = true;
};

const handleShowDetails = row => {
  emit("selectProject", row);
};

// 获取行的类名，用于高亮选中行
const getRowClassName = ({ row, rowIndex }) => {
  if (props.selectedProject && props.selectedProject.id === row.id) {
    return "selected-row";
  }
  return "";
};

defineExpose({
  fetchProductList,
  tableData: readonly(tableData)
});
</script>
<style scoped>
.hhh {
  color: red;
}

/* 表格容器样式 */
.table-container {
  width: 100%;
  border-radius: 8px;
}

/* 表格表头样式 */
:deep(.el-table thead) {
  background-color: #f9fafb;
}

:deep(.el-table th.el-table__cell) {
  padding: 16px;
  font-weight: 500;
  color: #111827;
  text-align: left;
  background-color: #f9fafb !important;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.el-table th .cell) {
  font-weight: 500;
  color: #111827;
}

/* 表格行样式优化 */
:deep(.el-table td.el-table__cell) {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-table tbody tr:hover > td) {
  background-color: #f8fafc !important;
}

/* 选中行样式 */
:deep(.el-table .selected-row > td) {
  background-color: #dbeafe !important;
  border-color: #93c5fd;
}

:deep(.el-table .selected-row:hover > td) {
  background-color: #bfdbfe !important;
}

/* 表格整体样式 */
:deep(.el-table) {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* 表格横向滚动样式 */
:deep(.el-table__body-wrapper) {
  overflow-x: auto !important;
}

:deep(.el-table__header-wrapper) {
  overflow-x: hidden !important;
}

/* 自定义滚动条样式 */
:deep(.el-scrollbar__bar.is-horizontal) {
  bottom: 0;
  height: 8px;
}

:deep(.el-scrollbar__thumb) {
  background-color: #c1c1c1;
  border-radius: 4px;
}

:deep(.el-scrollbar__thumb:hover) {
  background-color: #a8a8a8;
}

:deep(.el-scrollbar__track) {
  background-color: #f1f1f1;
  border-radius: 4px;
}

/* 确保固定列正常工作 */
:deep(.el-table__fixed-right) {
  right: 0 !important;
  z-index: 10;
}

:deep(.el-table__fixed-right-patch) {
  right: 0 !important;
}

:deep(.el-table__inner-wrapper::before) {
  display: none;
}

:deep(.el-table::before) {
  display: none;
}

/* 表格头部圆角 */
:deep(.el-table thead th:first-child) {
  border-top-left-radius: 8px;
}

:deep(.el-table thead th:last-child) {
  border-top-right-radius: 8px;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 400;
  cursor: default;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.2s;
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

.status-default {
  color: #8c8c8c;
  background-color: #f5f5f5;
}
</style>
