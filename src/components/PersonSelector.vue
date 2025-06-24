<template>
  <div class="person-selector flex-1">
    <div class="person-row flex items-center">
      <div class="person-label">{{ label }}</div>
      <div class="person-tags flex-1 ml-4">
        <!-- 标签卡片模式 -->
        <template v-if="displayMode === 'tag'">
          <div class="flex items-center gap-1">
            <div class="flex flex-wrap gap-1 items-center">
              <div
                v-for="tag in normalizedPersons"
                :key="tag.emplId"
                class="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 transition-all duration-300 opacity-100 scale-100"
              >
                <span
                  class="relative flex shrink-0 overflow-hidden rounded-full w-4 h-4"
                >
                  <img
                    v-if="showAvatar && tag.avatar"
                    :src="tag.avatar"
                    class="flex h-full w-full items-center justify-center rounded-full object-cover"
                    :alt="tag.name"
                  />
                  <span
                    v-else
                    class="flex h-full w-full items-center justify-center rounded-full text-[10px] bg-blue-500 text-white"
                  >
                    {{ tag.name ? tag.name.charAt(0) : "?" }}
                  </span>
                </span>
                <span class="text-xs text-blue-900">{{ tag.name }}</span>
                <button
                  v-if="!readonly"
                  @click="removePerson(tag)"
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-4 w-4 p-0 rounded-full transition-all duration-200 hover:bg-red-100"
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
                    class="w-3 h-3 transition-colors duration-200 text-red-500"
                  >
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
              </div>
              <!-- 暂无负责人提示 -->
              <span
                v-if="normalizedPersons.length === 0"
                class="text-xs text-gray-500"
              >
                暂无负责人
              </span>
            </div>
            <button
              v-if="!readonly"
              @click="choosePerson"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-5 w-5 p-0 rounded-full border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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
        </template>

        <!-- Simple 模式（仿照参考代码的样式） -->
        <template v-else-if="displayMode === 'simple'">
          <div class="simple-mode">
            <button
              v-if="!readonly"
              @click="choosePerson"
              :disabled="readonly"
              class="el-button el-button--default button-new-tag"
              type="button"
            >
              <span>+ {{ label }}</span>
            </button>
            <div class="helpers mt-2" v-if="normalizedPersons.length > 0">
              <p
                v-for="(item, index) in normalizedPersons"
                :key="item.emplId"
                class="help-item flex items-center justify-between py-1"
              >
                <span class="text-sm text-gray-900">{{ item.name }}</span>
                <button
                  v-if="!readonly"
                  @click="removePerson(item)"
                  class="ml-2 inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </p>
            </div>
          </div>
        </template>

        <!-- 列表模式（原有逻辑） -->
        <template v-else>
          <div
            v-for="tag in normalizedPersons"
            :key="tag.emplId"
            class="flex items-center gap-2 mb-2 mr-3"
          >
            <span
              class="relative flex shrink-0 overflow-hidden rounded-full"
              :class="size === 'small' ? 'w-5 h-5' : 'w-6 h-6'"
            >
              <img
                v-if="showAvatar && tag.avatar"
                :src="tag.avatar"
                class="flex h-full w-full items-center justify-center rounded-full object-cover"
                :alt="tag.name"
              />
              <span
                v-else
                class="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600"
                :class="size === 'small' ? 'text-xs' : 'text-xs'"
              >
                {{ tag.name ? tag.name.charAt(0) : "?" }}
              </span>
            </span>
            <span
              :class="size === 'small' ? 'text-xs' : 'text-sm'"
              class="text-gray-900"
            >
              {{ tag.name }}
            </span>
            <button
              v-if="!readonly"
              @click="removePerson(tag)"
              class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
            >
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
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
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
          <button
            v-if="!readonly && normalizedPersons.length > 0"
            @click="choosePerson"
            class="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
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
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            {{ label }}
          </button>
        </template>
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
  displayMode: {
    type: String,
    default: "list", // list, tag, simple
    validator: value => ["list", "tag", "simple"].includes(value)
  },
  readonly: {
    type: Boolean,
    default: false
  },
  // 自动保存相关配置
  autoSave: {
    type: Boolean,
    default: false
  },
  saveParams: {
    type: Object,
    default: () => ({})
  }
});

const DINGTALK_CORP_ID = "dingfc722e531a4125b735c2f4657eb6378f";
setTimeout(() => {
  initDingH5RemoteDebug();
}, 100);
ddAuthFun();

const emit = defineEmits(["update:modelValue", "autoSave"]);

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

      // 如果开启自动保存，触发保存事件
      if (props.autoSave) {
        emit("autoSave", {
          ...props.saveParams,
          assignees: outputData
        });
      }
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

  // 如果开启自动保存，触发保存事件
  if (props.autoSave) {
    emit("autoSave", {
      ...props.saveParams,
      assignees: newPersons
    });
  }
};
</script>

<style scoped>
.person-selector {
  .person-label {
    min-width: 80px;
    font-size: 14px;
    font-weight: 700;
    color: #606266;
    white-space: nowrap;
  }

  .person-row {
    align-items: center;
  }

  .person-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .simple-mode {
    .helpers {
      .help-item {
        padding: 4px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .el-button {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      padding: 8px 15px;
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      color: #606266;
      text-align: center;
      text-decoration: none;
      white-space: nowrap;
      vertical-align: middle;
      appearance: none;
      cursor: pointer;
      user-select: none;
      background-color: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      outline: none;
      transition: 0.1s;

      &:hover {
        color: #409eff;
        background-color: #ecf5ff;
        border-color: #c6e2ff;
      }

      &:focus {
        color: #409eff;
        border-color: #409eff;
      }

      &:active {
        color: #3a8ee6;
        border-color: #3a8ee6;
        outline: none;
      }

      &:disabled {
        color: #c0c4cc;
        cursor: not-allowed;
        background-color: #fff;
        background-image: none;
        border-color: #ebeef5;
      }

      span {
        display: inline-block;
      }
    }
  }
}
</style>
