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
        <el-form-item label="品牌" prop="brandId" class="form-item">
          <el-select
            v-model="formData.brandId"
            placeholder="请选择品牌"
            style="width: 100%"
            size="large"
            @change="handleBrandChange"
          >
            <el-option
              v-for="item in brandList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 系列选择 -->
        <el-form-item label="系列" prop="seriesId" class="form-item">
          <el-select
            v-model="formData.seriesId"
            :placeholder="formData.brandId ? '请选择系列' : '请先选择品牌'"
            style="width: 100%"
            size="large"
            :disabled="!formData.brandId"
          >
            <el-option
              v-for="item in seriesList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
        <el-form-item label="优先级" prop="priorityId" class="form-item">
          <el-select
            v-model="formData.priorityId"
            placeholder="请选择优先级"
            style="width: 100%"
            size="large"
          >
            <el-option
              v-for="item in priorityList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- PM负责人 -->
        <el-form-item label="PM负责人" prop="pmDingIds" class="form-item">
          <PersonSelector
            label="PM负责人"
            v-model="formData.pmDingIds"
            @change="handlePersonChange('pmDingIds')"
            :show-avatar="true"
          />
        </el-form-item>

        <!-- NPD负责人 -->
        <el-form-item label="NPD负责人" prop="npdDingIds" class="form-item">
          <PersonSelector
            label="NPD负责人"
            v-model="formData.npdDingIds"
            @change="handlePersonChange('npdDingIds')"
            :show-avatar="true"
          />
        </el-form-item>

        <!-- 预计上市日期 -->
        <el-form-item
          label="预计上市日期"
          prop="expectedListingDate"
          class="form-item"
        >
          <el-date-picker
            v-model="formData.expectedListingDate"
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
import { getProjectTypeList, addProjectProgress } from "@/api/progress";
import PersonSelector from "@/components/PersonSelector.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  brandList: {
    type: Array,
    default: () => []
  },
  priorityList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:visible", "save"]);

// 响应式数据
const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref(null);
const seriesList = ref([]);

const handlePersonChange = type => {
  formRef.value.validateField(type);
};

// 表单数据
const formData = ref({
  brandId: "",
  seriesId: "",
  productName: "",
  priorityId: "",
  pmDingIds: [],
  npdDingIds: [],
  expectedListingDate: ""
});

// 自定义校验函数
const validatePersonArray = (rule, value, callback) => {
  if (!value || value.length === 0) {
    console.log("验证失败: 数据为空");
    callback(new Error(rule.message));
    return;
  }

  if (!Array.isArray(value)) {
    console.log("验证失败: 不是数组");
    callback(new Error("数据格式错误，请重新选择人员"));
    return;
  }

  const isValidArray = value.every(
    item => item && typeof item === "object" && item.emplId && item.name
  );

  console.log("isValidArray:", isValidArray);

  if (!isValidArray) {
    console.log("验证失败: 数组元素格式不正确");
    callback(new Error("人员数据格式不正确，请重新选择"));
    return;
  }

  console.log("验证通过");
  callback();
};

// 表单验证规则
const formRules = {
  brandId: [{ required: true, message: "请选择品牌", trigger: "change" }],
  seriesId: [{ required: true, message: "请选择系列", trigger: "change" }],
  productName: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    {
      min: 1,
      max: 50,
      message: "产品名称长度在 1 到 50 个字符",
      trigger: "blur"
    }
  ],
  priorityId: [{ required: true, message: "请选择优先级", trigger: "change" }],
  pmDingIds: [
    {
      validator: validatePersonArray,
      message: "请选择PM负责人",
      trigger: ["change", "blur"]
    }
  ],
  npdDingIds: [
    {
      validator: validatePersonArray,
      message: "请选择NPD负责人",
      trigger: ["change", "blur"]
    }
  ],
  expectedListingDate: [
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

// 方法
const handleBrandChange = value => {
  // 品牌改变时重置系列选择
  formData.value.seriesId = "";
  fetchTypeList(value);
};

const fetchTypeList = brandId => {
  getProjectTypeList({ brandId }).then(res => {
    if (res?.code === 200) {
      seriesList.value = res?.data?.map(item => {
        return {
          label: item.seriesName,
          value: item.id
        };
      });
    }
  });
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

    // 创建新产品对象
    const newProduct = {
      seriesId: formData.value.seriesId,
      productName: formData.value.productName,
      expectedListingDate: formData.value.expectedListingDate,
      priorityId: formData.value.priorityId,
      pmDingIds: formData.value.pmDingIds?.map(item => item.emplId),
      npdDingIds: formData.value.npdDingIds?.map(item => item.emplId)
    };

    addProjectProgress(newProduct).then(res => {
      if (res?.code === 200) {
        ElMessage.success("创建成功");
        emit("save", newProduct);
        handleClose();
      } else {
        ElMessage.error(res?.msg);
      }
    });
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
    brandId: "",
    seriesId: "",
    productName: "",
    priorityId: "",
    pmDingIds: [],
    npdDingIds: [],
    expectedListingDate: ""
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
