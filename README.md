# 글씨결 — 내 글씨로 만드는 폰트

폰에서 한글 자음·모음 24자를 손으로 쓰면 한글 11,172자가 들어 있는 `.ttf` 폰트 파일이 만들어지는 웹앱입니다.
서버가 없습니다. HTML 파일 하나가 전부라서, 파일을 어디에 올리든 바로 돌아갑니다.

## 폴더 구조

```
geulssigyeol\                 (앱 이름은 그대로 "글씨결")
├─ README.md                  ← 이 문서
├─ deploy\                    ← Vercel에 올라가는 폴더. 이 안이 사이트 전부예요
│  ├─ index.html              ← 앱 (더블클릭하면 PC에서도 바로 실행)
│  ├─ og.png                  ← 링크 미리보기 이미지 (인스타 DM·카톡에 링크 보낼 때 뜨는 그림)
│  ├─ apple-touch-icon.png    ← 아이폰 홈 화면 아이콘
│  ├─ icon-512.png            ← 아이콘 원본
│  └─ vercel.json             ← Vercel 설정 (캐시). 건드릴 일 없음
├─ 플레이북.html               ← 인스타 운영 전략 문서. 더블클릭 → 브라우저로 열림
├─ 샘플폰트-YoonjungCe.ttf     ← 앱으로 만든 샘플 폰트. 더블클릭 → 설치하면 워드·PPT에서 "윤정체"로 보여요
└─ src\                       ← 나중에 고칠 때 쓰는 원본 (지금은 안 건드려도 됨)
   ├─ index.html              ← 화면 뼈대 (HTML) + 링크 미리보기 메타
   ├─ styles.css              ← 색·글꼴·레이아웃
   ├─ handfont.js             ← 폰트 엔진 (획 → TrueType 파일)
   ├─ app.js                  ← 화면 동작 + 인스타 설정(CONFIG) + 응원 문구(CHEER_LINES)
   └─ build.ps1               ← 위 4개를 합쳐 deploy\index.html 을 다시 만드는 스크립트
```

## 1. 지금 바로 써 보기

`deploy\index.html` 을 더블클릭하면 브라우저에서 열립니다.
폰에서 쓰려면 아래 "배포"를 먼저 해야 합니다. 폰 브라우저는 PC 파일을 직접 열 수 없기 때문입니다.

## 2. 설정 (인스타 계정 넣기)

`deploy\index.html` 을 메모장이나 VS Code로 열고 `CONFIG` 를 찾으세요. 딱 이 부분만 바꾸면 됩니다.

```js
const CONFIG = {
  brand: '글씨결',                                    // 앱 이름 (헤더, 공유 카드에 찍힘)
  handle: '@ht_bangbang',                             // 내 인스타 아이디
  profileUrl: 'https://www.instagram.com/ht_bangbang/', // 팔로우 버튼이 여는 주소
  hashtag: '#내글씨폰트',                              // 공유 카드에 찍히는 해시태그
  defaultSample: '오늘도 잘하고 있어. 진짜로.',        // 완성 화면 기본 응원 문구 (CHEER_LINES 첫 줄과 동일)
  defaultName: '내 손글씨',                            // 폰트 기본 이름
  defaultNameEn: 'MyHandwriting',                     // 파일 이름·앱 목록용 영문 이름
};
```

`src\` 를 쓰는 경우에는 `src\app.js` 의 같은 자리를 바꾸고 `build.ps1` 을 돌리세요.

배포 전에 테스트만 해보고 싶으면 주소 뒤에 붙여도 됩니다.

```
index.html?ig=my.handle&brand=글씨결&tag=내글씨폰트
```

## 3. 배포 — Vercel (GitHub 연결)

Vercel은 폴더를 직접 올리는 화면이 없고 GitHub 저장소를 연결합니다. 이 폴더는 이미 git 저장소로 초기화돼 있고 첫 커밋까지 돼 있습니다. 남은 건 GitHub에 올리고 Vercel에서 가져오는 두 단계입니다. 처음 한 번만 하면 됩니다.

### 3-1. GitHub에 올리기 (5분)

1. https://github.com/new 에서 저장소 만들기. 이름 `geulssigyeol`, **Private** 로 두어도 됩니다 (Vercel은 비공개 저장소도 배포해요). README·.gitignore는 추가하지 말고 빈 저장소로.
2. geulssigyeol 폴더에서 PowerShell을 열고 아래 두 줄. `아이디` 자리에 GitHub 아이디.

```powershell
git remote add origin https://github.com/아이디/geulssigyeol.git
git push -u origin main
```

로그인 창이 뜨면 GitHub 계정으로 로그인합니다. (한 번 하면 다음부터는 안 뜹니다.)

### 3-2. Vercel에서 가져오기 (3분)

1. https://vercel.com/new 접속 → GitHub으로 로그인 → 방금 만든 `geulssigyeol` 저장소 옆 **Import**
2. 설정 화면에서 딱 두 군데:
   - **Project Name**: `geulssigyeol` ← 이 이름이면 주소가 `https://geulssigyeol.vercel.app` 이 되고, 링크 미리보기 이미지 주소와 맞습니다. 이미 누가 쓰고 있어서 안 되면 다른 이름으로 하고 아래 3-3을 하세요.
   - **Root Directory**: `Edit` → `deploy` 선택 ← **이걸 빼먹으면 빈 페이지가 뜹니다**
   - Framework Preset은 `Other` 그대로.
3. **Deploy** → 1분 뒤 주소가 나옵니다. 그 주소를 인스타 프로필 링크와 리틀리 DM 버튼에 넣습니다.

이후에는 `src\` 를 고치고 `.\src\build.ps1` → `git add -A; git commit -m "메시지"; git push` 만 하면 Vercel이 알아서 다시 배포합니다.

### 3-3. 프로젝트 이름을 다르게 했다면

`src\index.html` 위쪽의 두 줄에서 `https://geulssigyeol.vercel.app` 을 실제 주소로 바꾸고 다시 빌드·푸시하세요. 링크 미리보기(og.png)가 그 주소를 보고 뜹니다.

```html
<meta property="og:image" content="https://geulssigyeol.vercel.app/og.png">
<meta property="og:url" content="https://geulssigyeol.vercel.app/">
```

### 3-4. 방문 수 보기 (선택)

Vercel 프로젝트 → **Analytics** 탭 → Enable. 앱에 스크립트가 이미 들어 있어서 켜기만 하면 페이지뷰가 잡힙니다. 인스타 프로필 링크 클릭 수와 맞춰 보는 용도입니다. 안 켜도 앱은 그대로 돌아갑니다.

### 다른 곳에 올려도 됩니다

`deploy` 폴더 안이 사이트 전부라서 Netlify Drop(https://app.netlify.com/drop 에 `deploy` 폴더 드래그)이나 GitHub Pages에 올려도 똑같이 동작합니다. 단, 그 경우 3-3의 주소를 바꿔 주세요. 어디든 주소는 **https** 여야 합니다. 폰트 설치 앱과 iOS 다운로드가 http에서는 막힙니다.

## 4. 만든 폰트 쓰는 법

앱에서 "폰트 파일 받기"를 누르면 `영문이름.ttf` 가 저장됩니다.

| 어디서 | 방법 |
|---|---|
| 윈도우 PC | `.ttf` 더블클릭 → 설치. 워드·PPT 글꼴 목록에 한글 이름으로 뜸 |
| 맥 | `.ttf` 더블클릭 → 서체 관리자에서 설치 |
| 아이폰 | iFont 같은 폰트 설치 앱으로 프로필 설치 |
| 굿노트·프로크리에이트·캡컷 | 앱 안의 폰트 가져오기에서 `.ttf` 선택 |

`샘플폰트-YoonjungCe.ttf` 로 먼저 시험해 보세요.

## 5. 앱 동작 요약

- **1단계 (필수)**: 자음 14 + 모음 10 = 24자. 이것만 쓰면 한글 전체가 조합됩니다.
- **추가 단계 (선택)**: 영문 소문자·숫자 36자, 영문 대문자·문장부호 33자, 쌍자음·ㅐ·ㅔ 7자. 쓰면 쓸수록 자연스러워집니다.
- **저장**: 쓴 글자는 브라우저 `localStorage` 에만 저장됩니다. 서버로 가지 않습니다. 같은 폰, 같은 브라우저에서만 이어 쓰기가 됩니다.
- **결과물**: `.ttf` 폰트 파일, 인스타 4:5 공유 카드(1080×1350 PNG).
- **펜 굵기**: 가늘게 / 보통 / 굵게 세 단계. 완성 화면에서 바꾸면 폰트가 다시 만들어집니다.

## 6. 코드 고치기 (src 사용)

1. `src\` 안의 파일을 고칩니다. `src\index.html` 을 더블클릭해도 실행되므로 그대로 테스트하면 됩니다.
2. geulssigyeol 폴더에서 PowerShell을 열고 실행합니다.

```powershell
.\src\build.ps1
```

3. `deploy\index.html` 이 새로 만들어집니다. 이 파일을 다시 배포하면 끝입니다.

파일 역할:

- `handfont.js`: 획 데이터를 받아 TrueType 폰트 바이너리를 만드는 엔진. 한글 조합 레이아웃(`LAYOUT`), 획 굵기 처리, cmap/glyf 등 폰트 테이블 생성이 여기 있습니다. 외부 라이브러리를 쓰지 않습니다.
- `app.js`: 화면 전환, 그리기 패드, 저장, 공유 카드, 인스타 설정. `STAGES` 를 고치면 쓰는 글자 순서와 단계를 바꿀 수 있습니다. `CHEER_LINES` 가 응원 문구 목록입니다 — 첫 화면 예시(탭하면 순환)와 완성 화면의 문구 칩에 같이 쓰입니다. 쉼표·물음표는 24자 예시 폰트에 없어서 문구에 넣지 않았습니다.
- `styles.css`: 색 변수(`--pen`, `--hl` 등)를 바꾸면 전체 색이 바뀝니다. 다크 모드도 같이 정의되어 있습니다.

## 7. 알아두면 좋은 것

- 브라우저에서 만든 폰트를 바로 미리보기로 쓰려면 `FontFace` API가 필요합니다. 요즘 폰 브라우저는 다 됩니다. 안 되는 환경에서는 캔버스로 그려서 보여줍니다.
- 구글 폰트(Gaegu, IBM Plex Sans KR)를 인터넷에서 불러옵니다. 오프라인에서는 기본 글꼴로 보입니다. 폰트 만들기 자체는 오프라인에서도 됩니다.
- 글자를 다 쓰지 않아도 자음 하나, 모음 하나만 있으면 폰트를 만들 수 있습니다. 안 쓴 글자는 시스템 글꼴로 대체됩니다.
