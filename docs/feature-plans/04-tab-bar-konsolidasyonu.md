# 04 — Tab Bar Konsolidasyonu (Progress → Profile, League tab açma)

> Mevcut alt tab bar **5** sekmeli: Home, Tasks, Progress, Clan, Profile. Lig
> sistemi (`01-ranked-lig-sistemi.md`) yeni bir **League / Lig** sekmesi
> istiyor ki retention dürtüsü her zaman görünür olsun. 6 tab GlassTabBar'da
> görsel olarak sıkışıyor (özellikle <360px ekranlarda). Çözüm: **Progress
> sekmesini Profile'a tamamen eritmek**, slotu League'a açmak.

---

## 1. Problem

- 5 tab → 6 tab sıkışma. `src/navigation/AppNavigator.tsx` GlassTabBar
  56px aktif pill kullanıyor; 6 tab × ~55px = 330px+ minimum, 360px ekranda
  kenardan taşar
- Roadmap (Faz 2 tab map) zaten 5 tab varsayıyor: Home / Tasks / Progress /
  Clan / Profile
- League sistemi tab seviyesinde olmazsa kullanıcı her gün açıp bakmaz →
  decay/heartbeat baskısı sönükleşir
- "Skill bars / achievement / weekly XP" Progress'te yaşıyor ama bunlar
  aslında **kullanıcı kimliğinin parçası** — Profile'a daha mantıklı

---

## 2. Üç seçenek karşılaştırması

| Seçenek                                            | Tab sayısı | Avantaj                                | Dezavantaj                               |
| -------------------------------------------------- | ---------- | -------------------------------------- | ---------------------------------------- |
| A. 6 tab (Progress + League ikisi de tabar)        | 6          | hiçbir şey kaybolmaz                   | sıkışık, roadmap'le çelişir              |
| B. League stack screen (Home'dan veya Progress'ten erişim) | 5  | mevcut yapıyı bozmaz             | League fark edilmez, retention düşer     |
| **C. Progress → Profile, League yeni tab** ✅      | 5          | League tab seviyesinde, Profile zenginleşir, roadmap uyumlu | Profile uzun bir scroll'a dönüşür (yönetilebilir) |

**Karar: C**. Profile zaten "kullanıcı kimliği" sekmesi; level/XP/skill/achievement
oraya taşınınca anlamlı bir bütün oluşur.

---

## 3. Yeni tab yapısı

```
Home   →  Tasks  →  League (NEW)  →  Clan  →  Profile (Profile + Progress + Skills)
```

`MainTabParamList`:

```ts
export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  League: undefined;     // NEW
  Clan: undefined;
  Profile: undefined;    // Now contains old Progress sections
};
```

Tab icon mapping (`AppNavigator.tsx` `TAB_ICONS`):

```ts
{
  Home: 'home-outline',
  Tasks: 'checkmark-done-outline',
  League: 'trophy-outline',     // NEW
  Clan: 'shield-outline',
  Profile: 'person-outline',
}
```

Progress için `'stats-chart-outline'` ikonu artık Profile içindeki "İstatistikler"
section header'ında ya da `SkillStatistics` Stack ekranında görünür.

---

## 4. Yeni Profile yapısı (10 section)

Profile uzun ama section'larla bölündüğünde okunabilir kalıyor.

| #  | Section                | Kaynak                          |
| -- | ---------------------- | ------------------------------- |
| 1  | Identity card          | mevcut ProfileScreen            |
| 2  | League / Rank summary  | NEW (`01-ranked-lig-sistemi.md`)|
| 3  | Stat grid (4 tile)     | mevcut ProfileScreen            |
| 4  | Level hero card        | **ProgressScreen'dan taşındı**  |
| 5  | Weekly XP chart        | **ProgressScreen'dan taşındı**  |
| 6  | Skill bars (top 6)     | **ProgressScreen'dan taşındı**  |
| 7  | Achievements strip     | **ProgressScreen'dan taşındı**  |
| 8  | Top skills (link)      | mevcut, Section 6 ile birleşir  |
| 9  | Preferences toggles    | mevcut                          |
| 10 | Account links          | mevcut                          |

> Section 6 üst 6 skill gösterir; "Tümünü gör" → mevcut `SkillsScreen` Stack.
> Section 7 son 5 achievement strip; "Tümünü gör" → yeni `AchievementsScreen` Stack.

---

## 5. Kod değişiklikleri

### `src/types/navigation.ts`

```ts
export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  League: undefined;       // NEW
  Clan: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // ...existing...
  Achievements: undefined;  // NEW
};
```

### `src/navigation/AppNavigator.tsx`

- `Tab.Screen name="Progress"` kaldırılır
- `Tab.Screen name="League" component={LeagueScreen}` eklenir
- `Stack.Screen name="Achievements" component={AchievementsScreen}` eklenir
- TAB_ICONS güncellenir

### `src/screens/ProgressScreen/` — silinir

İçeriği Profile'a taşındığı için tamamen kaldırılır. Reusable parçalar
`src/components/Profile/` altına çıkarılır:

- `LevelHeroCard.tsx` (eski Progress'in `levelHero` styles'ı)
- `WeeklyXPChart.tsx` (eski Progress'in chart logic'i + `buildWeeklyXP`)
- `SkillBar.tsx` (eski `SkillBar` ProgressScreen içinden)
- `AchievementBadge.tsx` (eski Progress'tan)
- `StatTile.tsx` (zaten Profile'da var, oradan kullan)

### `src/screens/ProfileScreen/ProfileScreen.tsx`

10 section sırasıyla yerleşir:

```tsx
<ScrollView>
  <IdentityCard />
  <LeagueSummaryCard />        {/* NEW */}
  <StatGrid />
  <LevelHeroCard />            {/* moved */}
  <WeeklyXPChart />            {/* moved */}
  <SkillBarsCard limit={6} />  {/* moved, "Tümünü gör" → Skills */}
  <AchievementsStrip limit={5} /> {/* moved, "Tümünü gör" → Achievements */}
  <PreferencesCard />
  <AccountLinksCard />
</ScrollView>
```

### `src/screens/AchievementsScreen/` (NEW)

Tüm achievement listesi — kilitli/açık ayrımı, kategori filtreleri, tarih
sıralaması. Stack screen.

### `src/screens/HomeScreen/HomeScreen.tsx`

Quick action "İstatistikler" CTA'sı zaten `SkillStatistics`'e gidiyor — değişiklik yok.

### `src/screens/index.ts`

```ts
// remove
export * from './ProgressScreen';

// add
export * from './LeagueScreen';
export * from './AchievementsScreen';
```

### `src/components/index.ts`

`Profile/` namespace altında yeni paylaşılan komponentler exports edilir.

---

## 6. Faz planı

### Faz A — Navigation + types
- [ ] `MainTabParamList` ve `RootStackParamList` güncelle
- [ ] `AppNavigator.tsx` Progress tab kaldır, League tab ekle, Achievements stack ekle
- [ ] TAB_ICONS map güncelle ('league' icon)
- [ ] Build temiz mi kontrol et

### Faz B — ProfileScreen rebuild
- [ ] `src/components/Profile/LevelHeroCard.tsx` (Progress'tan migration)
- [ ] `src/components/Profile/WeeklyXPChart.tsx` (Progress'tan migration)
- [ ] `src/components/Profile/SkillBarsCard.tsx` (limit prop'lu)
- [ ] `src/components/Profile/AchievementsStrip.tsx` (limit prop'lu)
- [ ] `src/components/Profile/LeagueSummaryCard.tsx` (NEW, `01-ranked-lig-sistemi.md` ile entegre)
- [ ] `ProfileScreen` yeniden compose et (10 section)
- [ ] Smooth scroll + section anchorlarını kontrol et

### Faz C — AchievementsScreen
- [ ] `src/screens/AchievementsScreen/AchievementsScreen.tsx` (Stack)
- [ ] Filtreleme: tümü / açılmış / kilitli
- [ ] Kategori sekmeleri (streak, level, social vs.)
- [ ] Profile'daki `AchievementsStrip` "Tümünü gör" link'i bu ekrana

### Faz D — Cleanup
- [ ] `src/screens/ProgressScreen/` klasörünü sil
- [ ] `src/screens/index.ts` exports güncelle
- [ ] HomeScreen'da Progress'e gönderen herhangi bir CTA varsa sil veya yönlendir
- [ ] todo.md'de Faz 7 (Progress Ekranı) entry'sini "tamamlandı" yerine "Profile'a entegre edildi" notu olarak işaretle

---

## 7. Edge case'ler ve riskler

- **Profile çok uzun scroll**: Section'lar arası "anchor" sticky tab-strip eklenebilir
  (scroll position'a göre highlight). Faz B'de değil, Faz C+ polish'te değerlendir
- **Skills çakışması**: Profile'daki sadece **top 6** skill bar gösterir;
  "Tümünü gör" → mevcut `SkillsScreen` (zaten Stack)
- **HomeScreen quick actions**: "İstatistikler" CTA'sı `SkillStatistics`'e gider, dokunma
- **Animation/scroll perf**: Uzun ScrollView için `removeClippedSubviews`, gerekirse
  `FlatList` section'lar
- **Geri dönüş yolu**: `Skills` veya `Achievements` Stack'ten geri → Profile tab'a düş
- **Boş state**: Mevcut kullanıcının bazı section'ları boşsa nazik fallback'ler
  ("Henüz achievement açmadın")
- **Onboarding**: Yeni kullanıcı Profile sıralamasını kafa karıştırıcı bulabilir;
  ilk açılışta mini coach mark gösterilebilir (Faz E)

---

## 8. Bağlantılar

- `docs/feature-plans/01-ranked-lig-sistemi.md` — League tab içeriği + RankBadge
- `docs/feature-plans/02-klan-chat-revamp.md` — Klan tab değişmiyor
- `docs/feature-plans/03-zenginlestirilmis-profil.md` — Profile zaten zenginleşiyor;
  bu plan onun üstüne **Progress'in tüm content'ini** ekliyor
- `docs/06-ux-and-ia.md` — Bilgi mimarisi tek doğrulayıcı kaynak



