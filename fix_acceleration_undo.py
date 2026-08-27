with open('electron-main.js', 'r') as f:
    content = f.read()

# I will just restore it from git if possible, or manually fix the end and move the hardware acceleration check.
