# Expo React Native Roadmap

## Amaç
Bu roadmap, projeye yavaş ve kontrollü başlamak için hazırlanmıştır. Şu an için hedef; backend bağlamadan, mock data ile çalışan, kullanıcı akışları netleşmiş, temel UI/UX oturmuş ve ileride gerçek API’ye sorunsuz bağlanabilecek bir mobil uygulama iskeleti kurmaktır.

Ana prensipler:
- Önce ürün akışını doğrula
- Sonra component sistemini oturt
- Sonra state ve domain mantığını temizle
- Backend’i en sona bırak ama bugünden backend-ready yapı kur

***

## Faz 0 — Mevcut yapıyı netleştir ve standardize et
**Hedef:** Var olan Expo React Native proje yapısını MVP ve mock-data geliştirmeye uygun hale getirmek.

### Mevcut yapı
```txt
src/
  assets/
    fonts/
    icons/
    images/
  components/
  constants/
  features/
  hooks/
  navigation/
  screens/
  services/
  store/
  theme/
  types/
  utils/
```

### Bu fazda yapılacaklar
- Her klasörün sorumluluğunu netleştir
- `features/test` gibi geçici klasörleri kaldır veya gerçek feature’lara dönüştür
- `screens` ve `features` ayrımını kesinleştir
- Navigation shell’i sabitle
- Theme token yapısını başlat
- Mock service standardını tanımla
- TypeScript strict ve ortak type düzenini kontrol et
- Basit naming convention belirle

### Klasör sorumlulukları
- `screens`: route seviyesindeki ekranlar
- `features`: feature/domain bazlı iş mantığı, feature component’leri ve local hook’lar
- `components`: app genelinde tekrar kullanılabilir UI parçaları
- `services`: mock servisler ve ileride gerçek API adaptörleri
- `store`: global state
- `theme`: renk, spacing, typography, radius, shadow gibi design token’lar
- `types`: ortak tip tanımları
- `hooks`: global reusable hook’lar
- `utils`: saf yardımcı fonksiyonlar
- `constants`: sabit veriler ve config yapıları

### Faz 0 çıktısı
- Düzenli klasör yapısı
- Boş ama çalışan navigation iskeleti
- Theme başlangıcı
- Mock-first service yaklaşımı
- Screen / feature ayrımı net bir temel

***

## Faz 1 — Ürün kapsamını daralt ve MVP’yi dondur
**Hedef:** Ne yapılacağını netleştirmek, ne yapılmayacağını daha netleştirmek.

### MVP’ye dahil
- Onboarding
- Home
- Habit listesi
- Todo listesi
- Task complete etkileşimi
- XP kazanımı
- Level progress
- Basit streak göstergesi
- Progress ekranı
- Basit clan overview ekranı
- Profil ekranı

### MVP dışı
- Gerçek zamanlı chat
- Ödeme sistemi
- Gelişmiş avatar editor
- Push notification altyapısı
- AI coach
- Gelişmiş analytics
- Gerçek backend auth

### Bu fazın çıktısı
- “İlk sürümde ne var?” dokümanı
- Herkesin aynı scope ile ilerlemesi

***

## Faz 2 — Bilgi mimarisi ve ekran haritası
**Hedef:** Kod yazmadan önce uygulamanın ekran akışını netleştirmek.

### Ana tab yapısı
- Home
- Tasks
- Progress
- Clan
- Profile

### Çıkarılacak ekranlar
- Splash / entry
- Onboarding step 1
- Onboarding step 2
- Onboarding step 3
- Home screen
- Habit list screen
- Todo list screen
- Add/edit task modal
- Progress screen
- Clan overview screen
- Profile screen

### Yapılacaklar
- Basit wireframe çıkar
- Her ekranın tek ana amacı ne, belirle
- Hangi ekranda hangi veri gösterilecek yaz
- Navigation flow’u netleştir

### Bu fazın çıktısı
- Screen map
- User flow
- Hızlı low-fi wireframe

***

## Faz 3 — Tasarım sistemi ve UI foundation
**Hedef:** Ekranları yapmadan önce ortak tasarım dili kurmak.

### Önce yapılacak temel UI kararları
- Renk paleti
- Karanlık mod olacak mı? (şimdiden düşün)
- Typography scale
- Spacing sistemi
- Border radius
- Shadow kullanımı
- Primary / secondary button stilleri
- Card yapısı
- Progress bar component stili

### Yapılacak reusable component’ler
- Button
- Card
- ScreenContainer
- SectionHeader
- ProgressBar
- XPBadge
- StreakBadge
- Avatar
- EmptyState
- ListItemRow
- Input
- BottomSheet veya Modal wrapper

### Kural
Önce ekran yapmayın; önce component set oluşturun. Sonra ekranları bu component’lerle kurun.

### Bu fazın çıktısı
- Ortak theme dosyası
- UI kit v1
- 6-10 reusable component

***

## Faz 4 — Mock data mimarisi kur
**Hedef:** Backend yokken bile gerçek sistem varmış gibi ilerlemek.

Expo ve React Native geliştirme akışında mock data ile ilerlemek, UI ve akışları hızlı doğrulamak için çok verimlidir. Mock katmanını service arkasına koymak, ileride gerçek API’ye geçerken ekran mantığını bozmadan adaptasyon yapmayı kolaylaştırır. [1][2]

### Kural
UI hiçbir zaman doğrudan mock JSON import etmesin.

### Doğru yapı
- `services/habits.service.ts`
- `services/todos.service.ts`
- `services/profile.service.ts`
- `services/clan.service.ts`
- `services/progress.service.ts`

Bu servisler şimdilik mock data döner.
İleride aynı fonksiyonlar API call yapar.

### Örnek yaklaşım
- `getTodayHabits()`
- `getTodos()`
- `completeHabit(id)`
- `completeTodo(id)`
- `getUserProgress()`
- `getClanOverview()`

### Mock veri setleri
- `mock-user.ts`
- `mock-habits.ts`
- `mock-todos.ts`
- `mock-progress.ts`
- `mock-clan.ts`
- `mock-activity.ts`

### Bu fazın çıktısı
- Service layer kurulmuş olur
- UI gerçek API’den bağımsız gelişir
- Sonradan backend bağlamak kolaylaşır

***

## Faz 5 — Domain logic’i UI’dan ayır
**Hedef:** XP, streak, level gibi sistemlerin ekran içinde dağılmasını engellemek.

### Ayrı module dosyaları oluştur
- `modules/xp`
- `modules/streak`
- `modules/level`
- `modules/clan`
- `modules/progress`

### Buralarda olacak şeyler
- XP hesaplama
- Level threshold hesaplama
- Streak update mantığı
- Completion sonrası event üretimi
- Clan contribution score hesaplama

### Kural
UI sadece sonucu göstermeli.
Hesapları component içinde yapmayın.

### Bu fazın çıktısı
- Business logic temiz ayrılmış olur
- Test etmek kolaylaşır
- Backend gelince logic tarafı daha stabil kalır

***

## Faz 6 — İlk çalışan kullanıcı akışı: onboarding
**Hedef:** Kullanıcının ilk 2 dakikadaki deneyimini prototip olarak bitirmek.

### Onboarding akışı
1. Hedef seçimi
2. Odak alanları seçimi
3. İlk habit ekleme
4. İlk todo ekleme
5. İlk completion hissi
6. XP kazanımı preview
7. Ana ekrana geçiş

### Yapılacaklar
- 3-5 adımlı onboarding flow
- Local mock state ile seçimleri tut
- “Finish” sonrası mock profile oluştur
- Kullanıcıyı Home ekranına yönlendir

### Bu fazın çıktısı
- Baştan sona ilk deneyim çalışır
- Ürün hissi oluşmaya başlar

***

## Faz 7 — Home ekranı
**Hedef:** Uygulamanın kalbi olan günlük aksiyon ekranını bitirmek.

### Home içeriği
- Bugünkü habitler
- Öncelikli todolar
- Günlük XP özeti
- Streak özeti
- Hızlı tamamla aksiyonu
- Quick add entry point

### Yapılacaklar
- Section bazlı home layout
- Complete button interaction
- Complete sonrası local state update
- Mini reward feedback

### Kural
Home kalabalık değil, aksiyon odaklı olmalı.

### Bu fazın çıktısı
- Kullanıcının app’i her gün açacağı çekirdek ekran hazır olur

***

## Faz 8 — Tasks alanı
**Hedef:** Habit ve todo yönetiminin temelini tamamlamak.

### Yapılacaklar
- Habit list screen
- Todo list screen
- Filter / segment control
- Add task modal
- Edit task modal
- Complete / uncomplete etkileşimi

### Karar verilmesi gerekenler
- Habit ve todo tek listede mi?
- Ayrı tab mı?
- Add flow tek ekran mı, tür seçmeli mi?

### Bu fazın çıktısı
- Kullanıcı veri oluşturabilir, görebilir, düzenleyebilir

***

## Faz 9 — Progress ekranı
**Hedef:** Kullanıcının gelişimini görünür hale getirmek.

### Gösterilecekler
- Toplam XP
- Mevcut level
- Level progress bar
- Skill bazlı ilerleme
- Habit streak’leri
- Achievement preview
- Haftalık özet

### Yapılacaklar
- Stat cards
- Skill progress bars
- XP history mock chart placeholder
- Achievement listesi

### Bu fazın çıktısı
- “Ben gelişiyorum” hissi ilk kez net görünür

***

## Faz 10 — Clan ekranı
**Hedef:** Ürünün fark yaratan katmanını erken ama basit şekilde görmek.

### İlk sürüm clan ekranı
- Clan adı
- Üye sayısı
- Haftalık contribution bar
- Top üyeler listesi
- Son aktiviteler
- Haftalık challenge kartı

### Şimdilik yapma
- Gerçek chat
- Realtime presence
- Karmaşık permissions
- Çok detaylı challenge engine

### Bu fazın çıktısı
- Social motivasyon katmanı görünür olur
- Ürünün farklılığı hissedilir

***

## Faz 11 — Profile ekranı
**Hedef:** Kullanıcının kendi kimliğini ve başarılarını görmesi.

### İçerik
- Avatar
- Display name
- Level
- Rozetler
- Top skill’ler
- Streak summary
- Settings girişleri

### Bu fazın çıktısı
- Ürünün kişisel sahiplik hissi güçlenir

***

## Faz 12 — State yönetimini toparla
**Hedef:** Mock data ile büyüyen uygulamanın dağılmasını engellemek.

### Ne zaman yapılmalı?
İlk 3-4 temel ekran çalıştıktan sonra.

### Öneri
Başta hafif ilerleyin. Eğer complexity artarsa Zustand gibi hafif bir global store düşünebilirsiniz. State yönetimini ürün ihtiyacı büyümeden ağırlaştırmamak daha sağlıklıdır. [3][4]

### Store’a alınabilecek şeyler
- Current user
- Today tasks
- Progress summary
- Clan summary
- UI modal states

### Local kalabilecek şeyler
- Form input state
- Geçici seçimler
- Tek ekranlık UI animasyon state’i

### Bu fazın çıktısı
- App state daha öngörülebilir hale gelir

***

## Faz 13 — UX polish turu
**Hedef:** Ürün artık çalışıyor; şimdi “iyi hissettirmesi” gerekiyor.

### Yapılacaklar
- Completion animasyonu iyileştir
- XP gain feedback ekle
- Empty state’leri tasarla
- Loading skeleton’ları ekle
- Hata state’lerini yaz
- Haptic feedback değerlendir
- Microcopy’leri iyileştir

### Kural
Gamification çocukça değil, tatmin edici olmalı.

### Bu fazın çıktısı
- Demo yapılabilir kalite
- Test kullanıcısına gösterilebilir akış

***

## Faz 14 — Teknik kalite turu
**Hedef:** Kod tabanını backend öncesi sağlıklı hale getirmek.

### Yapılacaklar
- ESLint / Prettier kontrolü
- Type cleanup
- Dead code temizliği
- Component prop standardizasyonu
- Basit test altyapısı
- Domain logic testleri

Mock’larla çalışma ve yan etkileri izole etme, testleri daha güvenilir hale getirir. React Native test pratiklerinde dış bağımlılıkları mock’lamak özellikle önerilir. [5]

### Test önceliği
- XP calculation
- Level calculation
- Streak update
- Habit complete action
- Todo complete action
- Clan contribution update

### Bu fazın çıktısı
- Daha sağlam kod tabanı
- Backend entegrasyonuna hazırlık

***

## Faz 15 — Backend-ready refactor
**Hedef:** Gerçek backend bağlamadan önce entegrasyon yüzeylerini hazırlamak.

### Yapılacaklar
- Service interface’lerini netleştir
- Mock response shape’lerini sabitle
- DTO / app model ayrımı düşün
- Error handling pattern tanımla
- Loading state standardı belirle

### Kural
Screen → service → module → state akışı net olsun.

### Bu fazın çıktısı
- Backend geldiğinde kırmadan geçiş yapılır

***

## Faz 16 — Sonra backend
**Bu aşamada backend’e geçebilirsiniz.**

O noktada yapılacaklar:
- Auth provider seçimi
- Database schema
- API contract
- Sync stratejisi
- Offline stratejisi
- Push notification

Expo dokümantasyonu, hızlı başlangıç için create-expo-app ve Expo workflow’larını; React Native dokümantasyonu da Expo’nun üretim seviyesinde bir framework olduğunu vurguluyor. Expo tarafında sonradan EAS Workflows ile build/release otomasyonu eklemek de mümkün. [6][3][4]

***

## İlk 3 haftalık mini plan

### Hafta 1
- Faz 0
- Faz 1
- Faz 2
- Faz 3 başlangıcı

**Teslim:** navigation + theme + wireframe + UI kit başlangıcı

### Hafta 2
- Faz 3 bitişi
- Faz 4
- Faz 5
- Faz 6

**Teslim:** mock data çalışan onboarding flow

### Hafta 3
- Faz 7
- Faz 8
- Faz 9

**Teslim:** home + tasks + progress çalışan demo

***

## Başlangıç için bugün yapılacaklar
Eğer bugün başlayacaksanız, sırayla bunu yapın:

1. `src` klasör mimarisini oluşturun
2. Theme dosyalarını oluşturun
3. Tab navigation iskeletini kurun
4. Mock service layer oluşturun
5. 5-6 reusable UI component yazın
6. Onboarding wireframe’ini çıkarın
7. Home ekranının boş skeleton versiyonunu yapın

***

## En önemli kural
Şu anda amaç “çok özellik yapmak” değil, doğru ürün omurgasını kurmak.

Önce:
- bilgi mimarisi
- UI sistemi
- mock data servisleri
- kullanıcı akışları
- progression hissi

Sonra:
- backend
- gerçek auth
- realtime social
- bildirimler