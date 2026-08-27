with open("src/components/SyncMatrixView.tsx", "r") as f:
    content = f.read()

content = content.replace("      }\n          )}", "          )}")

with open("src/components/SyncMatrixView.tsx", "w") as f:
    f.write(content)
