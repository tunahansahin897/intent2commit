# MCP Server Kılavuzu

## MCP Nedir?

Model Context Protocol (MCP), AI ajanlarının Intent2Commit ile programatik olarak etkileşmesini sağlar.

---

## Kurulum

```bash
npm install -g intent2commit-mcp-server
```

---

## Konfigürasyon

### Claude Desktop

**Dosya:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "intent2commit": {
      "command": "npx",
      "args": ["-y", "intent2commit-mcp-server"],
      "env": {
        "WORKSPACE_ROOT": "/projenizin/yolu"
      }
    }
  }
}
```

### Cline / Diğer MCP İstemcileri

```json
{
  "mcp.servers": {
    "intent2commit": {
      "type": "node",
      "module": "intent2commit-mcp-server",
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

---

## Mevcut Kaynaklar

### `intent://current`
Mevcut aktif niyeti al.

```typescript
const intent = await mcp.readResource('intent://current');
// { id, message, timestamp, template }
```

### `intent://history`
Niyet geçmişini al.

```typescript
const history = await mcp.readResource('intent://history');
```

### `intent://alignment/current`
Mevcut alignment analizini al.

```typescript
const alignment = await mcp.readResource('intent://alignment/current');
// { score, status, warnings, breakdown }
```

---

## Mevcut Araçlar

### `capture_intent`
```typescript
await mcp.callTool('capture_intent', {
  message: "veritabanı sorgularını optimize et",
  template: "performance"
});
```

### `check_alignment`
```typescript
const result = await mcp.callTool('check_alignment', {});
// Alignment skoru ve önerileri döndürür
```

### `commit_with_intent`
```typescript
await mcp.callTool('commit_with_intent', {
  force: false
});
```

---

## AI Ajan İş Akışı Örneği

```typescript
// 1. Ajan mevcut niyeti okur
const intent = await mcp.readResource('intent://current');

if (!intent) {
  // Henüz niyet yakalanmamış
  await mcp.callTool('capture_intent', {
    message: "Değişikliklere göre önerilen niyet"
  });
}

// 2. Alignment kontrol et
const alignment = await mcp.callTool('check_alignment');

if (alignment.score < 70) {
  // AI önerisi al
  const prompt = await mcp.getPrompt('review_alignment');
  const suggestion = await ai.analyze(prompt);
  
  if (suggestion.shouldSplit) {
    console.log("AI commit bölmeyi öneriyor");
  }
}

// 3. Commit ile devam et
await mcp.callTool('commit_with_intent');
```

---

## Prompt'lar

### `review_alignment`
AI'dan alignment'ı incelemesini ve önerilerde bulunmasını iste.

```typescript
const prompt = await mcp.getPrompt('review_alignment', {
  includeHistory: true
});
```

AI, niyet, değişiklikler ve alignment hakkında yapılandırılmış bağlam alır.

---

## AI Ajanları için Faydalar

1. **Bağlam Koruması:** AI kodun NEDEN yazıldığını bilir
2. **Karar Takibi:** AI geçmiş niyetleri sorgulayabilir
3. **Kalite Güvencesi:** AI commit öncesi alignment kontrol eder
4. **Takım Öğrenimi:** AI takımın niyet kalıplarından öğrenir

---

## Hata Ayıklama

### Server Durumunu Kontrol Et
```bash
npx intent2commit-mcp-server --version
```

### Bağlantıyı Test Et
```bash
# Claude/Cline'da
Sor: "Mevcut niyetim nedir?" (MCP kullanır)
```

---

**Tam MCP Spec:** Bakınız `mcp-server/MCP_SPEC.md`
