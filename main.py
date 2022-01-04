from typing import List, Dict, Tuple
import re
from dataclasses import dataclass
import uuid

from src.train_extractive import test_text_ext

"""
Main entry point to the model through main function.
"""

def clean(input_str, replacements):
  for replacement in replacements:
    input_str = re.sub(replacement[0], replacement[1], input_str)
  
  return input_str

def pre_clean(input_str: str) -> str:
  replacements = [
    (r'(e\.g\.|e\.x\.|i\.e\.)', ' for example '),
    (r'!?\[(.*?)\]', ' '),
    (r'[\[\]]', r''),
  ]
  return clean(input_str, replacements)


# prevents abbreviations from being considered sentences
# bracketed words
# stray brackets
def post_clean(input_str: str) -> str:
  replacements = [
    (r'(?m)^.*<notifications@github.com>.*', r''),  # removes reply to header
    (r'(?m)^[>].*', ''),  # Remove reply-to structure
    (r'\s(\w)\.\s', ' '),  # list enumerations
    (r'(\S+?)[@](.*?)[.]\w{2,3}', ' '),  # emails
    (r':*\+1:*|👍', ' thumbs up '),  # thumbs up reactions
    (r':*\-1:*|:\(', ' thumbs down '),  # thumbs down reactions
    (r'\.\.\.', '. '),  # ellipses
    (r'[><@_\-#-*`}{)(~$%^|/\"=]', ' '),  # remove extra punctuation
    (r'([\.,?!])(?=[a-zA-Z])', r'\1' + ' '),  # adds space between sentences
    (r' ( )+', r' '),  # Removes extra spaces
    (r'\s([?\.,!:])', r'\1'),  # Removes extra space before punctuation
    (r'(?<!\.)([?\.,!:\]])([^\.])?[?\.,!:]+(?!\.)', r'\1')  # removes double punctuation
  ]
  return clean(input_str, replacements)


@dataclass
class Artifact:
  type_: str
  data: str


def main(sentences: List[str]) -> str:
  """
  Inputs the text to be summarized. Uses Extractive Presumm model to summarize the input text.
  Performs the following tasks:
  1. Create tagged copy and cleaned copy of sentences along with artifacts store.
  2. Summarise cleaned copy of sentences - extract sentence IDs.
  3. Concat the sentences together and restore the necessary artifacts.
  """
  
  tagged_sentences, artifacts = preprocess(sentences)
  cleaned_sentences = replace_tags(tagged_sentences, artifacts)
  
  # TODO: Summarize cleaned sentences
  sentence_ids = summarise(cleaned_sentences)
  
  summary = replace_tags([tagged_sentences[i] for i in sentence_ids], artifacts, with_codewords=False)
  
  return " ".join(summary)


def preprocess(sentences: List[str]) -> Tuple[List[str], Dict[str, Artifact]]:
  """
  Preprocess comments by extracting & obfuscating artifacts with respective UUIDs.
  :return: preprocessed comment
  """
  
  def replace_artifact(type_: str, storage: Dict[str, Artifact] = None):
    if storage is None:
      raise ValueError("Storage required to store artifacts data. Provide Dict[str, Artifact].")
    
    def replace_format(id_, term):
      if type_ == "MD_URL":
        return f"[{term.group(1)}](ossu: {id_})"
      return f"(ossu: {id_})"
    
    def replace(term):
      id_ = uuid.uuid4().hex
      data = Artifact(type_=type_, data=term.group(0))
      
      storage[id_] = data
      return f"{replace_format(id_, term)}"
    
    return replace
  
  artifacts = {}
  tagged_sentences = []
  
  for sent in sentences:
    # remove markdown URLs
    name_regex = "[^]]+"
    url_regex = "http[s]?://[^)]+"
    markup_regex = '\[({0})]\(\s*({1})\s*\)'.format(name_regex, url_regex)
    text = re.sub(
      markup_regex,
      replace_artifact("MD_URL", storage=artifacts),
      sent
    )
    
    # remove other links
    link_regex = r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))"
    text = re.sub(link_regex, replace_artifact("URL", storage=artifacts), text)
    
    # remove large code blocks
    code_block_regex = re.compile(r'```([^`]+)```')
    text = re.sub(code_block_regex, replace_artifact("CODE", storage=artifacts), text)
    
    # remove short code blocks
    short_code_regex = re.compile(r'`([^`]+)`')
    text = re.sub(short_code_regex, replace_artifact("CODE", storage=artifacts), text)
    
    tagged_sentences.append(text)
  
  return tagged_sentences, artifacts


def replace_tags(tagged_sentences: List[str], artifacts: Dict[str, Artifact], with_codewords: bool = True) -> List[str]:
  def replace(term):
    if term.group(1) in artifacts:
      return artifacts[term.group(1)].type_ if with_codewords else artifacts[term.group(1)].data
    return term.group(0)
  
  id_pattern = re.compile('\(ossu: ([0-9a-f]{32})\)', re.I)
  
  cleaned_sentences = [re.sub(id_pattern, replace, sent) for sent in tagged_sentences]
  return cleaned_sentences


@dataclass
class Args:
  test_from: str
  text_src: str
  temp_dir: str = "temp"
  text_tgt: str = ''
  result_path: str = "test_results"
  
  batch_size: int = 140
  test_batch_size: int = 200
  max_ndocs_in_batch: int = 6
  
  max_pos: int = 512
  use_interval: bool = True
  large: bool = False
  load_from_extractive: str = ''
  
  sep_optim: bool = False
  lr_bert: float = 2e-3
  lr_dec: float = 2e-3
  use_bert_emb: bool = False
  
  share_emb: bool = False
  finetune_bert: bool = True
  dec_dropout: float = 0.2
  dec_layers: int = 6
  dec_hidden_size: int = 768
  dec_heads: int = 8
  dec_ff_size: int = 2048
  enc_hidden_size: int = 512
  enc_ff_size: int = 512
  enc_dropout: float = 0.2
  enc_layers: int = 6
  
  ext_dropout: float = 0.2
  ext_layers: int = 2
  ext_hidden_size: int = 768
  ext_heads: int = 8
  ext_ff_size: int = 2048
  
  label_smoothing: float = 0.1
  generator_shard_size: int = 32
  alpha: float = 0.6
  beam_size: int = 5
  min_length: int = 15
  max_length: int = 150
  max_tgt_len: int = 140
  
  param_init: float = 0
  param_init_glorot: bool = True
  optim: str = 'adam'
  lr: float = 1
  beta1: float = 0.9
  beta2: float = 0.999
  warmup_steps: int = 8000
  warmup_steps_bert: int = 8000
  warmup_steps_dec: int = 8000
  max_grad_norm: float = 0
  
  save_checkpoint_steps: int = 5
  accum_count: int = 1
  report_every: int = 1
  train_steps: int = 1000
  recall_eval: bool = False
  
  visible_gpus: str = "-1"
  gpu_ranks: str = '0'
  log_file: str = "logs/cnndm.log"
  seed: int = 666
  
  test_all: bool = False
  test_start_from: int = -1
  
  train_from: str = ''
  report_rouge: bool = True
  block_trigram: bool = True


def summarise(sentences: List[str]) -> List[int]:
  text = ' [CLS] [SEP] '.join(sentences)
  args = Args(
    test_from="bert_data/bertext_cnndm_transformer.pt",
    text_src=text,
    report_rouge=False,
    use_bert_emb=True,
    use_interval=True,
    log_file="logs/ext_log_cnndm",
    load_from_extractive="EXT_CKPT"
  )
  
  sentence_ids = test_text_ext(args)
  return sentence_ids
  


if __name__ == '__main__':
  # TODO: New line possible in each sentence
  sentences = [
    "But before I do that I have a question, you would want all tests from the three directories you linked above in the same `tests/selenium` directory? or you want them separated as they are now?",
    "so that the selenium directory is something like: ```\nselenium/base/\nselenium/notebook/\n``` Let me know if it's okay to start tackling the `notebook` directory and what structure do you prefer inside the new `tests/selenium` directory and I can start working on immediately.",
    "For now, let's keep the `tests/selenium` directory flat, placing files directly in there.",
    "We can easily rearrange it later if we need to divide them up, but I'm not convinced that the current way the JS tests are divided is that useful.Okay great!",
    "I'll start tackling the test files in the `tests/notebook` then, okay?Sounds good.",
    "@mpacer was looking at converting `markdown.js` from that folder, so if you want to start with another file, that would be good."
  ]

  print(main(sentences))
