<template>
  <div>
    <!-- 新增产品按钮 -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">产品维护列表</h2>
      <el-button type="primary" color="#161718" @click="showModal = true"
        >新增产品</el-button
      >
    </div>
    <!-- 产品列表 -->
    <productList ref="listRef" />
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
import { ElMessage } from "element-plus";
import factories from "./const";
import addProduct from "./addProduct.vue";
import productList from "./productList.vue";
console.log("factories:", factories);
const showModal = ref(false);
const saveProduct = () => {
  // 保存产品逻辑
  console.log("保存产品:", newProduct.value);
  ElMessage.success("产品保存成功");
  showModal.value = false;
};

const listRef = ref(null);

const refreshList = () => {
  listRef.value.fetchProductList();
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
