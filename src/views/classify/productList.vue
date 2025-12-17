<template>
  <div class="mt-3 rounded-sm">
    <el-table
      :data="tableData"
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="productNo" label="产品编号">
        <template #default="scope">
          <span
            @click="
              selectedDetails = scope.row;
              recordDialogVisible = true;
            "
            class="cursor-pointer underline"
            >{{ scope.row.productNo }}</span
          >
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="产品名称"></el-table-column>
      <el-table-column prop="statusName" label="状态">
        <template #default="scope">
          <div class="flex gap-2">
            <el-popover
              v-for="(status, index) in getStatusTags(scope.row.statusName)"
              :key="index"
              placement="top"
              trigger="hover"
              :content="`记录数：${status?.number}`"
            >
              <template #reference>
                <el-tag
                  class="mx-1"
                  :type="status?.text === '审核通过' ? 'success' : 'info'"
                >
                  {{ status?.text }}
                </el-tag>
              </template>
            </el-popover>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createAt" label="创建时间" sortable="custom">
        <template #default="scope">
          <!-- 格式化时间 -->
          {{
            scope.row.createAt
              ? dayjs(scope.row.createAt).format("YYYY-MM-DD HH:mm:ss")
              : ""
          }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="showDetails(scope.row)">详情</el-button>
          <el-button
            @click="deleteProductFun(scope.row)"
            type="danger"
            :disabled="!useAuthStoreHook().isAdmin"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="handlePageChange"
      :current-page="pagination.pageNo"
      :page-size="pagination.pageSize"
      layout="total, prev, pager, next"
      :total="pagination.total"
      style="width: 100%; margin-top: 20px; text-align: center"
    ></el-pagination>
    <addProduct
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      :details="selectedDetails"
      :isEdit="true"
      @refresh="fetchProductList"
    ></addProduct>
    <recordList
      v-if="recordDialogVisible"
      v-model:visible="recordDialogVisible"
      :details="selectedDetails"
      :statusList="props.statusList"
      @refresh="fetchProductList"
    ></recordList>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { getProductList, deleteProduct } from "@/api/pmApi.ts";
import UpdateDialog from "./UpdateDialog.vue";
import { reverseMapping, mapping } from "./utils";
import { debounce, storageLocal } from "@pureadmin/utils";
import addProduct from "./addProduct.vue";
import recordList from "./recordList.vue";
import { status } from "nprogress";
import { useAuthStoreHook } from "@/store/modules/auth";
import { ElMessageBox } from "element-plus";
import dayjs from "dayjs";
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
  sortStr?: string;
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

//#region 排序逻辑
// 请求的排序参数
const sortStr = ref<{ sortName: string; sortType: string }[]>([]);
// 处理排序变化
const handleSortChange = (column: any) => {
  console.log("column:", column);
  // 处理排序逻辑
  if (column.column.sortable === "custom") {
    // 自定义排序逻辑
    // 这里可以根据 column.prop 来判断是哪个列在排序
    // 并根据 column.order 来判断排序方向（ascending 或 descending）
    // 最后更新表格数据即可
    if (!column.order) {
      sortStr.value = [];
    }
    if (column.order === "descending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "desc"
        }
      ];
    }
    if (column.order === "ascending") {
      sortStr.value = [
        {
          sortName: column.prop,
          sortType: "asc"
        }
      ];
    }
    fetchProductList();
  }
};
//#endregion

const fetchProductList = () => {
  const searchStr: any = [];
  const commonInfo: IQueryParams = {
    pageNo: pagination.value.pageNo,
    pageSize: pagination.value.pageSize
  };
  const searchArr = [] as any;
  Object.keys(props.searchInfo)?.forEach(key => {
    const searchParams = {} as any;
    if (props.searchInfo[key]) {
      searchParams.searchName = key;
      searchParams.searchType = "like";
      searchParams.searchValue = props.searchInfo[key];
      searchArr.push(searchParams);
    }
  });
  commonInfo.searchStr = JSON.stringify(searchArr);
  commonInfo.sortStr = JSON.stringify(sortStr.value);
  getProductList(commonInfo).then(res => {
    console.log("getProductList:", res);
    // 为每个产品添加默认状态
    const products = res.data.records.map(product => ({
      ...product
    }));
    tableData.value = products.map(product => reverseMapping(product));
    pagination.value.total = res.data.total;
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

const deleteProductFun = row => {
  ElMessageBox.confirm(`确认删除产品 【${row.productName}】 吗？`, "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
    confirmButtonClass: "el-button--danger"
  })
    .then(() => {
      deleteProduct(mapping(row)).then(res => {
        if (res.code === 200) {
          ElMessage.success("删除成功");
          fetchProductList();
        }
      });
    })
    .catch(() => {});
};

fetchProductList();

defineExpose({
  fetchProductList
});
</script>
<style>
.hhh {
  color: red;
}
</style>
