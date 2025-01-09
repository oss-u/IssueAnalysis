# Summarization Engine
This branch contains code for training the summarization model and inference service. 

The training code is adapted from EMNLP 2019 paper [Text Summarization with Pretrained Encoders](https://arxiv.org/abs/1908.08345) ([Code](https://github.com/nlpyang/PreSumm)) which in turn borrows code from [ONMT](https://github.com/OpenNMT/OpenNMT-py). 

## Model Training 
The trained models are available on the [Google Drive](https://drive.google.com/drive/folders/1t6H-pcTHhoybh7HjG8Q8SvIQehWWtYL1?usp=sharing). You can copy these models them to `models/` directory and use for inference. 

To train the model, follow the following steps.

## Data Preparation
Follow the data preparation steps in https://github.com/nlpyang/PreSumm.

## Model Training
The steps are similar to PreSumm, with changes to encode longer text.To encoding a text longer than 512 tokens, set max_pos to 1000 during both preprocessing and training. The `train.py` script is located in `src/`.  

### Extractive Setting
```
python train.py -task ext -mode train -bert_data_path BERT_DATA_PATH -ext_dropout 0.1 -model_path MODEL_PATH -lr 2e-3 -visible_gpus 0,1,2 -report_every 50 -save_checkpoint_steps 1000 -batch_size 3000 -train_steps 50000 -accum_count 2 -log_file ../logs/ext_bert_cnndm -use_interval true -warmup_steps 10000 -max_pos 1000
```

### Abstractive Setting
#### TransformerAbs (baseline)
```
python train.py -mode train -accum_count 5 -batch_size 300 -bert_data_path BERT_DATA_PATH -dec_dropout 0.1 -log_file ../../logs/cnndm_baseline -lr 0.1 -model_path MODEL_PATH -save_checkpoint_steps 2000 -seed 777 -sep_optim false -train_steps 200000 -use_bert_emb true -use_interval true -warmup_steps 8000  -visible_gpus 0,1,2,3 -max_pos 1000 -report_every 50 -enc_hidden_size 512  -enc_layers 6 -enc_ff_size 2048 -enc_dropout 0.1 -dec_layers 6 -dec_hidden_size 512 -dec_ff_size 2048 -encoder baseline -task abs
```
#### BertAbs
```
python train.py  -task abs -mode train -bert_data_path BERT_DATA_PATH -dec_dropout 0.2  -model_path MODEL_PATH -sep_optim true -lr_bert 0.002 -lr_dec 0.2 -save_checkpoint_steps 2000 -batch_size 140 -train_steps 200000 -report_every 50 -accum_count 5 -use_bert_emb true -use_interval true -warmup_steps_bert 20000 -warmup_steps_dec 10000 -max_pos 1000 -visible_gpus 0,1,2,3  -log_file ../logs/abs_bert_cnndm
```
#### BertExtAbs
```
python train.py  -task abs -mode train -bert_data_path BERT_DATA_PATH -dec_dropout 0.2  -model_path MODEL_PATH -sep_optim true -lr_bert 0.002 -lr_dec 0.2 -save_checkpoint_steps 2000 -batch_size 140 -train_steps 200000 -report_every 50 -accum_count 5 -use_bert_emb true -use_interval true -warmup_steps_bert 20000 -warmup_steps_dec 10000 -max_pos 1000 -visible_gpus 0,1,2,3 -log_file ../logs/abs_bert_cnndm  -load_from_extractive EXT_CKPT   
```
`EXT_CKPT` is the saved `.pt` checkpoint of the extractive model.

## Start Inference Service
Once the model is trained, make sure it is located under `src/bert_data/`. Then you can start the service my running 
```python
python server.py
```

To deploy as GCP Cloud Function, run
```bash
gcloud functions deploy gen_summary --region=us-central1 --allow-unauthenticated --entry-point=generate_summary --runtime=python38 --memory=8192 --env-vars-file=.env.yaml --max-instances=2 --trigger-http --timeout=540
```