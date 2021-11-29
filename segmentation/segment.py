import re
import uuid
from collections import defaultdict
from dataclasses import dataclass
from typing import List, Callable, Tuple, Dict


@dataclass
class Artifact:
  type_: str
  data: str


@dataclass
class Prediction:
  sentence: str
  info_type: str


class Comment:
  """
  Comment class to maintain line segmented comment with artifacts.
  """
  
  def __init__(self, comment: str):
    self.comment = comment
    self.artifacts = {}
    self.sentences = Comment.extract_lines_from_text(self.preprocess_comment())
  
  def tag_artifacts(self, type_: str) -> Callable[[re.Match], str]:
    def tag_format(id_: str) -> str:
      return f"(ossu: {id_})"
    
    def replace(term: re.Match) -> str:
      id_ = uuid.uuid4().hex
      data = Artifact(type_=type_, data=term.group(0))
      
      self.artifacts[id_] = data
      return f" {tag_format(id_)} "
    
    return replace
  
  def preprocess_comment(self) -> str:
    """
    Preprocess comments by extracting & obfuscating artifacts with respective UUIDs.
    :return: preprocessed comment
    """
    # remove markdown URLs
    name_regex = "[^]]+"
    url_regex = "http[s]?://[^)]+"
    markup_regex = '\[({0})]\(\s*({1})\s*\)'.format(name_regex, url_regex)
    text = re.sub(markup_regex, "[\\1] URL ", self.comment)

    # remove other links
    link_regex = r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))"
    text = re.sub(link_regex, self.tag_artifacts("URL"), text)

    # remove large code blocks
    code_block_regex = re.compile(r'```([^`]+)```')
    text = re.sub(code_block_regex, self.tag_artifacts("CODE"), text)

    # remove short code blocks
    short_code_regex = re.compile(r'`([^`]+)`')
    text = re.sub(short_code_regex, self.tag_artifacts("CODE"), text)

    return text
  
  def get_obfuscated_sentences(self) -> List[str]:
    return self.sentences
  
  def get_actual_sentences(self) -> List[str]:
    """
    Returns actual sentences after replacing artifact tags with actual artifacts
    :return: list of sentences
    """
    
    def replace_tags(term: re.Match) -> str:
      if term.group(1) in self.artifacts:
        return self.artifacts[term.group(1)].data
      return term.group(0)
    
    pattern = re.compile(' ?\(ossu: ([0-9a-f]{32})\) ?', re.I)
    sents = [re.sub(pattern, replace_tags, sent) for sent in self.sentences]
    
    return sents
  
  def get_codeword_sentences(self) -> Tuple[List[str], Dict[str, List[Artifact]]]:
    """
    Returns actual sentences after replacing artifact tags with corresponding codewords
    :return: list of sentences
    """
    artifacts_matrix = defaultdict(list)
    pattern = re.compile('\(ossu: ([0-9a-f]{32})\)', re.I)
    
    def replace_and_construct(idx: int) -> Callable[[re.Match], str]:
      def replace(term: re.Match) -> str:
        if term.group(1) in self.artifacts:
          artifacts_matrix[idx].append(self.artifacts[term.group(1)])
          return self.artifacts[term.group(1)].type_
        return term.group(0)
      return replace
    
    sents = [re.sub(pattern, replace_and_construct(idx), sent) for (idx, sent) in enumerate(self.sentences)]
    
    return sents, artifacts_matrix
  
  def get_predictions(self, model) -> List[Prediction]:
    predictions = model.predict([Comment.clean_text(sent) for sent in self.get_codeword_sentences()[0]])
    return [Prediction(sent, pred) for sent, pred in zip(self.get_actual_sentences(), predictions)]
  
  @staticmethod
  def clean_text(text: str) -> str:
    """
    Cleans text. Code inspired from the paper
    `Analysis and Detection of Information Types of Open Source Software Issue Discussions` by Arya D., et al.
    :param text: text to be cleaned
    :return: cleaned text
    """
    
    # Workaround for ignoring abbreviations on split - add a comma after the abbreviation
    text = re.sub(r"e\.g\.", "example", text)
    text = re.sub(r"etc\. ([a-z])", "etc, \g<1>", text)
    text = re.sub(r"i\.e\.", "that is,", text)
    # text = re.sub(r"\n([A-Z])"," . \g<1>",text)
    
    # Replace new lines, multiple spaces, and some weird end characters with a single space,
    # so if there is a period before the new line, the sentences will be split,
    # if not it is a run on sentence across multiple lines
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
  def extract_lines_from_text(clean_text) -> List[str]:
    """
    Extract lines using special delimiter. Code inspired from the paper
    `Analysis and Detection of Information Types of Open Source Software Issue Discussions` by Arya D., et al.
    :param clean_text: clean text
    :return: a list of sentences
    """
    sentences = []
    
    # Note: Not splitting on "? " because in regex
    # ? is treated as a special character so some of the regexes get split.
    for line in re.split("[\.!?\n]", clean_text):
      # Actual splitting: For every line obtained using the standard regex splitter on '.' and '!',
      # if the line does NOT end in a period, add one at the end
      if not line.strip() or line.strip()[-1] != '.':
        line_to_add = line.strip() + "."
      # if it does, then, replace any instances of multiple consecutive periods
      # at the end of the line with a single period
      else:
        line = re.sub(r"\.+$", ".", line)
        line_to_add = line.strip()
      
      # if the line is not just a single period (i.e. nearly empty), then add it to the list of extracted sentences
      if line_to_add != '.':
        sentences.append(line_to_add)
    return sentences
