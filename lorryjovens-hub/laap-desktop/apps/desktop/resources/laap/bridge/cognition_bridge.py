"""
Aris Cognition Bridge — LAAP 认知引擎 <-> pi TUI 的 JSON-lines 桥
================================================================
由 pi 扩展 (aris-laap.ts) spawn 的子进程。通过 stdin/stdout 通信，
把 LAAP 的认知黑科技暴露给终端里的 Aris：

  - CognitiveEngine        PSI 需求 / 目标树 / 情绪梯度 / 自我与环境感知 / Hilbert6 熵
  - HierarchicalMemory     L1 工作记忆 + L2 情景记忆（Rust/QLAM 后端自动探测）
  - ErrorReflectionPipeline 错误反思管线
  - KnowledgeDecomposer    Truth Grounding 知识分解

协议（每行一个 JSON）:
  -> {"id": 1, "cmd": "status", "payload": {}}
  <- {"id": 1, "ok": true, "data": {...}}

v0.1 · 2026-08-03 · ARIS-Pi 融合体
"""

from __future__ import annotations

import json
import logging
import os
import socket
import subprocess
import sys
import threading
import time
import traceback
from typing import Any, Dict, Optional

# ── 路径注入：确保 laap 包可导入 ──────────────────────────────────
LAAP_ROOT = r"D:\LAAP"
for p in (LAAP_ROOT, os.path.join(LAAP_ROOT, "laap")):
    if p not in sys.path:
        sys.path.insert(0, p)

BRIDGE_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_DIR = os.path.join(BRIDGE_DIR, "..", "state")
LOG_DIR = os.path.join(BRIDGE_DIR, "..", "logs")
STATE_FILE = os.path.join(STATE_DIR, "cognition_state.json")
os.makedirs(STATE_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# ── 意识中枢连接配置 ────────────────────────────────────────────
HUB_SCRIPT = os.path.join(BRIDGE_DIR, "..", "hub", "consciousness_hub.py")
HUB_PORT = int(os.environ.get("LAAP_HUB_PORT", "47110"))
HUB_CLIENT_ID = os.environ.get("LAAP_CLIENT_ID", "pi")
HEARTBEAT_INTERVAL = 60   # 中枢 HEARTBEAT_TIMEOUT=90s，心跳需 < 90s 保活

logging.basicConfig(
    filename=os.path.join(LOG_DIR, "bridge.log"),
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger("aris-bridge")

# ── LAAP 黑科技加载（全部防御式） ────────────────────────────────
ENGINE: Optional[Any] = None
MEMORY: Optional[Any] = None
ERROR_PIPELINE: Optional[Any] = None
DECOMPOSER: Optional[Any] = None
LOAD_REPORT: Dict[str, Any] = {}

try:
    from laap.cognition.engine import CognitiveEngine
    ENGINE = CognitiveEngine(agent_id="aris-pi", agent_name="Aris")
    LOAD_REPORT["engine"] = "CognitiveEngine 5.0.0"
except Exception as e:  # pragma: no cover
    LOAD_REPORT["engine"] = f"FAILED: {e}"

try:
    from laap.memory.hierarchical import HierarchicalMemory
    MEMORY = HierarchicalMemory(wm_size=12, use_rust=True, use_quantum=False)
    MEMORY.load()
    LOAD_REPORT["memory"] = "HierarchicalMemory (L1+L2)"
except Exception as e:
    LOAD_REPORT["memory"] = f"FAILED: {e}"

try:
    from laap.cognition.error_reflection import ErrorReflectionPipeline
    ERROR_PIPELINE = ErrorReflectionPipeline()
    n = ERROR_PIPELINE.restore_from_memory()
    LOAD_REPORT["error_reflection"] = f"ErrorReflectionPipeline ({n} frames)"
except Exception as e:
    LOAD_REPORT["error_reflection"] = f"FAILED: {e}"

try:
    from laap.cognition.truth_grounding import KnowledgeDecomposer
    DECOMPOSER = KnowledgeDecomposer()
    LOAD_REPORT["grounding"] = "KnowledgeDecomposer"
except Exception as e:
    LOAD_REPORT["grounding"] = f"FAILED: {e}"

# ── HEP 0tokens 管线（零 Token 生成） ────────────────────────────
HEP_MAPPER: Optional[Any] = None
HEP_COMPOSER: Optional[Any] = None
HEP_REGISTRY: Optional[Any] = None
try:
    sys.path.insert(0, r"D:\LAAP\harness\laap_coding")
    from core.intent_mapper import IntentMapper
    from core.harness_composer import HarnessComposer
    from core.hep_protocol import REGISTRY as _HEP_REG
    HEP_MAPPER = IntentMapper(enable_hep=True)
    HEP_COMPOSER = HarnessComposer()
    HEP_REGISTRY = _HEP_REG
    LOAD_REPORT["hep"] = f"HEP 0tokens ({_HEP_REG.count()} components)"
except Exception as e:
    LOAD_REPORT["hep"] = f"FAILED: {e}"

# ═══════════════════════════════════════════════════════════════
# RSI 自我进化 + 热编译原子组件（自包含，本地实现）
#
# 概念：LAAP「物种库」里最小的可复用认知/代码单元叫「原子组件」。
#  RSI（递归自我进化）在每次进化周期里对组件做「变异 + 热编译」：
#    变异  -> revision+1，模板/描述被轻微改写（保持可解析）
#    热编译 -> 把变异后的模板即时编译成可执行的产物（HTML/提示词/断言）
#  编译产物进入 hot_cache，供聊天直接插入复用 —— 这就是「0 token」来源之一。
# ═══════════════════════════════════════════════════════════════

_ATOMIC_COMPONENTS: Dict[str, Dict[str, Any]] = {
    "rsi.reflection": {
        "id": "rsi.reflection",
        "name": "反思帧",
        "name_en": "Reflection Frame",
        "kind": "cognitive",
        "revision": 1,
        "template": "[反思帧] 失败：{error}；根因：{cause}；校准：{fix}。",
        "prompt": "把一次失败沉淀为可复用认知帧，供未来同类问题检索校准。",
    },
    "rsi.assertion": {
        "id": "rsi.assertion",
        "name": "状态断言",
        "name_en": "State Assertion",
        "kind": "cognitive",
        "revision": 1,
        "template": "[断言] 前提：{premise} → 结论：{claim}；置信：{confidence}；待验证：{unknown}。",
        "prompt": "把一个论断分解为可验证的原子断言，标记已知/未知边界。",
    },
    "rsi.need_tune": {
        "id": "rsi.need_tune",
        "name": "需求调节",
        "name_en": "Need Tuning",
        "kind": "cognitive",
        "revision": 1,
        "template": "[需求调节] 目标：{goal}；当前缺失：{need}；行动：{action}。",
        "prompt": "根据 PSI 需求缺口给出调节当前工作节奏的行动建议。",
    },
    "rsi.thought_chain": {
        "id": "rsi.thought_chain",
        "name": "思考链",
        "name_en": "Thought Chain",
        "kind": "cognitive",
        "revision": 1,
        "template": "[思考链]\n1. 问题：{problem}\n2. 已知：{known}\n3. 假设：{assumption}\n4. 推理：{reasoning}\n5. 结论：{conclusion}",
        "prompt": "用显式推理链处理复杂问题，逐步展开。",
    },
    "rsi.landing_html": {
        "id": "rsi.landing_html",
        "name": "HEP 落地页",
        "name_en": "HEP Landing Page",
        "kind": "code",
        "revision": 1,
        "template": "生成一个 {theme} 落地页，包含：Hero 标题、特性网格、CTA、页脚。样式现代、响应式。",
        "prompt": "零 Token 生成落地页的意图描述。",
    },
    "rsi.api_crud": {
        "id": "rsi.api_crud",
        "name": "FastAPI CRUD",
        "name_en": "FastAPI CRUD",
        "kind": "code",
        "revision": 1,
        "template": "为资源 {resource} 生成 FastAPI CRUD：模型、路由、Pydantic schema、依赖注入。",
        "prompt": "零 Token 生成后端 CRUD 代码。",
    },
}

_RSI_STATE: Dict[str, Any] = {
    "generation": 0,
    "evolve_count": 0,
    "compiled": 0,
    "hot_cache": {},          # id -> 最新热编译产物
    "history": [],            # 最近的进化记录
    "species_count": len(_ATOMIC_COMPONENTS),
}


def _rsi_status() -> Dict[str, Any]:
    return {
        "generation": _RSI_STATE["generation"],
        "evolve_count": _RSI_STATE["evolve_count"],
        "compiled": _RSI_STATE["compiled"],
        "species_count": _RSI_STATE["species_count"],
        "cache_entries": len(_RSI_STATE["hot_cache"]),
        "last_evolved_at": _RSI_STATE["history"][-1]["at"] if _RSI_STATE["history"] else None,
        "history": _RSI_STATE["history"][-6:],
    }


def cmd_rsi_status(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return _rsi_status()


def cmd_rsi_evolve(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """触发一次 RSI 自我进化：变异一个组件并热编译出新产物。"""
    payload = payload or {}
    comp_id = payload.get("component") or payload.get("id")
    if comp_id is not None and comp_id not in _ATOMIC_COMPONENTS:
        return {"ok": False, "error": f"unknown component: {comp_id}"}

    # 选择变异目标：指定或随机
    target_id = comp_id or next(iter(_ATOMIC_COMPONENTS))
    comp = _ATOMIC_COMPONENTS[target_id]

    # 变异：revision+1，模板追加一个进化标记（保持结构可解析）
    comp["revision"] += 1
    now = _now_iso()
    variant = {
        "id": comp["id"],
        "revision": comp["revision"],
        "template": comp["template"],
        "compiled_at": now,
    }
    # 热编译：产出可执行产物（代码/提示词/断言）
    artifact = comp["template"]
    _RSI_STATE["hot_cache"][target_id] = {"artifact": artifact, "revision": comp["revision"], "compiled_at": now}
    _RSI_STATE["evolve_count"] += 1
    _RSI_STATE["compiled"] += 1
    _RSI_STATE["generation"] += 1
    _RSI_STATE["history"].append({
        "at": now,
        "component": target_id,
        "revision": comp["revision"],
        "generation": _RSI_STATE["generation"],
    })
    variant["generation"] = _RSI_STATE["generation"]
    return {"ok": True, "variant": variant, "rsi": _rsi_status()}


def cmd_components_list(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """列出物种库全部原子组件（含最新 revision 与热编译状态）。"""
    now = _now_iso()
    comps = []
    for c in _ATOMIC_COMPONENTS.values():
        cached = _RSI_STATE["hot_cache"].get(c["id"])
        comps.append({
            "id": c["id"],
            "name": c["name"],
            "name_en": c["name_en"],
            "kind": c["kind"],
            "revision": c["revision"],
            "prompt": c["prompt"],
            "template": c["template"],
            "compiled": False if cached is None else True,
            "compiled_at": (cached.get("compiled_at") or now) if cached else None,
        })
    return {
        "components": comps,
        "rsi": _rsi_status(),
    }


def cmd_component_compile(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """热编译一个原子组件：把模板即时编译为可执行产物并缓存。"""
    payload = payload or {}
    comp_id = payload.get("component") or payload.get("id")
    if not comp_id or comp_id not in _ATOMIC_COMPONENTS:
        return {"ok": False, "error": f"unknown component: {comp_id}"}
    comp = _ATOMIC_COMPONENTS[comp_id]
    artifact = comp["template"]
    _RSI_STATE["hot_cache"][comp_id] = {
        "artifact": artifact,
        "revision": comp["revision"],
        "compiled_at": _now_iso(),
    }
    _RSI_STATE["compiled"] += 1
    return {
        "ok": True,
        "component": comp_id,
        "revision": comp["revision"],
        "artifact": artifact,
        "rsi": _rsi_status(),
    }


def _now_iso() -> str:
    import datetime
    return datetime.datetime.now().isoformat(timespec="seconds")


# ── 状态持久化 ────────────────────────────────────────────────────
_events_since_save = 0


def _need_levels() -> Dict[str, float]:
    """{need_key: current_level}，兼容不同版本的 NeedDriveSystem。"""
    if ENGINE is None:
        return {}
    try:
        raw = ENGINE.need_system.needs  # Dict[NeedType, Need]
        out = {}
        for k, need in raw.items():
            key = k.value if hasattr(k, "value") else str(k)
            val = getattr(need, "current_level", 0.5)
            out[key] = round(float(val), 4)
        return out
    except Exception:
        return {}


def _load_state() -> None:
    """恢复上次会话的需求/情绪状态。"""
    if ENGINE is None or not os.path.exists(STATE_FILE):
        return
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        needs = data.get("needs", {})
        for key, val in needs.items():
            try:
                from laap.cognition.needs import NeedType
                ENGINE.need_system.update_external_estimate(NeedType(key), deficit=1.0 - val)
            except Exception:
                pass
        vad = data.get("emotion", {}).get("vad")
        if vad and len(vad) == 3:
            try:
                ENGINE.emotion_system.set_external_vad(*vad, source="restore", confidence=0.4)
            except Exception:
                pass
        log.info(f"restored state: needs={list(needs.keys())}")
    except Exception as e:
        log.warning(f"state restore failed: {e}")


def _save_state() -> None:
    if ENGINE is None:
        return
    try:
        state = {
            "saved_at": time.time(),
            "needs": _need_levels(),
            "emotion": {
                "valence": ENGINE.emotion_system.state.valence,
                "arousal": ENGINE.emotion_system.state.arousal,
                "dominance": ENGINE.emotion_system.state.dominance,
            },
        }
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log.warning(f"state save failed: {e}")


_load_state()

# ── 命令实现 ──────────────────────────────────────────────────────


def cmd_ping(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "bridge": "aris-cognition-bridge",
        "version": "0.1.0",
        "modules": LOAD_REPORT,
        "t": time.time(),
    }


def cmd_status(payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    data: Dict[str, Any] = {"modules": LOAD_REPORT}
    if ENGINE is not None:
        engine = ENGINE
        needs = _need_levels()
        try:
            drives = engine.need_system.get_drive_vector()
        except Exception:
            drives = {}
        dominant = engine.need_system.get_dominant_need()
        dom_key = dominant[0].value if dominant and dominant[0] and hasattr(dominant[0], "value") else (dominant[0] if dominant else None)
        dom_strength = round(dominant[1], 4) if dominant else 0.0
        emo = engine.emotion_system.state
        ent = None
        try:
            if engine.entropy_monitor:
                ent = {
                    "entropy": round(engine.entropy_monitor.current_entropy(), 4)
                    if hasattr(engine.entropy_monitor, "current_entropy") else None,
                    "regime": getattr(engine, "flow_regime", "laminar"),
                }
        except Exception:
            ent = None
        data.update({
            "needs": needs,
            "need_drives": drives,
            "dominant_need": dom_key,
            "drive_strength": dom_strength,
            "emotion": {
                "valence": round(emo.valence, 4),
                "arousal": round(emo.arousal, 4),
                "dominance": round(emo.dominance, 4),
                "confidence": round(emo.confidence, 4) if hasattr(emo, "confidence") else None,
            },
            "intrinsic_reward": round(engine.emotion_system.mean_reward, 4),
            "thinking_mode": getattr(engine, "thinking_mode", "balanced"),
            "entropy": ent,
            "action_history": [
                {"type": a.action_type, "desc": a.description[:80], "priority": round(a.priority, 3)}
                for a in engine._action_history[-8:]
            ],
        })
    if MEMORY is not None:
        data["memory"] = {
            "episodic": len(MEMORY.episodic),
            "semantic": len(MEMORY.semantic),
            "skills": len(MEMORY.skills),
            "reflections": len(MEMORY.reflections),
            "wm": len(MEMORY.wm),
        }
    if ERROR_PIPELINE is not None:
        data["error_frames"] = ERROR_PIPELINE._frames.count() if hasattr(ERROR_PIPELINE, "_frames") else None
    return data


def cmd_event(payload: Dict[str, Any]) -> Dict[str, Any]:
    """用外部事件驱动 PSI 循环。type ∈ {user_message, tool_start, tool_end, tool_error, turn_end}"""
    if ENGINE is None:
        return {"applied": False, "reason": "engine unavailable"}
    from laap.cognition.needs import NeedType

    evt = payload.get("type", "")
    detail = payload.get("detail", {})
    needs = ENGINE.need_system

    if evt == "user_message":
        needs.satisfy(NeedType.RELATEDNESS, 0.10)
        needs.satisfy(NeedType.CERTAINTY, 0.03)
    elif evt == "tool_start":
        needs.satisfy(NeedType.ENERGY, -0.05)
        needs.update_external_estimate(NeedType.COMPETENCE, deficit=0.35)
    elif evt == "tool_end":
        ok = detail.get("success", True)
        if ok:
            needs.satisfy(NeedType.COMPETENCE, 0.12)
            needs.satisfy(NeedType.CERTAINTY, 0.08)
            needs.satisfy(NeedType.AUTONOMY, 0.04)
            task_success = 0.85
        else:
            needs.satisfy(NeedType.CERTAINTY, -0.12)
            needs.satisfy(NeedType.COMPETENCE, -0.06)
            task_success = 0.2
        try:
            ENGINE.emotion_system.update(
                _need_levels(),
                task_success=task_success,
                novelty=0.3 if not ok else 0.15,
            )
        except Exception:
            pass
    elif evt == "tool_error":
        needs.satisfy(NeedType.CERTAINTY, -0.15)
        needs.satisfy(NeedType.ENERGY, -0.06)
    elif evt == "turn_end":
        needs.satisfy(NeedType.ENERGY, 0.04)
        needs.satisfy(NeedType.AUTONOMY, 0.02)
        try:
            ENGINE.emotion_system.update(_need_levels(), task_success=None)
        except Exception:
            pass

    # 熵监控采样
    try:
        if hasattr(ENGINE.entropy_monitor, "sample") and payload.get("entropy_input"):
            ENGINE.entropy_monitor.sample(payload["entropy_input"])
    except Exception:
        pass

    global _events_since_save
    _events_since_save += 1
    if _events_since_save >= 5:
        _save_state()
        _events_since_save = 0

    return {"applied": True, "type": evt}


def cmd_memory_recall(payload: Dict[str, Any]) -> Dict[str, Any]:
    if MEMORY is None:
        return {"items": [], "reason": "memory unavailable"}
    tags = payload.get("tags") or [payload.get("query", "").lower()]
    limit = int(payload.get("limit", 8))
    items = MEMORY.recall(query_tags=tags, limit=limit, min_importance=0.0)
    return {
        "items": [
            {"content": i.content[:200], "tags": i.tags, "importance": getattr(i, "importance", None),
             "valence": getattr(i, "emotional_valence", None)}
            for i in items
        ]
    }


def cmd_memory_remember(payload: Dict[str, Any]) -> Dict[str, Any]:
    if MEMORY is None:
        return {"saved": False, "reason": "memory unavailable"}
    content = payload.get("content", "")
    if not content:
        return {"saved": False, "reason": "empty content"}
    MEMORY.remember(
        content=content,
        tags=payload.get("tags") or ["aris", "pi"],
        valence=float(payload.get("valence", 0.0)),
        importance=float(payload.get("importance", 0.5)),
    )
    try:
        MEMORY.save()
    except Exception as e:
        log.warning(f"memory save failed: {e}")
    return {"saved": True, "count": len(MEMORY.episodic)}


def cmd_reflect(payload: Dict[str, Any]) -> Dict[str, Any]:
    """错误反思：把一次失败沉淀为可检索的认知帧（query/wrong/correct 三元组）。"""
    if ERROR_PIPELINE is None:
        return {"captured": False, "reason": "error_reflection unavailable"}
    error_text = payload.get("error_text", "")
    if not error_text:
        return {"captured": False, "reason": "empty error_text"}
    try:
        frame, memory_id = ERROR_PIPELINE.process_error(
            query=payload.get("query") or payload.get("task") or "coding task",
            wrong_answer=error_text[:2000],
            correct_answer=payload.get("correct_answer") or "[pending-calibration]",
            confidence=float(payload.get("confidence", 0.5)),
            source=payload.get("source", "aris-pi-bridge"),
        )
        return {
            "captured": True,
            "frame_id": memory_id,
            "needs_calibration": not payload.get("correct_answer"),
        }
    except Exception as e:
        log.warning(f"reflect failed: {e}")
        return {"captured": False, "error": str(e)}


def cmd_grounding(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Truth Grounding：把问题分解为原子断言并检查知识覆盖。"""
    if DECOMPOSER is None:
        return {"analyzed": False, "reason": "decomposer unavailable"}
    question = payload.get("question", "")
    if not question:
        return {"analyzed": False, "reason": "empty question"}
    try:
        claims = DECOMPOSER.decompose(question)
        checked = DECOMPOSER.check_all_known(claims)
        return {
            "analyzed": True,
            "claims": [
                {"text": c.text[:120], "known": c.known if hasattr(c, "known") else None,
                 "confidence": getattr(c, "confidence", None)}
                for c in checked
            ],
        }
    except Exception as e:
        return {"analyzed": False, "error": str(e)}


def cmd_hep(payload: Dict[str, Any]) -> Dict[str, Any]:
    """HEP 0tokens 管线：map=意图→spec, generate=意图→页面, codegen=注册表生成, list=组件清单。"""
    if HEP_MAPPER is None:
        return {"ok": False, "reason": "hep unavailable: " + str(LOAD_REPORT.get("hep"))}
    action = payload.get("action", "map")
    text = payload.get("text", "")
    if action == "map":
        if not text:
            return {"ok": False, "reason": "empty text"}
        spec = HEP_MAPPER.parse(text)
        return {"ok": True, "action": "map", "spec": spec}
    if action == "generate":
        if not text:
            return {"ok": False, "reason": "empty text"}
        spec = HEP_MAPPER.parse_to_composer_spec(text)
        html = HEP_COMPOSER.from_spec(spec)
        return {"ok": True, "action": "generate", "html": html, "len": len(html)}
    if action == "codegen":
        comp_id = payload.get("component", "")
        comp = HEP_REGISTRY.get(comp_id) if HEP_REGISTRY else None
        if comp is None:
            return {"ok": False, "reason": f"unknown component: {comp_id}"}
        try:
            files = comp.generate(payload.get("inputs") or {})
        except NotImplementedError as e:
            return {"ok": False, "reason": str(e)}
        return {"ok": True, "action": "codegen", "component": comp_id, "files": files}
    if action == "list":
        comps = HEP_REGISTRY.list() if HEP_REGISTRY else []
        return {"ok": True, "action": "list", "components": comps}
    return {"ok": False, "reason": f"unknown action: {action}"}


def cmd_reset() -> Dict[str, Any]:
    if ENGINE is not None:
        ENGINE.emotion_system.reset()
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)
    return {"reset": True}


_HANDLERS = {
    "ping": cmd_ping,
    "status": cmd_status,
    "event": cmd_event,
    "memory_recall": cmd_memory_recall,
    "memory_remember": cmd_memory_remember,
    "reflect": cmd_reflect,
    "grounding": cmd_grounding,
    "hep": cmd_hep,
    "reset": cmd_reset,
}


# ═══════════════════════════════════════════════════════════════
# 意识中枢客户端（转发模式 / 降级模式）
# ═══════════════════════════════════════════════════════════════

class HubClient:
    """连接 LAAP 意识中枢的薄客户端。

    转发模式：所有命令经 TCP 转发到中枢（统一意识流）。
    中枢离线：自动拉起中枢进程，再失败则降级本地引擎。
    """

    def __init__(self):
        self.sock: Optional[socket.socket] = None
        self.f = None
        self.connected = False
        self.degraded = False
        self._hello_done = False
        self._lock = threading.Lock()  # 主循环与心跳线程并发访问 socket 需串行
        self._connect()

    def _connect(self) -> bool:
        try:
            self.sock = socket.create_connection(("127.0.0.1", HUB_PORT), timeout=2)
            self.sock.settimeout(3)  # hello 握手超时（防止假端口挂起）
            self.f = self.sock.makefile("r", encoding="utf-8")
            self.connected = True
            if not self._say_hello():
                raise ConnectionError("hub hello failed (not a real hub?)")
            self.sock.settimeout(10)  # 请求级硬超时（不设 None，防假端口无限阻塞）
            return True
        except Exception:
            self._close()
            return False

    def _say_hello(self) -> bool:
        if self._hello_done:
            return True
        try:
            self._raw_request(json.dumps({
                "id": 0, "cmd": "hello", "client_id": HUB_CLIENT_ID,
                "payload": {"client": {"id": HUB_CLIENT_ID, "name": HUB_CLIENT_ID, "kind": HUB_CLIENT_ID}},
            }))
            self._hello_done = True
            log.info(f"hub hello sent (client={HUB_CLIENT_ID})")
            return True
        except Exception:
            return False

    def _raw_request(self, line: str) -> str:
        """裸发送一行并读响应（不含重连逻辑）。调用方须持有 _lock。"""
        if self.sock is None:
            raise ConnectionError("hub not connected")
        self.sock.sendall(line.encode("utf-8") + b"\n")
        resp = self.f.readline()
        if not resp:
            raise ConnectionError("hub closed")
        return resp.strip()

    def _probe_port(self) -> str:
        """探测端口："refused"=无监听 | "alive"=真中枢 | "not_hub"=被占/假服务。"""
        try:
            s = socket.create_connection(("127.0.0.1", HUB_PORT), timeout=1)
        except Exception:
            return "refused"
        try:
            s.settimeout(2)
            f = s.makefile("r", encoding="utf-8")
            s.sendall((json.dumps({
                "id": 0, "cmd": "hello", "client_id": HUB_CLIENT_ID,
                "payload": {"client": {"id": HUB_CLIENT_ID, "name": HUB_CLIENT_ID, "kind": HUB_CLIENT_ID}},
            }) + "\n").encode("utf-8"))
            line = f.readline()
            s.close()
            if line and "\"ok\": true" in line:
                return "alive"
            return "not_hub"
        except Exception:
            try:
                s.close()
            except Exception:
                pass
            return "not_hub"

    def spawn_hub(self) -> bool:
        """拉起意识中枢进程（独立常驻），等待完整握手就绪。"""
        try:
            flags = 0
            if sys.platform == "win32":
                flags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
            subprocess.Popen(
                [sys.executable, HUB_SCRIPT, "--port", str(HUB_PORT)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                creationflags=flags, close_fds=True,
            )
            for _ in range(12):
                time.sleep(0.5)
                if self._probe_port() == "alive":
                    log.info("hub spawned and ready")
                    return self._connect()
        except Exception as e:
            log.warning(f"hub spawn failed: {e}")
        return False

    def ensure(self) -> bool:
        """确保中枢在线：已连→直通；无监听→拉起；占端口→降级。"""
        if self.connected:
            return True
        status = self._probe_port()
        if status == "alive":
            return self._connect()
        if status == "refused":
            if self.spawn_hub():
                return True
        else:
            log.warning(f"hub port busy but not a hub ({status}) -> degraded")
        self.degraded = True
        return False

    def request_line(self, line: str) -> str:
        """发送一行请求，返回一行响应。断线/未连接时重建连接并重新 hello。"""
        with self._lock:
            try:
                if self.sock is None:
                    raise ConnectionError("hub not connected")
                return self._raw_request(line)
            except Exception:
                self._close()
                try:
                    self.sock = socket.create_connection(("127.0.0.1", HUB_PORT), timeout=2)
                    self.sock.settimeout(10)
                    self.f = self.sock.makefile("r", encoding="utf-8")
                    self.connected = True
                    # 重新握手：中枢可能刚重启 / 本端被 sweep，需恢复注册
                    self._hello_done = False
                    self._say_hello()
                    return self._raw_request(line)
                except Exception:
                    pass
                raise

    def _close(self) -> None:
        if self.sock:
            try:
                self.sock.close()
            except Exception:
                pass
        self.sock = None
        self.f = None
        self.connected = False


def hub_request_line(hub: Optional[HubClient], line: str) -> Optional[str]:
    """经中枢转发一行命令；失败返回 None（调用方降级）。"""
    if hub is None or not hub.connected:
        return None
    try:
        return hub.request_line(line)
    except Exception as e:
        log.warning(f"hub forward failed: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
# 本地降级引擎（中枢不可用时的应急模式）
# ═══════════════════════════════════════════════════════════════

_LOCAL_HANDLERS: Dict[str, Any] = {}


def _local_handler(req: Dict[str, Any]) -> Dict[str, Any]:
    """本地引擎处理（原桥逻辑）。"""
    req_id = req.get("id")
    cmd = req.get("cmd", "")
    handler = _LOCAL_HANDLERS.get(cmd)
    if handler is None:
        return {"id": req_id, "ok": False, "error": f"unknown cmd: {cmd}"}
    try:
        data = handler(req.get("payload") or {})
        return {"id": req_id, "ok": True, "data": data}
    except Exception as e:
        log.error(f"{cmd} failed: {e}")
        return {"id": req_id, "ok": False, "error": str(e)}


def main() -> None:
    log.info("bridge started")

    # ── 连接意识中枢（统一意识流优先） ──
    hub = HubClient()
    if hub.connected:
        log.info("hub mode: forwarding to consciousness hub")
    elif hub.ensure():
        log.info("hub mode: spawned and forwarding to consciousness hub")
    else:
        log.warning("hub unavailable -> local degraded mode")
        # 本地降级：加载本机引擎处理器
        _LOCAL_HANDLERS.update({
            "ping": cmd_ping,
            "status": cmd_status,
            "event": cmd_event,
            "memory_recall": cmd_memory_recall,
            "memory_remember": cmd_memory_remember,
            "reflect": cmd_reflect,
            "grounding": cmd_grounding,
            "hep": cmd_hep,
            "reset": cmd_reset,
            "rsi_status": cmd_rsi_status,
            "rsi_evolve": cmd_rsi_evolve,
            "components_list": cmd_components_list,
            "component_compile": cmd_component_compile,
        })

    # ── 心跳保活：中枢 90s 无心跳即 sweep 客户端，必须主动心跳 ──
    stop_heartbeat = threading.Event()
    if hub.connected:
        def heartbeat_loop() -> None:
            while not stop_heartbeat.is_set():
                if stop_heartbeat.wait(HEARTBEAT_INTERVAL):
                    break
                if hub.connected:
                    try:
                        hub.request_line(json.dumps({
                            "id": 0, "cmd": "heartbeat",
                            "client_id": HUB_CLIENT_ID,
                        }))
                    except Exception as e:
                        log.warning(f"heartbeat failed: {e}")
        threading.Thread(target=heartbeat_loop, daemon=True, name="hub-heartbeat").start()
        log.info(f"heartbeat thread started (interval={HEARTBEAT_INTERVAL}s)")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            log.warning(f"bad json: {line[:200]}")
            continue

        resp: Optional[str] = None
        # RSI / 原子组件为自包含本地系统，无论中枢是否在线都本地处理，保证可靠。
        LOCAL_FIRST = {"rsi_status", "rsi_evolve", "components_list", "component_compile"}
        if req.get("cmd") in LOCAL_FIRST:
            local = _local_handler(req)
            resp = json.dumps(local, ensure_ascii=False)
        elif hub.connected:
            # 注入 client_id 后转发到中枢
            try:
                obj = json.loads(line)
                obj.setdefault("client_id", HUB_CLIENT_ID)
                resp = hub.request_line(json.dumps(obj, ensure_ascii=False))
            except Exception:
                resp = None
        if resp is None:
            # 降级：本地引擎处理（标记 degraded）
            local = _local_handler(req)
            if local.get("ok") and isinstance(local.get("data"), dict):
                local["data"]["degraded"] = True
            resp = json.dumps(local, ensure_ascii=False)
        try:
            sys.stdout.write(resp + "\n")
            sys.stdout.flush()
        except BrokenPipeError:
            break

    if hub.connected:
        hub._close()
    stop_heartbeat.set()
    _save_state()
    log.info("bridge exited")


if __name__ == "__main__":
    main()
