# AjouLibraGPT

아주대학교 도서관 도서 추천 시스템 (CLI + API)

> React.js (Frontend) + Rust (backend) + OpenAI's GPT-4 & text-embedding

![gif](https://github.com/Alfex4936/Ajou-Library-GPT/assets/2356749/345f9a1f-14da-4447-a2b8-a6b6cbf0310d)

```md
## 영어 검색 (English search)
### 도서관 검색: i wanna learn about elephant's life
### GPT-4가 생성한 쿼리:
        - Elephant Life, Elephant Biology
        - Elephant Social Behavior, Elephant Life Cycle
        - Elephant Ecology, 코끼리 생활
        - 코끼리 생물학, 코끼리 사회행동
        - 코끼리 생명주기, 코끼리 생태학

### 추천 도서 목록:
1. book_id_689776: "Love, life, and elephants :an African love story" by "Sheldrick, Dame Daphne", published by "New York :Farrar, Straus and Giroux,2012." (대여 위치: 3층.응용과학)
2. book_id_318267: "Coming of age with elephants : a memoir" by "Poole, Joyce", published by "New York : Hyperion,1996" (대여 위치: 4층.자연)
3. book_id_689697: "Elephant Company :the inspiring story of an unlikely hero and the animals who helped him save lives in World War II" by "Croke, Vicki", published by "New York :Random House,2014." (대여 위치: 2층.역사지리)
4. book_id_7491: "Three elephant power and other stories" by "Paterson, A. B", published by "Champaign, Ill. :Project Gutenberg" (현재 대여 불가)
5. book_id_163844: "The elephant and my Jewish problem  : selected stories andjournals, 1957-1987" by "Nissenson, Hugh", published by "New York  : Harper & Row ,1988." (대여 위치: 제1 보존서고)

### 추천 RISS 목록:
1. riss_id_"10573616": "The effects of elephants on their habitats in the Shimba Hills, Kenya" by "Kahumbu, Paula Gathoni", published by "Princeton University"
2. riss_id_"10568150": "The evolution and conservation of the African forest elephant" by "Eggert, Lori S", published by "University of California, San Diego"
3. riss_id_"13295182": "The secret lives of African forest elephants:  Using genetics, networks, and telemetry to understand sociality" by "Schuttler, Stephanie Grace", published by "University of Missouri - Columbia"
4. riss_id_"10588647": "Ecology and conservation of elephants in African rangelands" by "Gadd, Michelle Erin", published by "University of California, Davis"
5. riss_id_"10544197": "Aspects of elephant behavior, ecology, and interactions with humans (Conservation)" by "O'Connell, Caitlin Elizabeth", published by "University of California, Davis"
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

GPT-4와 SentenceTransformer/text-embedding-ada-002를 활용하여 사용자의 관심사와 가장 유사한 도서를 찾아 추천해 드립니다.

## 사용 기술

- GPT-4: 사용자의 관심사에 기반한 도서 검색 쿼리 생성
- SentenceTransformer/text-embedding-ada-002: 도서와 사용자의 관심사 간의 유사도를 계산
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
