with open("src/components/SyncMatrixView.tsx", "r") as f:
    content = f.read()

content = content.replace("            </div>\n          )}\n        </div>", "            </div>\n          }\n        </div>")

with open("src/components/SyncMatrixView.tsx", "w") as f:
    f.write(content)
