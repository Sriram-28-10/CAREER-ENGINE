"""
run_servers.py
Launches Python FastAPI backend on http://localhost:8000
and Next.js frontend on http://localhost:3000 concurrently.
"""

import os
import sys
import subprocess
import time

def find_node_bin():
    possible_paths = [
        r"C:\Program Files\nodejs",
        r"C:\Users\user\.node_portable\node-v20.12.2-win-x64",
    ]
    for p in possible_paths:
        if os.path.exists(os.path.join(p, "node.exe")):
            return p
    return None

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Update PATH to include node bin
    node_dir = find_node_bin()
    env = os.environ.copy()
    if node_dir:
        env["PATH"] = node_dir + os.pathsep + env.get("PATH", "")

    python_venv = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    if not os.path.exists(python_venv):
        python_venv = sys.executable

    print("🚀 Launching Career Readiness Twin Application...")
    print(f"🔹 Backend: FastAPI on http://localhost:8000")
    print(f"🔹 Frontend: Next.js 16 on http://localhost:3000")
    print("Press Ctrl+C to terminate both servers.\n")

    # Start FastAPI Backend
    backend_cmd = [python_venv, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir, env=env)

    # Start Next.js Frontend
    npm_bin = os.path.join(node_dir, "npm.cmd") if node_dir and os.path.exists(os.path.join(node_dir, "npm.cmd")) else "npm"
    frontend_cmd = [npm_bin, "run", "dev", "--", "-p", "3000"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir, env=env, shell=True)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Terminating servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
