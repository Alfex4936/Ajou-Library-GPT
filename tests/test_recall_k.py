from typing import List, Tuple

from evaluation_utils import recall

# Replace with your own test cases
test_cases = [
    (["book_id_1", "book_id_2", "book_id_3"], ["book_id_1", "book_id_3", "book_id_4"]),
    (["book_id_2", "book_id_3", "book_id_4"], ["book_id_1", "book_id_2", "book_id_4"]),
]


def test_recall_k(test_cases: List[Tuple[List[str], List[str]]]):
    recalls = [
        recall(recommended_books, relevant_books)
        for recommended_books, relevant_books in test_cases
    ]

    average_recall = sum(recalls) / len(recalls)
    print(f"Average Recall@K: {average_recall:.2f}")


test_recall_k(test_cases)
test_recall_k(test_cases)
