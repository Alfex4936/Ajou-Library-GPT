from typing import List, Tuple

from evaluation_utils import f1_score

# 기계학습
test_cases = [
    (["book_id_1", "book_id_2", "book_id_3"], ["book_id_1", "book_id_3", "book_id_4"]),
    (["book_id_2", "book_id_3", "book_id_4"], ["book_id_1", "book_id_2", "book_id_4"]),
]


def test_f1_score_k(test_cases: List[Tuple[List[str], List[str]]]):
    f1_scores = [
        f1_score(recommended_books, relevant_books)
        for recommended_books, relevant_books in test_cases
    ]

    average_f1_score = sum(f1_scores) / len(f1_scores)
    print(f"Average F1 Score@K: {average_f1_score:.2f}")


test_f1_score_k(test_cases)
test_f1_score_k(test_cases)
