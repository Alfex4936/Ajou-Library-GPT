# AjouLibraGPT

아주대학교 도서관 도서 추천 시스템

```md
### 도서관 검색: GPT를 공부하고 싶어
### GPT-4가 생성한 쿼리:
 - GPT
 - GPT 학습
 - GPT 이해하기
 - GPT 기초
 - GPT 공부
 - GPT 모델
 - GPT 알고리즘
 - Transformer
 - Transformer 구조
 - Transformer 기초
 - Transformer 공부
 - 인공지능
 - 자연어 처리
 - 딥러닝
 - 심층학습
 - Linear Algebra
 - Probability
 - Statistics
 - Calculus
 - 선형대수학
 - 확률
 - 통계학
 - 미적분학

### 추천 도서 목록:
1. book_id_1223427: "(Do it!) 강화 학습 입문 :GPT-2부터 자동 신경망 구성까지" by "조규남", published by "서울 :이지스퍼블리싱, 2021:(교보문고,2021)" (현재 대여 불가)
2. book_id_1277876: "챗GPT 교육혁명 : ChatGPT를 활용한 하이터치 하이테크 미래교육" by "정제영", published by "[서울] : 포르체, 2023" (대여 위치: 1층.큐레이션)
3. book_id_1277878: "챗GPT 기회를 잡는 사람들" by "장민", published by "서울 : 알투스, 2023" (현재
대여 불가)
4. book_id_1277875: "진짜 챗GPT 활용법 : 엑셀 활용법부터 블로그 자동화, 유튜브 콘텐츠 생성, 미드저니와 ChatGPT API 사용법까지" by "김준성", published by "파주 : 위키북스, 2023" (현재 대여 불가)
5. book_id_1277522: "GPT 제너레이션 : 챗GPT가 바꿀 우리 인류의 미래" by "이시한", published by "[대
구] : 북모먼트 : 북로망스, 2023" (현재 대여 불가)

### 추천 RISS 목록:
1. riss_id_"16372981": "GPT의 Multi-Head 생성을 통한 감성 대화 챗봇 시스템 개발" by "이효민", published by "연세대학교 대학원"
2. riss_id_"15652223": "GPT-2 모델을 이용한 카테고리별 텍스트 생성" by "손성환", published by "국민 대학교 일반대학원"
3. riss_id_"16022984": "GPT-2를 이용한 지식완성 = Knowledge Graph Completion Using GPT-2" by "김상운", published by "숭실대학교 대학원"
4. riss_id_"14210938": "GPT-vanishing 구조와 NP 작용소의 고유치의 조정가능성에 대한 분석" by "풍정정", published by "인하대학교 대학원"
5. riss_id_"16394576": "한국어 중의성 문제를 위한 GPT 혼합형 기반의 검색결과 정확도 향상 = Improve the accuracy of search result for ambiguous expression in Korean using hybrid GPT" by "김연건", published by "한양대학교 공학대학원"
```

--- "커서 훌륭한 프로그래머가 되고 싶어, 근데 코딩을 몰라"

![image](https://user-images.githubusercontent.com/2356749/235857127-93c16a5e-f5ae-4541-ac4a-67eccf5a89e6.png)

--- "인공지능을 공부하고 싶어"

![image](https://user-images.githubusercontent.com/2356749/235364713-63d2531e-77fd-4e56-9868-9ee94ae8bd18.png)

--- "대학교 2학년, 수학과를 위한 추천"

![image](https://user-images.githubusercontent.com/2356749/235365448-4411d5f3-d736-431e-b902-26cdf0d0fde6.png)

--- "지금 대학교 4학년이고 소프트웨어학과를 다니는데 뭘 공부할까"

![image](https://user-images.githubusercontent.com/2356749/235365378-1936ce8b-a69a-44b4-9e01-bc1b021a1b95.png)

> 아주대학교 도서관 검색 결과를 이용합니다.

아주대학교 도서관 도서 추천 시스템은 관심사에 기반하여 도서관에 있는 도서를 추천해 주는 프로그램입니다.

GPT-4와 SentenceTransformer를 활용하여 사용자의 관심사와 가장 유사한 도서를 찾아 추천해 드립니다.

## 사용 기술

- GPT-4: 사용자의 관심사에 기반한 도서 검색 쿼리 생성
- SentenceTransformer: 도서와 사용자의 관심사 간의 유사도를 계산
- aiohttp, asyncio: 비동기적으로 도서 정보와 대여 상태를 가져옴
- sklearn: 코사인 유사도 계산

## 설치 및 실행

1. 필요한 패키지 설치
```bash
pip install openai sentence-transformers aiohttp scikit-learn
```

2. `.env` 파일을 생성하고 다음과 같이 OpenAI API 키를 입력하세요. (GPT-4 가능한 KEY)
```
API_KEY=your_openai_api_key
```

3. 프로그램을 실행합니다.
```bash
python book.py
```

## 사용 방법

1. 프로그램을 실행하면, 사용자의 관심사를 입력하라는 메시지가 출력됩니다.
```python
도서관 검색: 인공지능을 공부하고 싶어

GPT-4가 생성한 쿼리: ['인공지능', '머신러닝', '딥러닝', '신경망', '데이터과학', '알고리즘', '텐서플로우', '파이토치']
```

2. 프로그램이 도서 목록을 가져온 후, 추천된 도서와 대여 가능한 위치를 출력합니다.
```yaml
book_id_1256661: (파이썬을 활용한) 머신러닝 자동화 시스템 구축 : 실무자를 위한 머신러닝 핵심 개념,모델 선택 및 하이퍼파라미터 튜닝, 최적화 기법 - Gil’s LAB (대여 위치: 4층.총류.컴퓨터)
book_id_794649: (장교수의) 딥러닝 - 장병탁 (대여 위치: 4층.총류.컴퓨터)
book_id_557876: 신경망을 이용한 고속도로 여행시간 추정 및 예측모형 개발 - 김남선 (대여 위치: 제1 보존서고)
book_id_764966: (코드와 그림으로 마스터하는) 알고리즘 :이 정도는 알아야만 Google에서 일할 수 있다! - 이상진 (대여 위치: 4층.총류.컴퓨터)
book_id_958780: 신경망과 심층학습 :뉴럴 네트워크와 딥러닝 교과서 - Aggarwal, Charu C (대여 위치: 4층.총류.컴퓨터)
```

이제 아주대학교 도서관 도서 추천 시스템을 사용하여 관심사에 맞는 도서를 찾아보세요!