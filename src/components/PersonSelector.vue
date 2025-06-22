<template>
  <div class="person-selector flex-1">
    <div class="person-row flex items-center">
      <div class="person-label">{{ label }}</div>
      <div class="person-tags flex-1 ml-4">
        <el-tag
          v-for="tag in selectedPersons"
          :key="tag.emplId"
          :disable-transitions="false"
          closable
          @close="removePerson(tag)"
          class="mr-2"
        >
          {{ tag.name }}
        </el-tag>
        <el-button class="add-person-btn" size="small" @click="choosePerson">
          + {{ label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import * as dd from "dingtalk-jsapi";
import { initDingH5RemoteDebug } from "dingtalk-h5-remote-debug";
import { ddAuthFun } from "@/utils/ddAuth";

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 10
  },
  corpId: {
    type: String,
    default: "dingfc722e531a4125b735c2f4657eb6378f"
  }
});

const DINGTALK_CORP_ID = "dingfc722e531a4125b735c2f4657eb6378f";
setTimeout(() => {
  initDingH5RemoteDebug();
}, 100);
ddAuthFun();

const emit = defineEmits(["update:modelValue"]);

// 使用计算属性直接使用 props.modelValue，避免递归更新
const selectedPersons = computed(() => props.modelValue);

const extractEmplId = users => {
  return users.map(user => user.emplId);
};

const choosePerson = () => {
  dd.biz.contact.choose({
    multiple: true,
    users: extractEmplId(selectedPersons.value),
    corpId: props.corpId,
    max: props.maxCount,
    onSuccess: function (data) {
      emit("update:modelValue", data);
    },
    onFail: function (err) {
      console.error("选择人员失败:", err);
    }
  });
};

const removePerson = tag => {
  const newPersons = selectedPersons.value.filter(
    item => item.emplId !== tag.emplId
  );
  emit("update:modelValue", newPersons);
};
</script>

<style scoped>
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
</style>
