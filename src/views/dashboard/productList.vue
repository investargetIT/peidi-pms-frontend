<template>
  <div class="mt-3 rounded-sm table-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      :row-class-name="getRowClassName"
      size="small"
    >
      <el-table-column prop="productName" label="产品信息" min-width="200">
        <template #default="scope">
          <div>
            <div class="text-sm font-medium text-gray-900 product-name" :title="scope.row.productName">
              {{ scope.row.productName }}
            </div>
            <div class="text-xs text-gray-500 truncate" :title="scope.row.brandName">{{ scope.row.brandName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="pmDingUser" label="PM负责人" min-width="100">
        <template #default="scope">
          <div
            v-for="item in scope.row.pmDingUser"
            :key="item.dingId"
            class="text-xs text-gray-700 mb-0.5"
          >
            {{ item.userName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="npdDingUser" label="NPD负责人" min-width="100">
        <template #default="scope">
          <div
            v-for="item in scope.row.npdDingUser"
            :key="item.dingId"
            class="text-xs text-gray-700 mb-0.5"
          >
            {{ item.userName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="statusName" label="状态" width="100">
        <template #default="scope">
          <div
            :class="getStatusColor(scope.row.statusName)"
            class="status-badge"
          >
            {{ scope.row.statusName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="priorityName" label="优先级" width="90">
        <template #default="scope">
          <div
            :class="getPriorityColor(scope.row.priorityName)"
            class="priority-badge"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-3 h-3 mr-0.5"
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
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-3 h-3 mr-0.5"
                v-else-if="scope.row.priorityName === '中'"
              >
                <path
                  d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                ></path>
                <line x1="4" x2="4" y1="22" y2="15"></line>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-3 h-3 mr-0.5"
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
      <el-table-column prop="progress" label="进度" width="80">
        <template #default="scope">
          <span class="text-xs text-gray-700">{{ `${Math.round(scope.row.progress)}%` }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="expectedListingDate"
        label="预计上市"
        width="110"
      >
        <template #default="scope">
          <span class="text-xs text-gray-700">{{ scope.row.expectedListingDate || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90" align="center">
        <template #default="scope">
          <el-tooltip content="查看详情" placement="top">
            <button
              @click="handleShowDetails(scope.row)"
              class="inline-flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors p-1.5 bg-transparent border-none outline-none rounded hover:bg-blue-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-4 h-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </el-tooltip>
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
import { ref, watch, computed, readonly, onMounted } from "vue";
import { Badge } from "lucide-vue-next";
import { getProjectProgressList } from "@/api/progress";
import { ElMessage } from "element-plus";
import { getProductList, deleteProduct } from "@/api/pmApi.ts";
import UpdateDialog from "./UpdateDialog.vue";
import { reverseMapping, mapping } from "./utils";
import { debounce, storageLocal } from "@pureadmin/utils";
import Avatar from "@/assets/user.jpg";
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

// 移除自动监听，改为手动触发搜索

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

const getStatusType = (status: string) => {
  switch (status) {
    case "开发中":
      return "primary";
    case "已上市":
    case "已上架":
    case "审核通过":
      return "success";
    case "待开始":
      return "info";
    case "已放弃":
      return "danger";
    default:
      return "";
  }
};

const getPriorityType = (priority: string) => {
  switch (priority) {
    case "高":
      return "danger";
    case "中":
      return "warning";
    case "低":
      return "success";
    default:
      return "";
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
  const searchArr = [];
  console.log("props.searchInfo:", props.searchInfo);

  if (!props.searchInfo) {
    const commonInfo = { searchStr: JSON.stringify([]) };
    return getProjectProgressList(commonInfo).then(res => {
      tableData.value = (res?.data || []).sort((a, b) => b.id - a.id);
      emit("updateTableData", tableData.value);
    });
  }

  Object.keys(props.searchInfo)?.forEach(key => {
    const value = props.searchInfo[key];

    // 检查值是否有效
    let isValid = false;
    if (Array.isArray(value)) {
      isValid = value.length > 0;
    } else if (typeof value === 'string') {
      isValid = value.trim() !== '';
    } else if (value !== null && value !== undefined) {
      isValid = true;
    }

    if (isValid) {
      const searchParams = {};
      const keyMap = {
        pmUserName: "pm",
        npdUserName: "npd",
        brandName: "brandName"
      };
      searchParams.searchName = keyMap[key] || key;
      searchParams.searchType = "like";

      const validKey = ["pmUserName", "npdUserName"];
      if (validKey.includes(key)) {
        searchParams.searchValue = extractEmplId(value).join("&#&");
      } else {
        searchParams.searchValue = value;
      }
      searchArr.push(searchParams);
    }
  });

  console.log("searchArr:", searchArr);
  const commonInfo = { searchStr: JSON.stringify(searchArr) };
  return getProjectProgressList(commonInfo).then(res => {
    // 产品进度列表顺序按照id从大到小排序
    tableData.value = (res?.data || []).sort((a, b) => b.id - a.id);
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

onMounted(() => {
  // 组件挂载时获取初始数据
  fetchProductList();
});

defineExpose({
  fetchProductList,
  tableData: readonly(tableData)
});
</script>
<style scoped>
/* 手机端适配 */
@media (width <= 768px) {
  :deep(.el-table th.el-table__cell),
  :deep(.el-table td.el-table__cell) {
    padding: 8px 4px;
    font-size: 12px;
  }

  :deep(.el-table th .cell),
  :deep(.el-table td .cell) {
    padding: 0;
    word-break: break-word;
    white-space: normal;
  }

  /* 调整徽章在小屏幕上的显示 */
  .status-badge,
  .priority-badge {
    padding: 1px 6px;
    font-size: 10px;
  }

  .priority-badge svg {
    width: 10px;
    height: 10px;
  }
}

@media (width <= 480px) {
  :deep(.el-table th.el-table__cell),
  :deep(.el-table td.el-table__cell) {
    padding: 6px 2px;
    font-size: 11px;
  }

  /* 在极小屏幕上进一步缩小徽章 */
  .status-badge,
  .priority-badge {
    padding: 1px 6px;
    font-size: 9px;
  }

  .priority-badge svg {
    width: 8px;
    height: 8px;
    margin-right: 2px;
  }
}

.hhh {
  color: red;
}

.table-container {
  overflow-x: auto;
  box-sizing: border-box;
}

/* 表格表头样式 */
:deep(.el-table thead) {
  background-color: #f9fafb;
}

:deep(.el-table th.el-table__cell) {
  padding: 10px 12px;
  font-weight: 500;
  color: #374151;
  text-align: left;
  background-color: #f9fafb !important;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

:deep(.el-table th .cell) {
  font-weight: 500;
  color: #374151;
}

/* 表格行样式优化 */
:deep(.el-table td.el-table__cell) {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
}

/* 表格列内容处理 */
:deep(.el-table .cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* 状态和优先级列特殊处理 */
:deep(.el-table td .status-badge),
:deep(.el-table td .priority-badge) {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  white-space: nowrap;
}

/* 产品名称最多显示2行，超过显示省略号 */
.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.4;
  max-height: 2.8em;
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
  width: 100%;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* 允许横向滚动 */
:deep(.el-table__body-wrapper) {
  overflow-x: auto !important;
}

:deep(.el-table__header-wrapper) {
  overflow-x: auto !important;
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
  flex-shrink: 0;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  cursor: default;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.2s;
}

.status-badge {
  display: inline-block;
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
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
