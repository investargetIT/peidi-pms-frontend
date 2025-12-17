// 空的工厂模板对象，用于解构赋值创建新工厂
const emptyFactoryTemplate = {
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
    productionProcess: "",
    productionDate: "",
    productionBatchNumber: "",
    save: ""
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
  }
};

// 工厂溯源信息配置模板数组，包含两个工厂的完整配置
const factories = [
  {
    // 江苏康贝工厂的登录信息配置
    login: {
      website: "https://trace.cciccloud.com/trace-web/#!/login", // 溯源系统登录网址
      username: "caicf@peidibrand.com", // 登录用户名
      password: "PDGFkj12345678" // 登录密码
    },
    // 入口页面操作步骤说明
    entryPage:
      "点击左侧“溯源信息管理”；点击“溯源信息录入”；点击“国产宠物食品溯源”；默认进入“实地评价”信息录入界面。",
    // 实地评价模块配置
    onSiteEvaluation: {
      add: "点击右上角的 '新增'", // 新增按钮操作说明
      batchNumber: {
        description: "输入编辑后的批次号", // 批次号填写说明
        rules: [
          "温州工厂：PDDWYY + 删除项目编号中的 '-' + 生产日期（年 + 月 + 日）", // 批次号生成规则
          "江苏工厂：PDKB + 删除项目编号中的 '-' + 生产日期（年 + 月 + 日）"
        ],
        examples: [
          "PDKB+CK241100+20231109 变为 PDKBCK24110020231109", // 批次号示例
          "PDDWYY+CK2950+20231109 变为 PDDWYYCK295020231109"
        ]
      },
      selectedProduct:
        "点击“选择”，输入“产品名称”或“产品编号”点击“查询”；选择对应产品在其右侧点击“选择”；点击右下角“确认”。", // 产品选择操作说明
      factoryName: "江苏康贝宠物食品有限公司", // 工厂名称
      address: "泰州市高港区许庄街道创业大道南侧", // 工厂地址
      factoryIntroduction:
        "江苏康贝宠物食品有限公司成立于2010年，一直专注于宠物营养食品的研究，致力于为全球家庭提供专业的宠物营养产品。公司是宠物营养科技有限公司的全资子公司。目前公司拥有员工530人，其中工程技术人员138人，中高级职称82人。公司主要生产五大系列产品：狗咬胶、肉制品、鸟食、小动物食品和烘焙食品。产品款式新颖、口感美味、营养丰富，深受国内外客户和宠物家庭的喜爱。公司拥有自主品牌——'CPET'、'PEIDI'国外品牌，'好时佳'、'驰能'、'贝佳'等国内品牌。产品出口到美国、日本、欧盟、韩国等发达国家，并与多家欧美大型宠物连锁超市建立了销售合作关系，成为沃尔玛超市全球优质产品的特供供应商。公司先后获得'省级企业认定技术中心'、'市级龙头企业'、'省级农产品出口基地'等荣誉称号。公司自主品牌'PEIDI'获得江苏省名牌产品称号。", // 工厂详细介绍
      factoryDisplay: "点击 '+', 上传 '康贝工厂区' 照片", // 工厂展示图片上传说明
      save: "点击底部的 '保存'" // 保存操作说明
    },
    // 原料采购模块配置
    rawMaterialPurchase: {
      entry:
        "点击左侧的 '原料采购'默认显示未录入批次，点击右侧的 '录入' 进入录入页面", // 原料采购入口说明
      materialName: "填写第三方检测的原料名称", // 原料名称填写说明
      materialSource: "填写原料供应商名称", // 原料来源填写说明
      supplier: "填写原料供应商名称", // 供应商名称填写说明
      inspectionReport: "点击 '+', 上传 '检疫证书'、'第三方检测报告' 照片", // 检测报告上传说明
      purchaseBatchNumber: "填写第三方检测的原料批次号", // 采购批次号填写说明
      save: "点击底部的 '保存'" // 保存操作说明
    },
    // 产品生产模块配置
    productProduction: {
      entry:
        "点击左侧的 '产品生产'默认显示未录入批次，点击右侧的 '录入' 进入录入页面", // 产品生产入口说明
      productionProcess: "点击 '+', 上传 '江苏康贝肉制品生产工艺' 照片", // 生产工艺图片上传说明
      productionDate: "选择生产日期", // 生产日期选择说明
      productionBatchNumber: "输入产品批次号", // 生产批次号填写说明
      // productionTechnology: "", // 生产工艺（预留字段）
      // technologyDescription: "" // 工艺说明（预留字段）
      save: "点击下方 '保存'" // 保存操作说明
    },
    // 成品控制模块配置
    finishedProductControl: {
      entry:
        "点击左侧“成品控制”；默认显示未录入批次，点击右侧“录入”，进入录入界面。", // 成品控制入口说明
      inspectionResult: "合格", // 检验结果默认值
      inspectionReport: "点击“+”，上传“检测报告”、“终检单”照片。", // 检验报告上传说明
      save: "点击下方“保存”" // 保存操作说明
    },
    // 售后服务模块配置
    afterSalesService: {
      entry:
        "点击左侧“售后服务”；默认显示未录入批次，点击右侧“录入”，进入录入界面。", // 售后服务入口说明
      contactAddress: "浙江省杭州市萧山区宁围街道诺德财富中心1幢2001室", // 联系地址
      hotline: "400-836-1508", // 咨询热线
      save: "点击下方“保存”" // 保存操作说明
    },
    // 溯源标识模块配置
    traceabilityIdentification: {
      entry:
        "点击左侧“售后服务”；默认显示未录入批次，点击右侧“录入”，进入录入界面。", // 溯源标识入口说明
      traceabilityType: "合规申明溯源", // 溯源类型
      identificationType: "防伪防转移一物一码标识", // 标识类型
      identificationFunction:
        "涂层+金属线防伪 一次性易碎防转移 唯一身份识别+随机码验证", // 标识功能
      verificationMode:
        "扫描溯源二维码，点击底部“防伪查询”，输入银色涂层下方的4位数随机码查询验证", // 验证方法
      save: "点击下方“保存”" // 保存操作说明
    },
    // 中检声明模块配置
    cciStatement: {
      entry:
        "点击左侧“中检声明”；默认显示未录入批次，点击右侧“录入”，进入录入界面。", // 中检声明入口说明
      traceabilityType: "产品合规申明溯源", // 溯源类型
      consumerService:
        "宠物食品/产品追溯热线：0571-56551738或13567137494(微信同号)，QQ社群号：663988914", // 消费者服务信息
      authenticityStatement:
        "本产品溯源信息链接包含的资料、信息等，均由中检溯源及其客户企业共同提供。但中检溯源仅对由自身（含中检各分支机构）直接采集的信息和出具的报告、证书负责。中检溯源开展检验、检测、认证、验证等活动所获得的企业和产品信息，均在申请企业保证诚信的前提下现场或线上采集，与此相关的报告以及证书为我方据实出具，但并不能免除生产方、贸易双方、承运人等所应承担的义务和法律责任，任何有意或无意的虚假行为所造成的后果由当事方自行承担负责。", // 真实性声明
      infringementStatement:
        "所有资料、信息及其他内容涉及中检溯源及其客户企业的知识产权和相关权益，未经许可，不得随意下载，转载和用于未经授权的其他途径，中检溯源及其客户企业有权诉诸法律维护自身合法权益", // 侵权声明
      save: "点击下方“保存”" // 保存操作说明
    },
    // 溯源批次编码模块配置
    traceabilityBatchCoding: {
      entry:
        "点击最左侧列表：追溯信息管理＞追溯批次赋码；选择对应批次编号，点击其右侧“维护”；进入追溯批次赋码界面，点击右侧“编辑”；在“单品追溯码”后填写追溯码，一个填写框只能写一个码，追溯码前五位的“0”不能去除，需要完整填入；输入所有溯源码序号后，点击右下角“保存”。" // 批次编码操作说明
    }
    // 以下为产品基本信息字段（预留）
    // production_enterprise: "", // 生产企业
    // product_brand: "", // 产品品牌
    // specification_model: "", // 规格型号
    // bar_code: "", // 条形码
    // origin: "", // 原产地
    // product_classification: "", // 产品分类
    // shelf_life: "", // 保质期
    // storage_environment: "", // 存储环境
    // ingredient_information: "", // 配料信息
    // product_picture: "", // 产品图片
    // product_details: "" // 产品详情
  },
  {
    // 温州佩蒂工厂的登录信息配置（与江苏康贝工厂类似但参数不同）
    login: {
      website: "https://trace.cciccloud.com/trace-web/#!/login", // 溯源系统登录网址
      username: "caicf@peidibrand.com", // 登录用户名
      password: "PDGFkj12345678" // 登录密码
    },
    // 入口页面操作步骤说明
    entryPage:
      "点击左侧“溯源信息管理”；点击“溯源信息录入”；点击“国产宠物食品溯源”；默认进入“实地评价”信息录入界面。",
    // 实地评价模块配置（温州工厂版本）
    onSiteEvaluation: {
      add: "点击右上角的 '新增'", // 新增按钮操作说明
      batchNumber: {
        description: "输入编写后的批次编号", // 批次号填写说明
        rules: [
          "温州工厂：PDDWYY + 删除项目编号中的 '-' + 生产日期（年 + 月 + 日）", // 批次号生成规则
          "江苏工厂：PDKB + 删除项目编号中的 '-' + 生产日期（年 + 月 + 日）"
        ],
        examples: [
          "PDKB+CK241100+20231109 变为 PDKBCK24110020231109", // 批次号示例
          "PDDWYY+CK2950+20231109 变为 PDDWYYCK295020231109"
        ]
      },
      selectedProduct:
        "点击“选择”，输入“产品名称”或“产品编号”点击“查询”；选择对应产品在其右侧点击“选择”；点击右下角“确认”。", // 产品选择操作说明
      factoryName: "佩蒂动物营养科技股份有限公司", // 工厂名称
      address: "浙江省温州市平阳县水头镇工业园区宠乐路2号", // 工厂地址
      factoryIntroduction:
        "佩蒂动物营养科技股份有限公司在2015年在新三板挂牌，初步踏入资本市场，后转板成功，于2017年7月11日成功在深交所创业板上市，成为我国宠物行业第一家上市公司。自上市以来，我们持续完善公司治理，主动与监管部门沟通，以规范运营和加强信息披露为底线，夯实发展根基。2018年，我们启动了“双轮驱动”的发展战略，在坐稳国内制造的基础上，坚持生产制造和品牌塑造双核心、国内国外双向发展，响应“一带一路”，积极实施“走出去”发展的策略。为提高产品质量，我们通过持续的研发投入，提升中国制造产品的技术含量和附加值逐步探索供应链的国际化。我们的原材料供应不仅有来自中国的和项目所在国的，还有来自乌兹别克斯坦、日本、泰国和巴西等国的原材料。2020年，公司入选浙江“省级供应链创新与应用第二批试点企业”，我们还将继续探索宠物食品企业如何建设高效的供应链这一课题。", // 工厂详细介绍
      factoryDisplay: "点击 '+', 上传 '温州厂区' 照片", // 工厂展示图片上传说明
      save: "点击下方 '保存'" // 保存操作说明
    },
    // 原料采购模块配置（温州工厂版本）
    rawMaterialPurchase: {
      entry:
        "点击左侧的 '原料采购'默认显示未录入批次，点击右侧的 '录入' 进入录入界面", // 原料采购入口说明
      materialName: "填写原料三方检测中的原料名称", // 原料名称填写说明
      materialSource: "填写原料供应商名称", // 原料来源填写说明
      supplier: "填写原料供应商名称", // 供应商名称填写说明
      inspectionReport: "点击 '+', 上传 '出厂检验报告'、'三方检测报告' 照片", // 检测报告上传说明
      purchaseBatchNumber: "填写原料三方检测中的原料批号", // 采购批次号填写说明
      save: "点击下方 '保存'" // 保存操作说明
    },
    // 产品生产模块配置（温州工厂版本）
    productProduction: {
      entry:
        "点击左侧的 '产品生产'默认显示未录入批次，点击右侧的 '录入' 进入录入界面", // 产品生产入口说明
      productionProcess: "点击 '+', 上传 '温州佩蒂鱼干生产工艺' 照片", // 生产工艺图片上传说明
      productionDate: "选择生产日期", // 生产日期选择说明
      productionBatchNumber: "输入产品批号，同上方 '批次编号'", // 生产批次号填写说明
      // productionTechnology: "", // 生产工艺（预留字段）
      // technologyDescription: "", // 工艺说明（预留字段）
      save: "点击下方 '保存'" // 保存操作说明
    },
    // 成品控制模块配置（温州工厂版本）
    finishedProductControl: {
      entry:
        "点击左侧的 '成品控制'默认显示未录入批次，点击右侧的 '录入' 进入录入界面", // 成品控制入口说明
      inspectionResult: "合格", // 检验结果默认值
      inspectionReport: "点击 '+', 上传 '检测报告'、'终检单' 照片", // 检验报告上传说明
      save: "点击下方 '保存'" // 保存操作说明
    },
    // 售后服务模块配置（温州工厂版本）
    afterSalesService: {
      entry:
        "点击左侧的 '售后服务'默认显示未录入批次，点击右侧的 '录入' 进入录入界面", // 售后服务入口说明
      contactAddress: "浙江省杭州市萧山区宁围街道诺德财富中心1幢2001室", // 联系地址
      hotline: "400-836-1508", // 咨询热线
      save: "点击下方 '保存'" // 保存操作说明
    },
    // 溯源标识模块配置（温州工厂版本）
    traceabilityIdentification: {
      entry:
        "点击左侧“售后服务”；默认显示未录入批次，点击右侧“录入”，进入录入界面。", // 溯源标识入口说明
      traceabilityType: "合规申明溯源", // 溯源类型
      identificationType: "防伪防转移一物一码标识", // 标识类型
      identificationFunction:
        "涂层+金属线防伪 一次性易碎防转移 唯一身份识别+随机码验证", // 标识功能
      verificationMode:
        "扫描溯源二维码，点击底部“防伪查询”，输入银色涂层下方的4位数随机码查询验证", // 验证方法
      save: "点击下方“保存”" // 保存操作说明
    },
    // 中检声明模块配置（温州工厂版本）
    cciStatement: {
      entry:
        "点击左侧“中检声明”；默认显示未录入批次，点击右侧“录入”，进入录入界面。", // 中检声明入口说明
      traceabilityType: "产品合规申明溯源", // 溯源类型
      consumerService:
        "宠物食品/产品追溯热线：0571-56551738或13567137494(微信同号)，QQ社群号：663988914", // 消费者服务信息
      authenticityStatement:
        "本产品溯源信息链接包含的资料、信息等，均由中检溯源及其客户企业共同提供。但中检溯源仅对由自身（含中检各分支机构）直接采集的信息和出具的报告、证书负责。中检溯源开展检验、检测、认证、验证等活动所获得的企业和产品信息，均在申请企业保证诚信的前提下现场或线上采集，与此相关的报告以及证书为我方据实出具，但并不能免除生产方、贸易双方、承运人等所应承担的义务和法律责任，任何有意或无意的虚假行为所造成的后果由当事方自行承担负责。", // 真实性声明
      infringementStatement:
        "所有资料、信息及其他内容涉及中检溯源及其客户企业的知识产权和相关权益，未经许可，不得随意下载，转载和用于未经授权的其他途径，中检溯源及其客户企业有权诉诸法律维护自身合法权益", // 侵权声明
      save: "点击下方“保存”" // 保存操作说明
    },
    // 溯源批次编码模块配置（温州工厂版本）
    traceabilityBatchCoding: {
      entry:
        "点击最左侧列表：追溯信息管理＞追溯批次赋码；选择对应批次编号，点击其右侧“维护”；进入追溯批次赋码界面，点击右侧“编辑”；在“单品追溯码”后填写追溯码，一个填写框只能写一个码，追溯码前五位的“0”不能去除，需要完整填入；输入所有溯源码序号后，点击右下角“保存”。"
    }
    // 以下为产品基本信息字段（预留）
    // production_enterprise: "", // 生产企业
    // product_brand: "", // 产品品牌
    // specification_model: "", // 规格型号
    // bar_code: "", // 条形码
    // origin: "", // 原产地
    // product_classification: "", // 产品分类
    // shelf_life: "", // 保质期
    // storage_environment: "", // 存储环境
    // ingredient_information: "", // 配料信息
    // product_picture: "", // 产品图片
    // product_details: "" // 产品详情
  }
];

// 工厂名称数组
const factoryNames = [
  "上海比瑞吉宠物用品股份有限公司",
  "山西星萌科技有限公司",
  "青岛康大长荣进出口有限公司",
  "高乔宠物食品（浙江）有限公司",
  "广东好顺欧迪斯科技科技股份有限公司",
  "内蒙古宁宇膨润土科技有限公司"
];

// 使用数组映射创建新工厂
const newFactories = factoryNames.map(factoryName => ({
  ...emptyFactoryTemplate,
  onSiteEvaluation: {
    ...emptyFactoryTemplate.onSiteEvaluation,
    factoryName
  }
}));

// 将新工厂添加到现有的factories数组中
factories.push(...newFactories);

export default factories;
