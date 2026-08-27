import json

with open('package.json', 'r') as f:
    pkg = json.load(f)

# Update build block
pkg['build']['appId'] = "net.itsjc.asynx"
pkg['build']['productName'] = "ASynX"

pkg['build']['win'] = {
    "target": ["appx"]
}

pkg['build']['appx'] = {
    "applicationId": "ASynX",
    "identityName": "JhayceFrancis.ASynX",
    "publisher": "CN=33482D18-0B96-40AB-8B34-80CCD0733481",
    "publisherDisplayName": "JhayceFrancis",
    "displayName": "ASynX",
    "backgroundColor": "#1A1A24"
}

# Remove legacy installers if any
if 'nsis' in pkg['build']:
    del pkg['build']['nsis']
if 'squirrel' in pkg['build']:
    del pkg['build']['squirrel']

with open('package.json', 'w') as f:
    json.dump(pkg, f, indent=2)

