# PergamonApp — Development Roadmap & TODO

Referans: `docs/` klasörü (00–09 arası dokümanlar)
MVP sonrası büyük özellik planları: `docs/feature-plans/` (lig, klan revamp,
zenginleştirilmiş profil, program sistemi)

---

## Faz 0 — Proje Altyapısı

- [x] Expo projesi kurulumu ve bağımlılık konfigürasyonu
- [x] TypeScript ayarları
- [x] Klasör yapısı (`screens/`, `components/`, `services/`, `types/`, `theme/`, `mock/`, `modules/`)
- [x] Tema sistemi (colors, spacing, radius, typography, shadows)
- [x] Navigation altyapısı — Bottom Tab + Stack Navigator
- [x] SafeAreaProvider entegrasyonu
- [x] Dark theme renk paleti

---

## Faz 1 — Domain Model & Servisler

- [x] `Habit` tipi (frequency, streak, skillIds, difficulty, xpReward…)
- [x] `Todo` tipi (priority, dueDate, difficulty, xpReward…)
- [x] `UserProgress` tipi
- [x] `User` tipi
- [x] `SkillId` enum
- [x] Mock veri (habits, todos, user, progress, clan)
- [x] `habitsService` (getTodayHabits, completeHabit, createHabit, deleteHabit, getHabitById, uncompleteHabit)
- [x] `todosService` (getTodos, completeTodo, createTodo, deleteTodo, getTodoById, uncompleteTodo, failTodo)
- [x] `progressService`
- [x] `profileService`
- [x] XP modülü (`modules/xp.ts`)
- [x] Level modülü (`modules/level.ts`)
- [x] Streak modülü (`modules/streak.ts`)

---

## Faz 2 — Tasks Ekranı

- [x] `TasksScreen` — Habit listesi + Todo listesi
- [x] Filter tabs (All / Habits / To Do)
- [x] `UserProgressCard` komponenti
- [x] `HabitRow` komponenti (complete butonu, skill emoji'leri, difficulty)
- [x] `TodoRow` komponenti (complete butonu, priority, xp badge)
- [x] `CategoriesBottomSheet` komponenti (3 çizgi menüsü)
- [x] `NewCategoryDialog` komponenti
- [x] `DeleteCategoryDialog` komponenti
- [x] Floating Add Button (FAB) → CreateTask ekranına yönlendirme
- [x] HabitRow / TodoRow tıklanınca TaskDetail'e yönlendirme

---

## Faz 3 — Task Oluşturma Ekranı

- [x] `CreateTaskScreen` — tam form
- [x] Habit / Todo type seçimi
- [x] Skill seçimi (multi-select pill'lar)
- [x] Difficulty slider
- [x] Frequency seçimi (Daily / Weekly / Monthly / Yearly / Custom)
- [x] Deadline seçimi (Today / Tomorrow / 1 week / Custom)
- [x] Estimated duration seçimi
- [x] `SectionCard` komponenti
- [x] `PillButton` komponenti
- [x] `SliderRow` komponenti

---

## Faz 4 — Task Detay Ekranı

- [x] `TaskDetailScreen` — taska tıklanınca açılan detay sayfası
- [x] Category + Difficulty kartları
- [x] Energy cost / Health cost / Coins Reward kartları
- [x] Weekly Activity grid (7 günlük, hafta navigasyonu)
- [x] Skills bölümü (pill + XP değerleri)
- [x] Task Details bölümü (Frequency, Status, Deadline, Priority, Duration, Created, Multiplier)
- [x] FAB menüsü (☰ → Completed ✓ / Fail ✗ / Edit ✎ / Undo ↩)
- [x] Silme butonu + confirm dialog
- [x] Navigation type güncellemesi (`TaskDetail` route)

---

## Faz 5 — Auth & Onboarding

- [ ] Splash screen
- [ ] Auth ekranı (giriş / kayıt)
- [ ] Onboarding flow:
  - [ ] Hedef seçimi
  - [ ] 3 odak alanı seçimi
  - [ ] İlk habit ekleme
  - [ ] İlk todo ekleme
  - [ ] Skill eşleştirme
  - [ ] İlk completion deneyimi
  - [ ] XP kazanımı gösterimi
  - [ ] Clan join önerisi

---

## Faz 6 — Home Ekranı

- [x] Today plan kartı
- [x] Bugün yapılacak habitler (özet)
- [x] Öncelikli todo'lar (özet)
- [x] Günlük XP özeti
- [x] Quick complete butonu
- [x] Quick add butonu (CreateTask kısayolu)

---

## Faz 7 — Progress Ekranı

- [x] Toplam XP + Level gösterimi
- [x] Level progress bar
- [x] Skill bar'ları (her skill için ayrı seviye)
- [x] Streak kartları (günlük, haftalık)
- [x] Achievement / badge sistemi (mock veri ile, kilitli/açılmış ayrımı)
  - [x] "İlk 7 gün streak" rozeti
  - [x] "100 görev tamamlandı" rozeti
  - [x] vb.
- [x] Haftalık istatistik grafikleri

---

## Faz 8 — Clan Ekranı

- [x] Clan oluşturma / katılma
- [x] Clan overview (üyeler, haftalık katkı)
- [x] Member aktivite akışı
- [x] Haftalık clan challenge
- [x] Davet / join mekanizması
- [x] Hero + Discover empty state tasarımı
- [x] Popüler klanlar keşfet listesi (void gradient efekti)

---

## Faz 9 — Profil Ekranı

- [x] Avatar gösterimi
- [x] Rozetler / başarılar vitrini (top skill kartları + stat tile'ları)
- [x] Tercihler (bildirim, tema, sesli hatırlatıcı toggle'ları)
- [x] Hesap ayarları (e-posta, hakkında, çıkış, düzenleme modal'ı)

---

## Faz 10 — Gamification Katmanı (Derinleştirme)

- [x] Completion animasyonu (XP gain efekti) — `XPGainOverlay` (particles, ring burst, skill badges, progress bar)
- [x] Level-up ekranı / modal — `LevelUpModal` (confetti, glow rings, bounce animations)
- [x] Streak mileston bonus XP — `StreakMilestoneToast` (slide-in toast, milestone data for 3/7/14/30/60/100)
- [x] Clan event tamamlama bonusu — `ClanChallengeBonusToast` + `clanService.claimChallengeBonus` (TaskDetail cascade entegre)
- [x] Daily challenge sistemi — `DailyChallengeCard` (progress bars, countdown timer, XP rewards)
- [x] Sezonluk event altyapısı — `SeasonalEventBanner` (shimmer, pulse, multiplier badge)
- [x] TaskDetailScreen entegrasyonu (complete → XP anim → level-up → streak toast)
- [x] TasksScreen entegrasyonu (daily challenges + seasonal event banner)

---

## Faz 11 — Backend Entegrasyonu

- [ ] API katmanı kurulumu (Axios / fetch wrapper)
- [ ] Auth (JWT veya OAuth)
- [ ] Habit CRUD API
- [ ] Todo CRUD API
- [ ] Progress API
- [ ] User / Profile API
- [ ] Clan API
- [ ] Mock servislerin gerçek API'ye taşınması

---

## Faz 12 — Gelişmiş Özellikler (Post-MVP)

- [ ] Gelişmiş avatar editörü
- [ ] Marketplace / item sistemi
- [ ] Deep analytics paneli
- [ ] AI coach entegrasyonu
- [ ] Sesli görev ekleme (voice input)
- [ ] Widget desteği (iOS / Android)
- [ ] Smart reminder otomasyonu
- [ ] Advanced clan wars

---

## Faz 13 — Tab Bar Konsolidasyonu

> Detaylı plan: `docs/feature-plans/04-tab-bar-konsolidasyonu.md`

- [ ] `MainTabParamList` Progress kaldır, League ekle
- [ ] `RootStackParamList` Achievements ekle
- [ ] `AppNavigator` Tab/Stack yeniden yapılandırma
- [ ] `src/components/Profile/` paylaşılan komponentler (LevelHeroCard, WeeklyXPChart, SkillBarsCard, AchievementsStrip)
- [ ] `ProfileScreen` 10 section ile rebuild
- [ ] `AchievementsScreen` (Stack)
- [ ] `src/screens/ProgressScreen/` sil + exports temizle

---

## Faz 14 — Ranked Lig Sistemi

> Detaylı plan: `docs/feature-plans/01-ranked-lig-sistemi.md`

- [ ] 10 tier (Acemi → Elmas) + `League`, `UserLeagueState` tipleri
- [ ] Haftalık 30 kişilik gruplar + Pazar reset
- [ ] Habit Heartbeat (banked-day sistemi, max 7)
- [ ] Yakut+ apex decay (5/8/10%/gün)
- [ ] `RankBadge`, `HeartbeatBar`, `LeagueBanner`, `LeagueScreen` (yeni tab)
- [ ] Promosyon / demosyon modal + toast
- [ ] Freeze günleri (1/hafta + 100-gün streak hediyesi)
- [ ] Decay warning + reset reminder push'ları
- [ ] Diamond Tournament (Faz F)

---

## Faz 15 — Zenginleştirilmiş Profil & Kimlik

> Detaylı plan: `docs/feature-plans/03-zenginlestirilmis-profil.md`

- [ ] `UserIdentity` veri modeli + mock
- [ ] Onboarding wizard (yaş, eğitim, hedef, focus, görünürlük)
- [ ] `IdentityChipRow`, `CurrentFocusCard`, `ProfileCompletionCard`
- [ ] Aktivite heatmap (12 hafta × 7 gün)
- [ ] `PublicProfileScreen` + visibility filtreleme
- [ ] Klan join / lig grup atama gating

---

## Faz 16 — Klan Revamp: Chat + Şeffaf Katkı

> Detaylı plan: `docs/feature-plans/02-klan-chat-revamp.md`

- [ ] Klan chat altyapısı (mock + system messages)
- [ ] `ClanChatList`, `ClanChatBubble` (user + system varyantları), `ClanChatInput`
- [ ] Otomatik sistem mesajları (görev / level-up / streak / klan bonus)
- [ ] Member Insights paneli (haftalık bar chart, comparative streaks)
- [ ] Roles & permissions (owner/admin/member)
- [ ] Klan quests (haftalık koop görevler)
