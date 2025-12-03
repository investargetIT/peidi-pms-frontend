<template>
  <el-dialog
    class="relative"
    v-model="visible"
    :title="isEdit ? '更新产品' : '新增产品'"
    :style="{ minWidth: '580px' }"
  >
    <el-button
      class="absolute left-20 top-3"
      @click="showDefaultInfo = !showDefaultInfo"
      >{{ showDefaultInfo ? "收起信息" : "展开信息" }}</el-button
    >
    <el-form
      v-if="newProduct.onSiteEvaluation"
      :model="newProduct"
      :rules="rules"
      ref="productForm"
      :disabled="!useAuthStoreHook().isAdmin"
      label-width="120px"
      label-position="left"
    >
      <!-- 工厂名称选择 -->
      <el-form-item
        prop="onSiteEvaluation.factoryName"
        label="工厂名称/生产企业"
      >
        <!-- :disabled="isEdit" -->
        <el-select
          v-model="newProduct.onSiteEvaluation.factoryName"
          placeholder="请选择工厂名称/生产企业"
          @change="fillFactoryInfo"
        >
          <el-option
            v-for="factory in factories"
            :key="factory.onSiteEvaluation.factoryName"
            :label="factory.onSiteEvaluation.factoryName"
            :value="factory.onSiteEvaluation.factoryName"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- :disabled="isEdit -->
      <el-form-item prop="productNo" label="产品号/货号">
        <el-input :disabled="false" v-model="newProduct.productNo"></el-input>
      </el-form-item>
      <!-- :disabled="isEdit -->
      <el-form-item prop="productName" label="产品名称">
        <el-input :disabled="false" v-model="newProduct.productName"></el-input>
      </el-form-item>
      <el-tag type="info" class="mb-3">SPU</el-tag>
      <el-form-item prop="spu.spuId" label="SPU">
        <el-select
          v-model="newProduct.spu.spuId"
          placeholder="请选择SPU"
          filterable
          clearable
        >
          <el-option
            v-for="item in spuList"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="spu.suiteNo" label="条形码">
        <el-input v-model="newProduct.spu.suiteNo"></el-input>
      </el-form-item>
      <el-form-item prop="spu.u9Name" label="u9名称">
        <el-input v-model="newProduct.spu.u9Name"></el-input>
      </el-form-item>
      <el-tag v-show="showDefaultInfo" type="info" class="mb-3">登录</el-tag>
      <el-form-item v-show="showDefaultInfo" label="登录网站">
        <el-input
          :disabled="true"
          v-model="newProduct.login.website"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="登录用户名">
        <el-input
          :disabled="true"
          v-model="newProduct.login.username"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="登录密码">
        <el-input
          v-model="newProduct.login.password"
          :disabled="true"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="入口页面步骤">
        <el-input
          :disabled="true"
          type="textarea"
          v-model="newProduct.entryPage"
        ></el-input>
      </el-form-item>
      <el-tag type="info" class="mb-3">实地评价</el-tag>
      <el-form-item v-show="showDefaultInfo" label="新增">
        <el-input
          :disabled="true"
          v-model="newProduct.onSiteEvaluation.add"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="批次编号描述">
        <el-input
          :disabled="true"
          v-model="newProduct.onSiteEvaluation.batchNumber.description"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="批次编号规则">
        <el-input
          :disabled="true"
          v-model="newProduct.onSiteEvaluation.batchNumber.rules"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="批次编号示例">
        <el-input
          :disabled="true"
          v-model="newProduct.onSiteEvaluation.batchNumber.examples"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="当前已选择产品">
        <el-input
          :disabled="true"
          v-model="newProduct.onSiteEvaluation.selectedProduct"
        ></el-input>
      </el-form-item>
      <el-form-item prop="onSiteEvaluation.address" label="地址">
        <el-input v-model="newProduct.onSiteEvaluation.address"></el-input>
      </el-form-item>
      <el-form-item
        prop="onSiteEvaluation.factoryIntroduction"
        label="工厂简介"
      >
        <el-input
          v-model="newProduct.onSiteEvaluation.factoryIntroduction"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="工厂展示">
        <el-input
          v-model="newProduct.onSiteEvaluation.factoryDisplay"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="保存">
        <el-input
          v-model="newProduct.onSiteEvaluation.save"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-tag v-show="showDefaultInfo" type="info" class="mb-3"
        >原料采购</el-tag
      >
      <el-form-item v-show="showDefaultInfo" label="录入">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.entry"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="原料名称">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.materialName"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="原料来源">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.materialSource"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="供应商">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.supplier"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="出厂检验报告">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.inspectionReport"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="采购批号">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.purchaseBatchNumber"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="保存">
        <el-input
          :disabled="true"
          v-model="newProduct.rawMaterialPurchase.save"
        ></el-input>
      </el-form-item>
      <el-tag type="info" v-show="showDefaultInfo" class="mb-3"
        >产品生产</el-tag
      >
      <el-form-item v-show="showDefaultInfo" label="录入">
        <el-input
          :disabled="true"
          v-model="newProduct.productProduction.entry"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item prop="productProduction.productionDate" label="生产日期">
        <el-date-picker
          v-model="newProduct.productProduction.productionDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item> -->
      <!-- <el-form-item label="生产批次编号">
        <el-input
          v-model="newProduct.productProduction.productionBatchNumber"
        ></el-input>
      </el-form-item> -->
      <el-tag type="info" class="mb-3">成品控制</el-tag>
      <el-form-item v-show="showDefaultInfo" label="录入">
        <el-input
          :disabled="true"
          v-model="newProduct.finishedProductControl.entry"
        ></el-input>
      </el-form-item>
      <el-form-item label="检验结果">
        <el-input
          v-model="newProduct.finishedProductControl.inspectionResult"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="检验报告">
        <el-input
          :disabled="true"
          v-model="newProduct.finishedProductControl.inspectionReport"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="保存">
        <el-input
          :disabled="true"
          v-model="newProduct.finishedProductControl.save"
        ></el-input>
      </el-form-item>
      <el-tag type="info" class="mb-3">售后服务</el-tag>
      <el-form-item v-show="showDefaultInfo" label="录入">
        <el-input
          :disabled="true"
          v-model="newProduct.afterSalesService.entry"
        ></el-input>
      </el-form-item>
      <el-form-item label="联系地址">
        <el-input
          v-model="newProduct.afterSalesService.contactAddress"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item label="咨询热线">
        <el-input
          v-model="newProduct.afterSalesService.hotline"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="保存">
        <el-input
          :disabled="true"
          v-model="newProduct.afterSalesService.save"
        ></el-input>
      </el-form-item>
      <el-tag type="info" class="mb-3">溯源标识</el-tag>
      <el-form-item :disabled="true" v-show="showDefaultInfo" label="录入">
        <el-input
          v-model="newProduct.traceabilityIdentification.entry"
        ></el-input>
      </el-form-item>
      <el-form-item label="溯源类型">
        <el-input
          :disabled="true"
          v-model="newProduct.traceabilityIdentification.traceabilityType"
        ></el-input>
      </el-form-item>
      <el-form-item label="标识类型">
        <el-input
          :disabled="true"
          v-model="newProduct.traceabilityIdentification.identificationType"
        ></el-input>
      </el-form-item>
      <el-form-item label="标识功能">
        <el-input
          :disabled="true"
          v-model="newProduct.traceabilityIdentification.identificationFunction"
        ></el-input>
      </el-form-item>
      <el-form-item label="验证方法">
        <el-input
          :disabled="true"
          v-model="newProduct.traceabilityIdentification.verificationMode"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="保存">
        <el-input
          :disabled="true"
          v-model="newProduct.traceabilityIdentification.save"
        ></el-input>
      </el-form-item>
      <el-tag type="info" class="mb-3">中检声明</el-tag>
      <el-form-item v-show="showDefaultInfo" label="录入">
        <el-input
          :disabled="true"
          v-model="newProduct.cciStatement.entry"
        ></el-input>
      </el-form-item>
      <el-form-item label="溯源类型">
        <el-input
          :disabled="true"
          v-model="newProduct.cciStatement.traceabilityType"
        ></el-input>
      </el-form-item>
      <el-form-item label="消费者服务">
        <el-input
          :disabled="true"
          v-model="newProduct.cciStatement.consumerService"
        ></el-input>
      </el-form-item>
      <el-form-item label="真实性声明">
        <el-input
          :disabled="true"
          v-model="newProduct.cciStatement.authenticityStatement"
        ></el-input>
      </el-form-item>
      <el-form-item label="侵权声明">
        <el-input
          :disabled="true"
          v-model="newProduct.cciStatement.infringementStatement"
        ></el-input>
      </el-form-item>
      <el-form-item v-show="showDefaultInfo" label="保存">
        <el-input
          :disabled="true"
          v-model="newProduct.cciStatement.save"
        ></el-input>
      </el-form-item>
      <el-tag type="info" v-show="showDefaultInfo" class="mb-3"
        >溯源批次编码</el-tag
      >
      <el-form-item v-show="showDefaultInfo" label="录入">
        <el-input
          :disabled="true"
          v-model="newProduct.traceabilityBatchCoding.entry"
        ></el-input>
      </el-form-item>
      <el-tag type="info" class="mb-3">溯源信息表</el-tag>
      <!-- 
      <el-form-item label="生产企业">
        <el-input v-model="newProduct.productionEnterprise"></el-input>
      </el-form-item> -->
      <el-form-item label="产品品牌">
        <el-input v-model="newProduct.productBrand"></el-input>
      </el-form-item>
      <el-form-item label="规格型号">
        <el-input v-model="newProduct.specificationModel"></el-input>
      </el-form-item>
      <el-form-item label="条形码">
        <el-input v-model="newProduct.barCode"></el-input>
      </el-form-item>
      <el-form-item label="原产地">
        <el-input v-model="newProduct.origin"></el-input>
      </el-form-item>
      <el-form-item label="产品分类">
        <el-input v-model="newProduct.productClassification"></el-input>
      </el-form-item>
      <el-form-item label="保质期">
        <el-input v-model="newProduct.shelfLife"></el-input>
      </el-form-item>
      <el-form-item label="存储环境">
        <el-input v-model="newProduct.storageEnvironment"></el-input>
      </el-form-item>
      <el-form-item label="配料信息">
        <el-input v-model="newProduct.ingredientInformation"></el-input>
      </el-form-item>
      <el-form-item
        prop="productProduction.productionTechnology"
        label="生产工艺"
      >
        <el-input
          v-model="newProduct.productProduction.productionTechnology"
        ></el-input>
      </el-form-item>
      <el-form-item prop="productProduction.productionProcess" label="工艺说明">
        <el-input
          v-model="newProduct.productProduction.productionProcess"
        ></el-input>
        <div style="margin-top: 4px" v-if="useAuthStoreHook().isAdmin">
          <el-tag
            type="primary"
            @click="setProductionProcess('低温风干')"
            style="cursor: pointer"
          >
            低温风干
          </el-tag>
          <el-tag
            type="primary"
            @click="setProductionProcess('冻干工艺')"
            style="margin-left: 10px; cursor: pointer"
          >
            冻干工艺
          </el-tag>
        </div>
      </el-form-item>
      <!-- 新增核心卖点 -->
      <el-form-item prop="sellingPoint" label="核心卖点">
        <el-input type="textarea" v-model="newProduct.sellingPoint"></el-input>
      </el-form-item>
      <!-- 新增核心卖点附件 -->
      <el-form-item prop="sellingPointFile" label="核心卖点附件">
        <div class="flex flex-col">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="https://api.peidigroup.cn/prm/traceability-flow/upload-oss"
            :limit="5"
            v-model:file-list="newProduct.sellingPointFile"
            type="primary"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            accept=".jpg,.png,.jpeg,.gif,.pdf"
            :show-file-list="false"
          >
            <el-button class="upload-button">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">
                上传文件支持 jpg、png、jpeg、gif、pdf
                格式,大小不超过10M，且最多上传5份。
              </div>
            </template>
          </el-upload>

          <!-- 自定义文件列表（使用显示文件列表） -->
          <div
            class="file-list-container"
            v-if="
              displayFileLists.sellingPointFile &&
              displayFileLists.sellingPointFile.length > 0
            "
          >
            <div
              v-for="file in displayFileLists.sellingPointFile"
              :key="file.uid"
              class="file-card"
            >
              <div class="file-info">
                <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                <span class="file-name" :title="file.name">{{
                  truncateString(file.name, 18)
                }}</span>
              </div>
              <div class="file-actions">
                <button
                  type="button"
                  v-if="isImageFile(file.name)"
                  class="action-btn preview-btn"
                  @click.stop="handlePreview(file)"
                >
                  预览
                </button>
                <button
                  type="button"
                  class="action-btn download-btn"
                  @click.stop="handleDownload(file)"
                >
                  下载
                </button>
                <button
                  type="button"
                  class="action-btn delete-btn"
                  @click.stop="handleRemove(file, 'sellingPointFile')"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="productPicture" label="产品图片">
        <div class="flex flex-col">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="https://api.peidigroup.cn/prm/traceability-flow/upload-oss"
            :limit="5"
            type="primary"
            v-model:file-list="newProduct.productPicture"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            accept=".jpg,.png,.jpeg,.gif,.pdf"
            :show-file-list="false"
          >
            <el-button class="upload-button">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">
                上传文件支持 jpg、png、jpeg、gif、pdf
                格式,大小不超过10M，且最多上传5份。
              </div>
            </template>
          </el-upload>

          <!-- 自定义文件列表（使用显示文件列表） -->
          <div
            class="file-list-container"
            v-if="
              displayFileLists.productPicture &&
              displayFileLists.productPicture.length > 0
            "
          >
            <div
              v-for="file in displayFileLists.productPicture"
              :key="file.uid"
              class="file-card"
            >
              <div class="file-info">
                <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                <span class="file-name" :title="file.name">{{
                  truncateString(file.name, 18)
                }}</span>
              </div>
              <div class="file-actions">
                <button
                  type="button"
                  v-if="isImageFile(file.name)"
                  class="action-btn preview-btn"
                  @click.stop="handlePreview(file)"
                >
                  预览
                </button>
                <button
                  type="button"
                  class="action-btn download-btn"
                  @click.stop="handleDownload(file)"
                >
                  下载
                </button>
                <button
                  type="button"
                  class="action-btn delete-btn"
                  @click.stop="handleRemove(file, 'productPicture')"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item prop="productDetails" label="产品详情">
        <div class="flex flex-col">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="https://api.peidigroup.cn/prm/traceability-flow/upload-oss"
            :limit="5"
            v-model:file-list="newProduct.productDetails"
            type="primary"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            accept=".jpg,.png,.jpeg,.gif,.pdf"
            :show-file-list="false"
          >
            <el-button class="upload-button">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">
                上传文件支持 jpg、png、jpeg、gif、pdf
                格式,大小不超过10M，且最多上传5份。
              </div>
            </template>
          </el-upload>

          <!-- 自定义文件列表（使用显示文件列表） -->
          <div
            class="file-list-container"
            v-if="
              displayFileLists.productDetails &&
              displayFileLists.productDetails.length > 0
            "
          >
            <div
              v-for="file in displayFileLists.productDetails"
              :key="file.uid"
              class="file-card"
            >
              <div class="file-info">
                <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                <span class="file-name" :title="file.name">{{
                  truncateString(file.name, 18)
                }}</span>
              </div>
              <div class="file-actions">
                <button
                  type="button"
                  v-if="isImageFile(file.name)"
                  class="action-btn preview-btn"
                  @click.stop="handlePreview(file)"
                >
                  预览
                </button>
                <button
                  type="button"
                  class="action-btn download-btn"
                  @click.stop="handleDownload(file)"
                >
                  下载
                </button>
                <button
                  type="button"
                  class="action-btn delete-btn"
                  @click.stop="handleRemove(file, 'productDetails')"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item prop="factoryPicture" label="工厂照片">
        <div class="flex flex-col">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="https://api.peidigroup.cn/prm/traceability-flow/upload-oss"
            :limit="5"
            v-model:file-list="newProduct.factoryPicture"
            type="primary"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            accept=".jpg,.png,.jpeg,.gif,.pdf"
            :show-file-list="false"
          >
            <el-button class="upload-button">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">
                上传文件支持 jpg、png、jpeg、gif、pdf
                格式,大小不超过10M，且最多上传5份。
              </div>
            </template>
          </el-upload>

          <!-- 自定义文件列表（使用显示文件列表） -->
          <div
            class="file-list-container"
            v-if="
              displayFileLists.factoryPicture &&
              displayFileLists.factoryPicture.length > 0
            "
          >
            <div
              v-for="file in displayFileLists.factoryPicture"
              :key="file.uid"
              class="file-card"
            >
              <div class="file-info">
                <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                <span class="file-name" :title="file.name">{{
                  truncateString(file.name, 18)
                }}</span>
              </div>
              <div class="file-actions">
                <button
                  type="button"
                  v-if="isImageFile(file.name)"
                  class="action-btn preview-btn"
                  @click.stop="handlePreview(file)"
                >
                  预览
                </button>
                <button
                  type="button"
                  class="action-btn download-btn"
                  @click.stop="handleDownload(file)"
                >
                  下载
                </button>
                <button
                  type="button"
                  class="action-btn delete-btn"
                  @click.stop="handleRemove(file, 'factoryPicture')"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item prop="productionProcessDrawing" label="生产工艺图">
        <div class="flex flex-col">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="https://api.peidigroup.cn/prm/traceability-flow/upload-oss"
            :limit="5"
            v-model:file-list="newProduct.productionProcessDrawing"
            type="primary"
            :headers="{
              Authorization: formatToken(getToken().accessToken)
            }"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            accept=".jpg,.png,.jpeg,.gif,.pdf"
            :show-file-list="false"
          >
            <el-button class="upload-button">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">
                上传文件支持 jpg、png、jpeg、gif、pdf
                格式,大小不超过10M，且最多上传5份。
              </div>
            </template>
          </el-upload>

          <!-- 自定义文件列表（使用显示文件列表） -->
          <div
            class="file-list-container"
            v-if="
              displayFileLists.productionProcessDrawing &&
              displayFileLists.productionProcessDrawing.length > 0
            "
          >
            <div
              v-for="file in displayFileLists.productionProcessDrawing"
              :key="file.uid"
              class="file-card"
            >
              <div class="file-info">
                <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                <span class="file-name" :title="file.name">{{
                  truncateString(file.name, 18)
                }}</span>
              </div>
              <div class="file-actions">
                <button
                  type="button"
                  v-if="isImageFile(file.name)"
                  class="action-btn preview-btn"
                  @click="handlePreview(file)"
                >
                  预览
                </button>
                <button
                  type="button"
                  class="action-btn download-btn"
                  @click.stop="handleDownload(file)"
                >
                  下载
                </button>
                <button
                  type="button"
                  class="action-btn delete-btn"
                  @click.stop="handleRemove(file, 'productionProcessDrawing')"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="NAS地址">
        <div class="nas-url-container">
          <el-input
            v-model="newProduct.nasUrl"
            placeholder="请输入NAS地址"
            class="nas-input"
          ></el-input>
          <el-button
            type="primary"
            :disabled="!newProduct.nasUrl"
            @click="previewNasUrl"
            class="preview-btn"
          >
            打开
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button
        :loading="loading"
        type="primary"
        @click="saveProduct"
        :disabled="!useAuthStoreHook().isAdmin"
        >保存</el-button
      >
    </div>
  </el-dialog>
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script setup>
import { onMounted, ref, watch, inject } from "vue";
import { ElMessage } from "element-plus";
import factories from "./const";
import { newTask, updateProduct, getFileDownLoadPath } from "@/api/pmApi.ts";
import { getToken, formatToken } from "@/utils/auth";
import { mapping, downloadFileFun } from "./utils";
// import { getTaskUnassigned } from "@/api/task";
import { useAuthStoreHook } from "@/store/modules/auth";
import { truncateString } from "@/utils/fun";
const visible = defineModel("visible");
const productForm = ref(null);
// 接受props的isEdit，默认是false
const { isEdit, details } = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  details: {
    type: Object,
    default: () => ({})
  }
});

// 依赖注入
const spuList = inject("spuList");

const emits = defineEmits(["refresh"]);

const loading = ref(false);
const isFlod = ref(false);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const selectedFactory = ref("");
const selectedFactoryInfo = ref(null);
const handleProductPictureUploadSuccess = (res, file) => {
  newProduct.value.productPicture = res.data;
};

const handleProductDetailsUploadSuccess = (res, file) => {
  newProduct.value.productDetails = res.data;
};

const rules = {
  productNo: [{ required: true, message: "请输入产品号", trigger: "blur" }],
  productName: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
  "productProduction.productionTechnology": [
    { required: false, message: "请输入生产工艺", trigger: "blur" }
  ],
  "productProduction.productionProcess": [
    { required: false, message: "请输入工艺说明", trigger: "blur" }
  ],
  "onSiteEvaluation.factoryName": [
    { required: false, message: "请选择工厂名称", trigger: "change" }
  ],
  "onSiteEvaluation.address": [
    { required: false, message: "请输入地址", trigger: "blur" }
  ],
  "onSiteEvaluation.factoryIntroduction": [
    { required: false, message: "请输入工厂简介", trigger: "blur" }
  ],
  productPicture: [
    { required: false, message: "请上传产品图片", trigger: "change" }
  ],
  productDetails: [
    { required: false, message: "请上传产品详情", trigger: "change" }
  ],
  factoryPicture: [
    { required: false, message: "请上传工厂照片", trigger: "change" }
  ],
  productionProcessDrawing: [
    { required: false, message: "请上传生产工艺图", trigger: "change" }
  ],
  sellingPoint: [
    { required: false, message: "请输入核心卖点", trigger: "blur" }
  ]
};

// 是否展示默认信息
const showDefaultInfo = ref(false);
const emptyValue = {
  productNo: "",
  productName: "",
  login: {
    website: "",
    username: "",
    password: ""
  },
  entryPage: "",
  onSiteEvaluation: {
    add: "",
    batchNumber: {
      description: "",
      rules: [],
      examples: []
    },
    selectedProduct: "",
    factoryName: "",
    address: "",
    factoryIntroduction: "",
    factoryDisplay: "",
    save: ""
  },
  rawMaterialPurchase: {
    entry: "",
    materialName: "",
    materialSource: "",
    supplier: "",
    inspectionReport: "",
    purchaseBatchNumber: "",
    save: ""
  },
  productProduction: {
    entry: "",
    productionProcess: "低温风干",
    productionDate: "",
    productionBatchNumber: ""
  },
  finishedProductControl: {
    entry: "",
    inspectionResult: "",
    inspectionReport: "",
    save: ""
  },
  afterSalesService: {
    entry: "",
    contactAddress: "",
    hotline: "",
    save: ""
  },
  traceabilityIdentification: {
    entry: "",
    traceabilityType: "",
    identificationType: "",
    identificationFunction: "",
    verificationMode: "",
    save: ""
  },
  cciStatement: {
    entry: "",
    traceabilityType: "",
    consumerService: "",
    authenticityStatement: "",
    infringementStatement: "",
    save: ""
  },
  traceabilityBatchCoding: {
    entry: ""
  },
  //生产企业
  productionEnterprise: "",
  //产品品牌
  productBrand: "Meatyway爵宴",
  // 规格型号
  specificationModel: "",
  // 条形码
  barCode: "",
  // 原产地
  origin: "中国",
  // 产品分类
  productClassification:
    "农副食品，动、植物油制品-饲料及宠物食品-宠物食品-宠物猫狗食品",
  // 保质期
  shelfLife: "",
  // 存储环境
  storageEnvironment: "请置于干爽清洁处，避免阳光直射。",
  // 配料信息
  ingredientInformation: "",
  // 产品图片
  productPicture: [],
  // 产品详情
  productDetails: [],
  // 新增核心卖点
  sellingPoint: "",
  // 新增核心卖点附件
  sellingPointFile: [],
  spu: {
    spuId: "",
    spuName: "",
    suiteNo: "",
    u9Name: ""
  },
  // NAS地址
  nasUrl: ""
};
const newProduct = ref(emptyValue);

// 新增：显示文件列表的响应式数据（用于组件显示，不修改源数据）
const displayFileLists = ref({
  sellingPointFile: [],
  productPicture: [],
  productDetails: [],
  factoryPicture: [],
  productionProcessDrawing: []
});

// 监听源数据变化，同步到显示文件列表
watch(
  () => newProduct.value,
  newVal => {
    // 同步各个文件字段到显示列表
    Object.keys(displayFileLists.value).forEach(fieldName => {
      if (newVal[fieldName] && Array.isArray(newVal[fieldName])) {
        displayFileLists.value[fieldName] = [...newVal[fieldName]];
      }
    });
  },
  { immediate: true, deep: true }
);

// 监听details的变化,如果是编辑状态，将details赋值给newProduct
watch(
  () => details,
  () => {
    console.log("details change:", details);
    if (isEdit) {
      newProduct.value = details;
    }
  },
  {
    immediate: true,
    deep: true
  }
);

const setProductionProcess = value => {
  newProduct.value.productProduction.productionProcess = value;
};

// 重制产品信息
const resetNewProduct = () => {
  newProduct.value = emptyValue;
};

// 深度合并对象属性
const deepMerge = (target, source) => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === "object" && source[key] !== null) {
        if (!target[key]) {
          target[key] = Array.isArray(source[key]) ? [] : {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
        // if (!target[key]) {
        //   target[key] = source[key];
        // }
      }
    }
  }
};

const fillFactoryInfo = () => {
  selectedFactoryInfo.value = factories.find(
    factory =>
      factory.onSiteEvaluation.factoryName ===
      newProduct.value.onSiteEvaluation.factoryName
  );
  if (selectedFactoryInfo.value) {
    deepMerge(newProduct.value, selectedFactoryInfo.value);
  }
};

if (isEdit) {
  newProduct.value = details;
  fillFactoryInfo();
  console.log("details:", details);
}
const saveProduct = () => {
  productForm.value.validate(valid => {
    if (valid) {
      loading.value = true;
      // 在保存前同步显示文件列表到源数据
      Object.keys(displayFileLists.value).forEach(fieldName => {
        if (
          displayFileLists.value[fieldName] &&
          Array.isArray(displayFileLists.value[fieldName])
        ) {
          newProduct.value[fieldName] = [...displayFileLists.value[fieldName]];
        }
      });

      // 保存产品逻辑
      console.log("保存产品:", newProduct.value);
      // 把spuName筛选出来放进去
      newProduct.value.spu.spuName =
        spuList.value.find(item => item.id === newProduct.value.spu.spuId)
          ?.value || "";
      const postData = mapping(newProduct.value);
      console.log("postData:", postData);
      if (isEdit) {
        updateProduct({
          ...postData,
          id: newProduct.value.id
        })
          .then(res => {
            if (res.code !== 200) {
              ElMessage.error("产品更新失败--" + res.msg);
              return;
            }
            console.log("res:", res);
            ElMessage.success("产品更新成功");
            emits("refresh");
            resetNewProduct();
            visible.value = false;
          })
          .catch(err => {
            console.error("err:", err);
            ElMessage.error("产品更新失败");
          })
          .finally(() => {
            loading.value = false;
          });
        return;
      } else {
        newTask({
          ...postData
        })
          .then(res => {
            if (res.code !== 200) {
              ElMessage.error("产品保存失败--" + res.msg);
              return;
            }
            console.log("res:", res);
            ElMessage.success("产品保存成功");
            emits("refresh");
            resetNewProduct();
            visible.value = false;
          })
          .catch(err => {
            console.error("err:", err);
            ElMessage.error("产品保存失败");
          })
          .finally(() => {
            loading.value = false;
          });
        return;
      }
    } else {
      ElMessage.error("表单还有未填项");
      return false;
    }
  });
};

const beforeUpload = file => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/jpg",
    "application/pdf"
  ];
  const isAllowedType = allowedTypes.includes(file.type);
  const isLte10M = file.size / 1024 / 1024 <= 10;

  if (!isAllowedType) {
    ElMessage.error("上传文件格式不正确，支持 jpg、png、jpeg、gif、pdf 格式");
  }

  if (!isLte10M) {
    ElMessage.error("上传文件大小不超过10M");
  }

  return isAllowedType && isLte10M;
};

const handleExceed = () => {
  ElMessage.warning("超过文件数量限制");
};

const handlePreview = file => {
  getFileDownLoadPath({
    objectName: "prm/traceability-Flow/" + file.name
  })
    .then(res => {
      const { code, msg, data } = res;
      if (code === 200) {
        const fileExtension = file.name?.split(".")?.pop()?.toLowerCase() || "";
        if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          dialogImageUrl.value = res.data;
          dialogVisible.value = true;
        } else {
          window.open(res.data, "_blank");
        }
      } else {
        ElMessage.error("图片预览失败--" + msg);
      }
    })
    .catch(err => {
      ElMessage.error("图片预览失败");
    });
};

//#region el-upload相关方法
// 新增方法：下载文件
const handleDownload = file => {
  getFileDownLoadPath({
    objectName: "prm/traceability-Flow/" + file.name
  })
    .then(res => {
      if (res.code === 200) {
        const link = document.createElement("a");
        link.href = res.data;
        link.download = file.name;
        link.click();
      } else {
        ElMessage.error("文件下载失败--" + res.msg);
      }
    })
    .catch(err => {
      ElMessage.error("文件下载失败");
    });
};

// 修改方法：删除文件（只删除显示列表中的文件，不修改源数据）
const handleRemove = (file, fieldName) => {
  const index = displayFileLists.value[fieldName].findIndex(
    item => item.uid === file.uid
  );
  if (index !== -1) {
    displayFileLists.value[fieldName].splice(index, 1);
    // ElMessage.success("文件已从列表中移除");
  }
};

// 新增方法：判断是否为图片文件
const isImageFile = fileName => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const extension = fileName?.split(".").pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

// 新增方法：获取文件图标
const getFileIcon = fileName => {
  const extension = fileName?.split(".").pop()?.toLowerCase();
  const iconMap = {
    pdf: "📄",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    zip: "📦",
    rar: "📦"
  };
  return iconMap[extension] || "📎";
};
//#endregion

//#region NAS地址逻辑
// NAS地址预览功能
const previewNasUrl = () => {
  if (!newProduct.value.nasUrl) {
    ElMessage.warning("请输入NAS地址");
    return;
  }

  // 检查是否为有效的URL格式
  const urlPattern =
    /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/;
  if (!urlPattern.test(newProduct.value.nasUrl)) {
    ElMessage.warning("请输入有效的URL地址");
    return;
  }

  // 在新窗口打开NAS地址
  window.open(newProduct.value.nasUrl, "_blank");
};
//#endregion
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

/* 新增样式：现代化的文件列表样式 */
.file-list-container {
  margin-top: 16px;
}

.file-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.file-card:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  transform: translateY(-1px);
}

.file-info {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.file-icon {
  flex-shrink: 0;
  margin-right: 12px;
  font-size: 20px;
}

.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  color: #495057;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  font-size: 12px;
  color: #6c757d;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: white;
  background: #007bff;
}

/* NAS地址预览按钮样式 */
.nas-url-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nas-input {
  width: 300px;
}

.preview-btn {
  flex-shrink: 0;
  color: white;
  white-space: nowrap;
  background: #28a745;
}

/* 确保按钮在禁用状态下也有良好的视觉效果 */
.preview-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.preview-btn:hover {
  background: #218838;
}

.download-btn {
  color: white;
  background: #17a2b8;
}

.download-btn:hover {
  background: #138496;
}

.delete-btn {
  color: white;
  background: #dc3545;
}

.delete-btn:hover {
  background: #c82333;
}

/* 上传按钮样式优化 */
.upload-button {
  /* margin-bottom: 16px; */
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
}
</style>
