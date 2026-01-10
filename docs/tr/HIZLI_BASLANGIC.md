# 🚀 Hızlı Başlangıç

## Kurulum

```bash
npm install -g intent2commit
```

---

## 5 Dakikada Intent2Commit

### 1. Git Repository'de Olduğunuzdan Emin Olun

```bash
git init  # Eğer zaten bir repo değilse
```

---

### 2. İlk Niyetinizi Yakalayın

```bash
intent "kullanıcı kimlik doğrulaması ekle"
```

**Çıktı:**
```
✓ Niyet yakalandı
  ID: a1b2c3d4
  "kullanıcı kimlik doğrulaması ekle"
```

---

### 3. Kod Yazın

Kodunuzu normal şekilde yazın:

```javascript
// auth.js
function login(username, password) {
  // ... auth logic
}
```

---

### 4. Değişiklikleri Stage Edin

```bash
git add auth.js
```

---

### 5. Önizleyin

```bash
intent preview
```

**Çıktı:**
```
Niyet: "kullanıcı kimlik doğrulaması ekle"

Alignment: 95/100 (Mükemmel)

Stage Edilmiş Değişiklikler:
  ✓ auth.js: (+50/-0)

✓ Alignment sorunları tespit edilmedi
```

---

### 6. Commit Yapın

```bash
intent commit
```

Otomatik olarak şöyle bir commit mesajı oluşturur:

```
feat(auth): kullanıcı kimlik doğrulaması ekle

Niyet: Temel kullanıcı giriş sistemi eklemek

Değişiklikler:
- auth.js'de login fonksiyonu eklendi
- Şifre hashlemesi eklendi
- Session yönetimi eklendi

Etki: Kullanıcılar artık giriş yapabilir

Niyet ID: a1b2c3d4
Alignment Skoru: 95/100
```

---

## Template Kullanımı

Yaygın senaryolar için template'ler kullanın:

```bash
intent --template performance
```

**İnteraktif promptlar:**
```
? Optimize ettiğiniz metrik nedir? response time
? Hedef iyileştirme (%)? 50
? Yaklaşım/yöntem? caching

✓ Niyet yakalandı: "response time'ı %50 azalt via caching"
```

---

## Görsel Diff

Detaylı alignment breakdown için:

```bash
intent preview --visual
```

**Çıktı:**
```
═══════════════════════════════════════════
      NIYET → KOD ALIGNMENT ÖNİZLEME
═══════════════════════════════════════════

┌─ NIYET ───────────────────────────────┐
│ "response time'ı azalt"
└───────────────────────────────────────┘

ALIGNMENT SKORU
████████████████████████░░░░░░░ 85/100

📊 ALIGNMENT BREAKDOWN:
  Niyet netliği:     ████████████████ 90%
  Dosya kapsamı:     ███████████████░ 85%
  Kod hacmi:         ████████████████░ Normal
  ⚠ Risk paternleri: -5 puan

🎯 ANA MESELE: Logging performans hedefi ile çelişebilir
```

---

## Branch'ler ile Çalışma

Niyet-bazlı branch'ler oluşturun:

```bash
intent branch "ödeme entegrasyonu ekle"
```

Otomatik olarak oluşturur:
- Branch: `intent/odeme-entegrasyonu-ekle`
- Metadata bağlantısı
- Merge alignment raporu

---

## İstatistikler

Takım metriklerini görüntüleyin:

```bash
intent stats --team
```

**Çıktı:**
```
Niyet İstatistikleri
────────────────────
Toplam Commit:     156
Ort. Alignment:    82/100
Mükemmel Oran:     45%
Aktif Dönem:       30 gün

En Çok Kullanılan Niyet Tipleri:
1. Performans (35%)
2. Bugfix (28%)
3. Feature (20%)
```

---

## Git Hooks (Opsiyonel)

Takım kurallarını zorunlu kılmak için:

```bash
intent install-hooks
```

**Ne yapar:**
- Commit öncesi niyet kontrolü
- Otomatik alignment analizi
- Ledger güncelleme

---

## Sıradaki Adımlar

### Dokümantasyon Keşfedin

- [Tüm Komutlar](docs/tr/KOMUTLAR.md)
- [VS Code Eklentisi](docs/tr/VS_CODE_KILAVUZU.md)
- [Felsefe](docs/tr/FELSEFE.md)

### Gelişmiş Özellikler

```bash
intent preview --matrix    # Dosya bazında alignment
intent history             # Niyet edit geçmişi
intent diff HEAD~5 HEAD    # Niyet evrimi
```

### Yardım Al

```bash
intent --help
```

---

## İpuçları

✅ **Erken yakalayın** - Koddan önce niyeti belirtin  
✅ **Spesifik olun** - "Hızlandır" değil "Login'i 800ms'ye düşür"  
✅ **Template kullanın** - Yapılandırılmış niyet için  
✅ **Önizleyin** - Commit öncesi her zaman kontrol edin  

---

**Keyifli coding!** 🚀

Sorular: https://github.com/yourusername/intent2commit/issues
