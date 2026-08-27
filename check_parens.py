import sys

def check(text):
    stack = []
    lines = text.split('\n')
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '({[':
                stack.append((char, i+1, j+1))
            elif char in ')}]':
                if not stack:
                    return f"Unexpected {char} at line {i+1} col {j+1}"
                top, l, c = stack.pop()
                expected = {'(': ')', '{': '}', '[': ']'}[top]
                if char != expected:
                    return f"Expected {expected} to match {top} at line {l} col {c}, but got {char} at line {i+1} col {j+1}"
    if stack:
        top, l, c = stack[-1]
        return f"Unclosed {top} at line {l} col {c}"
    return "OK"

with open("src/components/SyncMatrixView.tsx", "r") as f:
    # Just basic matching, ignoring strings and comments (which is rough)
    import re
    text = f.read()
    # Strip string literals and comments
    text = re.sub(r'".*?"', '""', text)
    text = re.sub(r"'.*?'", "''", text)
    text = re.sub(r'//.*', '', text)
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    print(check(text))
