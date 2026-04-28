# 03 — Zenginleştirilmiş Profil & Yapılandırılmış Kimlik

> Habitica'da avatarın vardı, ismin vardı, bio yazabilirdin — ama bunlar opsiyoneldi
> ve "ne yapıyorsun" sorusu hiçbir zaman cevaplanmıyordu. Biz bu boşluğu kapatmak
> istiyoruz: hedef kitlemiz (18–25 yaş YKS adayı / öğrenci / kendi kendine öğrenen)
> profilinde **ne yaptığını net şekilde** beyan etmek zorunda olsun. Klan
> arkadaşların sana "YKS Sayısal 2027" diye baktığında hemen bağlamı görsün.

---

## 1. Vizyon

Profil, sosyal medya bio'su değil; **çalışma kimliğinin özeti**. Üç katman:

1. **Yapılandırılmış kimlik** (zorunlu, açık uçlu değil): yaş, eğitim durumu,
   ana hedef, hedef tarihi
2. **Aktivite görünürlüğü** (otomatik): bu hafta yaptıkların, lig sıralaman, klan
   katkın, boss damage'in
3. **İlham noktası** (yarı-zorunlu): kısa bio + "şu an üzerinde çalıştığım şey"
   alanı (her hafta yenileme nudge'ı)

Habitica modelinin bizdeki farkı: serbest bio'nun yanına **structured fields'ı
zorunlu yapacağız** — özellikle ana hedef ve eğitim durumu olmadan klana
katılamamak veya lig grup atamasının yapılamaması gibi.

---

## 2. Kimlik alanları

### A. Zorunlu yapılandırılmış alanlar (ilk girişte / onboarding'de)

```ts
// types/identity.ts
export type AgeRange = '<18' | '18-21' | '22-25' | '26+';

export type EducationStage =
  | 'high-school'        // Lise öğrencisi
  | 'gap-year'           // YKS hazırlık (mezun)
  | 'university'         // Üniversite öğrencisi
  | 'graduate'           // Mezun, çalışmıyor / iş arıyor
  | 'working'            // Çalışan
  | 'self-learner';      // Sistem dışı, kendi kendine

export type PrimaryGoal =
  | { kind: 'yks'; track: 'sayisal' | 'ea' | 'sozel' | 'dil'; targetYear: number }
  | { kind: 'kpss'; targetYear: number }
  | { kind: 'university-courses'; major: string }
  | { kind: 'coding'; specialty: string } // 'frontend', 'backend', 'mobile', 'ai', 'devops'
  | { kind: 'language'; languageCode: string; targetLevel: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2' }
  | { kind: 'general-discipline' }
  | { kind: 'custom'; label: string };

export type UserIdentity = {
  userId: string;
  ageRange: AgeRange;
  educationStage: EducationStage;
  /** Lise/üniversite öğrencisiyse okul adı (opsiyonel ama nudge edilir) */
  institutionName: string | null;
  primaryGoal: PrimaryGoal;
  /** Dirsek temasında: "DGS adayı", "akademik kariyer" gibi */
  secondaryGoals: PrimaryGoal[];
  /** Şu an üzerinde çalıştığı kısa cümle, haftalık olarak güncellenmesi nudge edilir */
  currentFocus: string | null;
  /** "Söyleyecek 3 kelime ile kendini tanıt" — opsiyonel free text */
  shortBio: string | null;
  /** Profilin ne kadar tamamlandığı (0–100) */
  completion: number;
  visibility: ProfileVisibility;
  updatedAt: string;
};

export type ProfileVisibility = {
  ageRange: 'public' | 'clan' | 'private';
  educationStage: 'public' | 'clan' | 'private';
  institutionName: 'public' | 'clan' | 'private';
  primaryGoal: 'public' | 'clan' | 'private';
  currentFocus: 'public' | 'clan' | 'private';
};
```

### B. Otomatik üretilen alanlar (read-only)

- Toplam XP, level, lig tier
- Aktif streak, en uzun streak
- En güçlü 3 skill
- Bu hafta klan katkısı / boss hasarı
- Aktivite heatmap (son 12 hafta, GitHub-vari grid)
- Achievement koleksiyonu

### C. Kişiselleştirme (opsiyonel)

- Avatar (mevcut iconn.png + ileride özelleştirilebilir)
- Tema rengi (lig tier'a bağlı default; manuel değiştirme premium)
- Kapak fotoğrafı (opsiyonel, ileride)

---

## 3. Onboarding akışı

Eğer `userIdentity.completion < 70`, ilk girişte yarı-zorunlu wizard:

1. **Yaş aralığını seç** (4 buton)
2. **Eğitim durumun?** (6 kart)
3. **Ana hedef** (modal flow):
   - YKS seçtiyse → track + hedef yıl
   - Kodlama seçtiyse → specialty
   - Dil seçtiyse → language picker + level hedefi
4. **Şu an üzerinde çalıştığın şey?** (text input, opsiyonel ama atlanırsa fade hint)
5. **Görünürlük** (varsayılan: clan'a açık, public değil)

Sonuç: "Profilin %80 tamam!" → kalan %20 için nudge zamanlama (3 gün sonra hatırlat).

> Onboarding'i Faz 5 (Auth & Onboarding) ile birlikte ele almak gerekiyor;
> şu an auth atlandı ama onboarding flow profil temelli zorunlu olabilir.

---

## 4. Servis katmanı

Mevcut `profileService` genişler:

```ts
// services/profile.service.ts
profileService.getIdentity(userId): Promise<UserIdentity>
profileService.updateIdentity(userId, patch): Promise<UserIdentity>
profileService.computeCompletion(identity): number  // 0–100
profileService.getActivityHeatmap(userId, weeks?): Promise<HeatmapData>
profileService.getProfileSummary(userId): Promise<ProfileSummary>
  // Public profil görüntüleme: identity (visibility filtreli) + readonly aggregate'ler
```

Aktivite heatmap mevcut `recentXPEvents` ve `completionHistory`'lerden derlenebilir.

---

## 5. UI / Komponentler

### `ProfileScreen` revamp

Mevcut profil ekranı temel; üzerine ekleyecekleriz:

- **Identity card**: avatar + isim + handle altına structured chip row:
  - `🎓 YKS Sayısal 2027` (primaryGoal'a göre formatla)
  - `🏫 Lise 12` (educationStage + institutionName varsa)
  - `📍 İstanbul` (gelecek: konum, şimdilik atla)
- **Profil tamamlanma kartı**: completion %X, "Eksik alanları doldur" CTA
  (sadece kullanıcının kendi profilinde görünür)
- **"Şu an üzerinde çalıştığım"** widget — büyük, alıntı tarzında. 7 günden eski
  ise sönükleştir + "Güncelle" prompt
- **Aktivite heatmap** — GitHub-vari, 12 hafta × 7 gün grid; hover/long-press
  ile günlük detay
- **Top skills** mevcut, dokunma
- **Klan/lig özet kartı**: tier rozeti, mevcut lig sıralaması, klan adı + bu
  hafta katkısı
- **Achievement koleksiyonu** (Progress'tan link, profilde tease olarak ilk 5)

### Diğer kullanıcılar için public profile

`PublicProfileScreen` (Stack):
- Klan üyesine veya lig rakibine dokununca açılır
- Visibility filtresi uygulanır
- Klan üyeleri ek detay görür (institutionName, currentFocus)

### Yeni komponentler

- `IdentityChipRow` — yatay scroll structured chip listesi
- `ActivityHeatmap` — 12×7 grid, react-native-svg ile basit dolgular
- `CurrentFocusCard` — büyük quote kart, edit ikonu, tarih damgası
- `ProfileCompletionCard` — donut/bar progress + checklist
- `IdentityEditSheet` — bottom sheet, structured field editing
- `VisibilityPicker` — alan başına public/clan/private seçimi

### Animasyonlar

- Heatmap dolgu reveal (top'tan dalgalı stagger)
- "Profile tamamlandı" milestone — confetti küçük
- CurrentFocus güncellendiğinde quote kartında flash

---

## 6. Mock data

`mock/mock-identity.ts`:

- Furkan için: `'18-21'`, `'gap-year'`, `{ kind: 'yks', track: 'sayisal',
  targetYear: 2027 }`, `currentFocus: "Matematik üssel fonksiyonlar"`,
  `completion: 85`
- Klan üyeleri için varyasyonlar (lise 11, üniversite 2. sınıf yazılım, kendi
  kendine yabancı dil)

`mock/mock-heatmap.ts`:

- Son 12 haftalık grid, gerçekçi dağılım (haftaiçi yoğun, hafta sonu az)

---

## 7. Kısıtlamalar (gating)

Profil tamamlanmadan kilitlenecek özellikler:

- **Klan'a katılma**: `educationStage` + `primaryGoal` zorunlu
- **Lig sırası gösterimi**: `ageRange` zorunlu (yaş bazlı eşleştirme için ileride)
- **Klan chat'te mesaj atma**: shortBio veya currentFocus dolu olmalı (en az
  birinde)

> Gating "kibar duvar" tarzında: tıkla → modal → "Profilini bitirdiğinde
> aktif olur, hadi hızlıca dolduralım"

---

## 8. Faz planı

### Faz A — Veri katmanı
- [ ] `types/identity.ts` tipleri
- [ ] `mock/mock-identity.ts` Furkan + klan üyeleri için
- [ ] `services/profile.service.ts` genişletme (getIdentity, updateIdentity)
- [ ] `computeCompletion` helper (modules/profile.ts)

### Faz B — Profil görünümü
- [ ] `ProfileScreen` yeniden düzenleme (identity chip row, focus card)
- [ ] `IdentityChipRow` komponenti
- [ ] `CurrentFocusCard` komponenti (read-only önce)
- [ ] `ProfileCompletionCard` (sadece kendi profilinde)

### Faz C — Düzenleme akışı
- [ ] `IdentityEditSheet` bottom sheet
- [ ] Adımlı wizard flow (yaş → eğitim → hedef → focus → görünürlük)
- [ ] `VisibilityPicker` her alan için
- [ ] `currentFocus` haftalık nudge (7 günden eski ise)

### Faz D — Aktivite görünürlüğü
- [ ] `ActivityHeatmap` komponenti (react-native-svg yoksa View grid'le başla)
- [ ] `getActivityHeatmap` servis fonksiyonu (recentXPEvents + completionHistory)
- [ ] Klan/lig özet kartı entegrasyonu (mevcut servisleri çekerek)

### Faz E — Başkalarının profili
- [ ] `PublicProfileScreen` (Stack)
- [ ] Klan üyesi veya lig rakibine tap → public profile
- [ ] Visibility filtresi uygula
- [ ] "Profile bak" butonu chat / leaderboard'lardan

### Faz F — Gating ve onboarding
- [ ] Gating wrapper (`requireProfileFields(['educationStage', 'primaryGoal'])`)
- [ ] Klan join modal'a gating
- [ ] Onboarding wizard (Faz 5 ile birlikte)
- [ ] "Profilin %X tamam" badge sistem mesajı

### Faz G — Kişiselleştirme (post-MVP)
- [ ] Avatar customization (renk, aksesuar)
- [ ] Cover image
- [ ] Achievement showcase seçimi (3 sabit slot)
- [ ] Profil teması (lig tier'a bağlı varsayılan + premium override)

---

## 9. Edge case'ler

- **Yaş yalanı**: Şimdilik trust. İleride sınav türünü (YKS) yaş aralığıyla
  validate edebiliriz
- **Hedefini değiştiren kullanıcı**: Geçmiş hedef etiketi history'de kalır,
  profilde "ekim 2025'ten beri YKS hazırlık" gibi süre damgası
- **Currentfocus boş bırakanlar**: Zorunlu değil ama 3 gün sonra fade-in nudge.
  Hafta boyunca atlanırsa rahat bırak
- **Kötüleyici kullanım**: Public profilde report butonu (Faz F+ için)
- **Görünürlük yanılgısı**: Görünürlük picker'ında "Bu alanı kim görür?" preview
  satırı

---

## 10. Bağlantılar

- `docs/feature-plans/01-ranked-lig-sistemi.md` — RankBadge profilde
- `docs/feature-plans/02-klan-revamp-chat-boss.md` — Klan üyeleri profile bakar
- `docs/feature-plans/04-program-okul-yerine.md` — primaryGoal program
  şablonlarına bağlanır
- `docs/01-product-vision.md` — School-replacement vizyonunun temeli
