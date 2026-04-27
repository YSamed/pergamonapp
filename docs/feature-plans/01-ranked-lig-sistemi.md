# 01 — Ranked Lig Sistemi (Duolingo × League of Legends Hibriti)

> Hedef kitle: 18–25 yaş, YKS'ye hazırlanan veya kendi başına bir alan öğrenmeye çalışan
> Türk gençleri. Bu özelliğin amacı; "bir gün bile boş geçmeyin" baskısını sağlıklı bir
> şekilde kurmak. Habit kapanması ya da sadece XP kazanması yeterli değil — birisinin
> seninle aynı ligde olması, hafta sonu sıralamayı görmen, en üstte düşme korkusu yaşaman
> gerek.

---

## 1. Vizyon

İki ayrı dinamik birleştirilecek:

1. **Duolingo lig modeli** — Haftalık 30 kişilik gruplar. Pazar gecesi reset. İlk N
   kişi yükselir, son M kişi düşer.
2. **League of Legends üst tier mekaniği** — Belirli bir tier'ın üstündeyken (Usta+)
   her gün aktif olmazsan **lig XP'in günlük olarak çürür (decay)**. Üst üste pasif
   kalırsan tier düşersin. "Challenger'da bir gün bile oynamasan düşürürler" mantığı.

Sonuç: kullanıcı bir günü bile atlatamayacak. Üst tier kullanıcılar hem haftalık
sıralama, hem de günlük decay baskısı altında. Alt tier'lar daha relax, ama yükselme
hırsı var.

---

## 2. Tier yapısı

| #  | İsim          | Renk        | Açıklama                                    |
| -- | ------------- | ----------- | ------------------------------------------- |
| 1  | Acemi         | #6E8096     | Yeni başlayanlar, ilk hafta varsayılan      |
| 2  | Bronz         | #C77D3A     | Düzenli olmaya başlayanlar                  |
| 3  | Gümüş         | #B8C4D1     | Haftada birkaç gün stabil                   |
| 4  | Altın         | #F4B544     | Çoğu gün aktif                              |
| 5  | Platin        | #4ED8C7     | Disiplinli                                  |
| 6  | Elmas         | #6FA8FF     | Süper disiplinli                            |
| 7  | **Usta**      | #A855F7     | Decay başlar (24h aktif olmazsa XP eksilir) |
| 8  | **Bilge**     | #EC4899     | Decay devam, daha sert                      |
| 9  | **Efsane**    | #FF6B6B     | Top %0.1, en sert decay                     |

> Tier renklerini `theme/colors.ts` içinde `leagueTier` namespace'i altında tutacağız.

### Promosyon / demosyon kuralları (Acemi → Elmas)

- Her hafta 30 kişilik bir lig grubuna atanır
- Hafta sonunda sıralama:
  - **İlk 5** → bir tier yükselir
  - **6–20 arası** → aynı tier, yeni grup
  - **Son 10** → bir tier düşer (Acemi'den düşmez)
- Hafta resetinde lig XP'si sıfırlanır

### Üst tier (Usta, Bilge, Efsane) ek kuralları

- **Daily decay**: Son 24 saatte hiç görev tamamlanmamışsa, lig XP'sinin %X'i eksilir
  - Usta: %5/gün
  - Bilge: %8/gün
  - Efsane: %12/gün
- **Korunma süresi**: Tier'a yeni yükseldiğinde 48 saat decay'siz "korunma" tanınır
- **Dondurucu (freeze) item'ları**: Kullanıcı başına haftada 1 ücretsiz "donma günü"
  hakkı (sınav/hastalık için). Premium ile artırılabilir
- **Düşme**: Eğer XP belirli bir alt eşiğin altına inerse tier düşürülür (Bilge'den
  Usta'ya gibi)

---

## 3. Veri modeli

```ts
// types/league.ts
export type LeagueTier =
  | 'novice' | 'bronze' | 'silver' | 'gold' | 'platinum'
  | 'diamond' | 'master' | 'sage' | 'legend';

export type League = {
  id: string;
  /** Hangi tier'a ait grup */
  tier: LeagueTier;
  /** Hafta numarası, ISO formatı (e.g., "2026-W17") */
  weekId: string;
  /** Lige atanmış kullanıcılar */
  participants: LeagueParticipant[];
  /** Pazar 23:59 UTC+3 */
  endsAt: string;
};

export type LeagueParticipant = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  /** Bu hafta kazanılan XP */
  weeklyXP: number;
  /** Tier içindeki sıralama (1 = en üst) */
  rank: number;
  /** Son aksiyon zamanı — decay hesaplaması için */
  lastActivityAt: string;
  /** Demote/promote flag (hafta sonu hesaplandıktan sonra) */
  outcome: 'promote' | 'hold' | 'demote' | null;
};

export type UserLeagueState = {
  userId: string;
  currentTier: LeagueTier;
  highestTier: LeagueTier;
  currentLeagueId: string | null;
  /** Bu hafta kazanılan XP (lifetime'dan ayrı) */
  weeklyXP: number;
  /** Decay grace dönemi bitiş zamanı */
  protectionUntil: string | null;
  /** Bu hafta freeze hakkı */
  freezesAvailable: number;
  freezesUsedThisWeek: number;
  /** Promosyon/demosyon geçmişi son 8 hafta */
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
```

---

## 4. Servis katmanı

`services/league.service.ts` (yeni):

```ts
leagueService.getCurrentLeague(): Promise<League>
leagueService.getUserState(userId): Promise<UserLeagueState>
leagueService.contributeXP(userId, xp): Promise<void>
  // Görev tamamlandığında çağrılır. weeklyXP'yi artırır, lastActivityAt günceller.

leagueService.simulateWeekEnd(): Promise<LeagueResult>
  // Mock için: haftalık reset, promote/demote hesabı, yeni gruba atama.

leagueService.applyDailyDecay(): Promise<void>
  // App açılışında çağrılır. Üst tier'lar için son 24h aktif değilse XP düşürür.
  // Eşik altına inerse tier düşürür.

leagueService.useFreeze(userId): Promise<{ ok: boolean; until: string }>
  // Kullanıcı sınav günü "donmuş" kalmak için ister.
```

### Decay hesaplama mantığı

```ts
// modules/league.ts
export function calculateDecay(state: UserLeagueState, now: Date): number {
  if (!isUpperTier(state.currentTier)) return 0;
  if (state.protectionUntil && new Date(state.protectionUntil) > now) return 0;

  const last = new Date(state.history[0]?.weekId ?? state.protectionUntil ?? now);
  const hoursIdle = (now.getTime() - new Date(state.lastActivityAt).getTime()) / 3.6e6;
  if (hoursIdle < 24) return 0;

  const rate = DECAY_RATE[state.currentTier]; // 0.05 / 0.08 / 0.12
  return Math.floor(state.weeklyXP * rate);
}
```

### Hafta resetleme mantığı

- Pazar 23:59 (Türkiye saati) — hafta kapanır
- İlk 5 → bir tier yükselir, yeni gruba random atanır
- 6–20 → aynı tier'da yeni gruba atanır
- 21–30 → bir tier düşer (Acemi hariç)
- Tüm kullanıcılar için `weeklyXP = 0`
- Yeni hafta başı + 48 saat protection

---

## 5. UI / Komponentler

### Yeni komponentler

- `LeagueBanner` — Progress ekranının üstünde tier rozeti, sıralama, XP, geri sayım
- `LeagueLeaderboardScreen` — 30 kişilik tablo. Top 5 yeşil bant, son 10 kırmızı bant
- `RankBadge` — Avatar yanına/profile'a yerleştirilebilir küçük lig rozeti
- `LeaguePromotionModal` — Hafta resetinde gösterilecek "Bir tier yükseldin!" full-screen
- `DecayWarningToast` — "Bugün bir görev tamamlamazsan XP'in azalmaya başlayacak"
- `FreezeBottomSheet` — Donma günü kullanma onayı
- `LeagueIntroOverlay` — İlk açılışta lig sisteminin nasıl çalıştığını anlatan slayt

### Animasyonlar

- Promosyon: confetti + tier rozeti büyüme animasyonu (LevelUpModal benzeri)
- Demosyon: ekrana hafifçe shake + "Düşürüldün ama yine de iyi gidiyorsun" tonlu copy
- Decay tetiği: küçük ama dikkat çeken sarı pulse, gün sonu yaklaştıkça kırmızıya döner
- Sıralama değişimi: leaderboard satırlarında yumuşak FlipMove tipi geçiş

### Bottom tab / Progress entegrasyonu

- `ProgressScreen`'in en üstüne `LeagueBanner`
- "Tüm sıralamayı gör" → `LeagueLeaderboardScreen` (Stack screen)
- `RankBadge` → `ProfileScreen`'in identity card'ında
- `HomeScreen`'e küçük "Lig durumunuz" özet kartı

---

## 6. Mock data

`mock/mock-league.ts`:

- 30 kişilik altın tier ligi
- Furkan dahil 5 farklı kullanıcı isim/avatar/skoru
- 1 hafta süresi, 4 gün kalan endsAt
- Furkan'ın tier history'si: Bronz → Gümüş → Altın

---

## 7. Bildirimler

- **Decay warning** (Usta+): Saat 21:00, bugün 0 görev → "Lig XP'in azalmak üzere"
- **Day before reset**: Cumartesi 20:00, eğer top 5 dışındaysa → "Top 5'e girmek için
  X XP eksik"
- **Promosyon**: Pazar 23:59 sonrası "Bir tier yükseldin!"
- **Freeze hatırlatma**: Sınav takvimi varsa, sınav günü sabahı "Donma günü kullanmak
  ister misin?"

---

## 8. Faz planı

### Faz A — Temel lig (no decay, no notifications)
- [ ] `types/league.ts` ve `League`, `LeagueParticipant`, `UserLeagueState` tipleri
- [ ] `mock/mock-league.ts` — bir adet altın tier 30 kişilik mock ligi
- [ ] `services/league.service.ts` — getCurrentLeague, getUserState, contributeXP
- [ ] `modules/league.ts` — tier eşikleri, simulateWeekEnd, promotion mantığı
- [ ] `components/League/LeagueBanner.tsx`
- [ ] `components/League/RankBadge.tsx`
- [ ] `screens/LeagueLeaderboardScreen` (Stack)
- [ ] `ProgressScreen`'a `LeagueBanner` entegrasyonu
- [ ] `ProfileScreen`'a `RankBadge` entegrasyonu
- [ ] TaskDetail completion → leagueService.contributeXP

### Faz B — Promosyon / demosyon görselleştirmesi
- [ ] `LeaguePromotionModal` ve `LeagueDemotionToast`
- [ ] Hafta sonu mock simülasyonu (`simulateWeekEnd`) — geliştirici menüsünden tetiklenebilir
- [ ] Tier history grafiği (`ProgressScreen` veya `LeagueScreen` içinde küçük strip)

### Faz C — Üst tier decay
- [ ] `modules/league.ts` `calculateDecay` fonksiyonu
- [ ] App açılışında ve gece yarısı decay uygulaması (mock için: app focus event'inde)
- [ ] `DecayWarningToast` — günde maksimum 1 kez göster
- [ ] Protection (48h) yeni promosyon sonrası
- [ ] `freezesAvailable` mock sistemi
- [ ] `FreezeBottomSheet` UX

### Faz D — Bildirimler ve bağlam
- [ ] Decay warning push (21:00)
- [ ] Reset day reminder (Cumartesi 20:00)
- [ ] Promosyon bildirimi (Pazar 23:59 sonrası)
- [ ] LeagueIntroOverlay onboarding'da

### Faz E — Polish ve sezonluk
- [ ] Tier'a özel emblems (custom SVG'ler veya emoji kombinasyonu)
- [ ] Leaderboard'da haftalık MVP highlight
- [ ] Sezonluk tier renkleri / temalar (örn. "Yaz Sezonu")
- [ ] Lig profili paylaşımı (screenshot / story export)

---

## 9. Risk ve dikkat

- **Decay agresif olmamalı**: Hastalık, sınav, askerlik gibi durumlar → freeze günleri
  yeterli güvence vermeli
- **Acemi tier'da düşme yok**: Yeni kullanıcı kaybetmesin
- **30 kişilik grup boyutu**: Az olursa baskı yok, çok olursa kaybolursun. 30 ideal
  (Duolingo da öyle)
- **Hile riski**: Kolay görev spam'i — `DAILY_XP_CAP` (mevcut: 300) lig XP'sine de
  uygulanmalı
- **Kötü hissettirme**: Demosyonda copy nazik olmalı: "Bu hafta tempo düştü, ama
  yarın yeni bir başlangıç"

---

## 10. Bağlantılar

- `docs/04-gamification.md` — XP, level, streak temelleri
- `docs/05-social-and-clans.md` — Klan ile birlikte ele alınmalı
- `docs/feature-plans/02-klan-revamp-chat-boss.md` — Boss fight de lig XP'sine katkı
  yapacak
