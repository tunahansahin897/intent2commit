# Intent2Commit

> **AI kod yazıyor. Kontrol sende kalıyor.**

---

## 🎯 Problem

AI hızlı kod yazıyor. Ama bir ay sonra kimse bilmiyor:
- Bu kod **neden** yazıldı?
- Hangi problemi çözüyordu?
- Neden bu şekilde yapıldı?

**Sonuç:** Kod çöplüğü. Technical debt. Kaos.

---

## 💡 Çözüm

```bash
# 1. Niyetini söyle
intent "login sayfasını 2 saniyeden hızlı yap"

# 2. AI ile kodla
# ... cursor, copilot, claude, ne istersen ...

# 3. Commit öncesi kontrol
intent preview

# Çıktı:
# ✅ Fulfillment: 88/100
# ⚠️ DRIFT: logger.js niyetin dışında!
# 💡 Önerilen: loglama değişikliklerini ayır

# 4. Temiz commit
intent commit
```

**Her commit'te:**
- ✅ Niyet kayıtlı
- ✅ Sapma (drift) tespit edildi
- ✅ Gelecekteki sen teşekkür edecek

---

## ⚡ Kurulum

```bash
npm install -g intent2commit
```

---

## 🚀 Vibeathon Mode

Hackathon'lar için agresif drift uyarısı:

```bash
intent --vibeathon "feature X ekle"
```

Vibeathon Mode:
- 🔥 Daha agresif drift kontrolü
- ⚡ Tek komut, sıfır ayar
- 🚨 Scope dışı kod = anında uyarı

---

## 🔥 Temel Komutlar

```bash
# Niyet yakala
intent "performansı artır"

# Template kullan
intent --template security

# Preview (drift kontrolü)
intent preview

# Commit
intent commit

# Geçmişi gör
intent log

# Commit'i açıkla
intent explain abc123
```

---

## 🔌 AI Araçları Entegrasyonu

5 major AI coding tool destekli (MCP):

| Araç | Durum |
|------|-------|
| **Cursor** | ✅ |
| **Windsurf** | ✅ |
| **Antigravity** | ✅ |
| **Claude Desktop** | ✅ |
| **Cline** | ✅ |

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "intent2commit": {
      "command": "npx",
      "args": ["intent2commit-mcp-server"]
    }
  }
}
```

AI asistanın artık niyetini biliyor.

---

## 🤖 GitHub Action

Her PR'da otomatik kontrol:

```yaml
- uses: andorabilisim/intent2commit-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    fail-on-drift: true
```

Drift varsa merge engellensin.

---

## 📊 Drift Detection Nedir?

**Senaryo:**
- Niyet: "Login hızını artır"
- Değiştirdiğin dosyalar: `auth.js`, `cache.js`, `logger.js`

**Drift uyarısı:**
```
⚠️ INTENT DRIFT DETECTED
logger.js niyetin dışında!
Önerilen: Değişikliği ayır veya niyeti güncelle.
```

**Fayda:** Production'a saçmalık gitmiyor.

---

## 🏆 Neden Intent2Commit?

| Özellik | Intent2Commit | Normal Git | AI Tools |
|---------|---------------|------------|----------|
| Niyet kaydı | ✅ Açık | ❌ Yok | ⚠️ Tahmin |
| Drift tespit | ✅ Otomatik | ❌ Manuel | ❌ Yok |
| Lokal çalışma | ✅ %100 | ✅ | ❌ Cloud |
| AI entegrasyon | ✅ MCP | ❌ | ⚠️ Kapalı |

---

## 📁 Dosya Yapısı

```
intent2commit/
├── bin/intent.js        # CLI
├── src/                  # Core modules
├── mcp-server/           # AI tool integration
├── github-action/        # PR gatekeeper
├── vscode-extension/     # VS Code
└── docs/                 # Belgeler
```

---

## 🇹🇷 Türkçe Dokümantasyon

- [Hızlı Başlangıç](docs/tr/HIZLI_BASLANGIC.md)
- [Komutlar](docs/tr/KOMUTLAR.md)

---

## 📄 Lisans

MIT

---

## 🌟 Star at!

Beğendiysen ⭐ ver, destekle!

```bash
npm install -g intent2commit
```

**AI kod yazıyor. Kontrol sende kalıyor.**
