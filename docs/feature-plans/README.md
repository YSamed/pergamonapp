# Feature Plans

Bu klasör, MVP sonrası ürün vizyonunu büyük adımlara ayıran detaylı tasarım
dokümanlarını barındırır. Her dosya bağımsız ele alınabilir ama dördü birlikte
ürünün hedef kitlesine (18–25 yaş, YKS / üniversite / kendi kendine öğrenen
Türk gençleri) sürekli daily heartbeat ve sosyal accountability deneyimi sunar.

| Dosya                                       | Konu                                                  | Durum |
| ------------------------------------------- | ----------------------------------------------------- | ----- |
| `01-ranked-lig-sistemi.md`                  | Duolingo × LoL × Habit hibriti lig sistemi            | Plan  |
| `02-klan-chat-revamp.md`                    | Chat-öncelikli klan + şeffaf üye katkısı              | Plan  |
| `03-zenginlestirilmis-profil.md`            | Yapılandırılmış kimlik, okul/hedef beyanı             | Plan  |
| `04-tab-bar-konsolidasyonu.md`              | Progress → Profile, League tab açma                   | Plan  |

> Önceki taslakta yer alan `Program (Okul Yerine)` planı kullanıcı kararı
> doğrultusunda kaldırıldı. Klan boss-fight katmanı da kapsam dışı; klan plan'ı
> chat + member insights'a indirgendi.

## Bağımlılık grafı

```
                ┌─────────────────────────────┐
                │ 04 — Tab Bar Konsolidasyonu │
                │  (League tab açar, Profile  │
                │   Progress'i emer)          │
                └──────────┬──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
 │ 01 — League │   │ 02 — Clan    │   │ 03 — Profile │
 │  XP & rank  │   │  chat-first  │   │  zengin kimlik│
 └─────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          ▼
              docs/04-gamification.md
              cascade entegrasyonu
```

- **04 (Tab bar)** önce gelir; League tab'ı için slot açar
- **01 (League)** habit-bazlı heartbeat ve XP-bazlı sıralama → tab açıkken
  retention pressure görünür kalır
- **02 (Clan chat)** sistem mesajları XP/streak/level kazanımlarını klanda
  görünür yapar; lig XP de chat'te yansır
- **03 (Profile)** structured identity, gating diğer üçü için context sağlar

## Önerilen ele alma sırası

1. **04 — Tab bar konsolidasyonu** (½ hafta) — League tab slotunu açar
2. **01 — League sistemi** (2–3 hafta) — kısa retention dürtüsü
3. **03 — Profil zenginleştirme** (1–2 hafta) — structured identity + heatmap
4. **02 — Klan chat revamp** (2–3 hafta) — sosyal katman, en geniş chat altyapısı

## Plan-to-code geçişi

Her plan, `Faz A → Faz X` şeklinde checkbox'lı task listeleri içerir. Bunlar
hayata geçtikçe `todo.md` ile senkronize edilmeli; gerektiğinde plan içindeki
checkbox'lar işaretlenir, ek `Faz` başlıkları eklenir.

## Vizyon bağlamı

- `docs/01-product-vision.md` — Ürün vizyonu temeli
- `docs/02-core-features.md` — MVP feature listesi
- `docs/04-gamification.md` — XP, level, streak temelleri
- `docs/05-social-and-clans.md` — Klan vizyonu temeli
- `docs/09-open-questions.md` — Çözüme bağlanmamış konular

> Bu dosyalar yaşayan dokümanlar; her major sürümde gözden geçirilmeli ve
> kullanıcı geri bildirimine göre güncellenmeli.
