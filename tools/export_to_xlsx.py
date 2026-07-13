#!/usr/bin/env python3
"""
export_to_xlsx.py — MRI Taxonomy Excel exporter (Python wrapper)

NOTE: Python is not required. The actual export is performed by the Node.js
script tools/export_to_xlsx.js using the exceljs library.

This wrapper calls the Node script so the file can be invoked as specified
in task instructions.

Usage (from project root):
    python tools/export_to_xlsx.py
    -- OR --
    node tools/export_to_xlsx.js
"""
import subprocess
import sys
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = os.path.join(project_root, "tools", "export_to_xlsx.js")

result = subprocess.run(
    ["node", script],
    cwd=project_root,
)
sys.exit(result.returncode)
