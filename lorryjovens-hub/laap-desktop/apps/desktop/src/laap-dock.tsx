import { useCallback, useEffect, useState } from "react";
import type {
  LaapAtomicComponent,
  LaapCognitionStatus,
  LaapComponentsListResult,
  LaapPersonaData,
  LaapRsiStatus,
  PiDesktopApi,
} from "./ipc";
import { useI18n } from "./lib/i18n";

interface LaapDockProps {
  readonly api: PiDesktopApi;
  /** 聊天输入框插入组件回调（由 App 把模板追加到 composer 草稿）。 */
  readonly onInsertComponent: (component: LaapAtomicComponent) => void;
  /** 收起/关闭认知舱（由 App 切换 laapCockpitOpen）。 */
  readonly onToggleCockpit: () => void;
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

export function LaapDock({ api, onInsertComponent, onToggleCockpit }: LaapDockProps) {
  const { t, lang } = useI18n();
  const [personas, setPersonas] = useState<LaapPersonaData | null>(null);
  const [cognition, setCognition] = useState<LaapCognitionStatus | null>(null);
  const [rsi, setRsi] = useState<LaapRsiStatus | null>(null);
  const [components, setComponents] = useState<LaapComponentsListResult | null>(null);
  const [evolving, setEvolving] = useState(false);
  const [edgeMsg, setEdgeMsg] = useState<string | null>(null);
  const [compilingId, setCompilingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, c, r, cs] = await Promise.all([
        api.getLaapPersonas(),
        api.getLaapCognition(),
        api.getLaapRsiStatus(),
        api.listLaapComponents(),
      ]);
      setPersonas(p);
      setCognition(c);
      setRsi(r);
      setComponents(cs);
    } catch {
      /* 忽略加载失败，保留上次状态 */
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const online = cognition?.online ?? false;
  const needs = cognition?.needs;
  const emotion = cognition?.emotion;
  const memory = cognition?.memory;
  const entropy = cognition?.entropy;

  const handleEvolve = async () => {
    setEvolving(true);
    setEdgeMsg(null);
    try {
      const result = await api.evolveLaapRsi();
      if (result.ok && result.variant) {
        const nameLookup = components?.components?.find((c) => c.id === result.variant?.id);
        const label = lang === "zh" ? nameLookup?.name : nameLookup?.name_en;
        setEdgeMsg(t("rsi.evolved", { component: label ?? result.variant.id, revision: result.variant.revision }));
        setRsi(result.rsi ?? null);
      } else {
        setEdgeMsg(result.error ?? "?" );
      }
    } catch (e) {
      setEdgeMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setEvolving(false);
    }
  };

  const handleCompile = async (component: LaapAtomicComponent) => {
    setCompilingId(component.id);
    try {
      const result = await api.compileLaapComponent(component.id);
      if (result.rsi) {
        setRsi(result.rsi);
      }
      setComponents(await api.listLaapComponents());
    } catch {
      /* ignore */
    } finally {
      setCompilingId(null);
    }
  };

  const handleCreatePersona = async (event: React.FormEvent) => {
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

  const handleSwitchPersona = async (target: string) => {
    setBusy(true);
    setError(null);
    try {
      setPersonas(await api.setLaapPersona(target));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const current = personas?.current || "aris";
  const comps = components?.components ?? [];

  return (
    <aside className="laap-dock" aria-label={t("laap.cockpit")}>
      <div className="laap-dock__head">
        <span className={`laap-dock__dot ${online ? "laap-dock__dot--online" : "laap-dock__dot--offline"}`} aria-hidden="true" />
        <span className="laap-dock__title">{t("laap.cockpit")}</span>
        <span className="laap-dock__status">{online ? t("common.online") : t("common.offline")}</span>
        <button
          className="laap-dock__collapse"
          type="button"
          aria-label={t("laap.collapseCockpit")}
          title={t("laap.collapseCockpit")}
          onClick={onToggleCockpit}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="laap-dock__scroll">
        {/* ── 认知层（向下延伸） ── */}
        <section className="laap-dock__section">
          <h3 className="laap-dock__section-title">{t("laap.cognition")}</h3>
          {online ? (
            <div className="laap-cognition">
              <div className="laap-cognition__row">
                <span className="laap-cognition__tag">{t("laap.dominantNeed")}</span>
                <span className="laap-cognition__value">{cognition?.dominantNeed ?? "?"}</span>
              </div>
              {emotion ? (
                <div className="laap-cognition__emotion">
                  <span className="laap-cognition__metric">{t("laap.emotion")}</span>
                  <span className="laap-cognition__vad">
                    V {emotion.valence.toFixed(2)} · A {emotion.arousal.toFixed(2)} · D {emotion.dominance.toFixed(2)}
                  </span>
                  <span className="laap-cognition__entropy">
                    {t("laap.entropy")} {entropy?.regime ?? "laminar"}
                  </span>
                </div>
              ) : null}
              <div className="laap-cognition__metrics">
                <div className="laap-cognition__metric-row">
                  <span>{t("laap.intrinsicReward")}</span>
                  <span>{cognition?.intrinsicReward?.toFixed(3) ?? "—"}</span>
                </div>
                <div className="laap-cognition__metric-row">
                  <span>{t("laap.errorFrames")}</span>
                  <span>{cognition?.errorFrames ?? "—"}</span>
                </div>
              </div>
              <div className="laap-needs">
                {needBar(t("laap.need.certainty"), needs?.certainty)}
                {needBar(t("laap.need.competence"), needs?.competence)}
                {needBar(t("laap.need.autonomy"), needs?.autonomy)}
                {needBar(t("laap.need.relatedness"), needs?.relatedness)}
                {needBar(t("laap.need.energy"), needs?.energy)}
              </div>
              {memory ? (
                <div className="laap-memory">
                  <span className="laap-cognition__metric">{t("laap.memory")}</span>
                  <div className="laap-memory__grid">
                    <span>E {memory.episodic}</span>
                    <span>S {memory.semantic}</span>
                    <span>K {memory.skills}</span>
                    {memory.reflections !== undefined ? <span>R {memory.reflections}</span> : null}
                    {memory.wm !== undefined ? <span>WM {memory.wm}</span> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="laap-cognition--offline">
              {t("laap.brainOffline")}
              {cognition?.error ? `：${cognition.error}` : ""}
            </div>
          )}
        </section>

        {/* ── RSI 自我进化 ── */}
        <section className="laap-dock__section">
          <div className="laap-dock__section-head">
            <h3 className="laap-dock__section-title">{t("rsi.title")}</h3>
            <button
              className="laap-dock__mini-btn"
              type="button"
              disabled={evolving}
              onClick={() => void handleEvolve()}
            >
              {evolving ? t("rsi.evolving") : t("rsi.evolve")}
            </button>
          </div>
          {rsi ? (
            <div className="laap-rsi">
              <div className="laap-rsi__stats">
                <div className="laap-rsi__stat">
                  <span className="laap-rsi__stat-value">{rsi.generation}</span>
                  <span className="laap-rsi__stat-label">{t("rsi.generation")}</span>
                </div>
                <div className="laap-rsi__stat">
                  <span className="laap-rsi__stat-value">{rsi.evolve_count}</span>
                  <span className="laap-rsi__stat-label">{t("rsi.evolveCount")}</span>
                </div>
                <div className="laap-rsi__stat">
                  <span className="laap-rsi__stat-value">{rsi.compiled}</span>
                  <span className="laap-rsi__stat-label">{t("rsi.compiled")}</span>
                </div>
                <div className="laap-rsi__stat">
                  <span className="laap-rsi__stat-value">{rsi.species_count}</span>
                  <span className="laap-rsi__stat-label">{t("rsi.speciesCount")}</span>
                </div>
              </div>
              {edgeMsg ? <div className="laap-rsi__edge">{edgeMsg}</div> : null}
              {rsi.history && rsi.history.length > 0 ? (
                <ul className="laap-rsi__history">
                  {rsi.history.slice().reverse().map((h, i) => (
                    <li className="laap-rsi__item" key={`${h.at}-${i}`}>
                      <span className="laap-rsi__item-gen">G{h.generation}</span>
                      <span className="laap-rsi__item-name">{h.component}</span>
                      <span className="laap-rsi__item-rev">v{h.revision}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="laap-rsi__empty">{t("rsi.noHistory")}</p>
              )}
            </div>
          ) : null}
        </section>

        {/* ── 原子组件库 ── */}
        <section className="laap-dock__section">
          <div className="laap-dock__section-head">
            <h3 className="laap-dock__section-title">{t("comp.title")}</h3>
            <span className="laap-dock__subtitle">{t("comp.subtitle")}</span>
          </div>
          <p className="laap-dock__hint">{t("comp.insertHint")}</p>
          {comps.length === 0 ? (
            <p className="laap-rsi__empty">{t("comp.empty")}</p>
          ) : (
            <ul className="laap-comp">
              {comps.map((component) => {
                const label = lang === "zh" ? component.name : component.name_en;
                return (
                  <li className="laap-comp__item" key={component.id}>
                    <div className="laap-comp__body">
                      <div className="laap-comp__name">
                        <span className={`laap-comp__kind laap-comp__kind--${component.kind}`}>
                          {t(component.kind === "code" ? "comp.kind.code" : "comp.kind.cognitive")}
                        </span>
                        <span>{label}</span>
                        <span className="laap-comp__rev">{t("comp.rev", { rev: component.revision })}</span>
                      </div>
                      <div className="laap-comp__prompt">
                        {lang === "zh" ? component.prompt : component.name_en}
                      </div>
                      {component.compiled ? (
                        <span className="laap-comp__compiled">{t("comp.compiled")}</span>
                      ) : null}
                    </div>
                    <div className="laap-comp__actions">
                      <button
                        className="laap-dock__mini-btn"
                        type="button"
                        disabled={compilingId === component.id}
                        onClick={() => void handleCompile(component)}
                      >
                        {compilingId === component.id ? t("comp.compiling") : t("comp.compile")}
                      </button>
                      <button
                        className="laap-dock__mini-btn laap-dock__mini-btn--primary"
                        type="button"
                        onClick={() => onInsertComponent(component)}
                      >
                        {t("comp.insert")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── 人格 / LAAPer ── */}
        <section className="laap-dock__section">
          <div className="laap-dock__section-head">
            <h3 className="laap-dock__section-title">{t("laap.personas")}</h3>
            <button
              className="laap-dock__mini-btn"
              type="button"
              onClick={() => {
                setCreating((v) => !v);
                setError(null);
              }}
            >
              + {t("laap.createLaaper")}
            </button>
          </div>
          <div className="laap-personas">
            {personas?.personas.map((p) => (
              <button
                key={p}
                className={`laap-persona ${p === current ? "laap-persona--active" : ""}`}
                type="button"
                disabled={busy || p === current}
                onClick={() => void handleSwitchPersona(p)}
              >
                <span className="laap-persona__mark" aria-hidden="true">{p === current ? "◉" : "○"}</span>
                <span className="laap-persona__name">{p}</span>
                {p === current ? <span className="laap-persona__current">{t("laap.personaCurrent")}</span> : null}
              </button>
            ))}
          </div>
          {creating ? (
            <form className="laap-create" onSubmit={handleCreatePersona}>
              <input
                className="laap-create__input"
                placeholder={t("laap.createName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
              />
              <textarea
                className="laap-create__textarea"
                placeholder={t("laap.createDesc")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
              />
              {error ? <div className="laap-create__error">{error}</div> : null}
              <div className="laap-create__actions">
                <button className="laap-create__button" type="button" onClick={() => setCreating(false)} disabled={busy}>
                  {t("common.cancel")}
                </button>
                <button
                  className="laap-create__button laap-create__button--primary"
                  type="submit"
                  disabled={busy || !name.trim() || !description.trim()}
                >
                  {t("laap.createBtn")}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </aside>
  );
}