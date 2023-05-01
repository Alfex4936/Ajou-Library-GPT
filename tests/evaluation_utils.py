from typing import List, Tuple


def true_positive(recommended_books: List[str], relevant_books: List[str]) -> List[str]:
    return [book for book in recommended_books if book in relevant_books]


def false_positive(
    recommended_books: List[str], relevant_books: List[str]
) -> List[str]:
    return [book for book in recommended_books if book not in relevant_books]


def false_negative(
    recommended_books: List[str], relevant_books: List[str]
) -> List[str]:
    return [book for book in relevant_books if book not in recommended_books]


def precision(recommended_books: List[str], relevant_books: List[str]) -> float:
    tp = len(true_positive(recommended_books, relevant_books))
    fp = len(false_positive(recommended_books, relevant_books))

    return tp / (tp + fp) if tp + fp > 0 else 0


def recall(recommended_books: List[str], relevant_books: List[str]) -> float:
    tp = len(true_positive(recommended_books, relevant_books))
    fn = len(false_negative(recommended_books, relevant_books))

    return tp / (tp + fn) if tp + fn > 0 else 0


def f1_score(recommended_books: List[str], relevant_books: List[str]) -> float:
    p = precision(recommended_books, relevant_books)
    r = recall(recommended_books, relevant_books)

    return 2 * p * r / (p + r) if p + r > 0 else 0


def average_precision(recommended_books: List[str], relevant_books: List[str]) -> float:
    ap = 0
    tp = 0

    for k, book in enumerate(recommended_books, start=1):
        if book in relevant_books:
            tp += 1
            ap += precision(recommended_books[:k], relevant_books)

    return ap / len(relevant_books) if len(relevant_books) > 0 else 0


def mean_average_precision(test_cases: List[Tuple[List[str], List[str]]]) -> float:
    ap_sum = sum(
        average_precision(recommended_books, relevant_books)
        for recommended_books, relevant_books in test_cases
    )
    return ap_sum / len(test_cases) if len(test_cases) > 0 else 0
