<template>
  <div class="right-panel w-80 bg-white rounded-lg shadow-sm p-6">
    <div class="detail-header flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold">项目详情</h3>
    </div>

    <div class="detail-content">
      <div v-if="!selectedProject" class="empty-state text-center py-12">
        <div
          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Eye class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 text-sm">选择一个产品查看详细信息</p>
      </div>

      <div v-else class="project-info">
        <div class="info-section mb-6">
          <h4 class="text-base font-medium mb-3">基本信息</h4>
          <div class="info-item mb-3">
            <span class="label">产品名称：</span>
            <span class="value">{{ selectedProject.productName }}</span>
          </div>
          <div class="info-item mb-3">
            <span class="label">品牌：</span>
            <span class="value">{{ selectedProject.brandName }}</span>
          </div>
          <div class="info-item mb-3">
            <span class="label">状态：</span>
            <span class="value">{{ selectedProject.statusName }}</span>
          </div>
          <div class="info-item mb-3">
            <span class="label">优先级：</span>
            <span class="value">{{ selectedProject.priorityName }}</span>
          </div>
        </div>

        <div class="info-section mb-6">
          <h4 class="text-base font-medium mb-3">负责人</h4>
          <div class="info-item mb-3">
            <span class="label">PM负责人：</span>
            <div class="user-list">
              <div
                v-for="user in selectedProject.pmDingUser"
                :key="user.dingId"
                class="user-item flex items-center mb-2"
              >
                <img :src="user.avatarUrl" class="w-6 h-6 rounded-full mr-2" />
                <span class="text-sm">{{ user.userName }}</span>
              </div>
            </div>
          </div>
          <div class="info-item mb-3">
            <span class="label">NPD负责人：</span>
            <div class="user-list">
              <div
                v-for="user in selectedProject.npdDingUser"
                :key="user.dingId"
                class="user-item flex items-center mb-2"
              >
                <img :src="user.avatarUrl" class="w-6 h-6 rounded-full mr-2" />
                <span class="text-sm">{{ user.userName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h4 class="text-base font-medium mb-3">进度信息</h4>
          <div class="info-item mb-3">
            <span class="label">当前进度：</span>
            <span class="value">{{ selectedProject.progress }}%</span>
          </div>
          <div class="info-item mb-3">
            <span class="label">预计上市：</span>
            <span class="value">{{ selectedProject.expectedListingDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Eye } from "lucide-vue-next";

const props = defineProps({
  selectedProject: {
    type: Object,
    default: null
  }
});
</script>

<style scoped>
.info-section {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-section:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.label {
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.value {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.user-list {
  flex: 1;
}

.user-item {
  margin-bottom: 8px;
}

.user-item:last-child {
  margin-bottom: 0;
}
</style>
