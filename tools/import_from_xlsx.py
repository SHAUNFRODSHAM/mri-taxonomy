#!/usr/bin/env python3
"""
import_from_xlsx.py — MRI Taxonomy Excel importer (Python wrapper)

NOTE: Python is not required. The actual import is performed by the Node.js
script tools/import_from_xlsx.js using the exceljs library.

This wrapper calls the Node script so the file can be invoked as specified
in task instructions.

Usage (from project root):
    python tools/import_from_xlsx.py
    -- OR --
    node tools/import_from_xlsx.js
"""
import subprocess
import sys
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = os.path.join(project_root, "tools", "import_from_xlsx.js")

result = subprocess.run(
    ["node", script],
    cwd=project_root,
)
sys.exit(result.returncode)
