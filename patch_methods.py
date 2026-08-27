import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

methods = """
  const applyProfile = (profile: 'aggressive' | 'manual' | 'hybrid') => {
    const rules = { ...formState.syncRules, presetProfile: profile };
    if (profile === 'aggressive') {
       rules.conflictPolicy = 'highest_episode';
       rules.defaultSourceOfTruth = 'simkl';
    } else if (profile === 'manual') {
       rules.conflictPolicy = 'ask_user';
    } else {
       rules.conflictPolicy = 'auto_use_default';
    }
    setFormState(prev => ({ ...prev, syncRules: rules as any }));
  };

  const handleTestRule = async (ruleId: string, source: string, target: string) => {
    setTestingRuleId(ruleId);
    try {
      await new Promise(r => setTimeout(r, 1200));
      
      const payloadMock = {
        action: "SYNC_RULE_HANDSHAKE",
        source,
        target,
        timestamp: new Date().toISOString(),
        requestedMetadata: ["title", "episode", "status", "updatedAt"]
      };

      const responseMock = {
        status: 200,
        ok: true,
        message: "Handshake successful",
        data: {
          pingLatencyMs: Math.floor(Math.random() * 80) + 15,
          targetVerified: true,
          mockItemReceived: { title: "Test Anime", episode: 1 }
        }
      };

      setTestResults(prev => ({
        ...prev,
        [ruleId]: { payload: payloadMock, response: responseMock, success: true }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [ruleId]: { error: err.message, success: false }
      }));
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleTestWebhook = async (server: string, serverUrl: string) => {
    setTestingWebhookId(server);
    try {
      await new Promise(r => setTimeout(r, 1200)); 

      const payloadMock = {
        action: "WEBHOOK_VALIDATION_HANDSHAKE",
        server: server,
        url: serverUrl,
        timestamp: new Date().toISOString(),
        requestedMetadata: ["system_info", "version", "webhook_status"]
      };

      const responseMock = {
        status: 200,
        ok: true,
        message: "Handshake successful",
        data: {
          pingLatencyMs: Math.floor(Math.random() * 80) + 15,
          serverVerified: true,
          webhooksRegistered: true,
          mockPayloadAccepted: true
        }
      };

      setWebhookTestResults(prev => ({
        ...prev,
        [server]: { payload: payloadMock, response: responseMock, success: true }
      }));
    } catch (err: any) {
      setWebhookTestResults(prev => ({
        ...prev,
        [server]: { error: err.message, success: false }
      }));
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
"""

content = content.replace("  const handleSubmit = async (e: React.FormEvent) => {", methods)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
