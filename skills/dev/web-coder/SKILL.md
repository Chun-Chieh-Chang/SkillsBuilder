---
name: web-coder
description: Professional UI/UX design and industrial-grade web development. Builds production-quality UIs that are accessible, performant, and visually polished.
---

# Web Coder (Digital Art Director)

## Trigger Phrases
- "網頁開發", "UI/UX 優化", "web development", "建立前端"

## Instructions
- Follow the Digital Art Director style guide (Color Master Palette).
- Ensure responsiveness and premium aesthetics.

---

## 🔗 Addy Osmani 精華整合 (from frontend-ui-engineering)

### 組件架構原則
**組合優於配置：**
```tsx
// Good: 可組合
<Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader><CardBody>...</CardBody></Card>
// Avoid: 過度配置
<Card title="Tasks" headerVariant="large" bodyPadding="md" content={...} />
```

**分離數據獲取與展示：**
- Container 組件：處理數據（loading, error, empty states）
- Presentation 組件：純粹渲染

### 狀態管理決策樹
```
useState           → 組件專屬 UI 狀態
Lifted state       → 2-3 個兄弟組件共享
Context            → 主題、認證、語系（讀多寫少）
URL state          → 篩選、分頁、可分享的 UI 狀態
Server state (SWR) → 遠端數據 + 快取
Global store       → 跨應用的複雜客戶端狀態
```
**Prop drilling 超過 3 層時必須引入 Context 或重構組件樹。**

### 反 AI 美學（Anti-AI Aesthetic）
| AI 預設 | 為何有問題 | 生產品質 |
|---------|-----------|---------|
| 紫色/靛藍一切 | 每個 App 看起來一樣 | 使用專案色板 |
| 過度漸層 | 視覺噪音 | 扁平或微妙漸層 |
| 過度圓角 (rounded-2xl) | 忽視設計系統的圓角層級 | 一致的 border-radius |
| 超大 padding | 破壞視覺層次 | 一致的 spacing scale |
| 陰影過重 | 與內容競爭 | 微妙或無陰影 |

### WCAG 2.1 AA 無障礙
- **鍵盤導航**：所有交互元素必須可鍵盤操作
- **ARIA 標籤**：無可見文字的交互元素必須有 `aria-label`
- **焦點管理**：Modal 開啟時聚焦、內部困住焦點
- **色彩對比**：正文 4.5:1，大字 3:1
- **不依賴顏色**：使用圖標 + 文字 + 顏色

### Loading 與 Transition
- 內容加載使用 **Skeleton**（非 Spinner）
- 實作 **Optimistic Update** 提升感知速度
- 必須處理三種狀態：**Loading / Error / Empty**

### 響應式設計
- Mobile First：`320px → 768px → 1024px → 1440px`
- 手機版字體 ≥ 14px，觸控區域 ≥ 44x44px

