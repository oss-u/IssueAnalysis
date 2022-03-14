from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from src.main import main

hostname = "localhost"
port = 8080


class ModelServer(BaseHTTPRequestHandler):
  def do_GET(self):
    self.send_response(200)
    self.send_header("Content-type", "application/json")
    self.end_headers()

    sentences = [
      "But before I do that I have a question, you would want all tests from the three directories you linked above in the same `tests/selenium` directory? or you want them separated as they are now?",
      "so that the selenium directory is something like: ```\nselenium/base/\nselenium/notebook/\n``` Let me know if it's okay to start tackling the `notebook` directory and what structure do you prefer inside the new `tests/selenium` directory and I can start working on immediately.",
      "For now, let's keep the `tests/selenium` directory flat, placing files directly in there.",
      "We can easily rearrange it later if we need to divide them up, but I'm not convinced that the current way the JS tests are divided is that useful.Okay great!",
      "I'll start tackling the test files in the `tests/notebook` then, okay?Sounds good.",
      "@mpacer was looking at converting `markdown.js` from that folder, so if you want to start with another file, that would be good."
    ]
    data = {
      "summary": main(sentences),
      "status": 200
    }

    self.wfile.write(bytes(json.dumps(data), "utf-8"))


if __name__ == '__main__':
  webserver = HTTPServer((hostname, port), ModelServer)
  print(f"Server started at http://{hostname}:{port}/")

  try:
    webserver.serve_forever()
  except KeyboardInterrupt:
    webserver.server_close()
    print("Server stopped.")
