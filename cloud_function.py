import torch
import time

from src.args import Args
from src.main import main
from src.models.model_builder import ExtSummarizer
from src.models.trainer_ext import build_trainer

# global variables for caching
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


def generate_summary(request):
  body = request.json()

  if body['type'] == 'top-level':
    response = []
    for sentence_set in body['sentence_set']:
      sentences = []
      sentence_id_mapping = []
      for sentence in sentence_set['sentences']:
        sentences.append(sentence['text'])
        sentence_id_mapping.append((sentence['sentence_id'], sentence['text']))
    
      summary, sentence_ids = main(sentences, trainer, args)
    
      response_info_type = {
        'info_type': sentence_set['info_type'],
        'sentences': []
      }
    
      previous = 0
      for sentence_index in sentence_ids:
        response_info_type['sentences'].append({
          'id': sentence_id_mapping[sentence_index][0],
          'span': {
            'start': previous,
            'end': previous + len(sentence_id_mapping[sentence_index][1])
          }
        })
      
        previous += len(sentence_id_mapping[sentence_index][1]) + 1
    
      response.append(response_info_type)
  
    return {
      'summaries': response
    }
  elif body['type'] == 'comment-level':
    sentences = body['sentence_set']
    return {
      'summary': main(sentences, trainer, args)
    }
