# 02 — Klan Revamp: Chat-Öncelikli + Boss Fight + Şeffaf Katkı

> Mevcut klan ekranı feed/dashboard ağırlıklı. Habitica'nın party + boss raid
> deneyiminden ilham alıyoruz, ama Habitica'nın eksiği olan **"kim ne yaptı"
> görünürlüğünü** kapatıyoruz. Klan, sosyal medya feed'i değil; küçük bir
> çalışma grubu / Discord sunucusu hissi vermeli.

---

## 1. Vizyon

Klan = senin "çalışma grubun." Üç ayak:

1. **Chat-first**: Klan ekranının ana sürümü chat. Mesaj at, sistem mesajları
   "X göreve başladı / bitirdi / Y XP kazandı" otomatik düşsün
2. **Boss fight (haftalık raid)**: Klan birlikte bir boss'a karşı savaşır.
   Görev tamamlamak = boss'a hasar. Habitica mantığı, ama:
   - Hasar miktarı görev zorluğu × tier × süre uyumuyla hesaplanır
   - Her vuruş chat'te sistem mesajı olarak görünür
   - Profilde "Bu hafta vurduğun toplam hasar" görünür
3. **Şeffaf katkı**: Klan üyeleri birbirinin haftalık aktivitesini görür.
   "Boş gözükmek" zorlaşır → sosyal accountability

Klan boyutu: 4–8 kişi (Habitica party'si ~4, biz biraz daha esnek). Üst limit
8 → herkes birbirini tanıyabilir.

---

## 2. Modüller

| Modül                | Açıklama                                                  | Faz  |
| -------------------- | --------------------------------------------------------- | ---- |
| Clan Chat            | Realtime-vari mesajlaşma, sistem mesajları                | A    |
| Boss Fight           | Haftalık raid mekaniği, HP, damage, ödül                  | B    |
| Member Insights      | Üye katkı paneli, haftalık özet, profile bağlantısı       | C    |
| Roles & Permissions  | Owner / Admin / Member ayrımı, ayar paneli                | D    |
| Clan Quests          | Boss dışı haftalık koop görevler ("Bu hafta toplam 50 habit")| E    |

---

## 3. Veri modeli

```ts
// types/clan-chat.ts
export type ClanMessage = {
  id: string;
  clanId: string;
  /** Sistem mesajı veya kullanıcı mesajı */
  type: 'user' | 'system' | 'boss-damage' | 'boss-defeated' | 'level-up' | 'streak';
  authorId: string | null; // sistem mesajıysa null
  authorName: string | null;
  authorAvatar: string | null;
  body: string;
  meta: ClanMessageMeta | null; // type'a göre payload
  createdAt: string;
  reactions: ClanReaction[];
};

export type ClanMessageMeta =
  | { kind: 'boss-damage'; damage: number; bossId: string; taskTitle: string }
  | { kind: 'level-up'; newLevel: number }
  | { kind: 'streak'; days: number }
  | { kind: 'task-complete'; taskId: string; taskTitle: string; xp: number };

export type ClanReaction = {
  emoji: string;
  userIds: string[];
};

// types/clan-boss.ts
export type ClanBoss = {
  id: string;
  clanId: string;
  /** Tema: "Procrastination Lord", "Sınav Ejderi", "Algoritma Hayaleti" */
  theme: string;
  emoji: string;
  level: 1 | 2 | 3 | 4 | 5;
  maxHP: number;
  currentHP: number;
  startsAt: string;
  endsAt: string; // 7 gün sonra
  state: 'active' | 'defeated' | 'failed';
  rewards: BossReward;
  /** Üye bazlı toplam vuruş */
  contributions: BossContribution[];
};

export type BossContribution = {
  userId: string;
  totalDamage: number;
  taskCount: number;
  lastHitAt: string;
};

export type BossReward = {
  /** Boss yenilirse */
  victoryXP: number;
  victoryLeagueXP: number;
  victoryGems: number;
  /** Süresi dolarsa */
  consolationXP: number;
};
```

---

## 4. Hasar hesaplama

```ts
// modules/clan-boss.ts
export function computeDamage(
  task: { difficulty: Difficulty; xpReward: number },
  context: { userTier: LeagueTier; consecutiveStrikes: number },
): number {
  const base = task.xpReward; // 5 / 10 / 20 baseline
  const difficultyMult = { easy: 1.0, medium: 1.4, hard: 2.0 }[task.difficulty];
  const tierMult = TIER_DAMAGE[context.userTier]; // 1.0 → 1.5
  const streakBonus = Math.min(1.5, 1 + context.consecutiveStrikes * 0.05);
  return Math.round(base * difficultyMult * tierMult * streakBonus);
}
```

`consecutiveStrikes` = aynı gün içinde arka arkaya tamamlanan görev sayısı —
flow state ödülü.

---

## 5. Servis katmanı

`services/clan-chat.service.ts` (yeni):

```ts
clanChatService.getMessages(clanId, { before?, limit }): Promise<ClanMessage[]>
clanChatService.sendMessage(clanId, body): Promise<ClanMessage>
clanChatService.addSystemMessage(clanId, meta): Promise<ClanMessage>
clanChatService.addReaction(messageId, emoji): Promise<void>
clanChatService.subscribe(clanId, onMessage): () => void
  // Mock için: setInterval ile poll, ileride WebSocket
```

`services/clan-boss.service.ts` (yeni):

```ts
clanBossService.getActiveBoss(clanId): Promise<ClanBoss | null>
clanBossService.dealDamage(userId, amount, taskTitle): Promise<{ damage, hp, defeated }>
clanBossService.spawnNewBoss(clanId, level): Promise<ClanBoss>
clanBossService.tickBossTimer(): Promise<void> // expired bossları işle
```

### Mevcut entegrasyonlar

- `TaskDetailScreen.handleComplete` cascade'i:
  1. XP overlay
  2. Level-up modal
  3. Streak milestone toast
  4. Clan challenge bonus toast (mevcut)
  5. **YENİ**: Boss damage hesapla → `dealDamage` → küçük damage toast
     ("Boss'a 38 hasar verdin!"), arka planda chat'e sistem mesajı
- `chatService.addSystemMessage` her görev tamamlandığında otomatik tetiklenir

---

## 6. UI / Komponentler

### `ClanScreen` yeniden yapılanma

Mevcut: empty state + dashboard.
Yeni: dashboard küçülür, chat ekranın **ana içeriği** olur.

Layout:

```
┌────────────────────────────────────┐
│ Hero strip (klan adı + boss HP bar)│  ← Sticky top
├────────────────────────────────────┤
│ Sekme: Chat | Üyeler | Boss        │
├────────────────────────────────────┤
│                                    │
│  Mesaj listesi (ters scroll)       │
│  - sistem: "🗡 Furkan boss'a +24"  │
│  - sistem: "⚡ Burak 7 streak'e ulaştı" │
│  - kullanıcı: "Çalışıyorum, 21:00'a kadar" │
│                                    │
├────────────────────────────────────┤
│  Mesaj input + reaction picker     │
└────────────────────────────────────┘
```

### Yeni komponentler

- `ClanChatList` — `FlatList`, ters sıralı, virtualize edilmiş
- `ClanChatBubble` — `type`'a göre 4 görsel:
  - `user` — normal balon
  - `system` (görev tamamlama, level up, streak) — küçük center-aligned satır
  - `boss-damage` — kırmızı/turuncu vurgu, damage rakamı büyük
  - `boss-defeated` — full-width victory banner
- `ClanChatInput` — text input, emoji picker, mention support (`@isim`)
- `BossHealthBar` — sticky top'ta boss adı + HP fill + kalan süre
- `BossPanel` — Boss sekmesinde tam ekran: boss illüstrasyonu, HP, üye katkı leaderboard'u
- `MemberInsightsPanel` — Üye sekmesinde her üyenin haftalık aktivitesi (bar chart)
- `BossDefeatedModal` — Boss yenildiğinde çıkan tam ekran ödül animasyonu
- `BossFailedToast` — Süresi dolmuşsa yumuşak bildirim

### Animasyonlar

- Damage hit: chat balonunda sayı pop animasyonu, ekrana hafifçe shake
- Boss HP düşüşü: animated `Animated.Value` ile yumuşak progress
- Boss defeated: ekran flash + confetti (LevelUpModal benzeri)
- Mesaj geliş animasyonu: yukarıdan slide + opacity fade

---

## 7. Mock data

`mock/mock-clan-chat.ts`:

- 30 mesaj (karışık tipte)
- 5 üye, çoğu sistem mesajı, birkaç kullanıcı mesajı
- Boss'a vurulmuş 8 hasar mesajı

`mock/mock-clan-boss.ts`:

- Aktif "Sınav Ejderi" Level 2, 5000 HP, 2350 mevcut, 4 gün kalmış
- 5 üyenin katkı dağılımı (Furkan 540, Ayşe 720, vs.)
- Reward: 200 XP, 100 lig XP, 25 gem

---

## 8. Bildirimler

- **Boss spawn**: "Yeni boss ortaya çıktı: Sınav Ejderi (5 gün)"
- **Boss kritik HP**: "Boss %20 HP — son vuruşu sen yap"
- **Boss timer**: 12 saat kala, eğer hala canlı → "Klanınız bossa yetişemeyebilir"
- **Boss defeated**: Tüm üyelere "Bossu yendiniz! Ödüllerini al"
- **Mesaj mention**: `@isim` mention edilirse push (sessiz mod hariç)

---

## 9. Faz planı

### Faz A — Chat altyapısı
- [ ] `types/clan-chat.ts` tipleri
- [ ] `services/clan-chat.service.ts` mock
- [ ] `mock/mock-clan-chat.ts` 30 mesaj
- [ ] `components/Clan/ClanChatList.tsx`
- [ ] `components/Clan/ClanChatBubble.tsx` (user/system varyantları)
- [ ] `components/Clan/ClanChatInput.tsx`
- [ ] `ClanScreen` chat sekmesi (mevcut dashboard'u "Üyeler" sekmesine taşı)
- [ ] Görev tamamlama cascade'inde `addSystemMessage` çağrısı

### Faz B — Boss fight engine
- [ ] `types/clan-boss.ts` tipleri
- [ ] `mock/mock-clan-boss.ts` aktif boss
- [ ] `services/clan-boss.service.ts`
- [ ] `modules/clan-boss.ts` `computeDamage`
- [ ] `components/Clan/BossHealthBar.tsx` (sticky top)
- [ ] `components/Clan/BossPanel.tsx` (full sekme)
- [ ] `ClanChatBubble` `boss-damage` ve `boss-defeated` varyantları
- [ ] Görev tamamlama cascade'inde boss damage hook
- [ ] Boss spawn / despawn logic (mock için tarihe bakar)

### Faz C — Member Insights
- [ ] `components/Clan/MemberInsightsPanel.tsx`
- [ ] Üye haftalık katkı bar chart
- [ ] Profile screen'e "Bu haftaki klan katkısı" satırı
- [ ] Klan üyeleri arasında comparative streak görünümü

### Faz D — Roles & permissions
- [ ] `Owner` / `Admin` / `Member` role checks
- [ ] Klan ayarları sayfası: isim, açıklama, davet kodu, üye atma
- [ ] Mesaj silme (admin için)
- [ ] Boss zorluk seçimi (admin için)

### Faz E — Clan quests
- [ ] Boss dışında haftalık koop quest yapısı (örn. "Klan olarak 50 habit tamamlayın")
- [ ] Quest progress chat'e sistem mesajı olarak yansır
- [ ] Quest tamamlanırsa ödül cascade'i

### Faz F — Polish
- [ ] Mention sistemi (`@isim`)
- [ ] Reaction picker'da custom emoji
- [ ] Boss illüstrasyonları (5 tema × 5 level = 25 sprite veya animasyon)
- [ ] Boss raid hatırlatma push'ları
- [ ] Klan davet bağlantısı (deep link)

---

## 10. Risk ve dikkat

- **Habitica'nın hatası**: Boss raid mekaniğine fazla focus → sıradan kullanıcı
  kaçar. Çözüm: chat ana akış, boss arka planda otomatik damage. Kullanıcı boss'a
  bakmasa da yine kazanıyor
- **Şeffaflık ↔ baskı dengesi**: Üyenin "boş gözükmesi" damgalanma yaratmamalı.
  "Bu hafta ara verdi" tonlu görselleştirme (negatif yerine nötr)
- **Chat moderasyonu**: 4–8 kişilik küçük gruplar olduğu için ileri seviye
  moderasyon araçlarına gerek yok başta
- **Realtime**: Mock olarak polling (5–10 sn) yeterli. Production'da WebSocket'e
  geç (Faz F+)
- **Spam koruması**: Boss damage için `DAILY_XP_CAP` paralel bir damage cap
  uygulanmalı (örn. günlük max boss hasarı 500)
- **Solo kullanıcı**: Klansız kullanıcı için "Solo boss" modu opsiyonel. AI/bot
  klan değil, sadece kişisel mini boss

---

## 11. Bağlantılar

- `docs/05-social-and-clans.md` — Genel klan vizyonu
- `docs/feature-plans/01-ranked-lig-sistemi.md` — Boss yenilince lig XP'si verilir
- `docs/feature-plans/03-zenginlestirilmis-profil.md` — Üye profillerinde boss
  hasar geçmişi görünür
- `docs/04-gamification.md` — Cascade sırası: XP → Level-up → Streak → Clan
  bonus → **Boss damage**
