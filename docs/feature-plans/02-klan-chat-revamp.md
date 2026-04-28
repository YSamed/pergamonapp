# 02 — Klan Revamp: Chat-Öncelikli + Şeffaf Katkı

> Mevcut klan ekranı feed/dashboard ağırlıklı. Klan, sosyal medya feed'i değil;
> küçük bir çalışma grubu / Discord sunucusu hissi vermeli. Habitica'nın
> kapatamadığı **"kim ne yaptı görünmüyor"** boşluğunu otomatik sistem
> mesajları ve member insights ile dolduruyoruz.

---

## 1. Vizyon

Klan = senin "çalışma grubun." Üç ayak:

1. **Chat-first**: Klan ekranının ana sürümü chat. Mesaj at, sistem mesajları
   "X göreve başladı / bitirdi / Y XP kazandı" otomatik düşsün
2. **Şeffaf katkı**: Klan üyeleri birbirinin haftalık aktivitesini görür.
   "Boş gözükmek" zorlaşır → sosyal accountability
3. **Koop hedefler**: Boss yok, ama klan birlikte haftalık quest'ler tamamlar
   ("Klan olarak 50 habit tamamlayın")

Klan boyutu: 4–8 kişi (Habitica party'si ~4, biz biraz daha esnek). Üst limit
8 → herkes birbirini tanıyabilir.

---

## 2. Modüller

| Modül                | Açıklama                                                  | Faz  |
| -------------------- | --------------------------------------------------------- | ---- |
| Clan Chat            | Realtime-vari mesajlaşma, sistem mesajları                | A    |
| Member Insights      | Üye katkı paneli, haftalık özet, profile bağlantısı       | B    |
| Roles & Permissions  | Owner / Admin / Member ayrımı, ayar paneli                | C    |
| Clan Quests          | Haftalık koop görevler ("Bu hafta toplam 50 habit")       | D    |

---

## 3. Veri modeli

```ts
// types/clan-chat.ts
export type ClanMessage = {
  id: string;
  clanId: string;
  /** Sistem mesajı veya kullanıcı mesajı */
  type: 'user' | 'system' | 'level-up' | 'streak';
  authorId: string | null; // sistem mesajıysa null
  authorName: string | null;
  authorAvatar: string | null;
  body: string;
  meta: ClanMessageMeta | null; // type'a göre payload
  createdAt: string;
  reactions: ClanReaction[];
};

export type ClanMessageMeta =
  | { kind: 'level-up'; newLevel: number }
  | { kind: 'streak'; days: number }
  | { kind: 'task-complete'; taskId: string; taskTitle: string; xp: number }
  | { kind: 'clan-challenge-bonus'; challengeTitle: string; xp: number };

export type ClanReaction = {
  emoji: string;
  userIds: string[];
};
```

---

## 4. Servis katmanı

`services/clan-chat.service.ts` (yeni):

```ts
clanChatService.getMessages(clanId, { before?, limit }): Promise<ClanMessage[]>
clanChatService.sendMessage(clanId, body): Promise<ClanMessage>
clanChatService.addSystemMessage(clanId, meta): Promise<ClanMessage>
clanChatService.addReaction(messageId, emoji): Promise<void>
clanChatService.subscribe(clanId, onMessage): () => void
  // Mock için: setInterval ile poll, ileride WebSocket
```

### Mevcut entegrasyonlar

- `TaskDetailScreen.handleComplete` cascade'i:
  1. XP overlay
  2. Level-up modal
  3. Streak milestone toast
  4. Clan challenge bonus toast (mevcut)
- `chatService.addSystemMessage` her görev tamamlandığında, level-up'ta,
  streak milestone'unda ve clan challenge bonus kazanıldığında otomatik
  tetiklenir → chat'e ilgili sistem mesajı düşer

---

## 5. UI / Komponentler

### `ClanScreen` yeniden yapılanma

Mevcut: empty state + dashboard.
Yeni: dashboard küçülür, chat ekranın **ana içeriği** olur.

Layout:

```
┌────────────────────────────────────┐
│ Hero strip (klan adı + üye sayısı) │  ← Sticky top
├────────────────────────────────────┤
│ Sekme: Chat | Üyeler | Quests      │
├────────────────────────────────────┤
│                                    │
│  Mesaj listesi (ters scroll)       │
│  - sistem: "✅ Furkan 'Algoritma'  │
│             görevini bitirdi (+10)"│
│  - sistem: "⚡ Burak 7 streak'e    │
│             ulaştı"                │
│  - kullanıcı: "Çalışıyorum,        │
│             21:00'a kadar"         │
│                                    │
├────────────────────────────────────┤
│  Mesaj input + reaction picker     │
└────────────────────────────────────┘
```

### Yeni komponentler

- `ClanChatList` — `FlatList`, ters sıralı, virtualize edilmiş
- `ClanChatBubble` — `type`'a göre 2 görsel:
  - `user` — normal balon
  - `system` (görev tamamlama, level up, streak, clan challenge bonus) —
    küçük center-aligned satır, ikonla zenginleştirilmiş
- `ClanChatInput` — text input, emoji picker, mention support (`@isim`)
- `MemberInsightsPanel` — Üye sekmesinde her üyenin haftalık aktivitesi
  (bar chart) + profile link

### Animasyonlar

- Mesaj geliş animasyonu: yukarıdan slide + opacity fade
- Sistem mesajı vurgu: kısa highlight pulse
- Reaction ekleme: hafif bounce

---

## 6. Mock data

`mock/mock-clan-chat.ts`:

- 30 mesaj (karışık tipte)
- 5 üye, çoğu sistem mesajı, birkaç kullanıcı mesajı
- Görev tamamlama, level-up ve streak sistem mesajlarının dağılımı

---

## 7. Bildirimler

- **Mesaj mention**: `@isim` mention edilirse push (sessiz mod hariç)
- **Quest tamamlandı**: "Klanınız haftalık quest'i tamamladı"
- **Quest kritik**: Süre dolarken eksik kalan miktar için yumuşak hatırlatma

---

## 8. Faz planı

### Faz A — Chat altyapısı
- [ ] `types/clan-chat.ts` tipleri
- [ ] `services/clan-chat.service.ts` mock
- [ ] `mock/mock-clan-chat.ts` 30 mesaj
- [ ] `components/Clan/ClanChatList.tsx`
- [ ] `components/Clan/ClanChatBubble.tsx` (user/system varyantları)
- [ ] `components/Clan/ClanChatInput.tsx`
- [ ] `ClanScreen` chat sekmesi (mevcut dashboard'u "Üyeler" sekmesine taşı)
- [ ] Görev tamamlama / level-up / streak / clan challenge bonus
      cascade'inde `addSystemMessage` çağrısı

### Faz B — Member Insights
- [ ] `components/Clan/MemberInsightsPanel.tsx`
- [ ] Üye haftalık katkı bar chart
- [ ] Profile screen'e "Bu haftaki klan katkısı" satırı
- [ ] Klan üyeleri arasında comparative streak görünümü

### Faz C — Roles & permissions
- [ ] `Owner` / `Admin` / `Member` role checks
- [ ] Klan ayarları sayfası: isim, açıklama, davet kodu, üye atma
- [ ] Mesaj silme (admin için)

### Faz D — Clan quests
- [ ] Haftalık koop quest yapısı (örn. "Klan olarak 50 habit tamamlayın")
- [ ] Quest progress chat'e sistem mesajı olarak yansır
- [ ] Quest tamamlanırsa ödül cascade'i

### Faz E — Polish
- [ ] Mention sistemi (`@isim`)
- [ ] Reaction picker'da custom emoji
- [ ] Klan davet bağlantısı (deep link)

---

## 9. Risk ve dikkat

- **Şeffaflık ↔ baskı dengesi**: Üyenin "boş gözükmesi" damgalanma yaratmamalı.
  "Bu hafta ara verdi" tonlu görselleştirme (negatif yerine nötr)
- **Chat moderasyonu**: 4–8 kişilik küçük gruplar olduğu için ileri seviye
  moderasyon araçlarına gerek yok başta
- **Realtime**: Mock olarak polling (5–10 sn) yeterli. Production'da WebSocket'e
  geç (Faz E+)
- **Sistem mesajı spam**: Bir üye çok hızlı görev bitiriyorsa chat sistem
  mesajıyla taşmasın → kısa süre içinde ardışık tamamlamalar tek mesajda
  toplanabilir ("Furkan 3 görev bitirdi: ...")

---

## 10. Bağlantılar

- `docs/05-social-and-clans.md` — Genel klan vizyonu
- `docs/feature-plans/01-ranked-lig-sistemi.md` — Klan chat sistem mesajları
  lig XP görünürlüğünü güçlendirir (üye XP kazandığında chat'e sistem mesajı
  düşer, klan içinde lig ilerlemesi şeffaflaşır)
- `docs/feature-plans/03-zenginlestirilmis-profil.md` — Member insights
  panelinden üye profillerine bağlantı; haftalık katkı profile yansır
- `docs/04-gamification.md` — Cascade sırası: XP → Level-up → Streak → Clan
  bonus → **Chat sistem mesajı**
