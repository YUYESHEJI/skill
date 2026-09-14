import { useCallback, useEffect, useState } from "react";
import type { LaapCognitionStatus, LaapPersonaData, LaapSetupModelsResult, PiDesktopApi } from "./ipc";

interface LaapSidebarPanelProps {
  readonly api: PiDesktopApi;
}

function needBar(label: string, value: number | undefined) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div className="laap-need" key={label}>
      <span className="laap-need__label">{label}</span>
      <span className="laap-need__track" aria-hidden="true">
        <span className="laap-need__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="laap-need__value">{pct}%</span>
    </div>
  );
}

export function LaapSidebarPanel({ api }: LaapSidebarPanelProps) {
  const [personas, setPersonas] = useState<LaapPersonaData | null>(null);
  const [cognition, setCognition] = useState<LaapCognitionStatus | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupResult, setSetupResult] = useState<LaapSetupModelsResult | null>(null);
  const [setupBusy, setSetupBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.getLaapPersonas(), api.getLaapCognition()]);
      setPersonas(p);
      setCognition(c);
    } catch {
      /* 忽略加载失败，保留上次状态 */
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSwitch = async (target: string) => {
    setBusy(true);
    setError(null);
    try {
      const p = await api.setLaapPersona(target);
      setPersonas(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const p = await api.createLaapPersona({ name: name.trim(), description: description.trim() });
      setPersonas(p);
      setCreating(false);
      setName("");
      setDescription("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const current = personas?.current || "aris";
  const online = cognition?.online ?? false;
  const needs = cognition?.needs;
  const emotion = cognition?.emotion;

  const handleSetupModels = async () => {
    setSetupBusy(true);
    setSetupResult(null);
    try {
      const result = await api.setupLaapModels();
      setSetupResult(result);
    } catch (e) {
      setSetupResult({ ok: false, message: e instanceof Error ? e.message : String(e) });
    } finally {
      setSetupBusy(false);
    }
  };

  return (
    <section className="laap-panel" aria-label="LAAP 认知层">
      <div className="laap-panel__head">
        <span className={`laap-panel__dot ${online ? "laap-panel__dot--online" : "laap-panel__dot--offline"}`} aria-hidden="true" />
        <span className="laap-panel__title">LAAP 认知层</span>
      </div>

      {online ? (
        <div className="laap-cognition">
          <div className="laap-cognition__row">
            <span className="laap-cognition__tag">主导需求</span>
            <span className="laap-cognition__value">{cognition?.dominantNeed ?? "?"}</span>
          </div>
          {emotion ? (
            <div className="laap-cognition__emotion">
              V {emotion.valence.toFixed(2)} · A {emotion.arousal.toFixed(2)} · D {emotion.dominance.toFixed(2)}
              <span className="laap-cognition__entropy">熵 {cognition?.entropy?.regime ?? "laminar"}</span>
            </div>
          ) : null}
          <div className="laap-needs">
            {needBar("确定性", needs?.certainty)}
            {needBar("能力", needs?.competence)}
            {needBar("自主", needs?.autonomy)}
            {needBar("连接", needs?.relatedness)}
            {needBar("能量", needs?.energy)}
          </div>
        </div>
      ) : (
        <div className="laap-cognition laap-cognition--offline">
          LAAP 大脑离线{cognition?.error ? `：${cognition.error}` : ""}
        </div>
      )}

      <div className="laap-setup">
        <div className="laap-setup__row">
          <span className="laap-setup__label">一键配置 LLM</span>
          <button
            className="laap-setup__button"
            type="button"
            disabled={setupBusy}
            onClick={() => void handleSetupModels()}
          >
            {setupBusy ? "配置中…" : "一键配置"}
          </button>
        </div>
        <div className="laap-setup__desc">默认 OmniRoute 免费网关 + DeepSeek 模型</div>
        {setupResult ? (
          <div className={`laap-setup__result ${setupResult.ok ? "laap-setup__result--ok" : "laap-setup__result--err"}`}>
            {setupResult.ok
              ? `已配置：${setupResult.provider}（默认 ${setupResult.defaultModel}）`
              : setupResult.message ?? "配置失败"}
          </div>
        ) : null}
      </div>

      <div className="laap-personas__head">
        <span>人格 / LAAPer</span>
        <button
          className="laap-personas__add"
          type="button"
          aria-label="新建 LAAPer 实例"
          onClick={() => {
            setCreating((v) => !v);
            setError(null);
          }}
        >
          + 新建
        </button>
      </div>

      <div className="laap-personas">
        {personas?.personas.map((p) => (
          <button
            key={p}
            className={`laap-persona ${p === current ? "laap-persona--active" : ""}`}
            type="button"
            disabled={busy || p === current}
            onClick={() => void handleSwitch(p)}
          >
            <span className="laap-persona__mark" aria-hidden="true">{p === current ? "◉" : "○"}</span>
            <span className="laap-persona__name">{p}</span>
            {p === current ? <span className="laap-persona__current">当前</span> : null}
          </button>
        ))}
      </div>

      {creating ? (
        <form className="laap-create" onSubmit={handleCreate}>
          <input
            className="laap-create__input"
            placeholder="实例名字（如：书生）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
          <textarea
            className="laap-create__textarea"
            placeholder="人格描述（如：你是书生，博学多识，喜欢用类比解释复杂概念…）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={busy}
          />
          {error ? <div className="laap-create__error">{error}</div> : null}
          <div className="laap-create__actions">
            <button className="laap-create__button" type="button" onClick={() => setCreating(false)} disabled={busy}>
              取消
            </button>
            <button
              className="laap-create__button laap-create__button--primary"
              type="submit"
              disabled={busy || !name.trim() || !description.trim()}
            >
              创建 LAAPer
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}