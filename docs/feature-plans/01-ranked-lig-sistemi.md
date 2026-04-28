# 01 — Ranked Lig Sistemi (Duolingo × LoL × Habit Hibriti)

> Hedef: 18–25 yaş Türk gencinde "bugün bir habitimi yapmazsam düşerim" içgüdüsü
> kurmak. Duolingo'nun haftalık 30 kişilik kohort modelini, LoL'un apex tier
> decay disiplinini ve habit tracker'ın günlük heartbeat'ini birleştiriyoruz.

> Araştırma referansları (özetler section 11'de):
> - [Duolingo Leagues blog post](https://blog.duolingo.com/duolingo-leagues-leaderboards/)
> - [LoL Apex Tier rules (Riot)](https://support-leagueoflegends.riotgames.com/hc/en-us/articles/4405776545427)
> - [Duolingo Wiki / League](https://duolingo.fandom.com/wiki/League)

---

## 1. Vizyon ve üç dinamik

Sistemin omurgası **üç bağımsız ama iç içe çalışan** dinamikten oluşuyor:

| Dinamik          | Modeli       | Ne yapar?                                                |
| ---------------- | ------------ | -------------------------------------------------------- |
| Weekly Cohort    | Duolingo     | 30 kişilik gruplar, Pzt → Paz, top yükselir / bottom düşer |
| Habit Heartbeat  | Yeni (bizim) | Habit-bazlı banked days; "bugün bir habit yaptım mı?" sayar |
| Apex Decay       | LoL          | Üst tier'larda heartbeat 0'a düşerse XP çürür             |

XP **tüm** görevlerden (habit + todo) gelir. Ancak **tier'da kalmak için habit
zorunlu**. Bu, todo grindleyerek lig korumayı engeller; habit gerçekten daily
heartbeat olur.

---

## 2. Tier yapısı (10 tier)

Duolingo'nun 10 tier modelini Türkçeleştirip basit tutuyoruz:

| #  | İsim       | Renk      | Promote | Demote  | Heartbeat etkisi      |
| -- | ---------- | --------- | ------- | ------- | --------------------- |
| 1  | Acemi      | `#6E8096` | top 10  | yok     | sadece uyarı          |
| 2  | Bronz      | `#C77D3A` | top 10  | bot 5   | sadece uyarı          |
| 3  | Gümüş      | `#B8C4D1` | top 10  | bot 5   | sadece uyarı          |
| 4  | Altın      | `#F4B544` | top 7   | bot 5   | sadece uyarı          |
| 5  | Safir      | `#3B82F6` | top 7   | bot 5   | sadece uyarı          |
| 6  | Yakut      | `#EC4899` | top 7   | bot 5   | **5%/gün decay**      |
| 7  | Zümrüt     | `#10B981` | top 5   | bot 5   | **5%/gün decay**      |
| 8  | Ametist    | `#A855F7` | top 5   | bot 5   | **8%/gün decay**      |
| 9  | Obsidiyen  | `#1F2937` | top 5   | bot 7   | **8%/gün decay**      |
| 10 | **Elmas**  | `#06B6D4` | turnuva | bot 7   | **10%/gün decay**     |

- **Acemi**'den düşme yok; ilk hafta default tier
- Üstte **Elmas Turnuvası** var (3 hafta, top 10 → next round, Duolingo modeli)
- Renkler `theme/colors.ts` içinde `leagueTier` map olarak yaşar

---

## 3. Üç dinamiğin detayı

### 3.1. Weekly Cohort (Duolingo)

- 30 kişilik gruplar, **Pazartesi 00:00 → Pazar 23:59** Türkiye saati
- Tier-içi rastgele eşleştirme (ileride: yaş aralığı + saat dilimi)
- XP: bu hafta kazanılan toplam (habit + todo + bonus)
- Pazar sonunda: promote/hold/demote outcome hesaplanır, weekly XP sıfırlanır
- Tier başına farklı promote/demote oranları (yukarıdaki tabloda)

### 3.2. Habit Heartbeat (yeni — bizim için kritik)

> Habitica + LoL "banked games" karması. Habit'i daily heartbeat'e dönüştürür.

- Kullanıcı başına **`heartbeatBank`** sayacı tutulur (max 7, başlangıç 7)
- Her gece 23:59'da:
  - O gün **≥1 habit completion** varsa → `heartbeatBank = min(7, +1)`
  - O gün 0 habit → `heartbeatBank -= 1`
- Heartbeat 0 olduğunda:
  - Acemi → Safir: sadece uyarı (`HeartbeatLowToast`)
  - Yakut+: **decay** kuralları devreye girer (3.3)
- "Görsel kalp" — UI'da 7 dolu kalp gösterilir, bugünkü habit yapılmadıysa ışıklar söner
- **Önemli**: todo tamamlamak heartbeat **vermez**. Sadece habit. Bu, todo grindleyerek lig korumayı engeller.

### 3.3. Apex Decay (LoL stilinden uyarlama)

LoL: banked games biter → 100 LP/gün. Biz daha yumuşağız:

- Heartbeat 0 ve tier ≥ Yakut → her gece **weekly XP'nin %X'i eksilir** (tier başına: 5/5/8/8/10)
- Yeni promote olan kullanıcıya **48 saat protection** (decay yok, heartbeat yenilenir)
- Decay sonrası rank tier'ın min XP eşiğinin altına düşerse **bir tier düşme**
- Türü ne olursa olsun **maksimum decay süresi 14 gün** (LoL'daki üst sınır)
- Bu mekanik sadece tier ≥ Yakut için aktif; alt tier kullanıcıyı boğmaz

### 3.4. Streak Freeze (Duolingo modeli)

- Haftada **1 ücretsiz** freeze; bir günü "korumalı" yapar (heartbeat azalmaz, decay durur)
- 100-gün streak'e ulaşan kullanıcıya **3 ekstra freeze** (Duolingo'nun 100-gün hediyesi)
- Premium ile haftalık limit artar (faz E+)
- Sınav günü bildirim: takvimde sınav varsa "Donma günü kullanmak ister misin?" prompt'u

---

## 4. XP kaynakları

League XP = **tüm görev XP'lerinin toplamı + bonuslar**:

| Kaynak                       | XP                            |
| ---------------------------- | ----------------------------- |
| Easy habit / todo            | 5                             |
| Medium habit / todo          | 10                            |
| Hard habit / todo            | 20                            |
| Streak milestone bonus       | 5 / 15 / 25 / 50 (3/7/14/30)  |
| Daily challenge completion   | 20–30                         |
| Seasonal multiplier          | x1.5 (Bahar Atılımı vb.)      |
| Klan challenge bonus         | 100 (haftada 1)               |

`DAILY_XP_CAP = 300` (mevcut, abuse koruması) — lig XP'sine de uygulanır.

---

## 5. Veri modeli

```ts
// types/league.ts
export type LeagueTier =
  | 'novice' | 'bronze' | 'silver' | 'gold' | 'sapphire'
  | 'ruby'   | 'emerald' | 'amethyst' | 'obsidian' | 'diamond';

export type League = {
  id: string;
  tier: LeagueTier;
  weekId: string;             // "2026-W18"
  startsAt: string;
  endsAt: string;             // Pazar 23:59 TR
  participants: LeagueParticipant[];
};

export type LeagueParticipant = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  weeklyXP: number;
  rank: number;
  /** Bugün heartbeat alındı mı */
  heartbeatToday: boolean;
  outcome: 'promote' | 'hold' | 'demote' | null;
};

export type UserLeagueState = {
  userId: string;
  currentTier: LeagueTier;
  highestTier: LeagueTier;
  currentLeagueId: string | null;
  weeklyXP: number;
  /** 0–7, daily heartbeat sayacı */
  heartbeatBank: number;
  /** Decay başlamadan önce verilen koruma */
  protectionUntil: string | null;
  freezesAvailable: number;
  freezesUsedThisWeek: number;
  history: LeagueHistoryEntry[];
};

export type LeagueHistoryEntry = {
  weekId: string;
  startTier: LeagueTier;
  endTier: LeagueTier;
  finalRank: number;
  weeklyXP: number;
  outcome: 'promote' | 'hold' | 'demote' | 'freeze';
};

export type DiamondTournament = {
  id: string;
  segment: 1 | 2 | 3;          // çeyrek / yarı / final
  weekId: string;
  participants: LeagueParticipant[];  // top 10 from Diamond
  endsAt: string;
};
```

---

## 6. Servis & modül katmanı

`services/league.service.ts` (yeni):

```ts
leagueService.getCurrentLeague(userId): Promise<League>
leagueService.getUserState(userId): Promise<UserLeagueState>
leagueService.contributeXP(userId, xp): Promise<void>
  // Görev tamamlamada çağrılır.
  // weeklyXP arttırır, lastActivityAt günceller.
leagueService.markHabitDone(userId): Promise<void>
  // Habit completion'da çağrılır. Bugünkü heartbeat'i true yapar.
leagueService.runMidnightTick(): Promise<void>
  // App focus / gece 23:59'da: heartbeat hesaplama + decay uygula.
leagueService.simulateWeekEnd(): Promise<LeagueResult>
  // Pazar sonu: promote/hold/demote, yeni grup ataması, weeklyXP = 0.
leagueService.useFreeze(userId): Promise<{ ok: boolean; until: string }>
leagueService.getDiamondTournament(weekId): Promise<DiamondTournament | null>
```

`modules/league.ts` (yeni):

```ts
TIER_ORDER: LeagueTier[]
PROMOTE_COUNT: Record<LeagueTier, number>
DEMOTE_COUNT: Record<LeagueTier, number>
DECAY_RATE:   Record<LeagueTier, number>  // 0 / 0.05 / 0.08 / 0.10
HEARTBEAT_MAX = 7

calculateOutcome(rank, tier): 'promote' | 'hold' | 'demote'
applyDecay(state, now): UserLeagueState
applyHeartbeatTick(state, hadHabitToday): UserLeagueState
nextTier(tier), prevTier(tier)
```

---

## 7. UI / Komponentler

### Yeni LeagueScreen tab (önerilen)

> Tab bar konsolidasyonu için bkz. `docs/feature-plans/04-tab-bar-konsolidasyonu.md`.
> Önerilen: Progress sekmesi Profile'a taşınır, slot **League / Lig** sekmesine açılır.

`screens/LeagueScreen` (NEW tab):
- Üst hero: tier rozeti + sıralama + weeklyXP + endsAt countdown
- "Bu hafta" şeridi: 7 kalp grid (heartbeatBank görsel)
- Decay uyarı banner'ı (eğer aktifse)
- Tam 30 kişilik leaderboard:
  - Top 5/7 yeşil bant ("Yükselme bölgesi")
  - Orta bölge nötr
  - Bottom 5/7 kırmızı bant ("Düşme bölgesi")
- "Donma günü kullan" CTA (1 ücretsiz veya premium)
- Tier history strip (son 8 hafta)

### Diğer komponentler

- `RankBadge` — küçük tier rozeti (Profile, klan chat avatarları, leaderboard)
- `LeagueBanner` — Home / Profile için özet kartı
- `HeartbeatBar` — 7 kalp grid (LeagueScreen + Profile)
- `LeaguePromotionModal` — Pazar gecesi tier yükselme animasyonu
- `LeagueDemotionToast` — yumuşak ton: "Bu hafta tempo düştü"
- `DecayWarningToast` — Yakut+ için "XP eksilmek üzere"
- `HeartbeatLowToast` — alt tier'lar için bilgilendirme
- `FreezeBottomSheet` — donma günü kullanma onayı
- `LeagueIntroOverlay` — onboarding'de lig sistem tanıtım
- `DiamondTournamentBanner` — Elmas turnuvasına katılan kullanıcı için

### Animasyonlar

- Promosyon: confetti + tier rozeti büyüme (LevelUpModal benzeri)
- Heartbeat dolma: kalp ışığı pulse
- Decay tetiği: sarı pulse, gün sonu yaklaştıkça kırmızı
- Leaderboard satırları: FlipMove tipi yumuşak geçiş

---

## 8. Mevcut sistemle entegrasyon

### TaskDetailScreen completion cascade güncellemesi

Mevcut sıra: XP overlay → level-up → streak milestone → clan challenge bonus.

Yeni ekleme:

1. `await leagueService.contributeXP(userId, earnedXP)`
2. Eğer task tipi habit → `await leagueService.markHabitDone(userId)`
3. Cascade'de `LeaguePromotionModal` veya `LeagueDemotionToast` **sadece Pazar gecesi sonucu** gösterilir (mid-week complete'lerde değil)

### App açılış / focus event'i

`runMidnightTick`:
- Son tick'ten beri 24h geçtiyse → heartbeat hesapla, decay uygula
- Yeni outcome varsa (Pazar geçmiş) → promotion/demotion modalı tetikle
- Decay warning eşiği (heartbeat ≤ 1) → toast göster (günde max 1 kez)

### HomeScreen entegrasyonu

- "Lig durumun" özet kartı: tier rozeti + sıralama + heartbeat mini-grid
- Tıklama → LeagueScreen tab'a navigate

### ProfileScreen entegrasyonu

- Identity card altına `RankBadge` + tier history strip
- Tab bar planı (`04-tab-bar-konsolidasyonu.md`) Progress sekmesini Profile'a taşıdığında otomatik yer açılır

---

## 9. Mock data

`mock/mock-league.ts`:

- 30 kişilik **Altın** tier ligi
- Furkan dahil 6 farklı kullanıcı (gerçek mock-clan üyeleri ile aynı isim/avatarlar)
- Pazartesi 00:00 başlamış, 4 gün kalmış endsAt
- Furkan'ın `heartbeatBank: 5`, `weeklyXP: 280`, `rank: 12`
- Tier history: Acemi → Bronz → Bronz → Gümüş → Altın
- Bir önceki haftanın outcome'ı: 'promote' (Bronz → Gümüş)

`mock/mock-tournament.ts`:

- Boş başla; faz E'de eklenir

---

## 10. Bildirimler

- **Heartbeat low** (her tier): saat 21:00, bugün 0 habit → "Bugün bir habit yap, kalbini koru"
- **Decay warning** (Yakut+): saat 21:00, heartbeat 0 → "Lig XP'in azalmak üzere"
- **Reset day**: Cumartesi 20:00, top 5 dışındaysa → "Top 5'e girmek için X XP eksik"
- **Promosyon**: Pazar 23:59 sonrası "Bir tier yükseldin!"
- **Tournament invite**: Elmas top 10 → "Elmas Turnuvasına davetlisin"
- **Freeze hatırlatma**: kullanıcı sınav takvimi koymuşsa o gün sabahı

---

## 11. Faz planı

### Faz A — Çekirdek (no decay, no notifications)
- [ ] `types/league.ts` ve tipler
- [ ] `mock/mock-league.ts` Altın tier 30 kişilik
- [ ] `services/league.service.ts` mock (getCurrentLeague, getUserState, contributeXP, markHabitDone)
- [ ] `modules/league.ts` (TIER_ORDER, calculateOutcome, applyHeartbeatTick)
- [ ] `components/League/RankBadge.tsx`
- [ ] `components/League/HeartbeatBar.tsx`
- [ ] `components/League/LeagueBanner.tsx`
- [ ] `screens/LeagueScreen` (tab) — leaderboard + heartbeat + countdown
- [ ] AppNavigator'da League tab'ı eklenmesi (bkz. `04-tab-bar-konsolidasyonu.md`)
- [ ] TaskDetailScreen cascade'inde `contributeXP` + `markHabitDone` (habit ise)

### Faz B — Promosyon / demosyon görselleştirme
- [ ] `LeaguePromotionModal` ve `LeagueDemotionToast`
- [ ] `simulateWeekEnd` mock — geliştirici menüsünden tetiklenebilir
- [ ] Tier history strip (Profile içinde)
- [ ] Pazar tick'i için app focus + tarih kontrolü

### Faz C — Heartbeat & Apex Decay
- [ ] `applyDecay`, `runMidnightTick` modül + servis
- [ ] App focus event'inde tick (24h farkında)
- [ ] `DecayWarningToast`, `HeartbeatLowToast`
- [ ] Protection (48h) yeni promosyon sonrası

### Faz D — Freeze günleri ve sınav takvimi
- [ ] `freezesAvailable` mock + `useFreeze` servis
- [ ] `FreezeBottomSheet` UX
- [ ] 100-gün streak hediyesi (3 ekstra freeze)
- [ ] Sınav takvimi nudge

### Faz E — Bildirimler ve onboarding
- [ ] Heartbeat low push (21:00)
- [ ] Decay warning push
- [ ] Reset day reminder (Cumartesi 20:00)
- [ ] Promosyon push (Pazar 23:59 sonrası)
- [ ] `LeagueIntroOverlay` ilk açılışta

### Faz F — Diamond Tournament
- [ ] `DiamondTournament` tipi + mock
- [ ] 3 segment (çeyrek/yarı/final) UI
- [ ] `DiamondTournamentBanner` LeagueScreen'in üstünde
- [ ] Turnuva ödülleri (rozet, gem, lig XP boost)

### Faz G — Polish & sezonluk
- [ ] Tier-spesifik emblem'ler (SVG veya emoji kombinasyonu)
- [ ] Haftalık MVP highlight (en yüksek XP)
- [ ] Sezonluk tema renkleri
- [ ] Lig sıralama paylaşımı (story export)

---

## 12. Risk ve dikkat

- **Decay agresif olmamalı**: hastalık/sınav → freeze günleri yeterli. Asla "1 günde tier düşürme" olmasın
- **Acemi'den düşme yok**: yeni kullanıcı kaybetmesin, ürünü erkenden bırakmasın
- **30 kişilik kohort**: Duolingo da 30 kullanır, ne baskı kaybolur ne kullanıcı kaybolur
- **Habit-only heartbeat**: todo grindleyerek tier korumayı engeller; ama habit'i azaltarak da yorulur — günde 1 habit yeter
- **Hile koruması**: günlük cap (300 XP), düşük zorluklu görev spam'i tier yükseltmemeli
- **Kötü hissettirme**: demosyonda copy nazik — "Bu hafta tempo düştü, yarın yeni başlangıç"
- **Sınav günleri**: kullanıcının takvimine göre auto-freeze öner
- **Time zone**: Türkiye odaklı; başka bölgelerden kullanıcı gelirse ileride local-time matchmaking
- **İzole solo kullanım**: lig hep dolu mock kohortla. İleride boş gerçek kohort durumunda AI bot fallback'i

---

## 13. Bağlantılar

- `docs/04-gamification.md` — XP, level, streak temelleri
- `docs/05-social-and-clans.md` — Klan paralel
- `docs/feature-plans/02-klan-chat-revamp.md` — Klan chat'inde sistem mesajı = lig XP görünür
- `docs/feature-plans/03-zenginlestirilmis-profil.md` — RankBadge profilde
- `docs/feature-plans/04-tab-bar-konsolidasyonu.md` — League tab'ının yeri

---

## 14. Araştırma özeti (kaynaklar)

### Duolingo Leagues
- 10 tier (Bronze → Diamond), 30 kişilik kohort, Mon-Sun haftalık
- Top promote sayısı tier'a göre değişir (top 10–20 alt tier'larda, top 5 Obsidian → Diamond)
- Bottom 5 demote (her tier'da)
- Diamond Tournament: top 10 of Diamond, 3-segment elemeli
- Cross-language matchmaking (kullanıcı dilden bağımsız ligde olabilir)
- Streak Freeze: 1–2 equipable, 100-gün streak hediye 3 freeze
- XP herhangi bir aktiviteden gelir; abuse takibi var

### LoL Apex Tier Decay (Master / Grandmaster / Challenger)
- Banked games: max 10, her gün -1
- 0 banked → -100 LP/gün
- ~1 game/gün maintain
- Decay → Diamond II'ye düşme
- Maximum decay süresi 14 gün

### Habitica & diğer habit app'leri
- Habitica: party/raid odaklı, league yok
- HabitStreak: weekly leaderboard + group challenge (premium)
- Habicat: dil bazlı leaderboard
- League sistemini gerçekten habit + todo'ya bağlayan örnek **yok** — bizim için fırsat

(Kaynaklar: Duolingo Leagues blog post, Riot LoL Apex Tiers help center,
Duolingo Wiki, gamificationplus.uk 2026 review, HabitStreak pages)





