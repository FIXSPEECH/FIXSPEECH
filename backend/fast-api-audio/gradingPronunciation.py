from difflib import SequenceMatcher
from pydantic import BaseModel


class Difference(BaseModel):
    operation: str
    answer_text: str
    user_text: str
    answer_position: tuple
    user_postion: tuple


class PronunciationResult(BaseModel):
    similarity: float
    differences: list[Difference]


def create_index_map(text: str):
    # 띄어쓰기가 포함된 텍스트에서 띄어쓰기를 제거한 텍스트의 인덱스를 원본 인덱스에 매핑
    index_map = []
    count = 0
    for i, char in enumerate(text):
        if char != " ":
            index_map.append(i)
            count += 1
    return index_map

def compare_texts(answer_text: str, user_text: str):
    # 두 한글 문자열을 비교하여 유사도를 측정하고 틀린 부분을 추출합니다.
    answer_map = create_index_map(answer_text)
    user_map = create_index_map(user_text)
    
    # 띄어쓰기 삭제버전
    answer_text_nospace = answer_text.replace(" ", "")
    user_text_nospace = user_text.replace(" ", "") 
    
    # 유사도 계산
    matcher = SequenceMatcher(None, answer_text_nospace, user_text_nospace)
    similarity = matcher.ratio()
    
    # 차이점 추출 (equal 제외)
    differences = []
    for opcode, a0, a1, b0, b1 in matcher.get_opcodes():
        
        # 위치 계산
        answer_start = answer_map[a0] if a0 < len(answer_map) else None
        answer_end = answer_map[a1 - 1] + 1 if a1 - 1 < len(answer_map) else None
        user_start = user_map[b0] if b0 < len(user_map) else None
        user_end = user_map[b1 - 1] + 1 if b1 - 1 < len(user_map) else None
        
        # `replace`를 삽입/삭제로 재분류
        if opcode == "replace" and (a1 - a0 != b1 - b0):  # 길이가 다르면 삽입/삭제 가능성
            if a1 - a0 == 0:  # 정답 텍스트가 비어 있음 -> insert
                opcode = "insert"
            elif b1 - b0 == 0:  # 사용자 텍스트가 비어 있음 -> delete
                opcode = "delete"
        
        # 차이점 저장
        differences.append(Difference(
            operation=opcode,
            answer_text=answer_text[answer_start:answer_end] if answer_start is not None and answer_end is not None else "",
            user_text=user_text[user_start:user_end] if user_start is not None and user_end is not None else "",
            answer_position=(answer_start, answer_end),
            user_postion=(user_start, user_end)
        ))
    return PronunciationResult(similarity=similarity, differences=differences)

