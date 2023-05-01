from typing import List, Tuple

from evaluation_utils import mean_average_precision

# Replace with your own test cases
test_cases = [
    (["book_id_1", "book_id_2", "book_id_3"], ["book_id_1", "book_id_3", "book_id_4"]),
    (["book_id_2", "book_id_3", "book_id_4"], ["book_id_1", "book_id_2", "book_id_4"]),
]


def test_map(test_cases: List[Tuple[List[str], List[str]]]):
    mAP = mean_average_precision(test_cases)
    print(f"Mean Average Precision (mAP): {mAP:.2f}")


test_map(test_cases)
test_map(test_cases)
