with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

replacement = """        daemonSettings: {
          runOnStartup: settings.daemonSettings?.runOnStartup ?? false,
          autoScrobbleLocal: settings.daemonSettings?.autoScrobbleLocal ?? false,
          enableLocalMediaDetection: !settings.daemonSettings?.enableLocalMediaDetection
        }"""

content = content.replace("        daemonSettings: {\n          ...settings.daemonSettings,\n          enableLocalMediaDetection: !settings.daemonSettings?.enableLocalMediaDetection\n        }", replacement)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
