# VS Code Eklentisi Kılavuzu

## Kurulum

### VSIX'ten
```bash
cd vscode-extension
npm install
vsce package
code --install-extension intent2commit-0.1.0.vsix
```

### Marketplace'den (Yakında)
VS Code Extensions'da "Intent2Commit" ara.

---

## Özellikler

### 1. Kenar Çubuğu Paneli
- Mevcut niyeti göster
- Hızlı yakalama butonu
- Son niyet geçmişi

### 2. Durum Çubuğu
- Mevcut niyeti göster (önizleme için tıkla)
- Alignment göstergesi

### 3. Komutlar
Tüm komutlar Command Palette üzerinden (`Ctrl+Shift+P`):

- **Intent2Commit: Niyet Yakala** - Yeni niyet yakala
- **Intent2Commit: Önizle** - Alignment önizle
- **Intent2Commit: Commit** - Niyet ile commit
- **Intent2Commit: Yenile** - Niyet görünümünü yenile

---

## Konfigürasyon

**Dosya:** `.vscode/settings.json`

```json
{
  "intent2commit.showAlignmentInStatusBar": true,
  "intent2commit.autoRefresh": true
}
```

---

## Çalışma Akışı

1. **Niyet Yakala**
   - Kenar çubuğu butonuna tıkla VEYA
   - Command Palette → "Niyet Yakala"
   - Niyet mesajını gir

2. **Kod Yaz**
   - Niyet kenar çubuğunda görünür kalır
   - Durum çubuğu mevcut niyeti gösterir

3. **Önizle**
   - Durum çubuğuna tıkla VEYA
   - Command Palette → "Önizle"

4. **Commit**
   - Command Palette → "Commit"
   - Otomatik align edilmiş commit mesajı oluşturur

---

## Klavye Kısayolları (Opsiyonel)

`keybindings.json` dosyasına ekle:

```json
[
  {
    "key": "ctrl+shift+i",
    "command": "intent2commit.captureIntent"
  },
  {
    "key": "ctrl+shift+p",
    "command": "intent2commit.preview"
  }
]
```

---

## Sorun Giderme

### Eklenti Çalışmıyor

**CLI Kurulumunu Kontrol Et:**
```bash
intent --version
```

Kurulu değilse:
```bash
npm install -g intent2commit
```

### Kenar Çubuğu Görünmüyor

1. View → Open View → Intent2Commit
2. Veya Activity Bar'daki Intent2Commit ikonuna tıkla

---

**Yardım mı lazım?** https://github.com/yourusername/intent2commit/issues
