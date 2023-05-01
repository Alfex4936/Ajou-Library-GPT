from typing import List, Tuple

from evaluation_utils import precision

# Replace with your own test cases
test_cases = [
    (["book_id_1", "book_id_2", "book_id_3"], ["book_id_1", "book_id_3", "book_id_4"]),
    (["book_id_2", "book_id_3", "book_id_4"], ["book_id_1", "book_id_2", "book_id_4"]),
]


def test_precision_k(test_cases: List[Tuple[List[str], List[str]]]):
    precisions = [
        precision(recommended_books, relevant_books)
        for recommended_books, relevant_books in test_cases
    ]

    average_precision = sum(precisions) / len(precisions)
    print(f"Average Precision@K: {average_precision:.2f}")


test_precision_k(test_cases)
test_precision_k(test_cases)
