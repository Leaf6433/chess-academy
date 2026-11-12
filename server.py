"""Local Chess Academy HTTP server with headers needed by the full Stockfish worker.
Run: python server.py, then open http://localhost:8765
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import mimetypes
import os

ROOT = Path(__file__).resolve().parent
mimetypes.add_type('application/wasm', '.wasm')
mimetypes.add_type('text/javascript', '.js')

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    port=int(os.environ.get('PORT', '8765'))
    print(f'Chess Academy running at http://localhost:{port} (Ctrl+C to stop)', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=str(ROOT))).serve_forever()
