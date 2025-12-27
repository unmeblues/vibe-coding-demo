# TODO List (vibe-coding-demo)

간단한 웹 기반 TODO 앱입니다. 로컬 브라우저의 Local Storage를 사용해 항목을 저장하며, 다음 기능들을 제공합니다.

## 주요 기능 ✅
- 항목 추가(+ 버튼 또는 Enter)
- 완료 토글(체크 버튼)
- 중요 표시(별표) — 노란색 별, 삭제 버튼의 왼쪽에 위치
- 항목 삭제(휴지통 버튼)
- 모두 삭제(Clear All)
- 별표된 항목은 목록 상단에 표시
- 모든 데이터는 브라우저의 Local Storage에 저장

## 사용 방법 🧭
1. 저장소를 클론하거나 파일을 가져옵니다.
2. `index.html`을 브라우저로 열거나, 간단한 로컬 서버를 실행합니다.

로컬 서버 예시 (Python):

```bash
# Python 3에서 현재 폴더를 8000번 포트로 서비스
python -m http.server 8000
# 브라우저로 http://localhost:8000 열기
```

또는 VS Code의 Live Server 확장(권장)을 사용해 바로 확인할 수 있습니다.

## 파일 구조 🔧
```
/ (프로젝트 루트)
├─ index.html      # 앱 메인
├─ styles.css      # 스타일
├─ script.js       # 동작 로직 (로컬스토리지 저장)
└─ README.md       # 이 파일
```

## 개발 노트 💡
- 데이터는 `vibe-todos` 키로 Local Storage에 JSON 형태로 저장됩니다.
- `script.js`에서 항목 객체는 { id, text, completed, starred, created } 형태입니다.
- 개선 아이디어: 필터(별만 보기), 편집 모드, SVG 아이콘 적용, 애니메이션

## 라이선스 ⚖️
MIT

---
원하시면 README를 영어로 번역하거나, 데모 GIF/스크린샷을 추가해 드릴게요.