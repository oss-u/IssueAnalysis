import os
import re
import configparser
from datetime import datetime
from github import Github

def read_auth_from_config():
    config = configparser.ConfigParser()
    if os.path.isfile('cred.conf'):
        config.read('cred.conf')
        user = config['auth']['username']
        pwd = config['auth']['password']
        token = config['auth']['token']
        return user, pwd, token

def authenticate(token):
    if not token:
        try:
            user, pwd, token = read_auth_from_config()
        except Exception as e:
            print("Config error.")
    return Github(token)

def clean_string(line):
    if line.startswith('![') and line.endswith(')'):
        l = "<image>"
        return l
    # replace emojis with tokens
    l = re.sub(r':.{1,8}:', '<emoji>', line)
    # replace users with tokens
    l = re.sub(r'@\w*', '<user>', l)
    # replace italics
    l = re.sub(r'(_)(.*)(_)', r'\2', l)
    # replace urls
    l = re.sub(r'http(s)?:\/\/.*', '<url>', l)
    return l

repo_name = 'jupyter_notebook'

gh = authenticate(read_auth_from_config()[2])
repo = gh.get_repo("/".join(repo_name.split('_')))

pull_req_number = 1160

pull = repo.get_pull(pull_req_number) # https://github.com/jupyter/notebook/pull/1160
comments = pull.get_issue_comments()

thread = []
init_comment = []
for line in pull.body.split('\n'): 
    if line:
        init_comment.append(clean_string(line))
init_comment = " ".join(init_comment)
thread.append((pull.created_at.strftime("%M:%S"), pull.user.login, init_comment))

for comment in comments:
    body = comment.body.split('\n')
    cleaned = []
    for line in body:
        # Remove blank lines
        if line:
            # remove quotes
            if line.startswith('>'):
                continue
            cleaned.append(clean_string(line))
    cleaned = " ".join(cleaned)
    thread.append((comment.created_at.strftime("%M:%S"), comment.user.login, cleaned))

with open(f'../dataset/raw/detailed/{repo_name}/{pull_req_number}.raw.txt', 'w') as f:
    for ic in thread:
        line = f"[{ic[0]}] <{ic[1]}> {ic[2]}\n"
        f.write(line)