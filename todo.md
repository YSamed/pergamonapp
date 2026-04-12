# PergamonApp — Development Roadmap & TODO

Referans: `docs/` klasörü (00–09 arası dokümanlar)

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

- [ ] Today plan kartı
- [ ] Bugün yapılacak habitler (özet)
- [ ] Öncelikli todo'lar (özet)
- [ ] Günlük XP özeti
- [ ] Quick complete butonu
- [ ] Quick add butonu

---

## Faz 7 — Progress Ekranı

- [ ] Toplam XP + Level gösterimi
- [ ] Level progress bar
- [ ] Skill bar'ları (her skill için ayrı seviye)
- [ ] Streak kartları (günlük, haftalık)
- [ ] Achievement / badge sistemi
  - [ ] "İlk 7 gün streak" rozeti
  - [ ] "100 görev tamamlandı" rozeti
  - [ ] vb.
- [ ] Haftalık istatistik grafikleri

---

## Faz 8 — Clan Ekranı

- [ ] Clan oluşturma / katılma
- [ ] Clan overview (üyeler, haftalık katkı)
- [ ] Member aktivite akışı
- [ ] Haftalık clan challenge
- [ ] Davet / join mekanizması

---

## Faz 9 — Profil Ekranı

- [ ] Avatar gösterimi
- [ ] Rozetler / başarılar vitrini
- [ ] Tercihler (bildirim, tema vb.)
- [ ] Hesap ayarları

---

## Faz 10 — Gamification Katmanı (Derinleştirme)

- [ ] Completion animasyonu (XP gain efekti)
- [ ] Level-up ekranı / modal
- [ ] Streak mileston bonus XP
- [ ] Clan event tamamlama bonusu
- [ ] Daily challenge sistemi
- [ ] Sezonluk event altyapısı

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
