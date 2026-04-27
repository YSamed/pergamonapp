# 04 — Program Sistemi: Okulun Yerine Geçen Yapı

> "Starbucks ikinci ev gibi → biz de okulun yerine geçen merkez." Okulun değer
> ürettiği özellik ne? **Belirli görevler, deadline'lar, ara sınavlar, geri
> bildirim döngüsü, sınıf arkadaşları.** Bu özelliğin ana fikri: kullanıcının
> kendi başına çalıştığı şeyi (YKS, kodlama, dil, üniversite dersi) bir
> "müfredat çerçevesine" oturtmak. Üzel okula gitmeden de aynı disiplini
> verebilen sistem.

---

## 1. Vizyon

Program = **personel müfredat + zaman çerçevesi + ölçüm noktaları**. Habit ve
todo'larından üst bir katman. Dört temel parça:

1. **Şablon program** — sistemin önceden tanımladığı YKS Sayısal, Frontend Roadmap,
   B2 İngilizce, Algoritma Temelleri gibi yol haritaları
2. **Milestones** — 1–4 haftalık periyotlarda tamamlanması beklenen "hafta hedefleri"
3. **Mock exam / checkpoint** — programın sonunda veya milestone aralarında
   self-assessment veya ortak/birlikte yapılan denemeler
4. **Feedback loop** — milestone sonu otomatik özet: "Bu 4 haftada planın %62'sini
   bitirdin, en zayıf konu 'Türev', önerilen 3 görev şunlar"

Kullanıcı "bir programa kayıtlıyım" hissi yaşamalı. Klanlarla çakışacak: aynı
programı çalışan klan üyeleri otomatik gruplanabilir, ortak milestone'da
yarışabilir.

---

## 2. Veri modeli

```ts
// types/program.ts
export type ProgramKind =
  | 'yks-sayisal'  | 'yks-ea'  | 'yks-sozel'  | 'yks-dil'
  | 'kpss-genel'   | 'frontend-roadmap'  | 'backend-roadmap'
  | 'mobile-roadmap' | 'language-b2'    | 'algorithms-101'
  | 'university-course' | 'custom';

export type ProgramTemplate = {
  id: string;
  kind: ProgramKind;
  title: string;          // "YKS Sayısal — 2027 hazırlık"
  subtitle: string;       // "Matematik, Fizik, Kimya, Biyoloji"
  durationWeeks: number;  // örn. 36
  /** Önerilen başlangıç tarihi (örn. Eylül başı) */
  recommendedStart: string | null;
  milestones: ProgramMilestone[];
  /** Görsel: tema rengi, ikon */
  accentColor: string;
  emoji: string;
  tags: string[];
};

export type ProgramMilestone = {
  id: string;
  title: string;             // "Türev temelleri"
  weekIndex: number;         // 0-based (programın kaçıncı haftası)
  durationWeeks: number;     // 1–4
  /** Bu milestone içinde önerilen habit/todo şablonları */
  recommendedTasks: TaskTemplate[];
  /** Sonunda yapılacak değerlendirme */
  checkpoint: ProgramCheckpoint | null;
};

export type TaskTemplate = {
  id: string;
  title: string;
  type: 'habit' | 'todo';
  difficulty: Difficulty;
  skillIds: SkillId[];
  /** Habit için frequency, todo için durationDays */
  cadence: HabitFrequency | { kind: 'todo'; durationDays: number };
};

export type ProgramCheckpoint = {
  id: string;
  kind: 'self-quiz' | 'mock-exam' | 'reflection' | 'project-submission';
  title: string;
  description: string;
  /** Self-quiz için soru bankası referansı */
  quizBankId: string | null;
  /** Mock exam için zaman, soru sayısı */
  examConfig: { durationMin: number; questionCount: number } | null;
  /** Reflection için yönlendirici sorular */
  prompts: string[];
};

export type UserProgram = {
  id: string;
  userId: string;
  templateId: string;
  startedAt: string;
  /** Hedeflenmiş bitiş — sınav günü gibi */
  targetEndDate: string;
  /** Aktif milestone index */
  currentMilestoneIndex: number;
  state: 'active' | 'paused' | 'completed' | 'abandoned';
  /** Her milestone için tamamlanma yüzdesi */
  milestoneProgress: { milestoneId: string; completion: number }[];
  /** Checkpoint sonuçları */
  checkpointResults: CheckpointResult[];
  /** Bağlı task'lar */
  spawnedTaskIds: string[];
};

export type CheckpointResult = {
  checkpointId: string;
  takenAt: string;
  score: number | null;       // mock-exam / self-quiz için
  reflection: string | null;  // free text
  weakAreas: string[];        // ["Türev", "Üstel fonksiyonlar"]
  recommendation: string;     // sistem üretir
};
```

---

## 3. Kullanıcı akışı

### 3.1. Programa kayıt
1. `ProfileScreen.primaryGoal` "yks-sayisal-2027" olarak set edilmiş
2. Sistem otomatik öneri: "YKS Sayısal — 2027 programı senin için hazır"
3. Kullanıcı "Başla" → `UserProgram` oluşturulur, ilk milestone açılır
4. Önerilen task template'leri Habit/Todo olarak otomatik yaratılır (kullanıcı
   onay ile veya tek tıkla "tamamını ekle")

### 3.2. Haftalık döngü
- Pazartesi sabah: milestone özeti + "Bu hafta yapılması gerekenler" notification
- Hafta boyunca: standart task completion akışı
- Pazar akşam: milestone tamamlandı mı? Tamamlandıysa checkpoint açılır,
  tamamlanmadıysa "Eksik kalanlar" kartı

### 3.3. Checkpoint
- Self-quiz: 10 soruluk hızlı self-assessment, score + zayıf alanlar listesi
- Mock-exam: Tam YKS denemesi (180 dk, 80 soru) — opsiyonel ama shimmer
  rozet
- Reflection: 3 yönlendirici soru, bu hafta neyi öğrendin / neye takıldın /
  bir sonraki hafta nasıl başlayacaksın
- Project-submission: Kodlama programları için → public profile'da showcase

### 3.4. Geri bildirim raporu
Milestone sonu otomatik özet:
- Tamamlanan görev sayısı
- Plan vs gerçek (% ne yaptın)
- Zayıf alanlar (checkpoint sonucundan)
- 3 spesifik öneri ("Türev konusunda haftaya 2 ek video pratiği")
- Klan içi karşılaştırma (sadece izin varsa)

---

## 4. Servis katmanı

```ts
// services/program.service.ts
programService.listTemplates(filter?): Promise<ProgramTemplate[]>
programService.getTemplate(id): Promise<ProgramTemplate>
programService.suggestForUser(userId): Promise<ProgramTemplate[]>
  // Kullanıcı identity'sine göre öneri (primaryGoal eşleşmesi)
programService.startProgram(userId, templateId, targetEndDate): Promise<UserProgram>
programService.getActiveProgram(userId): Promise<UserProgram | null>
programService.advanceMilestone(programId): Promise<UserProgram>
programService.recordCheckpoint(programId, checkpointId, result): Promise<CheckpointResult>
programService.generateReport(programId, milestoneId): Promise<MilestoneReport>
```

`modules/program.ts` — milestone progress hesaplama (recommended task'lardan kaçı
tamamlandı, ne kadarı zamanında).

---

## 5. UI / Komponentler

### Yeni ekranlar

- `ProgramsHubScreen` (Stack) — keşfet sayfası: önerilenler + tüm şablonlar
- `ProgramDetailScreen` (Stack) — bir şablonun ayrıntısı: timeline, milestones,
  task previews, "Başla" CTA
- `ActiveProgramScreen` (Stack veya Home tab içinde sticky bölüm) — kullanıcının
  şu anki programı: timeline, mevcut milestone, kalan günler, ilerleme
- `CheckpointScreen` (Stack) — quiz / reflection / mock exam UI'ı
- `MilestoneReportScreen` (Stack) — milestone sonu raporu

### Mevcut ekranlara entegrasyon

- `HomeScreen`: yeni "Aktif programın" kartı (timeline mini-strip + bu haftaki
  hedef sayısı)
- `TasksScreen`: program-spawned task'lar için küçük rozet ("Programdan")
- `ProfileScreen`: aktif program rozeti + tamamlanmış programlar için achievement
- `ClanScreen`: aynı programı çalışan üyeler için "Birlikte çalışıyoruz"
  toplaşması (chat'te sistem mesajı)

### Yeni komponentler

- `ProgramCard` — kapsam, süre, accent renk, emoji, başlama butonu
- `ProgramTimeline` — yatay scroll milestone strip, mevcut nokta vurgulu
- `MilestoneCard` — bu haftaki milestone'un task listesi + ilerleme barı
- `CheckpointPrompt` — bottom sheet, quiz başlatma veya reflection input
- `ReportCard` — milestone bitince çıkan özet kart
- `ProgramSuggestionToast` — profil tamamlandığında "Senin için bir program var"

### Animasyonlar

- Milestone ilerleme: progress arc dolma animasyonu (Lottie veya `Animated.Value`)
- Milestone tamamlandığında: tema rengiyle sayfa flash + rozet pop
- Checkpoint sonucu: skor sayacı 0'dan rakama doğru animate
- Timeline'da node geçişi: yumuşak `translateX` + glow pulse

---

## 6. Şablon program örnekleri (Faz A için en az 3)

### YKS Sayısal — 2027

- 36 hafta, 4 ana faz × 9 hafta
- Faz 1 (1–9): Temel matematik tekrarı, fizik temelleri
- Faz 2 (10–18): Yoğun konu çalışması, türev/integral, mekanik
- Faz 3 (19–27): Soru çözümü, deneme aşamasına geçiş
- Faz 4 (28–36): Tam denemeler, hata defteri, son rötuş
- 9 milestone, her birinde küçük checkpoint + her fazın sonunda mock-exam

### Frontend Roadmap (3 ay)

- 12 hafta, 4 milestone
- M1: HTML/CSS temelleri + flexbox/grid (3 hafta + project)
- M2: JavaScript + DOM (3 hafta + mini todo app)
- M3: React (3 hafta + dashboard project)
- M4: Tailwind + deployment + portfolio (3 hafta + portfolio submission)
- Her milestone sonunda project-submission checkpoint

### B2 İngilizce — 6 ay

- 24 hafta, 6 milestone (4 hafta her biri)
- Reading, listening, writing, speaking dengeli
- Milestone sonu mock test (CEFR-aligned)
- Final hedef: B2 First (FCE) deneme sınavı

### Algoritma Temelleri (8 hafta)

- 8 hafta, 4 milestone (2 hafta her biri)
- Big-O & arrays, linked lists & stacks, trees & graphs, DP & greedy
- Her milestone'da self-quiz (LeetCode-vari 5 problem)

### Custom program

- Kullanıcı kendi milestone'larını yaratabilir (Faz D)

---

## 7. Mock data

`mock/mock-programs.ts`:

- 4 şablon: yks-sayisal, frontend-roadmap, b2-ingilizce, algorithms-101
- Her birinin milestones array'i (kısa ama anlamlı)
- Furkan'ın aktif programı: yks-sayisal, 6 hafta önce başlamış, milestone 2'de

---

## 8. Faz planı

### Faz A — Şablon altyapısı + read-only browse
- [ ] `types/program.ts` tipleri
- [ ] `mock/mock-programs.ts` 4 şablon (yks, frontend, b2, algo)
- [ ] `services/program.service.ts` mock listTemplates, getTemplate
- [ ] `screens/ProgramsHubScreen` keşif sayfası
- [ ] `screens/ProgramDetailScreen` detay sayfası
- [ ] `components/Programs/ProgramCard.tsx`
- [ ] `components/Programs/ProgramTimeline.tsx`
- [ ] `HomeScreen`'e "Programlara göz at" CTA

### Faz B — Programa kayıt & aktif program tracking
- [ ] `startProgram`, `getActiveProgram` servis
- [ ] `screens/ActiveProgramScreen`
- [ ] `components/Programs/MilestoneCard.tsx`
- [ ] Program task'larını otomatik üretme (TaskTemplate → habits/todos)
- [ ] `HomeScreen`'a aktif program özet kartı
- [ ] `TasksScreen`'da program-spawned task rozeti
- [ ] `advanceMilestone` mock (haftalık zaman geçtiğinde)

### Faz C — Checkpoint sistemi
- [ ] `screens/CheckpointScreen` (3 alt mod: quiz, reflection, project)
- [ ] Self-quiz mock soru bankası (5–10 soru × milestone)
- [ ] Reflection input + history
- [ ] `recordCheckpoint` servis
- [ ] `MilestoneReportScreen` özet rapor
- [ ] Mock-exam UI (timer + question navigator) — basit MVP

### Faz D — Smart suggestions & klan entegrasyonu
- [ ] `suggestForUser` — identity.primaryGoal'a göre
- [ ] `ProgramSuggestionToast` profil tamamlanır tamamlanmaz
- [ ] Klan'da "aynı programı çalışan" üye etiketi
- [ ] Ortak milestone yarışı (klan içinde aynı programı çalışanlar arasında)

### Faz E — Custom program builder
- [ ] Kullanıcının kendi milestone'larını eklemesi
- [ ] Drag-drop sıralama (Faz E+ içinde)
- [ ] Topluluk destekli template share (post-MVP)

### Faz F — Adaptive feedback & AI coach (post-MVP)
- [ ] Checkpoint score'larına göre milestone scope ayarlama
- [ ] AI ile zayıf alanlara özel task önerisi
- [ ] Performance trend grafiği

---

## 9. Edge case'ler

- **Program yarıda bırakma**: state = 'abandoned' olur, history'de kalır.
  Yeni programa "geçmiş program 'YKS Sayısal' yarım kaldı, devam etmek ister
  misin?" prompt'u
- **Programı duraklatma**: 'paused' state, target tarih ileri kayar (sınav,
  hastalık)
- **Aynı anda birden fazla program**: Faz A için tek aktif program. Faz E+'da
  paralel programlar (örn. YKS + İngilizce)
- **Mock exam'da düşük skor**: Yumuşak kopya — "Bu deneme öğrenmek için. İşte
  takıldığın 3 nokta..."
- **Milestone gecikmesi**: Otomatik milestone advance OLMAZ; kullanıcı onaylar.
  Geç kaldıysa "1 hafta gerideyiz, planı esnetelim mi?" CTA

---

## 10. Bağlantılar

- `docs/01-product-vision.md` — School-replacement vizyonunun temeli
- `docs/feature-plans/03-zenginlestirilmis-profil.md` — primaryGoal program
  önerisini besler
- `docs/feature-plans/02-klan-revamp-chat-boss.md` — Aynı programı çalışan
  klan üyeleri
- `docs/feature-plans/01-ranked-lig-sistemi.md` — Milestone tamamlama lig XP'si
  multiplier'ına eklenebilir
- `docs/02-core-features.md` — Programları core feature olarak yükselt
