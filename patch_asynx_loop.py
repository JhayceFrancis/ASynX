import re

with open('src/components/ASynX (loop).svg', 'r') as f:
    content = f.read()

# Change the background fill from rgba(234,254,255,0.82) to transparent, or just remove the fill attribute
content = content.replace('fill="rgba(234,254,255,0.82)"', 'fill="transparent"')

with open('src/components/ASynX (loop).svg', 'w') as f:
    f.write(content)

print("Patched ASynX (loop).svg")
