# Domain Model

## Ana objeler / domain modeli
Muhtemel ana entity’ler:
- User
- Profile
- Habit
- Todo
- Skill
- UserSkillProgress
- XPEvent
- Streak
- Achievement
- Clan
- ClanMember
- ClanChallenge
- ActivityFeedItem
- Reminder
- Season
- Reward

## Basit ilişki mantığı
- User birçok Habit ve Todo oluşturur
- Habit/Todo bir veya daha fazla Skill’e bağlanabilir
- Completion olunca XPEvent oluşur
- XPEvent hem user total XP’yi hem ilgili skill progress’i günceller
- User bir Clan’a ait olabilir
- Clan üyelerinin katkıları clan score’a yansır
- Achievement’lar kullanıcı davranışlarına göre unlock olur

## Alan mantığı
- **Tasks domain:** Habit ve Todo oluşturma, düzenleme, tamamlama
- **Progression domain:** XP, level, skill, streak, achievement
- **Social domain:** Clan, member activity, challenge, feed, contribution
- **Profile domain:** Avatar, preferences, badges, account-level görünüm

## Modelleme notu
Claude Code domain modellerini net ve modüler tanımlamalı; UI ihtiyaçlarına göre değil, ürün mantığına göre şekillendirmelidir.
