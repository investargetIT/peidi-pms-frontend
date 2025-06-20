<template>
  <div class="mt-3 rounded-sm">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="productName" label="产品信息">
        <template #default="scope">
          <div>{{ scope.row.productName }}</div>
          <div>{{ scope.row.brandName }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="pmDingUser" label="PM负责人">
        <template #default="scope">
          <div
            v-for="item in scope.row.pmDingUser"
            :key="item.dingId"
            class="userContainer"
          >
            <img :src="item.avatarUrl" class="userIcon" />
            <span>{{ item.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="npdDingUser" label="NPD负责人">
        <template #default="scope">
          <div
            v-for="item in scope.row.npdDingUser"
            :key="item.dingId"
            class="userContainer"
          >
            <img :src="item.avatarUrl" class="userIcon" />
            <span>{{ item.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="statusName" label="状态">
        <template #default="scope">
          <div
            :class="getStatusColor(scope.row.statusName)"
            class="status-badge"
          >
            {{ scope.row.statusName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="priorityName" label="优先级">
        <template #default="scope">
          <el-tag
            :type="scope.row.priorityName === '高' ? 'danger' : 'warning'"
          >
            {{ scope.row.priorityName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" />
        </template>
      </el-table-column>
      <el-table-column
        prop="expectedListingDate"
        label="预计上市"
      ></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="showDetails(scope.row)">详情</el-button>
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
import { ref, watch, computed } from "vue";
import { Badge } from "lucide-vue-next";
import { getProjectProgressList } from "@/api/progress";
import { ElMessage } from "element-plus";
import { getProductList, deleteProduct } from "@/api/pmApi.ts";
import UpdateDialog from "./UpdateDialog.vue";
import { reverseMapping, mapping } from "./utils";
import { debounce, storageLocal } from "@pureadmin/utils";
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
  }
});

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
      searchParams.searchType = "like";
      if (validKey.includes(key)) {
        searchParams.searValue = extractEmplId(props.searchInfo[key]).join(
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
    tableData.value = res?.data?.records || [];
    // pagination.value.total = res.data.total;
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

defineExpose({
  fetchProductList
});
</script>
<style scoped>
.hhh {
  color: red;
}

.userContainer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;

  .userIcon {
    width: 30px;
    height: 30px;
    margin-right: 5px;
    border-radius: 50%;
  }
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
