<template>
  <el-dialog
    v-model="dialogVisible"
    title="新建项目"
    width="480px"
    :before-close="handleClose"
    class="create-project-modal"
    center
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">新建项目</span>
      </div>
    </template>

    <div class="modal-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="project-form"
        label-position="top"
      >
        <!-- 品牌选择 -->
        <el-form-item label="品牌" prop="brand" class="form-item">
          <el-select
            v-model="formData.brand"
            placeholder="请选择品牌"
            style="width: 100%"
            size="large"
            @change="handleBrandChange"
          >
            <el-option
              v-for="brand in Object.keys(brandSeriesData)"
              :key="brand"
              :label="brand"
              :value="brand"
            />
          </el-select>
        </el-form-item>

        <!-- 系列选择 -->
        <el-form-item label="系列" prop="series" class="form-item">
          <el-select
            v-model="formData.series"
            :placeholder="formData.brand ? '请选择系列' : '请先选择品牌'"
            style="width: 100%"
            size="large"
            :disabled="!formData.brand"
          >
            <el-option
              v-for="series in availableSeries"
              :key="series"
              :label="series"
              :value="series"
            />
          </el-select>
        </el-form-item>

        <!-- 产品名称 -->
        <el-form-item label="产品名称" prop="productName" class="form-item">
          <el-input
            v-model="formData.productName"
            placeholder="请输入产品名称"
            size="large"
          />
        </el-form-item>

        <!-- 优先级 -->
        <el-form-item label="优先级" prop="priority" class="form-item">
          <el-select
            v-model="formData.priority"
            placeholder="请选择优先级"
            style="width: 100%"
            size="large"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>

        <!-- PM负责人 -->
        <el-form-item label="PM负责人" prop="pmManagerId" class="form-item">
          <el-select
            v-model="formData.pmManagerId"
            placeholder="请选择PM负责人"
            style="width: 100%"
            size="large"
            filterable
          >
            <el-option
              v-for="user in mockUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            >
              <div class="user-option">
                <el-avatar :size="28" class="user-avatar">
                  {{ user.name.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- NPD负责人 -->
        <el-form-item label="NPD负责人" prop="npdManagerId" class="form-item">
          <el-select
            v-model="formData.npdManagerId"
            placeholder="请选择NPD负责人"
            style="width: 100%"
            size="large"
            filterable
          >
            <el-option
              v-for="user in mockUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            >
              <div class="user-option">
                <el-avatar :size="28" class="user-avatar">
                  {{ user.name.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 预计上市日期 -->
        <el-form-item
          label="预计上市日期"
          prop="expectedLaunchDate"
          class="form-item"
        >
          <el-date-picker
            v-model="formData.expectedLaunchDate"
            type="date"
            placeholder="请选择预计上市日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            size="large"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="handleClose" class="cancel-btn">
          取消
        </el-button>
        <el-button
          type="primary"
          size="large"
          @click="handleSave"
          :loading="saving"
          class="save-btn"
        >
          <el-icon class="btn-icon"><Document /></el-icon>
          创建项目
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Document } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:visible", "save"]);

// 响应式数据
const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref(null);

// 表单数据
const formData = ref({
  brand: "",
  series: "",
  productName: "",
  priority: "medium",
  pmManagerId: "",
  npdManagerId: "",
  expectedLaunchDate: ""
});

// 品牌和系列数据
const brandSeriesData = {
  "爵宴 Meatyway": ["键支系列", "营养系列", "健康系列", "美味系列"],
  "好适嘉 Healthguard": ["医疗系列", "保健系列", "康复系列", "预防系列"]
};

// 模拟用户数据
const mockUsers = ref([
  { id: "u1", name: "张三", email: "zhang@company.com" },
  { id: "u2", name: "李四", email: "li@company.com" },
  { id: "u3", name: "王五", email: "wang@company.com" },
  { id: "u4", name: "赵六", email: "zhao@company.com" },
  { id: "u5", name: "刘七", email: "liu@company.com" },
  { id: "u6", name: "陈八", email: "chen@company.com" }
]);

// 默认阶段模板
const defaultStages = [
  { id: "s1", name: "产品提案", status: "pending" },
  { id: "s2", name: "配方文件", status: "pending" },
  { id: "s3", name: "工厂报价", status: "pending" },
  { id: "s4", name: "终料文件", status: "pending" },
  { id: "s5", name: "CTM Plan", status: "pending" },
  { id: "s6", name: "69码申请", status: "pending" },
  { id: "s7", name: "产品下单", status: "pending" },
  { id: "s8", name: "包装资质验证", status: "pending" },
  { id: "s9", name: "生产周期", status: "pending" },
  { id: "s10", name: "产品培训", status: "pending" },
  { id: "s11", name: "详情页设计", status: "pending" },
  { id: "s12", name: "产品到仓", status: "pending" }
];

// 表单验证规则
const formRules = {
  brand: [{ required: true, message: "请选择品牌", trigger: "change" }],
  series: [{ required: true, message: "请选择系列", trigger: "change" }],
  productName: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    {
      min: 1,
      max: 50,
      message: "产品名称长度在 1 到 50 个字符",
      trigger: "blur"
    }
  ],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  pmManagerId: [
    { required: true, message: "请选择PM负责人", trigger: "change" }
  ],
  npdManagerId: [
    { required: true, message: "请选择NPD负责人", trigger: "change" }
  ],
  expectedLaunchDate: [
    { required: true, message: "请选择预计上市日期", trigger: "change" }
  ]
};

// 监听visible变化
watch(
  () => props.visible,
  newVal => {
    dialogVisible.value = newVal;
  }
);

watch(dialogVisible, newVal => {
  if (!newVal) {
    emit("update:visible", false);
  }
});

// 计算属性
const availableSeries = computed(() => {
  return formData.value.brand
    ? brandSeriesData[formData.value.brand] || []
    : [];
});

// 方法
const handleBrandChange = () => {
  // 品牌改变时重置系列选择
  formData.value.series = "";
};

const disabledDate = time => {
  // 不能选择过去的日期
  return time.getTime() < Date.now() - 8.64e7;
};

const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    // 生成新产品ID
    const newProductId = `product_${Date.now()}`;

    // 创建新产品对象
    const newProduct = {
      id: newProductId,
      brand: formData.value.brand,
      series: formData.value.series,
      productName: formData.value.productName,
      status: "开发中",
      expectedLaunchDate: formData.value.expectedLaunchDate,
      overallProgress: 0,
      priority: formData.value.priority,
      pmManager: mockUsers.value.find(u => u.id === formData.value.pmManagerId),
      npdManager: mockUsers.value.find(
        u => u.id === formData.value.npdManagerId
      ),
      stages: defaultStages.map((stage, index) => ({
        ...stage,
        id: `${newProductId}_s${index + 1}`
      }))
    };

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    emit("save", newProduct);
    handleClose();
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    saving.value = false;
  }
};

const handleClose = () => {
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.value = {
    brand: "",
    series: "",
    productName: "",
    priority: "medium",
    pmManagerId: "",
    npdManagerId: "",
    expectedLaunchDate: ""
  };
  dialogVisible.value = false;
};
</script>

<style scoped>
.create-project-modal {
  border-radius: 12px;
}

.create-project-modal :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 10%),
    0 10px 10px -5px rgb(0 0 0 / 4%);
}

.create-project-modal :deep(.el-dialog__header) {
  padding: 20px 24px 0;
  border-bottom: none;
}

.create-project-modal :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.create-project-modal :deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-content {
  padding: 8px 0;
}

.project-form {
  max-width: 100%;
}

.project-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.project-form :deep(.el-form-item__label) {
  padding: 0;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #1f2937;
}

.project-form :deep(.el-form-item__label::before) {
  margin-right: 4px;
  font-weight: bold;
  color: #ef4444;
  content: "*";
}

.project-form :deep(.el-form-item__content) {
  line-height: normal;
}

.project-form :deep(.el-input__wrapper) {
  height: 44px;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: none;
  transition: all 0.2s;
}

.project-form :deep(.el-input__wrapper:hover) {
  border-color: #9ca3af;
}

.project-form :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.project-form :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
  line-height: 42px;
  color: #1f2937;
}

.project-form :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

.project-form :deep(.el-select .el-input__wrapper) {
  cursor: pointer;
}

.project-form :deep(.el-select .el-input__suffix) {
  right: 12px;
}

.project-form :deep(.el-date-editor .el-input__wrapper) {
  padding-right: 12px;
  padding-left: 12px;
}

.project-form :deep(.el-date-editor .el-input__prefix) {
  left: 12px;
}

.project-form :deep(.el-date-editor .el-input__suffix) {
  right: 12px;
}

.user-option {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.user-avatar {
  flex-shrink: 0;
  font-size: 12px;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #1f2937;
}

.user-email {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.4;
  color: #6b7280;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
}

.cancel-btn {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.save-btn {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #2563eb;
}

.btn-icon {
  margin-right: 6px;
}

/* 选择器下拉框样式 */
:deep(.el-select-dropdown) {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}

:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 12px;
  font-size: 14px;
  transition: all 0.2s;
}

:deep(.el-select-dropdown__item:hover) {
  background: #f3f4f6;
}

:deep(.el-select-dropdown__item.selected) {
  font-weight: 500;
  color: #1d4ed8;
  background: #eff6ff;
}

/* 日期选择器样式 */
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-picker-panel) {
  border-radius: 6px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}
</style>
