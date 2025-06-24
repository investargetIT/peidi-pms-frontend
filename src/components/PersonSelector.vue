<template>
  <div class="person-selector flex-1">
    <div class="person-row flex items-center">
      <div class="person-label">{{ label }}</div>
      <div class="person-tags flex-1 ml-4">
        <el-tag
          v-for="tag in normalizedPersons"
          :key="tag.emplId"
          :disable-transitions="false"
          :closable="!readonly"
          @close="removePerson(tag)"
          class="mr-2 person-tag"
          :class="{ 'with-avatar': showAvatar, [`size-${size}`]: true }"
        >
          <div class="flex items-center gap-1">
            <el-avatar
              v-if="showAvatar"
              :size="size === 'small' ? 16 : 20"
              :src="tag.avatar"
              class="text-xs"
            >
              {{ tag.name.charAt(0) }}
            </el-avatar>
            <span :class="size === 'small' ? 'text-xs' : 'text-sm'">{{
              tag.name
            }}</span>
          </div>
        </el-tag>
        <div
          v-if="normalizedPersons.length === 0"
          class="flex items-center gap-1"
        >
          <span class="text-xs text-gray-500">暂无负责人</span>
          <button
            v-if="!readonly"
            @click="choosePerson"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-5 w-5 p-0 rounded-full border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            type="button"
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
              class="w-3 h-3 text-gray-500 hover:text-blue-600"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </button>
        </div>
        <el-button
          v-if="!readonly && normalizedPersons.length > 0"
          class="add-person-btn"
          size="small"
          @click="choosePerson"
        >
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
  },
  showAvatar: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "default", // default, small
    validator: value => ["default", "small"].includes(value)
  },
  dataFormat: {
    type: String,
    default: "dingtalk", // dingtalk, system
    validator: value => ["dingtalk", "system"].includes(value)
  },
  readonly: {
    type: Boolean,
    default: false
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

// 标准化数据格式的计算属性
const normalizedPersons = computed(() => {
  if (!selectedPersons.value || selectedPersons.value.length === 0) {
    return [];
  }

  if (props.dataFormat === "system") {
    // 系统格式: {dingId, userName, avatarUrl} -> 标准格式
    return selectedPersons.value.map(user => ({
      emplId: user.dingId,
      name: user.userName,
      avatar: user.avatarUrl
    }));
  } else {
    // 钉钉格式: {emplId, name, avatar} -> 保持不变
    return selectedPersons.value;
  }
});

const extractEmplId = users => {
  return users.map(user => user.emplId);
};

const choosePerson = () => {
  if (props.readonly) return;

  dd.biz.contact.choose({
    multiple: true,
    users: extractEmplId(normalizedPersons.value),
    corpId: props.corpId,
    max: props.maxCount,
    onSuccess: function (data) {
      // 根据数据格式转换输出
      let outputData = data;
      if (props.dataFormat === "system") {
        // 转换为系统格式
        outputData = data.map(user => ({
          dingId: user.emplId,
          userName: user.name,
          avatarUrl: user.avatar || ""
        }));
      }
      emit("update:modelValue", outputData);
    },
    onFail: function (err) {
      console.error("选择人员失败:", err);
    }
  });
};

const removePerson = tag => {
  if (props.readonly) return;

  let newPersons;

  if (props.dataFormat === "system") {
    // 系统格式：根据 dingId 匹配删除
    newPersons = selectedPersons.value.filter(
      item => item.dingId !== tag.emplId
    );
  } else {
    // 钉钉格式：根据 emplId 匹配删除
    newPersons = selectedPersons.value.filter(
      item => item.emplId !== tag.emplId
    );
  }

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

  .person-tag {
    &.with-avatar {
      padding: 2px 8px 2px 4px;

      :deep(.el-tag__content) {
        display: flex;
        align-items: center;
      }
    }

    &.size-small {
      height: 24px;
      padding: 2px 6px;
      font-size: 11px;
      line-height: 20px;

      &.with-avatar {
        padding: 2px 6px 2px 2px;
      }
    }

    &.size-default {
      height: 28px;
      padding: 2px 8px;
      font-size: 13px;
      line-height: 24px;

      &.with-avatar {
        padding: 2px 8px 2px 4px;
      }
    }
  }
}
</style>
