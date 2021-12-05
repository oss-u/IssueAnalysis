import re
import uuid
from dataclasses import dataclass
from typing import List, Tuple, Dict
from spacy.lang.en import English


@dataclass
class Artifact:
  type_: str
  data: str
  span: Tuple[int, int]


@dataclass
class Span:
  start: int
  end: int


class Sentencizer:
  """
  Sentencizes a comment and predicts the information type for each comment.
  Uses in-built sentencizer of SpaCy.
  """
  
  def __init__(self, model):
    self.model = model
    self.parser = English()
    self.parser.add_pipe(self.parser.create_pipe('sentencizer'))
    self.id_pattern = re.compile('\(ossu: ([0-9a-f]{32})\)', re.I)
  
  @staticmethod
  def clean_text(text: str) -> str:
    # Workaround for ignoring abbreviations on split - add a comma after the abbreviation
    text = re.sub(r"e\.g\.", "example", text)
    text = re.sub(r"etc\. ([a-z])", "etc, \g<1>", text)
    text = re.sub(r"i\.e\.", "that is,", text)
    # text = re.sub(r"\n([A-Z])"," . \g<1>",text)
    
    # Replace new lines, multiple spaces, and some weird end characters with a single space, so if there is a period before the new line, the sentences will be split, if not it is a run on sentence across multiple lines
    # text = re.sub(r"\n"," ",text)
    text = re.sub(r"[ \t]+", " ", text)
    
    text = re.sub(r"\xa0", " ", text)
    text = re.sub(r" \.$", ".", text)
    text = re.sub(r"👎", ":-1:", text)
    text = re.sub(r"👍", ":+1:", text)
    
    # Replace multiple consecutive commas with a single comma
    text = re.sub(r",+", ",", text)
    
    # Remove \n from beginning and end of line
    return text.strip("\n ")
  
  @staticmethod
  def replace_artifact(type_: str, tag_artifact: bool, storage: Dict[str, Artifact] = None):
    if tag_artifact and storage is None:
      raise ValueError("Storage required to store artifacts data. Provide Dict[str, Artifact].")
    
    def replace_format(id_, term):
      if tag_artifact:
        if type_ == "MD_URL":
          return f"[{term.group(1)}](ossu: {id_})"
        return f"(ossu: {id_})"
      else:
        if type_ == "MD_URL":
          return f"[{term.group(1)}] URL"
        return f" {type_} "
    
    def replace(term):
      if not tag_artifact:
        return replace_format(None, term)
      id_ = uuid.uuid4().hex
      data = Artifact(type_=type_, data=term.group(0), span=term.span(0))
      
      storage[id_] = data
      return f"{replace_format(id_, term)}"
    
    return replace
  
  @staticmethod
  def preprocess(comment: str, tag_artifact: bool) -> Tuple[str, Dict[str, Artifact]]:
    """
    Preprocess comments by extracting & obfuscating artifacts with respective UUIDs.
    :return: preprocessed comment
    """
    artifacts = {}
    
    # remove markdown URLs
    name_regex = "[^]]+"
    url_regex = "http[s]?://[^)]+"
    markup_regex = '\[({0})]\(\s*({1})\s*\)'.format(name_regex, url_regex)
    text = re.sub(
      markup_regex,
      Sentencizer.replace_artifact("MD_URL", tag_artifact=tag_artifact, storage=artifacts),
      comment
    )
    # text = re.sub(markup_regex, "[\\1] URL ", comment)
    
    # remove other links
    link_regex = r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))"
    text = re.sub(link_regex, Sentencizer.replace_artifact("URL", tag_artifact=tag_artifact, storage=artifacts), text)
    
    # remove large code blocks
    code_block_regex = re.compile(r'```([^`]+)```')
    text = re.sub(code_block_regex, Sentencizer.replace_artifact("CODE", tag_artifact=tag_artifact, storage=artifacts),
                  text)
    
    # remove short code blocks
    short_code_regex = re.compile(r'`([^`]+)`')
    text = re.sub(short_code_regex, Sentencizer.replace_artifact("CODE", tag_artifact=tag_artifact, storage=artifacts),
                  text)
    
    return text, artifacts
  
  def sentencize(self, comment: str) -> List[Span]:
    processed_comment, artifacts = Sentencizer.preprocess(comment, tag_artifact=True)
    sentences = self.parser(processed_comment).sents
    
    # collecting sentence span in actual comment
    sentences_span = []
    acc_offset, start = 0, 0
    for sent in sentences:
      end = sent.end_char
      local_offset = 0
      for term in re.findall(self.id_pattern, sent.text):
        if term in artifacts:
          effective_data_len = len(artifacts[term].data)
          if artifacts[term].type_ == "MD_URL":   # workaround for special markdown urls
            effective_data_len += 2
            
          local_offset += effective_data_len - (32 + 8)
          end = end - (32 + 8) + effective_data_len
      
      sentences_span.append(Span(start=start, end=end+acc_offset))
      
      start = end + acc_offset + 1
      acc_offset += local_offset
    
    return sentences_span
  
  def predict(self, sentences: List[str]) -> List[str]:
    return self.model.predict([
      Sentencizer.clean_text(Sentencizer.preprocess(sent, tag_artifact=False)[0])
      for sent in sentences
    ])
