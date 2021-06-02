import pandas
import json
from os import listdir
from os.path import isfile, join

data_dir = 'dataset/raw/JupyterNotebook'

def get_files(dir_path:str) -> list:
    '''Get names of all files in the directory as a list'''
    return [join(dir_path, f) for f in listdir(dir_path) if isfile(join(dir_path, f))]


def read_json_file(file_path:str):
    try:
        return json.load(open(f))
    except json.decoder.JSONDecodeError:
        return None

data = []
for f in get_files(data_dir):
    data.append(read_json_file(f))

# Removing empty txts
data = [d for d in data if d]

data_df = pandas.DataFrame(data)

print(len(data_df), len(data))