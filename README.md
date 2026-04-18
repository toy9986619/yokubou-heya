# yokubou-heya（欲望部屋）

一個幫助朋友/伴侶表達「雙向害羞意圖」的小工具。兩人在 room 裡各自偷偷按下「想要」；只有當**雙方同時**都在同一天按下時，系統才會同步揭露「達成」。任何一方都無法窺探對方的狀態——這是產品核心價值，任何改動都不能破壞。

## 核心設計原則（改 code 前務必讀）

**Mutual blind consent（雙盲同意）**：
- 每個 user **只看得到自己的** `wanting` 狀態
- 對方的 `wanting` 狀態前端永遠讀不到（被 Firestore rules 封死）
- 只有當雙方都 `wanting=true` 時，由 **Cloud Function** 寫入 `matches/{dayKey}`，雙方才同步看到「達成」
- Toggle off 當下：Function 會刪掉當日的 match；跨日的 match 紀錄保留

如果新功能會讓一方推論出另一方當下的狀態，就破壞了產品核心，請重新設計。

## 技術棧

- **前端**：Next.js 14 App Router + MUI 5 + Emotion（靜態輸出 `output: 'export'`）
- **後端**：Firebase（Auth / Firestore / Cloud Functions v2）
- **部署**：Vercel / Firebase Hosting / GitHub Pages 皆可（純靜態）
- **包管理**：Yarn 4（Berry）、Node 22（本機）/ Node 20（Functions runtime）

## 架構概覽

```
rooms/{roomId}
  creatorUid, memberUids[2], purpose, inviteToken, isFull, createdAt
  └── wants/{uid}         // 僅本人可讀寫
        wanting, updatedAt
  └── matches/{dayKey}    // 成員可讀；僅 Function 可寫
        matchedAt, participants

invites/{token} -> { roomId, createdBy }  // 用 token 查 roomId
```

- **時區**：`dayKey` 統一用 UTC+8（Asia/Taipei），格式 `YYYY-MM-DD`
- **Wants 不做每日寫入 reset**：UI 只在 `wants.updatedAt` 的 dayKey === 今日 dayKey 時才視為「今日 wanting」，否則自動失效
- **動態路由用 query param**：`/room?id=xxx`、`/join?token=xxx`（靜態輸出限制）

## 初次 Setup（第一次要跑 or 換機器時）

### 1. 安裝相依套件

```bash
# 前端
yarn install

# Cloud Functions
cd functions && npm install && cd ..

# Firebase CLI（全域一次即可）
npm install -g firebase-tools
firebase login
```

### 2. Firebase Console 啟用服務

打開 https://console.firebase.google.com/project/yokubou-heya

- **Authentication → Sign-in method**：啟用 `Google` 和 `Anonymous`
- **Firestore Database → Create database**：地區選 `asia-east1`，先 test mode（下一步會部署 rules 鎖緊）
- **升級到 Blaze 方案**（Cloud Functions v2 必需）
  - Console → ⚙️ → Usage and billing → Details & settings → Modify plan

### 3. 設定 Budget auto-disable（重要，防超額）

Blaze 的免費額度對這個專案綽綽有餘，但為了絕對安全：

1. Cloud Console → https://console.cloud.google.com/billing/budgets
2. Create Budget：scope 勾 `yokubou-heya`，金額 `$1 USD`，alerts 50% / 90% / 100%
3. 串 Pub/Sub topic → deploy 自動 disable billing 的 Function
4. 照這篇做：https://cloud.google.com/billing/docs/how-to/notify

### 4. 環境變數

```bash
cp .env.example .env.local
# 填入 Firebase Console → Project settings → General → Your apps 看到的 web config
```

## 本機開發

### 方案 A：用 Firebase emulator（不碰線上資料，強烈建議）

```bash
# Terminal 1 — 開 emulator（第一次需要 Java）
firebase emulators:start

# Terminal 2 — 以 emulator 模式開 Next.js
NEXT_PUBLIC_USE_EMULATOR=1 yarn dev
```

Emulator UI：http://127.0.0.1:4000

### 方案 B：直連線上 Firebase

```bash
yarn dev
```

⚠️ 此模式寫入的是正式 Firestore，測試時請用專門的測試帳號，並記得之後清資料。

## Manual E2E 驗證流程

1. 開 Chrome 正常視窗，Google 登入帳號 A
2. `/rooms/new` 建 room（purpose：「一起看電影」）
3. 複製邀請連結
4. 開 Chrome 無痕視窗，貼連結
5. 填 displayName「Bob」→ Anonymous 加入
6. 兩邊視窗都只看到自己的 Want 按鈕狀態
7. A 按「想要」→ A、B 兩邊都沒有視覺變化（對方狀態不外露）
8. B 也按「想要」→ 兩邊同時跳出「達成」
9. A 取消 → 兩邊「達成」消失
10. 隔日（或改系統時間）再開 → 兩邊都從「未想要」開始，但昨天的 match 紀錄還在

DevTools 可以再驗：嘗試讀 `rooms/{id}/wants/{otherUid}` 應該被 rules 拒絕。

## 部署

### 前端（Vercel）

1. GitHub repo push
2. Vercel import
3. Settings → Environment Variables 貼 `.env.local` 裡 `NEXT_PUBLIC_FIREBASE_*` 那幾個（不要勾 `NEXT_PUBLIC_USE_EMULATOR`）
4. Firebase Console → Authentication → Settings → Authorized domains 加入 Vercel 給的 domain

### Firebase 端（rules / indexes / functions）

```bash
firebase deploy --only firestore:rules,firestore:indexes,functions
```

Functions 第一次 deploy 要 3-5 分鐘（啟用 Cloud Build 等 API）。

只改 rules 可以只部署 rules：

```bash
firebase deploy --only firestore:rules
```

## 資料夾結構

```
app/
  layout.js              AuthProvider 包裹 + AppBar
  page.js                首頁（未登入歡迎 / 登入後 room list）
  rooms/new/page.js      建立 room
  room/page.js           /room?id=xxx room 詳情
  join/page.js           /join?token=xxx 加入 room

src/
  firebase.js            Firebase init（idempotent + emulator switch）
  contexts/AuthContext   全域 auth state
  hooks/
    useRoomList          listener on memberUids array-contains self
    useRoom              single room doc
    useWant              own wants doc + toggle
    useMatches           matches subcollection
  lib/
    dayKey.js            Asia/Taipei YYYY-MM-DD helper
    inviteToken.js       random 32-char
  components/
    AuthToolbarControl   AppBar 右側登入/登出/升級
    WantButton           愛心 toggle
    MatchBanner          達成狀態 + 歷史紀錄
    RoomListItem / RoomListLayout
  containers/
    RoomListContainer

functions/
  index.js               onDocumentWritten wants → upsert/delete matches
  lib/dayKey.js          同 src/lib/dayKey.js 的 CommonJS 版

firestore.rules          security rules（務必 read 過）
firestore.indexes.json   composite index（memberUids array-contains + createdAt desc）
firebase.json            emulator / functions / rules 設定
```

## MVP 範圍外（v2 候選）

- FCM 推播（達成時通知對方）
- Room 刪除 / 封存 / 離開
- 多於 2 人的 room
- 使用者自訂時區
- 自動化測試（Firestore rules unit test 優先）
- 多語系

## 疑難雜症

### Cloud Functions 部署失敗
- 確認已升級 Blaze 方案
- 確認 Firebase Console → Build → Functions 那頁沒有卡在 enabling API
- `functions/` 執行 `npm install` 確認依賴裝好

### `.env.local` 值正確但 auth 失敗
- Firebase Console → Authentication → Settings → Authorized domains 有沒有加 `localhost` 和 deploy domain
- 確認 Google Sign-In provider 有實際啟用（不只列在那）

### Firestore 查詢報需要 index
- `firestore.indexes.json` 已包含 `memberUids + createdAt` composite index，確認 `firebase deploy --only firestore:indexes` 跑過
- 或直接點錯誤訊息裡的連結讓 Firebase 幫你建

### Emulator 狀態想清掉
`Ctrl+C` 停掉 emulator → 再起一次即可（預設不持久化）。
如果要持久化資料做回歸測試：`firebase emulators:start --export-on-exit=./emu-data --import=./emu-data`
