function isClaudeFamilyModel(modelId) {
  return /^claude-/i.test(String(modelId || '').trim());
}

function resolveRequestedModelForMode({ modelId, userMode, hasProvider }) {
  const normalizedModelId = String(modelId || '').trim() || 'claude-sonnet-4-6';

  if (!hasProvider && !isClaudeFamilyModel(normalizedModelId)) {
    return {
      modelId: normalizedModelId,
      fallbackApplied: false,
      error: `No enabled provider found for model "${normalizedModelId}".`,
    };
  }

  return {
    modelId: normalizedModelId,
    fallbackApplied: false,
    error: null,
  };
}

module.exports = {
  isClaudeFamilyModel,
  resolveRequestedModelForMode,
};
