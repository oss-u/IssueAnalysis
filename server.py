import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

import torch

from src.args import Args
from src.main import main
from src.models.model_builder import ExtSummarizer
from src.models.trainer_ext import build_trainer

hostname = "localhost"
port = 8080

# model initialization
args = Args(
  test_from="src/bert_data/bertext_cnndm_transformer_cleaned.pt",
  text_src='',      # fill later
  report_rouge=False,
  use_bert_emb=True,
  use_interval=True,
  log_file="logs/ext_log_cnndm",
  load_from_extractive="EXT_CKPT"
)
model_flags = ['hidden_size', 'ff_size', 'heads', 'inter_layers', 'encoder', 'ff_actv', 'use_interval', 'rnn_size']
start = time.time()
checkpoint = torch.load(args.test_from, map_location=lambda storage, loc: storage)
print(f"Checkpoint loading time: {time.time() - start}s")
opt = vars(checkpoint['opt'])
for k in opt.keys():
  if (k in model_flags):
    setattr(args, k, opt[k])

device = "cpu" if args.visible_gpus == '-1' else "cuda"
device_id = 0 if device == "cuda" else -1

start = time.time()
model = ExtSummarizer(args, device, checkpoint)
print(f"Model instance time taken: {time.time() - start}s")
model.eval()

start = time.time()
trainer = build_trainer(args, device_id, model, None)
print(f"Time to build trainer: {time.time() - start}s")


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

    args.text_src = ' [CLS] [SEP] '.join(sentences)

    data = {
      "summary": main(sentences, trainer, args),
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
