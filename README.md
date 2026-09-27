# Sesli Biyografi Sergisi — İnteraktif Müze Deneyimi (MVP)

Next.js 14 (App Router) ile geliştirilmiş, iki ana bölümden oluşan bir web
uygulaması:

1. **Ziyaretçi Arayüzü** (`/`) — büyük bir sahne görseli üzerinde tıklanabilir
   kişiler; her kişi kendi hazırlanmış biyografisini ve (varsa) sesini sunar.
2. **Admin Paneli** (`/admin`) — kişi kütüphanesi, sahne/görsel yükleme ve
   hotspot (kişi alanı) editörü.

## Kurulum

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` üzerinde açılır.

- Ziyaretçi deneyimi: `/`
- Admin girişi: `/admin` — demo hesap: **admin / museum2026**
  (bkz. `data/admin.json`; üretimde mutlaka değiştirin ve hashleyin)

## Mimari

```
app/
  page.js                 → Ziyaretçi sahnesi (Server Component, veriyi okur)
  admin/                  → Tüm admin sayfaları (her biri oturum kontrolü yapar)
  api/                    → REST benzeri route handler'lar (persons, scenes,
                             hotspots, upload, detect, auth)
components/
  Scene/                  → SceneExperience (zoom/blur orkestrasyonu), Hotspot
  BiographyPanel/         → Sekmeli panel + AudioPlayer
  Admin/                  → AdminShell, LoginForm, PersonForm, HotspotEditor, ...
lib/
  data.js                 → TÜM veri erişimi buradan geçer (tek değişim noktası)
  auth.js                 → Basit cookie tabanlı oturum sistemi
  types.js                → Person / Scene / Hotspot veri modeli (JSDoc)
data/                     → JSON "veritabanı" (persons.json, scenes.json, ...)
public/uploads/           → Admin panelinden yüklenen görsel/ses dosyaları
public/demo/              → Demo sahne ve kişi görselleri (yerel SVG, harici bağımlılık yok)
```

### Veri modeli

- **Person**: id, name, subtitle, biography (birinci ağızdan tam metin),
  shortBiography, works[], contributions[], period, gallery[], videoUrl,
  audioUrl, audioIsTTS, audioStale, timeline[], relatedPersons[]
- **Scene**: id, title, imageUrl, hotspots[]
- **Hotspot**: id, sceneId, personId, x/y/width/height (**yüzde bazlı**, 0-100)

Hotspot yalnızca bir `personId`'ye referans verir. Kullanıcı bir hotspot'a
tıkladığında ilgili `Person` kaydındaki **önceden hazırlanmış** `biography` ve
`audioUrl` gösterilir/oynatılır — hiçbir zaman anlık olarak yeni metin ya da
ses üretilmez.

### Neden JSON dosyaları?

İlk sürüm için `lib/data.js` içindeki fonksiyonlar dosya sistemini kullanır.
Gerçek bir veritabanına (Postgres, MongoDB vb.) geçerken **yalnızca bu dosyanın
içini** değiştirmeniz yeterli; uygulamanın geri kalanı (API route'ları, sayfa
bileşenleri) `getPersons()`, `createScene()` gibi fonksiyonları çağırdığı için
etkilenmez.

> Not: Dosya tabanlı depolama, tek sunuculu / kalıcı disk olan ortamlarda
> (ör. kendi sunucunuz, VPS, Docker container + volume) sorunsuz çalışır.
> Vercel gibi salt-okunur/geçici dosya sistemine sahip serverless ortamlara
> deploy edecekseniz önce gerçek bir veritabanına geçmeniz gerekir.

### Otomatik kişi algılama

`app/api/detect/route.js` şu an **yer tutucu (placeholder)** bir servistir;
gerçek bir yüz/nesne algılama modeli yerine sabit örnek kutular döner. Kod
içinde nereye gerçek bir modelin bağlanacağı ayrıntılı olarak açıklanmıştır.
Otomatik algılama olsun ya da olmasın, admin panelindeki hotspot editörü her
zaman elle taşıma / boyutlandırma / silme / yeni alan ekleme imkânı sunar.

### Kimlik doğrulama

Basit, tek kullanıcılı bir oturum sistemi: `data/admin.json` içindeki
kullanıcı adı/şifre ile giriş yapılır, sunucu tarafında rastgele bir oturum
tokenı üretilip `data/sessions.json` içinde saklanır ve tarayıcıya `httpOnly`
bir cookie olarak verilir. Üretime geçerken:

- Şifreyi düz metin yerine hashleyin (ör. bcrypt),
- Oturumları dosya yerine veritabanında/Redis'te tutun,
- HTTPS zorunlu kılın.

## MVP'de tamamlanan özellikler

- [x] Admin login (cookie tabanlı oturum)
- [x] Görsel yükleme (`/admin/scenes/new`)
- [x] Hotspot oluşturma / taşıma / boyutlandırma / silme (`/admin/scenes/[id]`)
- [x] Kişi kaydı oluşturma / düzenleme / silme (`/admin/persons`)
- [x] Mevcut kişi ile hotspot eşleştirme (dropdown)
- [x] Kullanıcı tarafında hover glow + "Hikâyesini keşfet" ipucu
- [x] Tıklayınca sinematik zoom + arka plan karartma/blur
- [x] Sekmeli biyografi paneli (Ben Kimim?, Hayat Hikâyem, Çalışmalarım,
      Önemli Katkılarım, Galeri, Zaman Çizelgesi)
- [x] Hazır ses dosyasının oynatılması (oynat/duraklat/yeniden başlat/sessize
      alma) + yaklaşık kelime bazlı altyazı vurgusu
- [x] "Sahneye dön" akışı (zoom geri alma, sesi durdurma)
- [x] Mobil uyum: dokunmatik cihazlarda ilk dokunuş = öne çıkar (peek),
      ikinci dokunuş = açar
- [x] Erişilebilirlik: aria-label'lar, klavye ile Tab/Enter navigasyonu,
      Escape ile sahneye dönüş, görünür focus halkası,
      `prefers-reduced-motion` desteği
- [x] Biyografi metni değiştiğinde sesin "güncel değil" olarak işaretlenmesi
      (otomatik ses üretimi/yükleme yapılmaz, admin bilgilendirilir)
- [x] 3 kişilik demo sahne (Ada Lovelace, Nikola Tesla, Marie Curie)

## Sonraki adımlar için öneriler

- Gerçek bir yüz/kişi algılama modelinin `api/detect` içine bağlanması
- Gerçek bir veritabanına geçiş (`lib/data.js` üzerinden)
- Admin şifresinin hashlenmesi ve ortam değişkenine taşınması
- Ses dosyaları için gerçek TTS entegrasyonu (yalnızca admin panelinden,
  kullanıcı tıklamasında değil)
