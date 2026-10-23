/**
 * SkillHub market — Host half.
 *
 * Fetches the public SkillHub catalog once, gives every skill a Chinese and an
 * English display name, and serves the result to the Client through two
 * same-origin read routes. The Client never talks to SkillHub directly: the
 * upstream API sends no CORS headers, and a same-origin proxy also keeps the
 * page's request gate in charge.
 */

import { InstallError, LIMITS, SKILLS_ROOT, installSkillPackage, isTrustedRequest, readJsonBody } from './install.js'

const SKILLHUB_API = 'https://skillhub.seeyon.com/api/web'
const SKILLHUB_SITE = 'https://skillhub.seeyon.com'
const CACHE_TTL_MS = 5 * 60 * 1000
const PAGE_SIZE = 100
const MAX_PAGES = 12

export const name = 'dsh-skillhub'
export const inject = ['webServer']

/** @type {Map<string, { data: CatalogPayload, fetchedAt: number }>} */
const catalogCache = new Map()
/** @type {Map<string, Promise<CatalogPayload>>} */
const inflight = new Map()
/** @type {{ labels: LabelPayload[], fetchedAt: number } | null} */
let labelCache = null
/** @type {Promise<LabelPayload[]> | null} */
let labelInflight = null
/** @type {Map<string, { data: Record<string, unknown>, fetchedAt: number }>} */
const detailCache = new Map()
/** @type {Map<string, Promise<Record<string, unknown>>>} */
const detailInflight = new Map()
let installInFlight = false


/**
 * Per-skill name overrides. The catalog's own displayName is often the same
 * English slug; these entries are the cases where a term-by-term translation
 * would read badly or where the skill is well known enough to deserve a name.
 */
const NAME_OVERRIDES = {
  "v5-prototype": {
    "zh": "V5 原型生成器",
    "en": "V5 Prototype Generator"
  },
  "delivery-solution-team": {
    "zh": "交付方案专家团",
    "en": "Delivery Solution Expert Team"
  },
  "v8-prototype-design": {
    "zh": "V8 原型设计",
    "en": "V8 Prototype Design"
  },
  "v8-capability-assessment-guide": {
    "zh": "V8 能力评估向导",
    "en": "V8 Capability Assessment Guide"
  },
  "seeyon-oa-doc-writer": {
    "zh": "致远 OA 文档写作助手",
    "en": "Seeyon OA Document Writer"
  },
  "business-solution-writer": {
    "zh": "业务解决方案写作助手",
    "en": "Business Solution Writer"
  },
  "seeyon-db-sql": {
    "zh": "致远数据库 SQL 助手",
    "en": "Seeyon Database SQL Assistant"
  },
  "seeyon-kk-codegraph": {
    "zh": "致远 KK 代码图谱",
    "en": "Seeyon KK Code Graph"
  },
  "seeyon-v8-knowledge-base": {
    "zh": "致远 V8 知识库",
    "en": "Seeyon V8 Knowledge Base"
  },
  "seeyon-custom-dev-guidelines": {
    "zh": "致远客开开发规范",
    "en": "Seeyon Custom Development Guidelines"
  },
  "seeyon-customize-merge": {
    "zh": "致远客开合并工具",
    "en": "Seeyon Customization Merge"
  },
  "seeyon-code-upgrade": {
    "zh": "致远代码升级助手",
    "en": "Seeyon Code Upgrade"
  },
  "seeyon-open-platform": {
    "zh": "致远开放平台",
    "en": "Seeyon Open Platform"
  },
  "seeyon-cap4-flow-data": {
    "zh": "致远 CAP4 流程数据",
    "en": "Seeyon CAP4 Flow Data"
  },
  "seeyon-business-component": {
    "zh": "致远业务组件",
    "en": "Seeyon Business Components"
  },
  "seeyon-project-delivery": {
    "zh": "致远项目交付",
    "en": "Seeyon Project Delivery"
  },
  "seeyon-mobile-page-framework": {
    "zh": "致远移动端页面框架",
    "en": "Seeyon Mobile Page Framework"
  },
  "seeyon-cmp-components": {
    "zh": "致远 CMP 组件",
    "en": "Seeyon CMP Components"
  },
  "seeyon-directory-diff-report": {
    "zh": "致远组织目录差异报告",
    "en": "Seeyon Directory Diff Report"
  },
  "seeyon-v8-spi": {
    "zh": "致远 V8 SPI 开发",
    "en": "Seeyon V8 SPI"
  },
  "seeyon-cap4-groovy": {
    "zh": "致远 CAP4 Groovy 脚本",
    "en": "Seeyon CAP4 Groovy"
  },
  "seeyon-cap4-formula": {
    "zh": "致远 CAP4 公式",
    "en": "Seeyon CAP4 Formula"
  },
  "seeyon-thirdparty-sync": {
    "zh": "致远第三方同步",
    "en": "Seeyon Third-Party Sync"
  },
  "seeyon-esign-integration": {
    "zh": "致远电子签集成",
    "en": "Seeyon eSignature Integration"
  },
  "seeyon-esign-designer": {
    "zh": "致远电子签设计器",
    "en": "Seeyon eSignature Designer"
  },
  "seeyon-signature-archive-integration": {
    "zh": "致远签名归档集成",
    "en": "Seeyon Signature Archive Integration"
  },
  "seeyon-a8-data-processing": {
    "zh": "致远 A8 数据处理",
    "en": "Seeyon A8 Data Processing"
  },
  "seeyon-a8n-manual-helper": {
    "zh": "致远 A8N 手册助手",
    "en": "Seeyon A8N Manual Helper"
  },
  "seeyon-v5-system-init": {
    "zh": "致远 V5 系统初始化",
    "en": "Seeyon V5 System Init"
  },
  "seeyon-v5-wbs-gantt-control": {
    "zh": "致远 V5 WBS 甘特图控件",
    "en": "Seeyon V5 WBS Gantt Control"
  },
  "seeyon-v11-wbs-gantt-control": {
    "zh": "致远 V11 WBS 甘特图控件",
    "en": "Seeyon V11 WBS Gantt Control"
  },
  "seeyon-v5-demo": {
    "zh": "致远 V5 演示",
    "en": "Seeyon V5 Demo"
  },
  "seeyon-v8-demo": {
    "zh": "致远 V8 演示",
    "en": "Seeyon V8 Demo"
  },
  "seeyon-v8-grafana-analyzer": {
    "zh": "致远 V8 Grafana 分析器",
    "en": "Seeyon V8 Grafana Analyzer"
  },
  "seeyon-v8-knowledge-engine": {
    "zh": "致远 V8 知识引擎",
    "en": "Seeyon V8 Knowledge Engine"
  },
  "seeyon-v9-data-dictionary": {
    "zh": "致远 V9 数据字典",
    "en": "Seeyon V9 Data Dictionary"
  },
  "seeyon-v10sp1-data-dictionary": {
    "zh": "致远 V10SP1 数据字典",
    "en": "Seeyon V10SP1 Data Dictionary"
  },
  "seeyon-v5-test-base": {
    "zh": "致远 V5 测试基础",
    "en": "Seeyon V5 Test Base"
  },
  "seeyon-v5-greeting-section": {
    "zh": "致远 V5 问候栏目",
    "en": "Seeyon V5 Greeting Section"
  },
  "seeyon-oa-plan-generator": {
    "zh": "致远 OA 计划生成器",
    "en": "Seeyon OA Plan Generator"
  },
  "seeyon-oa-env-planner": {
    "zh": "致远 OA 环境规划器",
    "en": "Seeyon OA Environment Planner"
  },
  "seeyon-oa-folder-batch": {
    "zh": "致远 OA 文件夹批量处理",
    "en": "Seeyon OA Folder Batch"
  },
  "seeyon-oa-deploy-ops": {
    "zh": "致远 OA 部署运维",
    "en": "Seeyon OA Deployment Ops"
  },
  "seeyon-local-v5-deploy": {
    "zh": "致远 V5 本地部署",
    "en": "Seeyon Local V5 Deployment"
  },
  "seeyon-build-dependency": {
    "zh": "致远构建依赖",
    "en": "Seeyon Build Dependencies"
  },
  "seeyon-code-generator": {
    "zh": "致远代码生成器",
    "en": "Seeyon Code Generator"
  },
  "seeyon-plugin-generator": {
    "zh": "致远插件生成器",
    "en": "Seeyon Plugin Generator"
  },
  "seeyon-pak-packager": {
    "zh": "致远 PAK 打包器",
    "en": "Seeyon PAK Packager"
  },
  "seeyon-presales-kit": {
    "zh": "致远售前工具包",
    "en": "Seeyon Presales Kit"
  },
  "seeyon-question-skill": {
    "zh": "致远问答助手",
    "en": "Seeyon Question Assistant"
  },
  "seeyon-sales-pre-delivery": {
    "zh": "致远销售预交付",
    "en": "Seeyon Sales Pre-Delivery"
  },
  "seeyon-custom-dev-solution": {
    "zh": "致远客开解决方案",
    "en": "Seeyon Custom Development Solution"
  },
  "seeyon-requirement-analysis": {
    "zh": "致远需求分析",
    "en": "Seeyon Requirement Analysis"
  },
  "seeyon-development-docs": {
    "zh": "致远开发文档",
    "en": "Seeyon Development Docs"
  },
  "seeyon-test-personalized": {
    "zh": "致远个性化测试",
    "en": "Seeyon Personalized Test"
  },
  "seeyon-official-mcp": {
    "zh": "致远官方 MCP",
    "en": "Seeyon Official MCP"
  },
  "seeyon-toolbox": {
    "zh": "致远工具箱",
    "en": "Seeyon Toolbox"
  },
  "seeyon-pwd": {
    "zh": "致远密码工具",
    "en": "Seeyon Password Tool"
  },
  "seeyon-dev": {
    "zh": "致远开发助手",
    "en": "Seeyon Dev"
  },
  "seeyon-lyg-ppt": {
    "zh": "致远 LYG PPT 生成",
    "en": "Seeyon LYG PPT"
  },
  "seeyon-ai-delivery-method": {
    "zh": "致远 AI 交付方法论",
    "en": "Seeyon AI Delivery Method"
  },
  "seeyon-v8-flow-action-extension": {
    "zh": "致远 V8 流程动作扩展",
    "en": "Seeyon V8 Flow Action Extension"
  },
  "seeyonskillhub-skill-assistant": {
    "zh": "SkillHub 技能助手",
    "en": "SkillHub Skill Assistant"
  },
  "oa-doc-sync": {
    "zh": "OA 文档同步",
    "en": "OA Document Sync"
  },
  "oa-lexiang-sync": {
    "zh": "OA 乐享同步",
    "en": "OA Lexiang Sync"
  },
  "oa-create-formula": {
    "zh": "OA 公式创建",
    "en": "OA Create Formula"
  },
  "oa-process-start-doc-gen": {
    "zh": "OA 流程发起文档生成",
    "en": "OA Process Start Doc Generator"
  },
  "oa-event-listener-generator": {
    "zh": "OA 事件监听器生成器",
    "en": "OA Event Listener Generator"
  },
  "oa-test-case-designer": {
    "zh": "OA 测试用例设计器",
    "en": "OA Test Case Designer"
  },
  "oa-implementation-plan-builder": {
    "zh": "OA 实施计划构建器",
    "en": "OA Implementation Plan Builder"
  },
  "oa-install-maintenance-report": {
    "zh": "OA 安装维护报告",
    "en": "OA Install & Maintenance Report"
  },
  "oa-estimation": {
    "zh": "OA 工时估算",
    "en": "OA Estimation"
  },
  "v5-browser-envcheck-skill": {
    "zh": "V5 浏览器环境检查",
    "en": "V5 Browser Environment Check"
  },
  "v5-system-log-analyzer": {
    "zh": "V5 系统日志分析器",
    "en": "V5 System Log Analyzer"
  },
  "v5-view-sync-codegen": {
    "zh": "V5 视图同步代码生成",
    "en": "V5 View Sync Codegen"
  },
  "v5-column-layout-generator": {
    "zh": "V5 栏目布局生成器",
    "en": "V5 Column Layout Generator"
  },
  "v5-space-column-development-py": {
    "zh": "V5 空间栏目开发（Python）",
    "en": "V5 Space Column Development (Python)"
  },
  "v5-org-integration-assistant": {
    "zh": "V5 组织集成助手",
    "en": "V5 Organization Integration Assistant"
  },
  "cap4-form-builder": {
    "zh": "CAP4 表单构建器",
    "en": "CAP4 Form Builder"
  },
  "cap4-kafka-consumer-sync": {
    "zh": "CAP4 Kafka 消费者同步",
    "en": "CAP4 Kafka Consumer Sync"
  },
  "cap3-to-cap4-migration": {
    "zh": "CAP3 转 CAP4 迁移",
    "en": "CAP3 to CAP4 Migration"
  },
  "cap-requirement-research": {
    "zh": "CAP 需求调研",
    "en": "CAP Requirement Research"
  },
  "cap-requirement-analysis-report": {
    "zh": "CAP 需求分析报告",
    "en": "CAP Requirement Analysis Report"
  },
  "cap-business-solution-report": {
    "zh": "CAP 业务方案报告",
    "en": "CAP Business Solution Report"
  },
  "cap-front-build-products": {
    "zh": "CAP 前端构建产物",
    "en": "CAP Front-End Build Products"
  },
  "spfl-project-case-summary-report": {
    "zh": "SPFL 项目案例总结报告",
    "en": "SPFL Project Case Summary Report"
  },
  "spfl-full-lifecycle": {
    "zh": "SPFL 全生命周期",
    "en": "SPFL Full Lifecycle"
  },
  "spfl-v5-full-lifecycle": {
    "zh": "SPFL V5 全生命周期",
    "en": "SPFL V5 Full Lifecycle"
  },
  "spfl-initiation-planning": {
    "zh": "SPFL 启动与规划",
    "en": "SPFL Initiation & Planning"
  },
  "spfl-planning-phase": {
    "zh": "SPFL 规划阶段",
    "en": "SPFL Planning Phase"
  },
  "spfl-prototyping": {
    "zh": "SPFL 原型设计",
    "en": "SPFL Prototyping"
  },
  "spfl-prototyping-plus": {
    "zh": "SPFL 原型设计增强版",
    "en": "SPFL Prototyping Plus"
  },
  "spfl-deployment-plan": {
    "zh": "SPFL 部署计划",
    "en": "SPFL Deployment Plan"
  },
  "spfl-environment-config": {
    "zh": "SPFL 环境配置",
    "en": "SPFL Environment Config"
  },
  "spfl-trial-run-analysis-report": {
    "zh": "SPFL 试运行分析报告",
    "en": "SPFL Trial Run Analysis Report"
  },
  "spfl-system-test-cases": {
    "zh": "SPFL 系统测试用例",
    "en": "SPFL System Test Cases"
  },
  "spfl-blueprint-walkthrough-video": {
    "zh": "SPFL 蓝图走查视频",
    "en": "SPFL Blueprint Walkthrough Video"
  },
  "spfl-ops-manual": {
    "zh": "SPFL 运维手册",
    "en": "SPFL Ops Manual"
  },
  "spfl-operation-manual": {
    "zh": "SPFL 操作手册",
    "en": "SPFL Operation Manual"
  },
  "spfl-v8-entity-import-generator": {
    "zh": "SPFL V8 实体导入生成器",
    "en": "SPFL V8 Entity Import Generator"
  },
  "gov-docx-formatter": {
    "zh": "政务公文 DOCX 格式化",
    "en": "Government DOCX Formatter"
  },
  "gov-project-acceptance-report-generator": {
    "zh": "政务项目验收报告生成器",
    "en": "Government Project Acceptance Report Generator"
  },
  "gov-project-archive-generator": {
    "zh": "政务项目归档生成器",
    "en": "Government Project Archive Generator"
  },
  "gov-project-case-study-generator": {
    "zh": "政务项目案例生成器",
    "en": "Government Project Case Study Generator"
  },
  "gov-launch-readiness-checklist": {
    "zh": "政务上线就绪清单",
    "en": "Government Launch Readiness Checklist"
  },
  "gov-launch-report-generator": {
    "zh": "政务上线报告生成器",
    "en": "Government Launch Report Generator"
  },
  "gov-launch-training-plan": {
    "zh": "政务上线培训计划",
    "en": "Government Launch Training Plan"
  },
  "gov-rollout-plan-generator": {
    "zh": "政务推广计划生成器",
    "en": "Government Rollout Plan Generator"
  },
  "gov-cutover-plan-generator": {
    "zh": "政务切换计划生成器",
    "en": "Government Cutover Plan Generator"
  },
  "gov-handover-checklist-generator": {
    "zh": "政务交接清单生成器",
    "en": "Government Handover Checklist Generator"
  },
  "gov-launch-notice-generator": {
    "zh": "政务上线通知生成器",
    "en": "Government Launch Notice Generator"
  },
  "gov-system-value-extractor": {
    "zh": "政务系统价值提取器",
    "en": "Government System Value Extractor"
  },
  "weaver-e9-data-dictionary": {
    "zh": "泛微 E9 数据字典",
    "en": "Weaver E9 Data Dictionary"
  },
  "weaver-e9db-sql": {
    "zh": "泛微 E9 数据库 SQL",
    "en": "Weaver E9 Database SQL"
  },
  "weaver-e9": {
    "zh": "泛微 E9",
    "en": "Weaver E9"
  },
  "source-apply-workflow": {
    "zh": "源码申请流程",
    "en": "Source Code Apply Workflow"
  },
  "project-case-summary-report": {
    "zh": "项目案例总结报告",
    "en": "Project Case Summary Report"
  },
  "project-retrospective-org-learning": {
    "zh": "项目复盘与组织学习",
    "en": "Project Retrospective & Org Learning"
  },
  "project-simulation-drill": {
    "zh": "项目模拟演练",
    "en": "Project Simulation Drill"
  },
  "stakeholder-game": {
    "zh": "干系人游戏",
    "en": "Stakeholder Game"
  },
  "soe-meeting": {
    "zh": "国企会议助手",
    "en": "SOE Meeting Assistant"
  },
  "soe-ppt-review": {
    "zh": "国企 PPT 评审",
    "en": "SOE PPT Review"
  },
  "jingban-integration": {
    "zh": "京办集成",
    "en": "Jingban Integration"
  },
  "ocip-integration": {
    "zh": "OCIP 集成",
    "en": "OCIP Integration"
  },
  "comi-fde-assistant": {
    "zh": "Comi FDE 助手",
    "en": "Comi FDE Assistant"
  },
  "zhiyuan-pmo-management": {
    "zh": "致远 PMO 管理",
    "en": "Zhiyuan PMO Management"
  },
  "wenbantong-tech-presales": {
    "zh": "文办通技术售前",
    "en": "Wenbantong Tech Presales"
  },
  "wenbantong-tech-doc": {
    "zh": "文办通技术文档",
    "en": "Wenbantong Tech Docs"
  },
  "xinshili-delivery-workflow": {
    "zh": "新势力交付工作流",
    "en": "Xinshili Delivery Workflow"
  },
  "xinchuang-baomi-delivery": {
    "zh": "信创保密交付",
    "en": "Xinchuang Confidential Delivery"
  },
  "feekong-survey-generator": {
    "zh": "飞控调研生成器",
    "en": "Feekong Survey Generator"
  },
  "feishu-sso": {
    "zh": "飞书单点登录",
    "en": "Feishu SSO"
  },
  "feishucli-wiki-exporter-skill": {
    "zh": "飞书 Wiki 导出器",
    "en": "Feishu Wiki Exporter"
  },
  "yuque-wiki-exporter-skill": {
    "zh": "语雀 Wiki 导出器",
    "en": "Yuque Wiki Exporter"
  },
  "tengxun-wiki-exporter-skill": {
    "zh": "腾讯 Wiki 导出器",
    "en": "Tencent Wiki Exporter"
  },
  "lexiang-upload": {
    "zh": "乐享上传",
    "en": "Lexiang Upload"
  },
  "e-signbao-oa-delivery": {
    "zh": "e签宝 OA 交付",
    "en": "eSignbao OA Delivery"
  },
  "a8-local-build-packager": {
    "zh": "A8 本地构建打包助手",
    "en": "A8 Local Build & Packaging Assistant"
  },
  "a8本地构建打包助手": {
    "zh": "A8 本地构建打包助手",
    "en": "A8 Local Build & Packaging Assistant"
  },
  "零偏见客观回复准则": {
    "zh": "零偏见客观回复准则",
    "en": "Zero-Bias Objective Response Guidelines"
  },
  "oa-金蝶客开组织复制": {
    "zh": "OA-金蝶客开组织复制",
    "en": "OA-Kingdee Custom Org Replication"
  },
  "生成时序图": {
    "zh": "生成时序图",
    "en": "Generate Sequence Diagram"
  },
  "ones-项目主计划快速搭建技能包": {
    "zh": "ONES 项目主计划快速搭建技能包",
    "en": "ONES Project Master Plan Quick Setup Kit"
  },
  "运维必备-中间件修复-已蒸馏九九八十一位运维专家": {
    "zh": "运维必备-中间件修复（蒸馏 81 位运维专家）",
    "en": "Ops Essentials: Middleware Repair (81 Distilled Experts)"
  },
  "运维必备-v8中间件部署-已蒸馏部署脚本版": {
    "zh": "运维必备-V8 中间件部署（蒸馏脚本版）",
    "en": "Ops Essentials: V8 Middleware Deployment (Distilled Scripts)"
  },
  "致远oa功能应用案例生成": {
    "zh": "致远 OA 功能应用案例生成",
    "en": "Seeyon OA Feature Application Case Generator"
  },
  "门户高保真原型生成器": {
    "zh": "门户高保真原型生成器",
    "en": "Portal High-Fidelity Prototype Generator"
  },
  "三方htm生成excel转致远v5应用包": {
    "zh": "三方 HTM 生成 Excel 转致远 V5 应用包",
    "en": "Third-Party HTM to Excel to Seeyon V5 App Package"
  },
  "详细设计方案生成助手": {
    "zh": "详细设计方案生成助手",
    "en": "Detailed Design Plan Generation Assistant"
  },
  "致远智能交付方法论": {
    "zh": "致远智能交付方法论",
    "en": "Seeyon Intelligent Delivery Methodology"
  },
  "交付作业平台用户助手": {
    "zh": "交付作业平台用户助手",
    "en": "Delivery Workbench User Assistant"
  },
  "跨部门会议全链路专家": {
    "zh": "跨部门会议全链路专家",
    "en": "Cross-Department Meeting Full-Chain Expert"
  },
  "通用工具-高质量ppt生成工具": {
    "zh": "通用工具-高质量 PPT 生成工具",
    "en": "General Tools: High-Quality PPT Generator"
  },
  "政务协同办公详细设计方案生成": {
    "zh": "政务协同办公详细设计方案生成",
    "en": "Government Collaborative Office Detailed Design Generator"
  },
  "等保合规等级评估助手": {
    "zh": "等保合规等级评估助手",
    "en": "Cybersecurity Compliance Level Assessment Assistant"
  },
  "手签字识别采集工具": {
    "zh": "手签字识别采集工具",
    "en": "Handwritten Signature Recognition & Capture Tool"
  },
  "报表驾驶舱设计器": {
    "zh": "报表驾驶舱设计器",
    "en": "Report Cockpit Designer"
  },
  "v5-cap3转cap4表单": {
    "zh": "V5-CAP3 转 CAP4 表单",
    "en": "V5 CAP3 to CAP4 Form Converter"
  },
  "致远v5移动端地图栏目开发": {
    "zh": "致远 V5 移动端地图栏目开发",
    "en": "Seeyon V5 Mobile Map Column Development"
  },
  "v8-dev-path": {
    "zh": "V8 开发路径",
    "en": "V8 Dev Path"
  },
  "v8-faq-answer": {
    "zh": "V8 FAQ 问答",
    "en": "V8 FAQ Answer"
  },
  "v8-api-selector": {
    "zh": "V8 API 选择器",
    "en": "V8 API Selector"
  },
  "v8-entity-import-generator": {
    "zh": "V8 实体导入生成器",
    "en": "V8 Entity Import Generator"
  },
  "v8-expert-installer": {
    "zh": "V8 专家安装器",
    "en": "V8 Expert Installer"
  },
  "v8patchctl": {
    "zh": "V8 补丁工具",
    "en": "V8 Patch Tool"
  },
  "v8envcheck-excel-to-word": {
    "zh": "V8 环境检查 Excel 转 Word",
    "en": "V8 Env Check Excel to Word"
  },
  "udc-app-export": {
    "zh": "UDC 应用导出",
    "en": "UDC App Export"
  },
  "udc-app-import": {
    "zh": "UDC 应用导入",
    "en": "UDC App Import"
  },
  "udc-compatibility-scanner": {
    "zh": "UDC 兼容性扫描器",
    "en": "UDC Compatibility Scanner"
  },
  "workbench-v2-frontend-architecture": {
    "zh": "中海工作台二期前端架构",
    "en": "Workbench V2 Frontend Architecture"
  },
  "flowchart-studio": {
    "zh": "流程图工作室",
    "en": "Flowchart Studio"
  },
  "xu-cui-hui": {
    "zh": "需萃绘图表生成器",
    "en": "Xu Cuihui Diagram Generator"
  },
  "save-tokens": {
    "zh": "节省 Token",
    "en": "Save Tokens"
  },
  "hermes-agnes-switch": {
    "zh": "Hermes / Agnes 模型切换",
    "en": "Hermes Agnes Model Switch"
  },
  "github-good-skills": {
    "zh": "GitHub 优质 Skill 推荐",
    "en": "GitHub Good Skills"
  },
  "java-naming": {
    "zh": "Java 命名规范",
    "en": "Java Naming"
  },
  "chinese-markdown": {
    "zh": "中文 Markdown 排版",
    "en": "Chinese Markdown"
  },
  "seeyonkk": {
    "zh": "致远 V8 客开知识库",
    "en": "Seeyon KK V8 Knowledge Base"
  },
  "agentguard": {
    "zh": "AgentGuard 安全卫士",
    "en": "AgentGuard"
  },
  "commencement-form-filler": {
    "zh": "开工表单填写器",
    "en": "Commencement Form Filler"
  },
  "system-testing": {
    "zh": "系统测试",
    "en": "System Testing"
  },
  "user-manual-generator": {
    "zh": "用户手册生成器",
    "en": "User Manual Generator"
  },
  "product-mapping-tool": {
    "zh": "产品映射工具",
    "en": "Product Mapping Tool"
  },
  "new-customctrl-dev": {
    "zh": "自定义控件开发（新版）",
    "en": "New Custom Control Development"
  },
  "env-architecture-planner": {
    "zh": "环境架构规划器",
    "en": "Environment Architecture Planner"
  },
  "project-cost-estimator": {
    "zh": "项目成本估算器",
    "en": "Project Cost Estimator"
  },
  "recordanalysis-slow-report": {
    "zh": "慢查询记录分析报告",
    "en": "Slow Record Analysis Report"
  },
  "uat-scenario-generator": {
    "zh": "UAT 场景生成器",
    "en": "UAT Scenario Generator"
  },
  "issue-tracker-template": {
    "zh": "问题跟踪模板",
    "en": "Issue Tracker Template"
  },
  "system-implementation": {
    "zh": "系统实施",
    "en": "System Implementation"
  }
}

/** Whole-slug names for skills whose catalog displayName is Chinese. */
const CJK_NAME_OVERRIDES = {
  "致远v5移动端地图栏目开发": {
    "en": "Seeyon V5 Mobile Map Column Development"
  },
  "零偏见客观回复准则": {
    "en": "Zero-Bias Objective Response Guidelines"
  },
  "oa-金蝶客开组织复制": {
    "en": "OA-Kingdee Custom Org Replication"
  },
  "生成时序图": {
    "en": "Generate Sequence Diagram"
  },
  "ones-项目主计划快速搭建技能包": {
    "en": "ONES Project Master Plan Quick Setup Kit"
  },
  "运维必备-中间件修复-已蒸馏九九八十一位运维专家": {
    "en": "Ops Essentials: Middleware Repair (81 Distilled Experts)"
  },
  "致远智能交付方法论": {
    "en": "Seeyon Intelligent Delivery Methodology"
  },
  "交付作业平台用户助手": {
    "en": "Delivery Workbench User Assistant"
  },
  "跨部门会议全链路专家": {
    "en": "Cross-Department Meeting Full-Chain Expert"
  },
  "通用工具-高质量ppt生成工具": {
    "en": "General Tools: High-Quality PPT Generator"
  },
  "致远oa功能应用案例生成": {
    "en": "Seeyon OA Feature Application Case Generator"
  },
  "门户高保真原型生成器": {
    "en": "Portal High-Fidelity Prototype Generator"
  },
  "三方htm生成excel转致远v5应用包": {
    "en": "Third-Party HTM to Excel to Seeyon V5 App Package"
  },
  "详细设计方案生成助手": {
    "en": "Detailed Design Plan Generation Assistant"
  },
  "a8本地构建打包助手": {
    "en": "A8 Local Build & Packaging Assistant"
  },
  "v5-cap3转cap4表单": {
    "en": "V5 CAP3 to CAP4 Form Converter"
  },
  "手签字识别采集工具": {
    "en": "Handwritten Signature Recognition & Capture Tool"
  },
  "报表驾驶舱设计器": {
    "en": "Report Cockpit Designer"
  },
  "等保合规等级评估助手": {
    "en": "Cybersecurity Compliance Level Assessment Assistant"
  },
  "政务协同办公详细设计方案生成": {
    "en": "Government Collaborative Office Detailed Design Generator"
  },
  "运维必备-v8中间件部署-已蒸馏部署脚本版": {
    "en": "Ops Essentials: V8 Middleware Deployment (Distilled Scripts)"
  }
}

/** Brand spellings that title-cased English names must keep. */
const BRANDS = {
  seeyon: 'Seeyon', weaver: 'Weaver', ones: 'ONES', jmeter: 'JMeter', grafana: 'Grafana',
  kafka: 'Kafka', groovy: 'Groovy', git: 'Git', github: 'GitHub', java: 'Java',
  markdown: 'Markdown', skillhub: 'SkillHub', agentguard: 'AgentGuard', hermes: 'Hermes',
  agnes: 'Agnes', comi: 'Comi', ima: 'IMA', lyg: 'LYG', fde: 'FDE', seeyonkk: 'Seeyon KK',
  processon: 'ProcessOn', mermaid: 'Mermaid', ardot: 'Ardot', goplus: 'GoPlus',
}

/** Product and acronym tokens that stay in Latin script. */
const ACRONYMS = new Set([
  'v5', 'v8', 'v9', 'v10sp1', 'v11', 'v2', 'a8', 'a8n', 'e9', 'e9db', 'cap', 'cap3', 'cap4',
  'oa', 'seeyon', 'spfl', 'udc', 'pmo', 'pm', 'ppt', 'pptx', 'docx', 'word', 'excel', 'html',
  'htm', 'css', 'java', 'mysql', 'sql', 'db', 'api', 'sso', 'mcp', 'har', 'jmeter', 'svn',
  'git', 'kafka', 'groovy', 'grafana', 'kk', 'ai', 'ima', 'ones', 'weaver', 'ocip', 'comi',
  'fde', 'lyg', 'bpm', 'sdk', 'cli', 'json', 'xml', 'csv', 'pdf', 'wbs', 'spi', 'cmp', 'uat',
  'sow', 'qa', 'faq', 'ddl', 'vo', 'poc', 'mcp', 'rag', 'llm', 'dsl',
])

/** One-token translations. Tokens are lower-case and stripped of punctuation. */
const TERMS = {
  "seeyon": "致远",
  "weaver": "泛微",
  "oa": "OA",
  "v5": "V5",
  "v8": "V8",
  "v9": "V9",
  "v10sp1": "V10SP1",
  "v11": "V11",
  "a8": "A8",
  "a8n": "A8N",
  "e9": "E9",
  "e9db": "E9DB",
  "cap": "CAP",
  "cap3": "CAP3",
  "cap4": "CAP4",
  "spfl": "SPFL",
  "udc": "UDC",
  "pmo": "PMO",
  "pm": "PM",
  "ppt": "PPT",
  "pptx": "PPTX",
  "docx": "DOCX",
  "word": "Word",
  "excel": "Excel",
  "html": "HTML",
  "htm": "HTM",
  "css": "CSS",
  "java": "Java",
  "mysql": "MySQL",
  "sql": "SQL",
  "db": "数据库",
  "api": "API",
  "sso": "单点登录",
  "mcp": "MCP",
  "har": "HAR",
  "jmeter": "JMeter",
  "svn": "SVN",
  "git": "Git",
  "kafka": "Kafka",
  "groovy": "Groovy",
  "grafana": "Grafana",
  "kk": "KK",
  "ai": "AI",
  "ima": "IMA",
  "ones": "ONES",
  "ocip": "OCIP",
  "comi": "Comi",
  "fde": "FDE",
  "lyg": "LYG",
  "wbs": "WBS",
  "spi": "SPI",
  "cmp": "CMP",
  "uat": "UAT",
  "sow": "SOW",
  "faq": "FAQ",
  "ddl": "DDL",
  "vo": "VO",
  "poc": "POC",
  "rag": "RAG",
  "llm": "LLM",
  "test": "测试",
  "tests": "测试",
  "case": "案例",
  "cases": "案例",
  "prototype": "原型",
  "prototypes": "原型",
  "prototyping": "原型设计",
  "design": "设计",
  "designer": "设计器",
  "designe": "设计",
  "generator": "生成器",
  "generation": "生成",
  "generate": "生成",
  "builder": "构建器",
  "build": "构建",
  "writer": "写作助手",
  "write": "编写",
  "assistant": "助手",
  "helper": "助手",
  "guide": "指南",
  "guidelines": "准则",
  "guideline": "规范",
  "manual": "手册",
  "checklist": "清单",
  "report": "报告",
  "doc": "文档",
  "docs": "文档",
  "document": "文档",
  "summary": "摘要",
  "solution": "方案",
  "team": "团队",
  "delivery": "交付",
  "project": "项目",
  "plan": "计划",
  "planner": "规划器",
  "planning": "规划",
  "schedule": "排期",
  "scheduled": "定时",
  "master": "主",
  "kickoff": "启动会",
  "deck": "演示文稿",
  "slide": "幻灯片",
  "presentation": "演示",
  "meeting": "会议",
  "training": "培训",
  "course": "课程",
  "material": "材料",
  "video": "视频",
  "dashboard": "看板",
  "cockpit": "驾驶舱",
  "chart": "图表",
  "knowledge": "知识",
  "base": "基础",
  "engine": "引擎",
  "graph": "图谱",
  "code": "代码",
  "source": "源码",
  "apply": "应用",
  "workflow": "工作流",
  "process": "流程",
  "flow": "流程",
  "formula": "公式",
  "form": "表单",
  "field": "字段",
  "entity": "实体",
  "table": "表",
  "column": "栏目",
  "layout": "布局",
  "space": "空间",
  "page": "页面",
  "framework": "框架",
  "component": "组件",
  "components": "组件",
  "business": "业务",
  "requirement": "需求",
  "requirements": "需求",
  "research": "调研",
  "survey": "调研",
  "analysis": "分析",
  "analyze": "分析",
  "analyzer": "分析器",
  "analyse": "分析",
  "implementation": "实施",
  "deployment": "部署",
  "deploy": "部署",
  "environment": "环境",
  "env": "环境",
  "config": "配置",
  "configuration": "配置",
  "integration": "集成",
  "migration": "迁移",
  "migrate": "迁移",
  "upgrade": "升级",
  "development": "开发",
  "dev": "开发",
  "custom": "定制",
  "customize": "客开",
  "customization": "客开",
  "customctrl": "自定义控件",
  "standard": "标准",
  "spec": "规范",
  "specification": "规格",
  "style": "样式",
  "theme": "主题",
  "brand": "品牌",
  "official": "官方",
  "open": "开放",
  "platform": "平台",
  "thirdparty": "第三方",
  "third": "第三",
  "party": "方",
  "org": "组织",
  "organization": "组织",
  "directory": "目录",
  "diff": "差异",
  "compare": "对比",
  "merge": "合并",
  "sync": "同步",
  "copy": "复制",
  "replication": "复制",
  "file": "文件",
  "folder": "文件夹",
  "batch": "批量",
  "content": "内容",
  "interactive": "交互",
  "high": "高",
  "fidelity": "保真",
  "quality": "高质量",
  "general": "通用",
  "tool": "工具",
  "tools": "工具",
  "toolbox": "工具箱",
  "kit": "套件",
  "package": "包",
  "packager": "打包器",
  "pack": "打包",
  "artifact": "制品",
  "template": "模板",
  "module": "模块",
  "extension": "扩展",
  "action": "动作",
  "event": "事件",
  "listener": "监听器",
  "consumer": "消费者",
  "producer": "生产者",
  "service": "服务",
  "log": "日志",
  "search": "搜索",
  "query": "查询",
  "retrieval": "检索",
  "wiki": "Wiki",
  "exporter": "导出器",
  "export": "导出",
  "import": "导入",
  "upload": "上传",
  "download": "下载",
  "scan": "扫描",
  "scanner": "扫描器",
  "check": "检查",
  "checker": "检查器",
  "review": "评审",
  "reviewer": "评审器",
  "estimate": "估算",
  "estimation": "估算",
  "cost": "成本",
  "resource": "资源",
  "assembler": "组建器",
  "stakeholder": "干系人",
  "game": "游戏",
  "simulation": "模拟",
  "drill": "演练",
  "retrospective": "复盘",
  "learning": "学习",
  "handover": "交接",
  "receiver": "接收方",
  "launch": "上线",
  "readiness": "就绪",
  "notice": "通知",
  "acceptance": "验收",
  "archive": "归档",
  "study": "研究",
  "rollout": "推广",
  "value": "价值",
  "extractor": "提取器",
  "blueprint": "蓝图",
  "walkthrough": "走查",
  "trial": "试",
  "run": "运行",
  "system": "系统",
  "ops": "运维",
  "operation": "操作",
  "operations": "运维",
  "support": "支持",
  "maintenance": "维护",
  "install": "安装",
  "installation": "安装",
  "local": "本地",
  "remote": "远程",
  "cloud": "云",
  "data": "数据",
  "database": "数据库",
  "dictionary": "字典",
  "processing": "处理",
  "classification": "分类",
  "nature": "性质",
  "customer": "客户",
  "sales": "销售",
  "presales": "售前",
  "contract": "合同",
  "consult": "咨询",
  "bid": "投标",
  "proposal": "方案",
  "safety": "安全",
  "production": "生产",
  "management": "管理",
  "manager": "管理器",
  "governance": "治理",
  "compliance": "合规",
  "assessment": "评估",
  "security": "安全",
  "audit": "审计",
  "statistics": "统计",
  "monitor": "监控",
  "performance": "性能",
  "slow": "慢",
  "recordanalysis": "记录分析",
  "runner": "运行器",
  "mobile": "移动端",
  "web": "Web",
  "webview": "WebView",
  "debugging": "调试",
  "signature": "签名",
  "handwritten": "手写",
  "recognition": "识别",
  "capture": "采集",
  "selection": "选择",
  "selective": "选择性",
  "print": "打印",
  "chain": "链路",
  "collaboration": "协同",
  "office": "办公",
  "gov": "政务",
  "collaborative": "协同",
  "detailed": "详细",
  "zero": "零",
  "bias": "偏见",
  "objective": "客观",
  "response": "回复",
  "principles": "准则",
  "create": "创建",
  "colleague": "同事",
  "hello": "问候",
  "greeting": "问候",
  "section": "栏目",
  "map": "地图",
  "how": "如何",
  "to": "转",
  "use": "使用",
  "skillhub": "SkillHub",
  "skill": "技能",
  "hub": "中心",
  "market": "市场",
  "personal": "个人",
  "personalized": "个性化",
  "demo": "演示",
  "browser": "浏览器",
  "view": "视图",
  "codegen": "代码生成",
  "gen": "生成",
  "add": "添加",
  "edoc": "电子文档",
  "setting": "设置",
  "settings": "设置",
  "attributes": "属性",
  "answer": "问答",
  "mode": "模式",
  "advisor": "顾问",
  "cutover": "切换",
  "plus": "增强版",
  "lifecycle": "生命周期",
  "full": "全",
  "capability": "能力",
  "path": "路径",
  "sketch": "草图",
  "pwd": "密码",
  "e-signbao": "e签宝",
  "signbao": "签宝",
  "esign": "电子签",
  "esignbao": "e签宝",
  "jingban": "京办",
  "lexiang": "乐享",
  "feishu": "飞书",
  "yuque": "语雀",
  "tengxun": "腾讯",
  "wenbantong": "文办通",
  "xinshili": "新势力",
  "xinchuang": "信创",
  "baomi": "保密",
  "dengbao": "等保",
  "zhiyuan": "致远",
  "soe": "国企",
  "government": "政务",
  "level": "等级",
  "cybersecurity": "网络安全",
  "case-study": "案例研究",
  "go-live": "上线",
  "master-schedule": "主计划",
  "kickoff-deck": "启动会演示文稿",
  "system-test": "系统测试",
  "test-base": "测试基础",
  "knowledge-base": "知识库",
  "data-dictionary": "数据字典",
  "full-lifecycle": "全生命周期",
  "open-platform": "开放平台",
  "third-party": "第三方",
  "high-fidelity": "高保真",
  "source-apply": "源码申请",
  "project-case": "项目案例",
  "business-solution": "业务方案",
  "delivery-solution": "交付方案",
  "custom-dev": "客开开发",
  "test-case": "测试用例",
  "test-cases": "测试用例",
  "op-platform": "开放平台",
  "code-graph": "代码图谱",
  "workbench": "工作台",
  "frontend": "前端",
  "architecture": "架构",
  "flowchart": "流程图",
  "studio": "工作室",
  "save": "节省",
  "tokens": "Token",
  "token": "Token",
  "switch": "切换",
  "chinese": "中文",
  "markdown": "Markdown",
  "naming": "命名",
  "user": "用户",
  "product": "产品",
  "mapping": "映射",
  "estimator": "估算器",
  "testing": "测试",
  "new": "新建",
  "scenario": "场景",
  "issue": "问题",
  "tracker": "跟踪",
  "commencement": "开工",
  "filler": "填写器",
  "github": "GitHub",
  "seeyonkk": "致远 KK",
  "agentguard": "AgentGuard",
  "processon": "ProcessOn",
  "mermaid": "Mermaid"
}

/** Two-token phrases checked before the one-token table. */
const PHRASES = {
  'test|case': '测试用例',
  'test|cases': '测试用例',
  'test|base': '测试基础',
  'knowledge|base': '知识库',
  'data|dictionary': '数据字典',
  'full|lifecycle': '全生命周期',
  'open|platform': '开放平台',
  'third|party': '第三方',
  'high|fidelity': '高保真',
  'master|schedule': '主计划',
  'kickoff|deck': '启动会演示文稿',
  'system|test': '系统测试',
  'case|study': '案例研究',
  'project|case': '项目案例',
  'source|apply': '源码申请',
  'business|solution': '业务方案',
  'delivery|solution': '交付方案',
  'custom|dev': '客开开发',
  'code|graph': '代码图谱',
  'go|live': '上线',
  'e|signbao': 'e签宝',
}

function hasCJK(value) {
  return /[\u3400-\u9fff]/.test(value)
}

function tokenize(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_\-/]+/)
    .map(token => token.replace(/^[^A-Za-z0-9\u3400-\u9fff]+|[^A-Za-z0-9\u3400-\u9fff]+$/g, ''))
    .filter(Boolean)
}

function titleToken(token) {
  if (!token) return ''
  const lower = token.toLowerCase()
  if (BRANDS[lower]) return BRANDS[lower]
  if (ACRONYMS.has(lower)) return lower.toUpperCase()
  if (/^[A-Z0-9]{2,}$/.test(token)) return token
  if (token[0] === token[0].toUpperCase() && token.slice(1) !== token.slice(1).toUpperCase()) return token
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function prettyEnglish(value) {
  const tokens = tokenize(value)
  if (tokens.length === 0) return ''
  return tokens.map(titleToken).join(' ')
}

function translateChinese(value) {
  const rawTokens = tokenize(value)
  if (rawTokens.length === 0) return ''
  const segments = []
  for (let index = 0; index < rawTokens.length; index += 1) {
    const first = rawTokens[index].toLowerCase()
    const second = rawTokens[index + 1]?.toLowerCase()
    const pair = second ? PHRASES[first + '|' + second] : undefined
    if (pair) {
      segments.push(pair)
      index += 1
      continue
    }
    const direct = TERMS[first]
    if (direct) {
      segments.push(direct)
      continue
    }
    if (ACRONYMS.has(first)) {
      segments.push(first.toUpperCase())
      continue
    }
    // Unknown tokens stay in Latin script; they are usually product names.
    segments.push(titleToken(rawTokens[index]))
  }
  let out = ''
  for (const segment of segments) {
    if (!segment) continue
    if (!out) {
      out = segment
      continue
    }
    const latinSegment = /^[A-Za-z0-9+.#/()（）\-]+$/.test(segment) && !hasCJK(segment)
    const latinTail = /[A-Za-z0-9+.#/()（）\-]$/.test(out)
    out += latinSegment || latinTail ? ' ' + segment : segment
  }
  return out.replace(/\s+/g, ' ').trim()
}

function lookupOverride(slug, displayName) {
  const keys = [String(slug || '').toLowerCase(), String(displayName || '').trim().toLowerCase()]
  for (const key of keys) {
    if (NAME_OVERRIDES[key]) return NAME_OVERRIDES[key]
  }
  return undefined
}

function lookupCjkOverride(slug, displayName) {
  const keys = [String(slug || '').toLowerCase(), String(displayName || '').trim().toLowerCase()]
  for (const key of keys) {
    if (CJK_NAME_OVERRIDES[key]) return CJK_NAME_OVERRIDES[key]
  }
  return undefined
}

/**
 * Build the two display names for one catalog entry.
 * @param {{slug?: string, displayName?: string}} skill
 * @returns {{nameZh: string, nameEn: string}}
 */
export function buildBilingualName(skill) {
  const slug = String(skill?.slug || '')
  const displayName = String(skill?.displayName || '').trim()
  const override = lookupOverride(slug, displayName)
  const cjkOverride = lookupCjkOverride(slug, displayName)

  let nameZh = override?.zh
  if (!nameZh) {
    nameZh = hasCJK(displayName) ? displayName : translateChinese(slug || displayName)
  }
  if (!nameZh) nameZh = displayName || slug || '未命名技能'

  let nameEn = override?.en
  if (!nameEn && cjkOverride?.en) nameEn = cjkOverride.en
  if (!nameEn) {
    if (hasCJK(displayName)) {
      nameEn = slug && !hasCJK(slug) ? prettyEnglish(slug) : displayName
    } else {
      nameEn = prettyEnglish(displayName || slug)
    }
  }
  if (!nameEn) nameEn = slug || displayName || 'Untitled skill'

  return { nameZh: cleanName(nameZh), nameEn: cleanName(nameEn) }
}

function cleanName(value) {
  return String(value)
    .replace(/\s*([（）()【】[\],，。:：])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeLabel(label) {
  if (!label || typeof label !== 'object') return null
  const slug = String(label.slug || '').trim()
  if (!slug) return null
  return {
    slug,
    displayName: String(label.displayName || slug),
    type: String(label.type || ''),
  }
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {Record<string, unknown>}
 */
export function normalizeSkill(raw) {
  const names = buildBilingualName(raw)
  const labels = Array.isArray(raw.labels) ? raw.labels.map(normalizeLabel).filter(Boolean) : []
  const published = raw.publishedVersion && typeof raw.publishedVersion === 'object' ? raw.publishedVersion : null
  const headline = raw.headlineVersion && typeof raw.headlineVersion === 'object' ? raw.headlineVersion : null
  const version = String(published?.version || headline?.version || '')
  const namespace = String(raw.namespace || 'global')
  const slug = String(raw.slug || '')
  return {
    id: raw.id,
    slug,
    namespace,
    displayName: String(raw.displayName || slug),
    nameZh: names.nameZh,
    nameEn: names.nameEn,
    summary: String(raw.summary || '').trim(),
    labels,
    version,
    downloadCount: Number(raw.downloadCount || 0),
    starCount: Number(raw.starCount || 0),
    ratingAvg: Number(raw.ratingAvg || 0),
    ratingCount: Number(raw.ratingCount || 0),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
    url: SKILLHUB_SITE + '/space/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(slug),
  }
}

async function fetchJson(path, signal) {
  const response = await fetch(SKILLHUB_API + path, {
    headers: {
      accept: 'application/json',
      'accept-language': 'zh-CN',
      'user-agent': 'dsh-skillhub/1.0 (+DeepSeek Harness plugin)',
    },
    signal: signal || AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error('SkillHub HTTP ' + response.status)
  const body = await response.json()
  if (!body || body.code !== 0) throw new Error(body?.msg || 'SkillHub returned an error')
  return body.data
}

async function fetchPage(page, size, label, signal) {
  let path = '/skills?page=' + page + '&size=' + size
  if (label) path += '&label=' + encodeURIComponent(label)
  return fetchJson(path, signal)
}

async function fetchAllSkills(label, signal) {
  const first = await fetchPage(0, PAGE_SIZE, label, signal)
  const total = Number(first.total || first.items?.length || 0)
  const items = Array.isArray(first.items) ? [...first.items] : []
  const pageCount = Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / PAGE_SIZE)))
  for (let page = 1; page < pageCount; page += 1) {
    const next = await fetchPage(page, PAGE_SIZE, label, signal)
    if (Array.isArray(next.items) && next.items.length > 0) items.push(...next.items)
  }
  return items
}

/**
 * Read the nine visible categories and their skill counts. Counts come from
 * one size=1 request per category, so the catalog payload can stay small.
 * @returns {Promise<LabelPayload[]>}
 */
async function fetchLabelsAndCounts() {
  if (labelCache && Date.now() - labelCache.fetchedAt < CACHE_TTL_MS) return labelCache.labels
  if (labelInflight) return labelInflight
  labelInflight = (async () => {
    const labelsRaw = await fetchJson('/labels')
    const labels = Array.isArray(labelsRaw) ? labelsRaw.map(normalizeLabel).filter(Boolean) : []
    const counts = await Promise.all(labels.map(async (entry) => {
      try {
        const data = await fetchPage(0, 1, entry.slug)
        return Number(data.total || 0)
      } catch (error) {
        return 0
      }
    }))
    const withCounts = labels.map((entry, index) => ({ ...entry, count: counts[index] || 0 }))
    labelCache = { labels: withCounts, fetchedAt: Date.now() }
    return withCounts
  })()
  try {
    return await labelInflight
  } finally {
    labelInflight = null
  }
}

function normalizeItems(rawItems) {
  const seen = new Set()
  const normalized = []
  for (const item of rawItems) {
    if (!item || typeof item !== 'object') continue
    const id = String(item.id ?? item.slug ?? '')
    if (!id || seen.has(id)) continue
    seen.add(id)
    normalized.push(normalizeSkill(item))
  }
  return normalized
}

/**
 * Read the public catalog, optionally narrowed to one category. The list API
 * omits per-item labels, so categories are applied by SkillHub itself and the
 * Client keeps the same local search/sort/pagination behaviour on the subset.
 * @param {boolean} force
 * @param {string} label
 * @returns {Promise<CatalogPayload>}
 */
export async function fetchCatalog(force = false, label = '') {
  const key = label || '*'
  const now = Date.now()
  const cached = catalogCache.get(key)
  if (!force && cached && now - cached.fetchedAt < CACHE_TTL_MS) return cached.data
  if (inflight.has(key)) return inflight.get(key)

  const fallbackLabels = labelCache ? labelCache.labels : []
  if (force) labelCache = null

  const task = (async () => {
    let labels = fallbackLabels
    try {
      labels = await fetchLabelsAndCounts()
    } catch (error) {
      labels = fallbackLabels
    }
    const rawItems = await fetchAllSkills(label)
    const items = normalizeItems(rawItems)
    const data = {
      ok: true,
      source: SKILLHUB_SITE,
      fetchedAt: new Date().toISOString(),
      label: label || null,
      total: items.length,
      labels,
      items,
    }
    catalogCache.set(key, { data, fetchedAt: Date.now() })
    return data
  })()
  inflight.set(key, task)

  try {
    return await task
  } catch (error) {
    if (cached) {
      return { ...cached.data, stale: true, warning: error instanceof Error ? error.message : String(error) }
    }
    throw error
  } finally {
    inflight.delete(key)
  }
}

function sendJson(response, status, body) {
  const payload = JSON.stringify(body)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'content-length': Buffer.byteLength(payload),
  })
  response.end(payload)
}

function methodNotAllowed(response, allow = 'GET') {
  response.writeHead(405, { allow, 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ ok: false, error: 'method not allowed' }))
}

function queryParam(request, name) {
  try {
    return new URL(request.url || '/', 'http://localhost').searchParams.get(name) || ''
  } catch (error) {
    return ''
  }
}

function isRefresh(request) {
  return queryParam(request, 'refresh') === '1'
}

function isValidLabel(value) {
  return value === '' || /^[a-z0-9][a-z0-9-]{0,63}$/.test(value)
}

function isValidSkillKey(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 200 && !/[\/\\?#\u0000-\u001f]/.test(value) && value !== '.' && value !== '..'
}

async function fetchSkillDetail(namespace, slug) {
  const key = namespace + '/' + slug
  const now = Date.now()
  const cached = detailCache.get(key)
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) return cached.data
  if (detailInflight.has(key)) return detailInflight.get(key)
  const task = (async () => {
    const raw = await fetchJson('/skills/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(slug))
    const data = normalizeSkill(raw)
    data.ownerDisplayName = String(raw.ownerDisplayName || '')
    data.subscriptionCount = Number(raw.subscriptionCount || 0)
    detailCache.set(key, { data, fetchedAt: Date.now() })
    return data
  })()
  detailInflight.set(key, task)
  try {
    return await task
  } finally {
    detailInflight.delete(key)
  }
}

async function downloadSkillPackage(namespace, slug) {
  const detail = await fetchSkillDetail(namespace, slug)
  const version = String(detail.version || '')
  if (!version) throw new InstallError('no-version', 'This skill has no published version', 409)
  const url = SKILLHUB_API + '/skills/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(slug) + '/versions/' + encodeURIComponent(version) + '/download'
  let response
  try {
    response = await fetch(url, {
      headers: {
        accept: 'application/zip',
        'accept-language': 'zh-CN',
        'user-agent': 'skillhub/1.0 (+DeepSeek Harness plugin)',
      },
      signal: AbortSignal.timeout(60000),
    })
  } catch (error) {
    throw new InstallError('download-failed', 'Could not reach SkillHub: ' + (error instanceof Error ? error.message : String(error)), 502)
  }
  if (!response.ok) throw new InstallError('download-failed', 'SkillHub returned HTTP ' + response.status, 502)
  const declared = Number(response.headers.get('content-length') || 0)
  if (declared > LIMITS.downloadBytes) throw new InstallError('package-too-large', 'The skill package exceeds the 30 MB limit', 413)
  const chunks = []
  let total = 0
  if (response.body) {
    const reader = response.body.getReader()
    while (true) {
      const step = await reader.read()
      if (step.done) break
      const value = step.value
      if (!value) continue
      total += value.length
      if (total > LIMITS.downloadBytes) {
        try { await reader.cancel() } catch (error) { /* the size error wins */ }
        throw new InstallError('package-too-large', 'The skill package exceeds the 30 MB limit', 413)
      }
      chunks.push(Buffer.from(value))
    }
  } else {
    const buffer = Buffer.from(await response.arrayBuffer())
    total = buffer.length
    if (total > LIMITS.downloadBytes) throw new InstallError('package-too-large', 'The skill package exceeds the 30 MB limit', 413)
    chunks.push(buffer)
  }
  const buffer = Buffer.concat(chunks)
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new InstallError('not-zip', 'The downloaded package is not a ZIP', 502)
  }
  return { buffer, version }
}

async function handleInstall(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, 'POST')
  if (!isTrustedRequest(request)) {
    sendJson(response, 403, { ok: false, code: 'forbidden', error: 'Untrusted request' })
    return
  }
  const contentType = String(request.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  if (contentType !== 'application/json') {
    sendJson(response, 415, { ok: false, code: 'unsupported-media-type', error: 'Content-Type must be application/json' })
    return
  }
  if (installInFlight) {
    sendJson(response, 429, { ok: false, code: 'busy', error: 'Another install is already running' })
    return
  }
  installInFlight = true
  try {
    const body = await readJsonBody(request)
    const namespace = String(body.namespace || '').trim()
    const slug = String(body.slug || '').trim()
    if (!isValidSkillKey(namespace) || !isValidSkillKey(slug)) {
      sendJson(response, 400, { ok: false, code: 'invalid-skill', error: 'Invalid namespace or slug' })
      return
    }
    const downloaded = await downloadSkillPackage(namespace, slug)
    const result = installSkillPackage(downloaded.buffer, SKILLS_ROOT, slug)
    sendJson(response, 200, Object.assign({ ok: true, version: downloaded.version, source: SKILLHUB_SITE }, result))
  } catch (error) {
    if (error instanceof InstallError) {
      sendJson(response, error.status, { ok: false, code: error.code, error: error.message })
      return
    }
    sendJson(response, 502, { ok: false, code: 'install-failed', error: error instanceof Error ? error.message : String(error) })
  } finally {
    installInFlight = false
  }
}

/** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
async function handleCatalog(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed(response)
  const label = queryParam(request, 'label').trim()
  if (!isValidLabel(label)) {
    sendJson(response, 400, { ok: false, error: 'invalid category' })
    return
  }
  try {
    const data = await fetchCatalog(isRefresh(request), label)
    sendJson(response, 200, data)
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      error: 'SkillHub is unreachable: ' + (error instanceof Error ? error.message : String(error)),
    })
  }
}

/** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
function handleHealth(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed(response)
  const root = catalogCache.get('*')
  sendJson(response, 200, {
    ok: true,
    cached: root !== undefined,
    ageMs: root ? Date.now() - root.fetchedAt : null,
    total: root ? root.data.total : null,
    categories: labelCache ? labelCache.labels.length : null,
    cacheKeys: [...catalogCache.keys()],
    source: SKILLHUB_SITE,
  })
}

/**
 * Host entry. The routes are exact matches, so they never collide with the
 * page's own prefix routes.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  ctx.effect(() => {
    const disposers = [
      ctx.webServer.register({ kind: 'exact', path: '/dsh-skillhub/api/catalog', handler: handleCatalog }),
      ctx.webServer.register({ kind: 'exact', path: '/dsh-skillhub/api/health', handler: handleHealth }),
      ctx.webServer.register({ kind: 'exact', path: '/dsh-skillhub/api/install', handler: handleInstall }),
    ]
    return () => {
      for (const dispose of disposers) {
        try {
          dispose()
        } catch {
          // The host may already have disposed the route.
        }
      }
    }
  }, 'dsh-skillhub: HTTP routes')
}
