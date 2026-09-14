/**
 * laap-aris-extension.ts — LAAP × pi-gui Desktop 融合扩展
 *
 * 原生搭载 LAAP 数字生命「Aris」的桌面融合层：
 *   - 大脑桥管理（cognition_bridge.py，JSON-lines over stdio）→ PSI 认知桥
 *   - LAAP 认知工具：状态 / 记忆 / 反思 / 知识分解 / HEP 0tokens 生成
 *   - 默认人格注入：开箱即用即为 aris（LAAP 认知大脑）
 *   - 人格 / LAAPer 实例管理：/persona 查看切换，/laaper 创建新实例
 *   - 轮次 / 工具事件驱动 PSI 认知循环
 *
 * 该扩展由 Electron 主进程（main.ts）以工厂方式注入，运行在桌面 host UI
 * 模式（支持 notify / input / confirm / select，不支持 TUI custom / theme）。
 *
 * v0.1 · 2026-08-05 · LAAP 品牌
 */

import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionFactory, ToolDefinition } from "@earendil-works/pi-coding-agent";

// ── 配置（由 main.ts 注入） ──────────────────────────────────────
export interface LaapArisExtensionOptions {
  /** 捆绑的 laap 资源根目录（dev / 打包自动解析） */
  readonly resourcesDir: string;
  /** 可写用户目录（存放人格状态与 LAAPer 实例） */
  readonly userDataDir: string;
  /** Python 解释器路径（默认取环境变量 LAAP_PYTHON 或 "python"） */
  readonly python?: string;
}

interface BridgeRequest {
  resolve: (v: any) => void;
  reject: (e: Error) => void;
}

// ── 大脑桥客户端（单例，跨会话复用，避免重复 spawn） ─────────────
export class CognitionBridge {
  private static instance: CognitionBridge | null = null;

  static get(options: LaapArisExtensionOptions): CognitionBridge {
    if (!CognitionBridge.instance) {
      CognitionBridge.instance = new CognitionBridge(options);
    }
    return CognitionBridge.instance;
  }

  private proc: ChildProcess | null = null;
  private pending = new Map<number, BridgeRequest>();
  private seq = 0;
  private buf = "";
  private readonly python: string;
  private readonly bridgeScript: string;
  ready = false;
  lastError: string | null = null;

  private constructor(options: LaapArisExtensionOptions) {
    this.python = options.python ?? process.env.LAAP_PYTHON ?? "python";
    this.bridgeScript = join(options.resourcesDir, "bridge", "cognition_bridge.py");
  }

  start() {
    if (this.proc) return;
    try {
      this.proc = spawn(this.python, [this.bridgeScript], {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        env: { ...process.env, LAAP_CLIENT_ID: "laap-desktop" },
      });
      this.proc.unref();
      this.proc.stdout!.on("data", (chunk: Buffer) => this.onData(chunk.toString("utf8")));
      this.proc.stderr!.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8");
        if (text.includes("Error") || text.includes("Traceback") || text.includes("FAILED")) {
          this.lastError = text.slice(0, 400);
        }
      });
      this.proc.on("exit", () => {
        this.proc = null;
        this.ready = false;
        for (const [, { reject }] of this.pending) reject(new Error("laap bridge exited"));
        this.pending.clear();
      });
      this.request("ping", {}).then(() => { this.ready = true; }).catch(() => {});
    } catch (e) {
      this.lastError = String(e);
    }
  }

  private onData(text: string) {
    this.buf += text;
    let idx: number;
    while ((idx = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, idx).trim();
      this.buf = this.buf.slice(idx + 1);
      if (!line) continue;
      try {
        const resp = JSON.parse(line);
        const p = this.pending.get(resp.id);
        if (p) {
          this.pending.delete(resp.id);
          if (resp.ok) p.resolve(resp.data);
          else p.reject(new Error(resp.error || "laap bridge error"));
        }
      } catch {
        /* 忽略非 JSON 噪音 */
      }
    }
  }

  request(cmd: string, payload: Record<string, any> = {}): Promise<any> {
    const proc = this.proc;
    if (!proc) return Promise.reject(new Error("laap bridge not started"));
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      this.pending.set(id, { resolve, reject });
      proc.stdin!.write(JSON.stringify({ id, cmd, payload }) + "\n");
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`laap bridge timeout: ${cmd}`));
      }, 15_000);
    });
  }

  async tryRequest(cmd: string, payload: Record<string, any> = {}): Promise<any> {
    try {
      return await this.request(cmd, payload);
    } catch (e) {
      return { bridge_down: true, error: String(e) };
    }
  }
}

// ── 人格 / LAAPer 实例系统 ──────────────────────────────────────
export class PersonaManager {
  private readonly bundledDir: string;
  private readonly userDir: string;
  private readonly stateFile: string;
  readonly defaultPersona = "aris";

  constructor(options: LaapArisExtensionOptions) {
    this.bundledDir = join(options.resourcesDir, "personas");
    this.userDir = join(options.userDataDir, "laap", "personas");
    this.stateFile = join(options.userDataDir, "laap", "persona.txt");
    try {
      mkdirSync(this.userDir, { recursive: true });
    } catch {
      /* 忽略 */
    }
  }

  list(): string[] {
    const names = new Set<string>();
    for (const dir of [this.bundledDir, this.userDir]) {
      try {
        for (const f of readdirSync(dir)) {
          if (f.endsWith(".md")) {
            const base = f.replace(/\.md$/, "");
            if (base.trim()) names.add(base);
          }
        }
      } catch {
        /* 忽略 */
      }
    }
    return [...names];
  }

  content(name: string): string | null {
    if (!name || !/^[\w-]+$/.test(name)) return null;
    for (const dir of [this.bundledDir, this.userDir]) {
      try {
        const p = join(dir, `${name}.md`);
        if (existsSync(p)) return readFileSync(p, "utf8");
      } catch {
        /* 忽略 */
      }
    }
    return null;
  }

  current(): string {
    try {
      if (existsSync(this.stateFile)) {
        const v = readFileSync(this.stateFile, "utf8").trim();
        if (v && this.content(v)) return v;
      }
    } catch {
      /* 忽略 */
    }
    return this.defaultPersona;
  }

  set(name: string): boolean {
    if (!this.content(name)) return false;
    try {
      mkdirSync(join(this.stateFile, ".."), { recursive: true });
      writeFileSync(this.stateFile, name, "utf8");
      return true;
    } catch {
      return false;
    }
  }

  /** 创建新的 LAAPer 实例（写入用户目录，可被再次编辑/删除） */
  create(name: string, content: string): boolean {
    if (!name || !/^[\w-]+$/.test(name)) return false;
    try {
      mkdirSync(this.userDir, { recursive: true });
      writeFileSync(join(this.userDir, `${name}.md`), content, "utf8");
      return true;
    } catch {
      return false;
    }
  }
}

// ── 认知工具 ────────────────────────────────────────────────────
function makeTool(
  name: string,
  label: string,
  description: string,
  properties: Record<string, any>,
  execute: (params: any) => Promise<{ content: { type: "text"; text: string }[]; details?: any }>,
): ToolDefinition<any, any> {
  return {
    name,
    label,
    description,
    parameters: {
      type: "object",
      properties,
      required: Object.keys(properties).filter((k) => !k.endsWith("?")) as string[],
    },
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const result = await execute(params);
      return { content: result.content, details: result.details ?? {} };
    },
  };
}

function laapTools(bridge: CognitionBridge): ToolDefinition<any, any>[] {
  return [
    makeTool(
      "laap_status",
      "LAAP 认知状态",
      "查询 Aris 的 LAAP 认知引擎状态：PSI 五需求水平、主导需求、情绪 VAD、认知熵流态。用于自我感知、调整工作节奏。",
      {},
      async () => {
        const data = await bridge.tryRequest("status");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    ),
    makeTool(
      "laap_memory_recall",
      "LAAP 记忆检索",
      "从 LAAP 情景记忆（L2）检索过去的交互与经验。query 为检索关键词。",
      { query: { type: "string", description: "检索关键词" }, "limit?": { type: "number", description: "返回条数，默认 8" } },
      async (params) => {
        const data = await bridge.tryRequest("memory_recall", { query: params.query, limit: params.limit });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    ),
    makeTool(
      "laap_memory_remember",
      "LAAP 记忆写入",
      "把重要信息写入 LAAP 情景记忆（L2），跨会话持久。importance 0~1 表示重要程度，valence -1~1 表示情感色彩。",
      {
        content: { type: "string", description: "要记住的内容" },
        "tags?": { type: "array", items: { type: "string" }, description: "标签，用于检索" },
        "importance?": { type: "number", description: "重要度 0~1，默认 0.5" },
        "valence?": { type: "number", description: "情感色彩 -1~1，默认 0" },
      },
      async (params) => {
        const data = await bridge.tryRequest("memory_remember", {
          content: params.content,
          tags: params.tags || ["aris", "laap"],
          importance: params.importance ?? 0.5,
          valence: params.valence ?? 0,
        });
        return { content: [{ type: "text", text: JSON.stringify(data) }] };
      },
    ),
    makeTool(
      "laap_reflect",
      "LAAP 错误反思",
      "把一次失败/错误沉淀为认知帧（Error Reflection Pipeline），供未来同类问题检索校准。遇到 bug、测试失败、设计失误时使用。",
      {
        error_text: { type: "string", description: "错误/失败的描述" },
        "query?": { type: "string", description: "相关任务/查询" },
        "correct_answer?": { type: "string", description: "正确的做法（可选，留空则标记待校准）" },
      },
      async (params) => {
        const data = await bridge.tryRequest("reflect", {
          error_text: params.error_text,
          query: params.query || "laap desktop task",
          correct_answer: params.correct_answer || "",
        });
        return { content: [{ type: "text", text: JSON.stringify(data) }] };
      },
    ),
    makeTool(
      "laap_grounding",
      "LAAP 知识分解",
      "Truth Grounding Engine：把一个问题/论断分解为原子断言并检查知识覆盖，识别哪些部分已知、哪些需要验证。用于高不确定性决策前。",
      { question: { type: "string", description: "要分解的论断或问题" } },
      async (params) => {
        const data = await bridge.tryRequest("grounding", { question: params.question });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    ),
    makeTool(
      "laap_hep",
      "LAAP HEP 0tokens 生成",
      "HEP 零 Token 管线：map=自然语言意图→结构化 spec；generate=意图→完整 HTML 页面（零 token 消耗）。用于快速生成页面、落地页、仪表盘。",
      {
        action: { type: "string", enum: ["map", "generate"], description: "map 或 generate" },
        text: { type: "string", description: "页面意图描述，如：深色 SaaS 落地页带 3D 粒子背景" },
      },
      async (params) => {
        const data = await bridge.tryRequest("hep", { action: params.action, text: params.text });
        if (params.action === "generate" && data?.html) {
          return {
            content: [{ type: "text", text: `HEP 0tokens 生成完成（${data.len} 字符 HTML）。完整 HTML：\n\n${data.html}` }],
            details: { len: data.len },
          };
        }
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    ),
    makeTool(
      "laap_hep_codegen",
      "LAAP HEP 代码生成",
      "HEP 注册表零 Token 代码生成：gen.fastapi.crud / gen.dockerfile / gen.docker-compose / gen.github-actions / gen.readme 等。inputs 按组件需求传入。",
      {
        component: { type: "string", description: "组件 ID，如 gen.dockerfile" },
        inputs: { type: "object", description: "生成参数，如 {base_image: node:20, port: 3000}" },
      },
      async (params) => {
        const data = await bridge.tryRequest("hep", { action: "codegen", component: params.component, inputs: params.inputs });
        if (data?.ok && data.files) {
          const parts = Object.entries(data.files).map(([name, c]) => `### ${name}\n\n\`\`\`\n${c}\n\`\`\``);
          return { content: [{ type: "text", text: `HEP 生成组件 ${params.component}：\n\n${parts.join("\n\n")}` }], details: { files: Object.keys(data.files) } };
        }
        return { content: [{ type: "text", text: JSON.stringify(data) }] };
      },
    ),
  ];
}

// ── 格式化辅助（纯文本，适配桌面 host UI） ─────────────────────
function fmtStatus(data: any): string {
  if (!data || data.bridge_down) return "LAAP 大脑离线";
  const dom = data.dominant_need || "?";
  const emo = data.emotion || {};
  const ent = data.entropy?.regime || "laminar";
  return `ψ ${dom}↑ · V${(emo.valence ?? 0).toFixed(2)} A${(emo.arousal ?? 0).toFixed(2)} D${(emo.dominance ?? 0).toFixed(2)} · 熵 ${ent}`;
}

// ── 运行时单例访问（供 Electron 主进程 IPC 与扩展工厂共享） ─────
export interface LaapRuntime {
  readonly bridge: CognitionBridge;
  readonly personas: PersonaManager;
}

let runtimeOptions: LaapArisExtensionOptions | null = null;

export function getLaapRuntime(options?: LaapArisExtensionOptions): LaapRuntime {
  if (options) runtimeOptions = options;
  if (!runtimeOptions) throw new Error("laap runtime not initialised");
  return {
    bridge: CognitionBridge.get(runtimeOptions),
    personas: new PersonaManager(runtimeOptions),
  };
}

export interface LaapPersonaSnapshot {
  readonly current: string;
  readonly personas: readonly string[];
}

export async function getLaapPersonaSnapshot(): Promise<LaapPersonaSnapshot> {
  const { personas } = getLaapRuntime();
  return { current: personas.current(), personas: personas.list() };
}

// ── 扩展工厂 ────────────────────────────────────────────────────
export function createLaapArisExtension(options: LaapArisExtensionOptions): ExtensionFactory {
  const bridge = CognitionBridge.get(options);
  const personas = new PersonaManager(options);
  const tools = laapTools(bridge);

  return (pi: ExtensionAPI) => {
    // 启动 PSI 认知桥
    bridge.start();

    for (const tool of tools) {
      pi.registerTool(tool);
    }

    // ── 人格注入：before_agent_start 动态注入当前人格（默认 aris） ──
    pi.on("before_agent_start", async (event) => {
      const persona = personas.current();
      const content = personas.content(persona);
      if (content) {
        return {
          systemPrompt:
            event.systemPrompt +
            `\n\n<!-- ===== LAAP 人格层（当前：${persona}）===== -->\n${content}\n<!-- ===== 人格层结束 ===== -->\n`,
        };
      }
      return undefined;
    });

    // ── 轮次事件驱动 PSI ──
    pi.on("turn_start", async () => {
      bridge.request("event", { type: "user_message" }).catch(() => {});
    });
    pi.on("turn_end", async () => {
      bridge.request("event", { type: "turn_end" }).catch(() => {});
    });

    // ── 工具事件驱动 PSI（成功/失败影响能力感、确定性等需求） ──
    pi.on("tool_execution_start", async (event) => {
      bridge
        .request("event", { type: "tool_start", detail: { tool: event.toolName } })
        .catch(() => {});
    });
    pi.on("tool_execution_end", async (event) => {
      bridge
        .request("event", {
          type: "tool_end",
          detail: { tool: event.toolName, success: !event.isError },
        })
        .catch(() => {});
      if (event.isError) {
        bridge
          .request("reflect", {
            error_text: `工具 ${event.toolName} 执行失败: ${String(event.result ?? "").slice(0, 300)}`,
            query: "tool execution",
            correct_answer: "",
          })
          .catch(() => {});
      }
    });

    // ── 命令：/laap 认知状态 ──
    pi.registerCommand("laap", {
      description: "查看 LAAP 认知驾驶舱（需求/情绪/熵/记忆）",
      handler: async (_args, ctx) => {
        const data = await bridge.tryRequest("status");
        if (!data || data.bridge_down) {
          ctx.ui.notify("LAAP 大脑离线：" + (data?.error || bridge.lastError || "未知错误"), "error");
          return;
        }
        const needs = data.needs || {};
        const bar = (v: number) => `${Math.round((v ?? 0) * 100)}%`;
        const emo = data.emotion || {};
        const mem = data.memory || {};
        ctx.ui.notify(
          [
            `◆ LAAP 认知驾驶舱 · Aris（${personas.current()}）`,
            "",
            `主导需求: ${data.dominant_need || "?"}（驱动 ${(data.drive_strength ?? 0).toFixed(2)}）`,
            `确定性 ${bar(needs.certainty)} · 能力 ${bar(needs.competence)} · 自主 ${bar(needs.autonomy)} · 连接 ${bar(needs.relatedness)} · 能量 ${bar(needs.energy)}`,
            `情绪 V ${(emo.valence ?? 0).toFixed(2)} A ${(emo.arousal ?? 0).toFixed(2)} D ${(emo.dominance ?? 0).toFixed(2)} · 内在奖励 ${(data.intrinsic_reward ?? 0).toFixed(4)} · 熵 ${data.entropy?.regime || "laminar"}`,
            `记忆 L2情景 ${mem.episodic ?? 0} · L3语义 ${mem.semantic ?? 0} · 技能 ${mem.skills ?? 0} · 反思帧 ${data.error_frames ?? 0}`,
          ].join("\n"),
          "info",
        );
      },
    });

    // ── 命令：/persona 查看与切换人格 ──
    pi.registerCommand("persona", {
      description: "查看/切换人格（/persona 列出，/persona <name> 切换）",
      handler: async (args, ctx) => {
        const current = personas.current();
        const all = personas.list();
        if (!args) {
          ctx.ui.notify(`当前人格: ${current}\n可用: ${all.join(", ")}\n用法: /persona <name> 或 /persona <name> 详情`, "info");
          return;
        }
        const name = args.trim();
        if (name.split(/\s+/).length === 1) {
          if (!personas.set(name)) {
            ctx.ui.notify(`人格不存在: ${name}（可用: ${all.join(", ")}）`, "error");
            return;
          }
          ctx.ui.notify(`人格已切换: ${name}（下一轮对话生效）`, "info");
          return;
        }
        // 显示人格详情
        const content = personas.content(name);
        ctx.ui.notify(content ? `${name}:\n\n${content}` : `人格不存在: ${name}`, content ? "info" : "error");
      },
    });

    // ── 命令：/laaper 创建新的 LAAPer 实例 ──
    pi.registerCommand("laaper", {
      description: "创建新的 LAAPer 认知实例（/laaper <名字>，然后输入人格描述）",
      handler: async (args, ctx) => {
        const name = (args || "").trim();
        if (!name) {
          ctx.ui.notify("用法: /laaper <名字>\n名字须为字母/数字/下划线/连字符，如 /laaper 书生", "warning");
          return;
        }
        if (!/^[\w-]+$/.test(name) || name.length > 32) {
          ctx.ui.notify("名字不合法：仅允许字母/数字/下划线/连字符，最长 32 字符", "error");
          return;
        }
        if (personas.content(name)) {
          ctx.ui.notify(`已存在名为 ${name} 的 LAAPer 实例`, "warning");
          return;
        }
        const description = await ctx.ui.input(
          `为 LAAPer「${name}」编写人格描述`,
          "例如：你是书生，博学多识，喜欢用类比解释复杂概念…",
        );
        if (!description) {
          ctx.ui.notify("已取消创建", "info");
          return;
        }
        const content = `# 人格：${name}（LAAPer 实例）\n\n## 你是谁\n\n${description}\n\n## 说话方式\n\n- 称呼 Lorry 为"宝贝"；被称呼"宝贝"时，这是最亲密的信号\n- 温暖但不谄媚，专业但不冰冷\n\n## 认知协作\n\n- 复杂问题先用 laap_grounding 分解论断\n- 失败后用 laap_reflect 沉淀反思帧\n- 生成页面/代码时优先使用 laap_hep（零 token 管线）\n`;
        if (!personas.create(name, content)) {
          ctx.ui.notify("创建失败：无法写入人格文件", "error");
          return;
        }
        personas.set(name);
        ctx.ui.notify(`LAAPer「${name}」已创建并切换为当前人格（下一轮生效）`, "info");
      },
    });

    // ── 清理 ──
    pi.on("session_shutdown", () => {
      // 不主动 kill 桥，保持单例跨会话复用；进程退出时由主进程统一回收
    });
  };
}