import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

handle_test = """
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

  const applyProfile = (profile: 'aggressive' | 'manual' | 'hybrid') => {
"""

content = content.replace("  const applyProfile = (profile: 'aggressive' | 'manual' | 'hybrid') => {", handle_test)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
