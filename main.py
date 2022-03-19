import os
import time
import google.cloud.logging
import logging

import torch

from src.args import Args
from src.main import main
from src.models.model_builder import ExtSummarizer
from src.models.trainer_ext import build_trainer


client = google.cloud.logging.Client()
client.setup_logging()

class SummarizationModel:
  def __init__(self, model_path: str):
    logging.info(f"Model to be loaded from {model_path}")
    self.args = Args(
      test_from=model_path,
      text_src='',      # fill later
      report_rouge=False,
      use_bert_emb=True,
      use_interval=True,
      log_file="logs/ext_log_cnndm",
      load_from_extractive="EXT_CKPT"
    )
    self.model_flags = ['hidden_size', 'ff_size', 'heads', 'inter_layers', 'encoder', 'ff_actv', 'use_interval', 'rnn_size']
    
    start = time.time()
    self.checkpoint = torch.load(self.args.test_from, map_location=lambda storage, loc: storage)
    logging.info(f"Checkpoint loading time: {time.time() - start}s")

    self.opt = vars(self.checkpoint['opt'])
    for k in self.opt.keys():
      if (k in self.model_flags):
        setattr(self.args, k, self.opt[k])

    self.device = "cpu" if self.args.visible_gpus == '-1' else "cuda"
    self.device_id = 0 if self.device == "cuda" else -1

    start = time.time()
    self.model = ExtSummarizer(self.args, self.device, self.checkpoint)
    logging.info(f"Model instance time taken: {time.time() - start}s")
    self.model.eval()

    start = time.time()
    self.trainer = build_trainer(self.args, self.device_id, self.model, None)
    logging.info(f"Time to build trainer: {time.time() - start}s")

model_collection = None

def init_model():
  global model_collection
  
  logging.info("Initializing model...")
  
  path = download_model_file()
  model_collection = SummarizationModel(model_path=path)
  

def download_model_file() -> str:

    from google.cloud import storage

    logging.info("Downloading model...")

    # Model Bucket details
    BUCKET_NAME = os.getenv("bucket")
    PROJECT_ID = os.getenv("project_id")
    GCS_MODEL_FILE = os.getenv("model_file")
    
    # Initialise a client
    client = storage.Client(PROJECT_ID)
    
    # Create a bucket object for our bucket
    bucket = client.get_bucket(BUCKET_NAME)
    
    # Create a blob object from the filepath
    blob = bucket.blob(GCS_MODEL_FILE)
    
    folder = '/tmp/'
    if not os.path.exists(folder):
      os.makedirs(folder)
    # Download the file to a destination
    dest_path = folder + GCS_MODEL_FILE
    blob.download_to_filename(dest_path)
    return dest_path


def generate_summary(request):
  global model_collection
  
  if not model_collection:
    init_model()
  
  body = request.get_json()

  if body['type'] == 'top-level':
    logging.info("Processing for top-level summary...")
    
    response = []
    for sentence_set in body['sentence_set']:
      sentences = []
      sentence_id_mapping = []
      for sentence in sentence_set['sentences']:
        sentences.append(sentence['text'])
        sentence_id_mapping.append((sentence['sentence_id'], sentence['text']))
    
      summary, sentence_ids = main(sentences, model_collection.trainer, model_collection.args)
    
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
    logging.info("Processing for comment-level summary...")
    
    sentences = body['sentence_set']
    return {
      'summary': main(sentences, model_collection.trainer, model_collection.args)
    }
