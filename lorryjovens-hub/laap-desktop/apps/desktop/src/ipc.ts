import type { RuntimeSettingsSnapshot } from "@pi-gui/session-driver/runtime-types";
import type {
  NavigateSessionTreeOptions,
  NavigateSessionTreeResult,
  SessionTreeSnapshot,
} from "@pi-gui/session-driver/types";
import type {
  AppView,
  ComposerAttachment,
  ComposerImageAttachment,
  CreateSessionInput,
  CreateWorktreeInput,
  DesktopAppState,
  ForkThreadInput,
  ModelSettingsScopeMode,
  NotificationPreferences,
  RemoveWorktreeInput,
  SendChildThreadFollowUpInput,
  SetChildSupervisionLoopInput,
  SelectedTranscriptRecord,
  StartThreadInput,
  ThemePresetId,
  WorkspaceSessionTarget,
} from "./desktop-state";

export type DesktopNotificationPermissionStatus =
  | "granted"
  | "denied"
  | "default"
  | "unsupported"
  | "unknown";


export interface CustomProviderModelConfig {
  readonly id: string;
  readonly contextWindow?: number;
}

export interface CustomProviderConfig {
  readonly providerId: string;
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly models: readonly CustomProviderModelConfig[];
}

export interface CustomProviderProbeInput {
  readonly baseUrl: string;
  readonly apiKey?: string;
}

export type CustomProviderProbeResult =
  | { readonly ok: true; readonly models: readonly string[] }
  | { readonly ok: false; readonly error: string };

// ── LAAP 认知层（aris / LAAPer） IPC 类型 ───────────────────────
export interface LaapPersonaData {
  readonly current: string;
  readonly personas: readonly string[];
}

export interface LaapCognitionStatus {
  readonly online: boolean;
  readonly dominantNeed?: string;
  readonly driveStrength?: number;
  readonly needs?: {
    readonly certainty: number;
    readonly competence: number;
    readonly autonomy: number;
    readonly relatedness: number;
    readonly energy: number;
  };
  readonly emotion?: { readonly valence: number; readonly arousal: number; readonly dominance: number };
  readonly entropy?: { readonly regime: string };
  readonly intrinsicReward?: number;
  readonly memory?: {
    readonly episodic: number;
    readonly semantic: number;
    readonly skills: number;
    readonly reflections?: number;
    readonly wm?: number;
  };
  readonly errorFrames?: number;
  readonly error?: string;
}

export interface LaapCreatePersonaInput {
  readonly name: string;
  readonly description: string;
}

export interface LaapSetupModelsResult {
  readonly ok: boolean;
  readonly message?: string;
  readonly provider?: string;
  readonly defaultModel?: string;
  readonly providers?: readonly string[];
}

// ── LAAP RSI 自我进化 + 热编译原子组件 ──────────────────────────
export interface LaapRsiHistoryEntry {
  readonly at?: string;
  readonly component?: string;
  readonly revision?: number;
  readonly generation?: number;
}

export interface LaapRsiStatus {
  readonly generation: number;
  readonly evolve_count: number;
  readonly compiled: number;
  readonly species_count: number;
  readonly cache_entries: number;
  readonly last_evolved_at?: string;
  readonly history?: readonly LaapRsiHistoryEntry[];
}

export interface LaapAtomicComponent {
  readonly id: string;
  readonly name: string;
  readonly name_en: string;
  readonly kind: string;
  readonly revision: number;
  readonly prompt?: string;
  readonly template?: string;
  readonly compiled?: boolean;
  readonly compiled_at?: string;
}

export interface LaapComponentsListResult {
  readonly components?: readonly LaapAtomicComponent[];
  readonly rsi?: LaapRsiStatus;
  readonly ok?: boolean;
  readonly error?: string;
}

export interface LaapComponentCompileResult {
  readonly ok: boolean;
  readonly component?: string;
  readonly revision?: number;
  readonly artifact?: string;
  readonly rsi?: LaapRsiStatus;
  readonly error?: string;
}

export interface LaapRsiEvolveResult {
  readonly ok: boolean;
  readonly variant?: {
    readonly id: string;
    readonly revision: number;
    readonly template: string;
    readonly generation: number;
  };
  readonly rsi?: LaapRsiStatus;
  readonly error?: string;
}

export const desktopIpc = {
  stateRequest: "laap:state-request",
  stateChanged: "laap:state-changed",
  selectedTranscriptRequest: "laap:selected-transcript-request",
  selectedTranscriptChanged: "laap:selected-transcript-changed",
  appCommand: "laap:app-command",
  workspacePicked: "laap:workspace-picked",
  clipboardImagePasted: "laap:clipboard-image-pasted",
  addWorkspacePath: "laap:add-workspace-path",
  pickWorkspace: "laap:pick-workspace",
  selectWorkspace: "laap:select-workspace",
  renameWorkspace: "laap:rename-workspace",
  removeWorkspace: "laap:remove-workspace",
  reorderWorkspaces: "laap:reorder-workspaces",
  reorderPinnedSessions: "laap:reorder-pinned-sessions",
  openWorkspaceInFinder: "laap:open-workspace-in-finder",
  createWorktree: "laap:create-worktree",
  removeWorktree: "laap:remove-worktree",
  openSkillInFinder: "laap:open-skill-in-finder",
  openExtensionInFinder: "laap:open-extension-in-finder",
  syncCurrentWorkspace: "laap:sync-current-workspace",
  selectSession: "laap:select-session",
  renameSession: "laap:rename-session",
  archiveSession: "laap:archive-session",
  unarchiveSession: "laap:unarchive-session",
  markSessionRead: "laap:mark-session-read",
  setSessionPinned: "laap:set-session-pinned",
  createSession: "laap:create-session",
  startThread: "laap:start-thread",
  forkThread: "laap:fork-thread",
  sendChildThreadFollowUp: "laap:send-child-thread-follow-up",
  setChildSupervisionLoop: "laap:set-child-supervision-loop",
  cancelCurrentRun: "laap:cancel-current-run",
  setActiveView: "laap:set-active-view",
  setSidebarCollapsed: "laap:set-sidebar-collapsed",
  refreshRuntime: "laap:refresh-runtime",
  setModelSettingsScopeMode: "laap:set-model-settings-scope-mode",
  setDefaultModel: "laap:set-default-model",
  setDefaultThinkingLevel: "laap:set-default-thinking-level",
  setSessionModel: "laap:set-session-model",
  setSessionThinkingLevel: "laap:set-session-thinking-level",
  loginProvider: "laap:login-provider",
  logoutProvider: "laap:logout-provider",
  setProviderApiKey: "laap:set-provider-api-key",
  listCustomProviders: "laap:list-custom-providers",
  setCustomProvider: "laap:set-custom-provider",
  deleteCustomProvider: "laap:delete-custom-provider",
  probeCustomProviderModels: "laap:probe-custom-provider-models",
  setEnableSkillCommands: "laap:set-enable-skill-commands",
  setScopedModelPatterns: "laap:set-scoped-model-patterns",
  setSkillEnabled: "laap:set-skill-enabled",
  setExtensionEnabled: "laap:set-extension-enabled",
  respondToHostUiRequest: "laap:respond-to-host-ui-request",
  setNotificationPreferences: "laap:set-notification-preferences",
  setIntegratedTerminalShell: "laap:set-integrated-terminal-shell",
  setEnableTransparency: "laap:set-enable-transparency",
  terminalEnsurePanel: "laap:terminal-ensure-panel",
  terminalCreateSession: "laap:terminal-create-session",
  terminalSetActiveSession: "laap:terminal-set-active-session",
  terminalWrite: "laap:terminal-write",
  terminalResize: "laap:terminal-resize",
  terminalRestartSession: "laap:terminal-restart-session",
  terminalCloseSession: "laap:terminal-close-session",
  terminalSetTitle: "laap:terminal-set-title",
  terminalSetFocused: "laap:terminal-set-focused",
  terminalData: "laap:terminal-data",
  terminalExit: "laap:terminal-exit",
  terminalError: "laap:terminal-error",
  getNotificationPermissionStatus: "laap:get-notification-permission-status",
  requestNotificationPermission: "laap:request-notification-permission",
  openSystemNotificationSettings: "laap:open-system-notification-settings",
  notificationPermissionStatusChanged: "laap:notification-permission-status-changed",
  pickComposerAttachments: "laap:pick-composer-attachments",
  readClipboardImage: "laap:read-clipboard-image",
  addComposerAttachments: "laap:add-composer-attachments",
  removeComposerAttachment: "laap:remove-composer-attachment",
  editQueuedComposerMessage: "laap:edit-queued-composer-message",
  cancelQueuedComposerEdit: "laap:cancel-queued-composer-edit",
  removeQueuedComposerMessage: "laap:remove-queued-composer-message",
  steerQueuedComposerMessage: "laap:steer-queued-composer-message",
  updateComposerDraft: "laap:update-composer-draft",
  submitComposer: "laap:submit-composer",
  getSessionTree: "laap:get-session-tree",
  navigateSessionTree: "laap:navigate-session-tree",
  toggleWindowMaximize: "laap:toggle-window-maximize",
  listWorkspaceFiles: "laap:list-workspace-files",
  readWorkspaceFile: "laap:read-workspace-file",
  getChangedFiles: "laap:get-changed-files",
  getFileDiff: "laap:get-file-diff",
  stageFile: "laap:stage-file",
  getThemeMode: "laap:get-theme-mode",
  getResolvedTheme: "laap:get-resolved-theme",
  setThemeMode: "laap:set-theme-mode",
  setThemePresetId: "laap:set-theme-preset-id",
  themeChanged: "laap:theme-changed",
  laapGetPersonas: "laap:get-personas",
  laapSetPersona: "laap:set-persona",
  laapCreatePersona: "laap:create-persona",
  laapGetCognition: "laap:get-cognition",
  laapCognitionChanged: "laap:cognition-changed",
  laapSetupModels: "laap:setup-models",
  laapRsiStatus: "laap:rsi-status",
  laapRsiEvolve: "laap:rsi-evolve",
  laapComponentsList: "laap:components-list",
  laapComponentCompile: "laap:component-compile",
  ping: "app:ping",
  openExternal: "app:open-external",
} as const;

export const desktopCommands = {
  openSettings: "open-settings",
  openNewThread: "open-new-thread",
  toggleTerminal: "toggle-terminal",
  toggleSidebar: "toggle-sidebar",
} as const;

export function getDesktopShortcutLabel(platform: NodeJS.Platform, key: string): string {
  return `${platform === "darwin" ? "⌘" : "Ctrl+"}${key.toUpperCase()}`;
}

export type PiDesktopStateListener = (state: DesktopAppState) => void;
export type PiDesktopSelectedTranscriptListener = (payload: SelectedTranscriptRecord | null) => void;
export type PiDesktopCommand = (typeof desktopCommands)[keyof typeof desktopCommands];

export type ChangedFileStatus = "added" | "copied" | "deleted" | "modified" | "renamed" | "untracked";

export interface ChangedFileEntry {
  readonly path: string;
  readonly previousPath?: string;
  readonly stagingSourcePath?: string;
  readonly status: ChangedFileStatus;
  readonly staged: boolean;
}

export type ChangedFilesErrorCode = "git-status-failed" | "git-status-invalid" | "workspace-unavailable";

export interface ChangedFilesError {
  readonly code: ChangedFilesErrorCode;
  readonly message: string;
}

export type ChangedFilesResult =
  | {
      readonly state: "available";
      readonly files: readonly ChangedFileEntry[];
    }
  | {
      readonly state: "unavailable";
      readonly error: ChangedFilesError;
    };

export interface WorkspaceFilePreview {
  readonly path: string;
  readonly content: string;
  readonly truncated: boolean;
  readonly binary: boolean;
  readonly sizeBytes: number;
}

export interface TerminalSize {
  readonly cols: number;
  readonly rows: number;
}

export type TerminalSessionStatus = "running" | "exited" | "error";

export interface TerminalSessionSnapshot {
  readonly id: string;
  readonly workspaceId: string;
  readonly cwd: string;
  readonly shell: string;
  readonly title: string;
  readonly status: TerminalSessionStatus;
  readonly replay: string;
  readonly truncated: boolean;
  readonly exitCode?: number;
  readonly signal?: number;
}

export interface TerminalPanelSnapshot {
  readonly workspaceId: string;
  readonly rootKey: string;
  readonly activeSessionId: string;
  readonly sessions: readonly TerminalSessionSnapshot[];
}

export interface TerminalDataEvent {
  readonly terminalId: string;
  readonly data: string;
}

export interface TerminalExitEvent {
  readonly terminalId: string;
  readonly exitCode?: number;
  readonly signal?: number;
}

export interface TerminalErrorEvent {
  readonly terminalId: string;
  readonly message: string;
}

export interface DesktopShortcutInput {
  readonly modifier: boolean;
  readonly shift: boolean;
  readonly key: string;
  readonly code?: string;
}

export function getDesktopCommandFromShortcut(input: DesktopShortcutInput): PiDesktopCommand | undefined {
  if (!input.modifier) {
    return undefined;
  }

  const lowerKey = input.key.toLowerCase();
  const isComma = input.key === "," || input.code === "Comma";
  const isB = lowerKey === "b" || input.code === "KeyB";
  const isJ = lowerKey === "j" || input.code === "KeyJ";
  const isShiftO = input.shift && (lowerKey === "o" || input.code === "KeyO");

  if (!input.shift && isComma) {
    return desktopCommands.openSettings;
  }

  if (!input.shift && isJ) {
    return desktopCommands.toggleTerminal;
  }

  if (!input.shift && isB) {
    return desktopCommands.toggleSidebar;
  }

  if (isShiftO) {
    return desktopCommands.openNewThread;
  }

  return undefined;
}

export interface PiDesktopApi {
  platform: NodeJS.Platform;
  versions: NodeJS.ProcessVersions;
  ping(): Promise<string>;
  getState(): Promise<DesktopAppState>;
  onStateChanged(listener: PiDesktopStateListener): () => void;
  getSelectedTranscript(): Promise<SelectedTranscriptRecord | null>;
  onSelectedTranscriptChanged(listener: PiDesktopSelectedTranscriptListener): () => void;
  onCommand(listener: (command: PiDesktopCommand) => void): () => void;
  onWorkspacePicked(listener: (workspaceId: string) => void): () => void;
  onClipboardImagePasted(listener: (attachment: ComposerImageAttachment) => void): () => void;
  getPathForFile(file: File): string;
  addWorkspacePath(path: string): Promise<DesktopAppState>;
  pickWorkspace(): Promise<DesktopAppState>;
  selectWorkspace(workspaceId: string): Promise<DesktopAppState>;
  renameWorkspace(workspaceId: string, displayName: string): Promise<DesktopAppState>;
  removeWorkspace(workspaceId: string): Promise<DesktopAppState>;
  reorderWorkspaces(workspaceOrder: readonly string[]): Promise<DesktopAppState>;
  reorderPinnedSessions(pinnedSessionOrder: readonly string[]): Promise<DesktopAppState>;
  openWorkspaceInFinder(workspaceId: string): Promise<void>;
  createWorktree(input: CreateWorktreeInput): Promise<DesktopAppState>;
  removeWorktree(input: RemoveWorktreeInput): Promise<DesktopAppState>;
  openSkillInFinder(workspaceId: string, filePath: string): Promise<void>;
  openExtensionInFinder(workspaceId: string, filePath: string): Promise<void>;
  syncCurrentWorkspace(): Promise<DesktopAppState>;
  selectSession(target: WorkspaceSessionTarget): Promise<DesktopAppState>;
  renameSession(target: WorkspaceSessionTarget, title: string): Promise<DesktopAppState>;
  archiveSession(target: WorkspaceSessionTarget): Promise<DesktopAppState>;
  unarchiveSession(target: WorkspaceSessionTarget): Promise<DesktopAppState>;
  markSessionRead(target: WorkspaceSessionTarget): Promise<DesktopAppState>;
  setSessionPinned(target: WorkspaceSessionTarget, pinned: boolean): Promise<DesktopAppState>;
  createSession(input: CreateSessionInput): Promise<DesktopAppState>;
  startThread(input: StartThreadInput): Promise<DesktopAppState>;
  forkThread(input: ForkThreadInput): Promise<DesktopAppState>;
  sendChildThreadFollowUp(input: SendChildThreadFollowUpInput): Promise<DesktopAppState>;
  setChildSupervisionLoop(input: SetChildSupervisionLoopInput): Promise<DesktopAppState>;
  cancelCurrentRun(): Promise<DesktopAppState>;
  setActiveView(view: AppView): Promise<DesktopAppState>;
  setSidebarCollapsed(collapsed: boolean): Promise<DesktopAppState>;
  refreshRuntime(workspaceId?: string): Promise<DesktopAppState>;
  setModelSettingsScopeMode(mode: ModelSettingsScopeMode): Promise<DesktopAppState>;
  setDefaultModel(workspaceId: string, provider: string, modelId: string): Promise<DesktopAppState>;
  setDefaultThinkingLevel(
    workspaceId: string,
    thinkingLevel: RuntimeSettingsSnapshot["defaultThinkingLevel"],
  ): Promise<DesktopAppState>;
  setSessionModel(
    workspaceId: string,
    sessionId: string,
    provider: string,
    modelId: string,
  ): Promise<DesktopAppState>;
  setSessionThinkingLevel(
    workspaceId: string,
    sessionId: string,
    thinkingLevel: NonNullable<RuntimeSettingsSnapshot["defaultThinkingLevel"]>,
  ): Promise<DesktopAppState>;
  loginProvider(workspaceId: string, providerId: string): Promise<DesktopAppState>;
  logoutProvider(workspaceId: string, providerId: string): Promise<DesktopAppState>;
  setProviderApiKey(workspaceId: string, providerId: string, apiKey: string): Promise<DesktopAppState>;
  listCustomProviders(): Promise<readonly CustomProviderConfig[]>;
  setCustomProvider(workspaceId: string, config: CustomProviderConfig): Promise<DesktopAppState>;
  deleteCustomProvider(workspaceId: string, providerId: string): Promise<DesktopAppState>;
  probeCustomProviderModels(input: CustomProviderProbeInput): Promise<CustomProviderProbeResult>;
  setEnableSkillCommands(workspaceId: string, enabled: boolean): Promise<DesktopAppState>;
  setScopedModelPatterns(workspaceId: string, patterns: readonly string[]): Promise<DesktopAppState>;
  setSkillEnabled(workspaceId: string, filePath: string, enabled: boolean): Promise<DesktopAppState>;
  setExtensionEnabled(workspaceId: string, filePath: string, enabled: boolean): Promise<DesktopAppState>;
  respondToHostUiRequest(
    workspaceId: string,
    sessionId: string,
    response:
      | { readonly requestId: string; readonly value: string }
      | { readonly requestId: string; readonly confirmed: boolean }
      | { readonly requestId: string; readonly cancelled: true },
  ): Promise<DesktopAppState>;
  setNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<DesktopAppState>;
  setIntegratedTerminalShell(shell: string): Promise<DesktopAppState>;
  setEnableTransparency(enabled: boolean): Promise<DesktopAppState>;
  setThemePresetId(presetId: ThemePresetId): Promise<DesktopAppState>;
  ensureTerminalPanel(
    workspaceId: string,
    terminalScopeId: string,
    size?: Partial<TerminalSize>,
  ): Promise<TerminalPanelSnapshot>;
  createTerminalSession(
    workspaceId: string,
    terminalScopeId: string,
    size?: Partial<TerminalSize>,
  ): Promise<TerminalPanelSnapshot>;
  setActiveTerminalSession(
    workspaceId: string,
    terminalScopeId: string,
    terminalId: string,
  ): Promise<TerminalPanelSnapshot>;
  writeTerminal(terminalId: string, data: string): Promise<void>;
  resizeTerminal(terminalId: string, size: TerminalSize): Promise<void>;
  restartTerminalSession(terminalId: string, size?: Partial<TerminalSize>): Promise<TerminalPanelSnapshot>;
  closeTerminalSession(terminalId: string): Promise<TerminalPanelSnapshot | null>;
  setTerminalTitle(terminalId: string, title: string): Promise<void>;
  setTerminalFocused(focused: boolean): Promise<void>;
  onTerminalData(listener: (event: TerminalDataEvent) => void): () => void;
  onTerminalExit(listener: (event: TerminalExitEvent) => void): () => void;
  onTerminalError(listener: (event: TerminalErrorEvent) => void): () => void;
  getNotificationPermissionStatus(): Promise<DesktopNotificationPermissionStatus>;
  requestNotificationPermission(): Promise<DesktopNotificationPermissionStatus>;
  openSystemNotificationSettings(): Promise<void>;
  onNotificationPermissionStatusChanged(
    callback: (status: DesktopNotificationPermissionStatus) => void,
  ): () => void;
  pickComposerAttachments(): Promise<DesktopAppState>;
  readClipboardImage(): ComposerImageAttachment | null;
  addComposerAttachments(attachments: readonly ComposerAttachment[]): Promise<DesktopAppState>;
  removeComposerAttachment(attachmentId: string): Promise<DesktopAppState>;
  editQueuedComposerMessage(messageId: string, currentDraft?: string): Promise<DesktopAppState>;
  cancelQueuedComposerEdit(): Promise<DesktopAppState>;
  removeQueuedComposerMessage(messageId: string): Promise<DesktopAppState>;
  steerQueuedComposerMessage(messageId: string): Promise<DesktopAppState>;
  updateComposerDraft(composerDraft: string): Promise<DesktopAppState>;
  submitComposer(text: string, options?: { readonly deliverAs?: "steer" | "followUp" }): Promise<DesktopAppState>;
  getSessionTree(target: WorkspaceSessionTarget): Promise<SessionTreeSnapshot>;
  navigateSessionTree(
    target: WorkspaceSessionTarget,
    targetId: string,
    options?: NavigateSessionTreeOptions,
  ): Promise<{ readonly state: DesktopAppState; readonly result: NavigateSessionTreeResult }>;
  listWorkspaceFiles(workspaceId: string, options?: { readonly force?: boolean }): Promise<string[]>;
  readWorkspaceFile(workspaceId: string, filePath: string): Promise<WorkspaceFilePreview>;
  getChangedFiles(workspaceId: string): Promise<ChangedFilesResult>;
  getFileDiff(workspaceId: string, filePath: string): Promise<string>;
  stageFile(workspaceId: string, filePath: string, stagingSourcePath?: string): Promise<void>;
  toggleWindowMaximize(): Promise<void>;
  openExternal(url: string): Promise<void>;
  getThemeMode(): Promise<"system" | "light" | "dark">;
  getResolvedTheme(): Promise<"light" | "dark">;
  setThemeMode(mode: "system" | "light" | "dark"): Promise<DesktopAppState>;
  onThemeChanged(callback: (theme: "light" | "dark") => void): () => void;
  getLaapPersonas(): Promise<LaapPersonaData>;
  setLaapPersona(name: string): Promise<LaapPersonaData>;
  createLaapPersona(input: LaapCreatePersonaInput): Promise<LaapPersonaData>;
  getLaapCognition(): Promise<LaapCognitionStatus>;
  setupLaapModels(): Promise<LaapSetupModelsResult>;
  getLaapRsiStatus(): Promise<LaapRsiStatus>;
  evolveLaapRsi(component?: string): Promise<LaapRsiEvolveResult>;
  listLaapComponents(): Promise<LaapComponentsListResult>;
  compileLaapComponent(component: string): Promise<LaapComponentCompileResult>;
}
