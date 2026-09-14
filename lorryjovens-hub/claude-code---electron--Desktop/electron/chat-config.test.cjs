const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveRequestedModelForMode,
} = require('./chat-config.cjs');

test('keeps Claude models unchanged', () => {
  const result = resolveRequestedModelForMode({
    modelId: 'claude-sonnet-4-6',
    userMode: 'selfhosted',
    hasProvider: false,
  });

  assert.equal(result.modelId, 'claude-sonnet-4-6');
  assert.equal(result.fallbackApplied, false);
  assert.equal(result.error, null);
});

test('fails fast when no provider for a non-Claude model', () => {
  const result = resolveRequestedModelForMode({
    modelId: 'gemini-3.1-pro-preview',
    userMode: 'selfhosted',
    hasProvider: false,
  });

  assert.equal(result.modelId, 'gemini-3.1-pro-preview');
  assert.equal(result.fallbackApplied, false);
  assert.match(result.error, /No enabled provider/i);
});

test('allows non-Claude models when provider is available', () => {
  const result = resolveRequestedModelForMode({
    modelId: 'gpt-4o',
    userMode: 'selfhosted',
    hasProvider: true,
  });

  assert.equal(result.modelId, 'gpt-4o');
  assert.equal(result.fallbackApplied, false);
  assert.equal(result.error, null);
});
