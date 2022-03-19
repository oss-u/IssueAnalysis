from dataclasses import dataclass


@dataclass
class Args:
  test_from: str
  text_src: str
  temp_dir: str = "/tmp/"
  text_tgt: str = ''
  result_path: str = "test_results"
  model_path: str = "src/models/"
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

  world_size: int = 1
