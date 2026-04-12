# Tech Notes

## Teknik yaklaşım için notlar
Claude Code teknik karar alırken bu ürünün doğasını dikkate almalı.

## Gereken karakteristikler
- State-heavy bir uygulama
- Realtime veya near-realtime sosyal güncellemeler ileride önemli olabilir
- Progress hesaplamaları tutarlı olmalı
- Offline-friendly deneyim faydalı olur
- Notification / reminder sistemi kritik olabilir

## Teknik dikkat noktaları
- XP ve reward hesapları deterministik olmalı
- Abuse prevention düşünülmeli
- Completion event’leri log bazlı tutulabilir
- Social feed performansı önemli olabilir
- Clan verileri ölçeklenebilir kurgulanmalı

## Olası mimari düşünceler
- Modüler domain-driven yaklaşım faydalı olur
- Core domain: tasks, habits, progression, social
- Event-driven mantık ileride işlevsel olabilir
- Analytics için event tracking en baştan düşünülmeli

## Güvenlik ve suistimal önleme
Sistem oyunlaştırıldığı için exploit riski yüksek olacaktır.

Dikkat edilmesi gerekenler:
- Fake completion spam
- Çok düşük eforlu task’larla XP kasma
- Clan contribution manipülasyonu
- Challenge abuse
- Multi-account exploit

Önlem fikirleri:
- XP caps
- Diminishing returns
- Task validation heuristics
- Suspicious behavior flags
- Server-side reward calculation

## Gelecek vizyonu
Uzun vadede ürün şu yöne evrilebilir:
- Sadece task manager değil, “personal progression platform”
- Sosyal self-improvement network
- Clan-based growth ecosystem
- Seasonal events ve collaborative goals
- AI supported accountability coach

## Claude Code için çalışma talimatı
### Rol
- Sadece coder değil, product-aware builder gibi davran
- Her feature’da hem teknik hem UX hem ürün etkisini düşün
- Gereksiz complexity ekleme
- MVP mantığını koru

### Öncelik sırası
1. Kullanıcının günlük aksiyon almasını kolaylaştır
2. Progress hissini güçlü ver
3. Social/clan katmanını doğru soyutla
4. Ölçeklenebilir veri modelini koru
5. Görsel olarak clean ama motive edici yapı kur

### Kod üretirken
- Domain modellerini net tanımla
- Feature’ları modüler ayır
- Reusable component mantığı kur
- Progression logic’i ayrı katmanda tasarla
- UI state ile business logic’i gereksiz karıştırma
- Event tracking’e uygun yapı kur

### Kaçınılması gerekenler
- Sıradan todo app gibi düşünmek
- Oyunlaştırmayı sadece icon ve rozet sanmak
- Sosyal katmanı sonradan eklenecek ufak modül gibi görmek
- Aşırı karmaşık ama düşük etkili feature’lara erken girmek
