import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    lines = f.readlines()

def check():
    stack = []
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                stack.append(('{', i+1))
            elif char == '}':
                if not stack or stack[-1][0] != '{':
                    print(f"Unmatched }} at line {i+1}")
                else:
                    stack.pop()
            elif char == '(':
                stack.append(('(', i+1))
            elif char == ')':
                if not stack or stack[-1][0] != '(':
                    print(f"Unmatched ) at line {i+1}")
                else:
                    stack.pop()
            elif char == '[':
                stack.append(('[', i+1))
            elif char == ']':
                if not stack or stack[-1][0] != '[':
                    print(f"Unmatched ] at line {i+1}")
                else:
                    stack.pop()

check()
