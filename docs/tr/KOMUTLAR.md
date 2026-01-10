# Intent2Commit - Komut Referansı

## 📚 İçindekiler

- [Temel Komutlar](#temel-komutlar)
- [Level 1 Özellikler](#level-1-özellikler)
- [Level 2 Özellikler](#level-2-özellikler)
- [Konfigürasyon](#konfigürasyon)
- [Hızlı Referans](#hızlı-referans)

---

## Temel Komutlar

### `intent <mesaj>`
Kod yazmadan önce niyetini yakala.

```bash
intent "kullanıcı profil endpoint'inde veritabanı sorgularını optimize et"
```

**Seçenekler:**
- `-t, --template <isim>` - Template kullan

**Örnekler:**
```bash
intent "login süresini 1200ms'den 800ms'ye düşür"
intent --template performance
```

---

### `intent commit`
Niyet-bilinçli commit mesajı ile commit yap.

```bash
git add .
intent commit
```

---

### `intent preview`
Commit öncesi niyeti ve değişiklikleri önizle.

```bash
intent preview              # Kompakt görünüm
intent preview --visual     # Tam görsel diff
intent preview --matrix     # Dosya bazında alignment matrisi
```

---

### `intent log`
Niyet geçmişini göster.

```bash
intent log
intent log -f src/auth.js   # Dosya-özel
```

---

### `intent stats`
İstatistikleri göster.

```bash
intent stats
intent stats --team         # Takım analitiği
```

---

## Level 1 Özellikler

### `intent branch <mesaj>`
Niyet metadatası ile Git branch oluştur.

```bash
intent branch "ödeme entegrasyonu ekle"
# Oluşturur: intent/odeme-entegrasyonu-ekle
```

---

### `intent edit <mesaj>`
Mevcut niyeti düzenle.

```bash
intent edit "yeni mesaj" --reason "kapsam değişikliği"
```

---

### `intent undo`
Son niyet değişikliğini geri al.

```bash
intent undo
```

---

### `intent history`
Niyet düzenleme geçmişini göster.

```bash
intent history
```

---

## Hızlı Referans

| Komut | Açıklama |
|-------|----------|
| `intent <msg>` | Niyet yakala |
| `intent commit` | Niyet ile commit |
| `intent preview` | Değişiklikleri önizle |
| `intent preview --visual` | Görsel diff |
| `intent preview --matrix` | Alignment matrisi |
| `intent log` | Niyet geçmişi |
| `intent stats` | İstatistikler |
| `intent branch <msg>` | Niyet branch'i oluştur |
| `intent edit <msg>` | Niyeti düzenle |
| `intent undo` | Geri al |
| `intent history` | Düzenleme geçmişi |
| `intent --template <name>` | Template kullan |

---

**Tam dokümantasyon:** https://github.com/yourusername/intent2commit
