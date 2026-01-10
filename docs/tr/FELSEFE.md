# Intent2Commit - Felsefe

## Problem: Bağlam Kaybı ve Kod Sapması

Modern geliştiriciler aynı anda birden fazla ortamda çalışır: editör, terminal, tarayıcı, issue takip sistemleri ve AI araçları. Bu akışkanlık kısa vadede verimli görünse de, zamanla sistematik bağlam kaybına yol açar.

**Bağlam kaybı** geliştiriciler kodun neden yazıldığını unuttuğunda başlar. Kod çalışıyor olabilir, ama orijinal hedefe olan bağlantısı zayıflıyor. Zamanla bu **kod sapmasına** yol açar - kodun amacına hizmet etmek yerine kendi başına bir yapıya dönüşmesi.

Bu problem özellikle açık kaynak ve uzun soluklu projelerde belirgin hale geliyor. Yeni katkı sağlayanlar kararların arkasındaki akıl yürütmeyi anlamakta zorlanıyor. Mevcut ekipler ise kodu değiştirmekten çekiniyor çünkü orijinal niyeti anlamıyorlar.

**Asıl neden teknik yetersizlik değil.** Niyetin sistematik olarak kaybolmasıdır.

---

## Mevcut Araçlar Neden Yetersiz

Mevcut geliştirme araçları niyeti yeterince koruyamıyor:

- **Commit mesajları** genelde yüzeysel, sonradan yazılmış
- **Issue'lar** genellikle kod yazıldıktan sonra oluşturuluyor
- **Dokümantasyon** implementasyonun gerisinde kalıyor
- **AI araçları** bağlamı korumak yerine genişletiyor

Geliştirici şununla kalıyor: **Çalışan kod ama kimse neden var olduğunu bilmiyor.**

---

## Çözümümüz: Niyet Birinci Sınıf İlkel Olarak

Intent2Commit temel bir değişim getiriyor: **koddan önce niyet**.

### Temel Prensipler

**1. Niyet Açık**
- Kodlama başlamadan **önce** tanımlanır
- Kısa, net ve bağlayıcı
- Geliştirme boyunca takip edilir

**2. Niyet Doğrulanır**
- Kod değişiklikleri belirtilen niyetle karşılaştırılır
- Sapmalar tespit edilir (engellenmez)
- Geri bildirim anında ve eyleme dönüştürülebilir

**3. Sapma Görünür**
- Kod niyetten saptığında, vurgulanır
- Engelleme veya cezalandırma yok
- Sadece farkındalık ve hesap verebilirlik

---

## Tasarım Felsefesi

**Geliştiricinin düşünmesinin yerini almıyoruz.**  
**Sadece daha önce ne düşündüklerini unutmalarını önlüyoruz.**

### Ne DEĞİLİZ

- ❌ AI destekli bir araç
- ❌ Karmaşık bir framework
- ❌ Workflow değiştirici
- ❌ Dokümantasyon oluşturucu

### Neyiz

- ✅ Hafif bir doğrulama katmanı
- ✅ Karar koruma sistemi
- ✅ Bağlam kurtarma mekanizması
- ✅ Takım iletişim aracı

---

## Gerçek Dünya Örneği

### Intent2Commit Olmadan

```
commit a8f3c2
"auth refactor"

Değiş files:
- auth.js (+50/-30)
- logger.js (+12/-2)
```

**6 ay sonra:** Kimse bu değişikliğin neden yapıldığını, hangi problemi çözdüğünü veya logging'in neden eklendiğini bilmiyor.

### Intent2Commit İle

```
Niyet: "login süresini 1200ms'den 800ms'ye düşür"

Alignment: 65/100
⚠ Eklenen logging performansı etkileyebilir

Değişiklikler:
- auth.js: Caching eklendi
- logger.js: Debug logging eklendi ← Niyet ile çelişiyor

Dosyalar: 2
Alignment: Fair (performans hedefi vs logging ekleme)
```

**6 ay sonra:** Neden kristal netliğinde. Çelişki belgelenmiş. Yeni geliştiriciler trade-off'u anlıyor.

---

## Başarı Kriterleri

Bu yaklaşım şu durumlarda başarılıdır:

✅ Geliştiriciler kodlarının neden var olduğunu hatırlıyor  
✅ Yeni katkı sağlayanlar daha hızlı adapte oluyor  
✅ Kod review süresi azalıyor  
✅ Gereksiz karmaşıklık daha erken yakalanıyor  
✅ "Neden bu yapıldı?" soruları kayboluyor

---

## Teknik Sınırlar

Basitlik ve güveni korumak için:

- **AI gerekli değil** — Tamamen deterministik
- **Cloud servis yok** — %100 lokal
- **Konfigürasyon gerekmiyor** — Hemen çalışır
- **Performans cezası yok** — Hızlı analiz
- **Breaking change yok** — Non-intrusive katman

---

## Büyük Resim

### Küçük Projeler

Bağlam kaybı fark edilmiyor. Intent2Commit "nice to have" gibi hissettiriyor.

### Açık Kaynak Projeler

Bağlam kaybı bileşik hale geliyor. Intent2Commit şunlar için kritik:
- Sürdürülebilirlik
- Katkı sağlayan onboarding
- Karar arkeolojisi
- Kod sahipliği

### Uzun Vadeli Projeler

Bağlam kaybı teknik borca dönüşüyor. Intent2Commit şunları önlüyor:
- Tekrarlayan problem çözme
- Yanlış yönlendirilmiş refactorlar
- Gereksiz soyutlamalar
- Amaç sapması

---

## Bu Kod Yazmakla İlgili Değil

**Neden yazdığımızı hatırlamakla ilgili.**

Kod **ne** değiştiğini söyler.  
Niyet **neden** değiştiğini söyler.  
Alignment **değişmesi gerekip gerekmediğini** söyler.

Birlikte, yazılım evriminin tam resmini oluştururlar.

---

## Son Not

Intent2Commit geliştirici özgürlüğünü kısıtlamaz.  
**Sadece niyetin sessizce kaybolmasını engeller.**

Hedef mükemmellik değil. Farkındalık.  
Yöntem zorlama değil. Görünürlük.  
Sonuç uyum değil. Anlayış.

---

**Kodlarının arkasındaki "neden"i önemseyen geliştiriciler için inşa edildi.**
