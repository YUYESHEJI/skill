import { PhysicsMetric } from './types';

export const APP_NAME = "MetaVerseX";
export const APP_VERSION = "1.0.0-beta";

// Gemini 3 Pro for complex reasoning and multimodal analysis
export const GEMINI_MODEL_PRO = "gemini-3-pro-preview";
// Gemini 2.5 Flash for fast tasks and grounding
export const GEMINI_MODEL_FLASH = "gemini-2.5-flash"; 
// High quality image generation
export const GEMINI_MODEL_IMAGE = "gemini-3-pro-image-preview";
// Video generation
export const GEMINI_MODEL_VIDEO = "veo-3.1-fast-generate-preview";
// Live API
export const GEMINI_MODEL_LIVE = "gemini-2.5-flash-native-audio-preview-09-2025";

export const MOCK_PHYSICS_DATA: PhysicsMetric[] = Array.from({ length: 20 }, (_, i) => ({
  timestamp: `T-${20 - i}s`,
  collisionLoad: Math.floor(Math.random() * 40) + 20,
  physicsThreadTime: Math.random() * 8 + 2,
  activeEntities: Math.floor(Math.random() * 500) + 1000,
}));

export const SAMPLE_PROMPTS = [
  "Cyberpunk slum with neon rain and flying cars",
  "Floating islands with ancient ruins and waterfalls",
  "Post-apocalyptic desert with giant mechanical worms"
];

export const UI_TRANSLATIONS = {
  en: {
    // Sidebar
    nav_dashboard: 'Dashboard',
    nav_worldBuilder: 'World Builder',
    nav_assetForge: 'Asset Forge',
    nav_physicsLab: 'AI Physics Lab',
    nav_liveNpc: 'Live NPC',
    nav_mrPreview: 'MR Preview',
    nav_localization: 'Localization',
    nav_settings: 'Engine Settings',
    
    // Dashboard
    dash_title: 'System Overview',
    dash_subtitle: 'Real-time telemetry from MetaVerseX Engine (Gemini Powered)',
    dash_active_users: 'Active Users',
    dash_ai_ops: 'AI Operations',
    dash_physics_load: 'Physics Load',
    dash_storage: 'Storage',
    dash_notifications: 'System Notifications',
    
    // World Builder
    wb_title: 'World Architect',
    wb_lore: 'Lore',
    wb_concept: 'Concept',
    wb_veo: 'Veo',
    wb_prompt_lore: 'World Description',
    wb_prompt_visual: 'Visual Prompt',
    wb_prompt_cine: 'Cinematic Prompt',
    wb_generate: 'Generate Content',
    wb_generating: 'Generating...',
    wb_grounding: 'Use Real World Data',
    
    // Asset Forge
    af_title: 'Asset Forge',
    af_subtitle: 'Generate technical specs, scripts, or 3D meshes.',
    af_placeholder: 'Describe object, script logic, or upload concept art...',
    af_btn_specs: 'Generate Specs',
    af_btn_mesh: 'Generate 3D Mesh',
    
    // Physics
    phy_title: 'AI Physics Lab',
    phy_subtitle: 'Neural Physics Simulation & Anomaly Detection',
    phy_upload: 'UPLOAD LOG',
    phy_sim_active: 'SIMULATION: ACTIVE',
    
    // Common
    translate: 'Translate',
    translating: 'Translating...',
  },
  cn: {
    // Sidebar
    nav_dashboard: '仪表盘',
    nav_worldBuilder: '世界构建器',
    nav_assetForge: '资产锻造',
    nav_physicsLab: 'AI 物理实验室',
    nav_liveNpc: '实时 NPC',
    nav_mrPreview: 'MR 预览',
    nav_localization: '本地化翻译',
    nav_settings: '引擎设置',
    
    // Dashboard
    dash_title: '系统概览',
    dash_subtitle: 'MetaVerseX 引擎实时遥测 (Gemini 驱动)',
    dash_active_users: '活跃用户',
    dash_ai_ops: 'AI 算力 (OPS)',
    dash_physics_load: '物理负载',
    dash_storage: '存储占用',
    dash_notifications: '系统通知',

    // World Builder
    wb_title: '世界架构师',
    wb_lore: '传说背景',
    wb_concept: '概念图',
    wb_veo: 'Veo 视频',
    wb_prompt_lore: '世界描述',
    wb_prompt_visual: '视觉提示词',
    wb_prompt_cine: '电影感提示词',
    wb_generate: '生成内容',
    wb_generating: '生成中...',
    wb_grounding: '使用真实世界数据',

    // Asset Forge
    af_title: '资产锻造',
    af_subtitle: '生成技术规格、脚本或 3D 网格。',
    af_placeholder: '描述对象、脚本逻辑或上传概念艺术...',
    af_btn_specs: '生成规格',
    af_btn_mesh: '生成 3D 模型',

    // Physics
    phy_title: 'AI 物理实验室',
    phy_subtitle: '神经物理模拟与异常检测',
    phy_upload: '上传日志',
    phy_sim_active: '模拟状态：运行中',

    // Common
    translate: '翻译',
    translating: '翻译中...',
  }
};