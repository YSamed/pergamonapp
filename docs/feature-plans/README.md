# Feature Plans

Bu klasör, MVP sonrası ürün vizyonunu büyük adımlara ayıran detaylı tasarım
dokümanlarını barındırır. Her dosya bağımsız ele alınabilir ama dördü birlikte
ürünün hedef kitlesine (18–25 yaş, YKS / üniversite / kendi kendine öğrenen
Türk gençleri) okul-replacement deneyimi sunmayı amaçlar.

| Dosya                                       | Konu                                          | Durum   |
| ------------------------------------------- | --------------------------------------------- | ------- |
| `01-ranked-lig-sistemi.md`                  | Duolingo × LoL hibrit lig sistemi             | Plan    |
| `02-klan-revamp-chat-boss.md`               | Chat-öncelikli klan + Habitica-vari boss raid | Plan    |
| `03-zenginlestirilmis-profil.md`            | Yapılandırılmış kimlik, okul/hedef beyanı     | Plan    |
| `04-program-okul-yerine.md`                 | Müfredat şablonları, milestone, checkpoint    | Plan    |

## Bağımlılık grafı

```
              ┌─────────────────────────┐
              │ 03 — Profile / Identity │
              │  (gating ve vizyon)     │
              └────────────┬────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
 │ 01 — League │   │ 02 — Clan    │   │ 04 — Program │
 │  XP & rank  │◄──┤  chat + boss │   │  curriculum  │
 └─────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          ▼
              docs/04-gamification.md
              cascade entegrasyonu
```

- **03 (Profile)** önce gelmeli; çünkü `primaryGoal` olmadan **04 (Program)** öneri
  yapamaz, **01 (League)** yaş bazlı eşleştirme yapamaz, **02 (Clan)** üye
  görünürlüğünü zenginleştiremez.
- **01** ve **02** birbirine paralel ilerletilebilir; **02**'nin boss damage'i
  **01**'in lig XP'sine de katkı yapar.
- **04** en geniş kapsamlı; **01** ve **02** çalışır hale geldikten sonra ele
  alınabilir.

## Önerilen ele alma sırası

1. **03** — Profil zenginleştirme (1–2 hafta) — diğerlerinin gating'i
2. **01** — Lig sistemi (2–3 hafta) — kısa retention dürtüsü
3. **02** — Klan chat + boss (3–4 hafta) — sosyal katman
4. **04** — Program sistemi (4–6 hafta) — en geniş kapsam, school-replacement
   vizyonunun tamamlayıcısı

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
