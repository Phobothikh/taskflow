# TASKFLOW

TASKFLOW, görevleri kaydetmek için kurduğumuz sunucu. Node.js ve Express çalışıyor. Görev, kullanıcı, günlük rapor ve yemek kayıtları JSON dosyalarında duruyor. Tarayıcıyı açınca bir panel de çıkıyor.

Adres varsayılan olarak [http://localhost:3000](http://localhost:3000). Durum kontrolü [http://localhost:3000/durum](http://localhost:3000/durum) adresidir. Cevap şöyle olmalı:

```json
{ "basarili": true, "mesaj": "TASKFLOW API ayakta" }
```

## Görevler

Görev eklenir, listelenir, tek tek açılır, değiştirilir ve silinir. Bu işler için giriş şart değil.

Yeni görevde başlık yazılır. Açıklama, öncelik, durum ve atanan kişi boş kalabilir. Öncelik `dusuk`, `orta`, `yuksek` veya `acil` olur. Yazılmazsa `orta` sayılır. Durum `beklemede`, `devam_ediyor` veya `tamamlandi` olur. Yazılmazsa `beklemede` kalır. Başlık boşsa ya da öncelik ve durum bu listeden değilse sunucu 400 döner.

Numarayı, oluşturulma saatini ve son değişiklik saatini sunucu kendisi yazar.

```json
{
  "baslik": "Veritabanı şeması",
  "aciklama": "Tabloları çiz",
  "oncelik": "yuksek",
  "durum": "devam_ediyor",
  "atanan": "uye@taskflow.com"
}
```

| Ne yapılacak | Adres |
|--------------|--------|
| Hepsini getir | GET `/gorevler` |
| Birini getir | GET `/gorevler/:id` |
| Ekle | POST `/gorevler` |
| Değiştir | PUT `/gorevler/:id` |
| Sil | DELETE `/gorevler/:id` |

Ekleme 201 döner. Diğerleri yolunda giderse 200 döner. Kayıtlar `data/gorevler.json` içindedir.

## İstek günlüğü

Gelen her istekte üç şey yazılır: yöntem, adres ve saat. Satır hem terminalde görünür hem `gunluk/istekler.log` dosyasına eklenir. Bu günlük dosyaları GitHub’a konmaz.

## Giriş

Panelde iki deneme hesabı var. İkisi de aynı giriş ekranından girer. Ayrı bir admin sitesi yok.

| E-posta | Şifre | Ne görür |
|---------|--------|----------|
| uye@taskflow.com | 123456 | kendi raporu ve kendi yemek kartı |
| admin@taskflow.com | admin123 | bunlara ek olarak ekibin rapor takibi |

Şifreler düz yazılmaz. Dosyada bcrypt ile durur. Bunlar sadece deneme şifresidir.

Giriş `POST /giris` ile olur:

```json
{
  "eposta": "uye@taskflow.com",
  "sifre": "123456"
}
```

Cevaptaki anahtar sonraki isteklerde başlığa yazılır:

```
X-Oturum-Anahtari: <giris-cevabindaki-anahtar>
```

`GET /ben` giriş yapan kişiyi söyler. `POST /cikis` oturumu kapatır.

## Günlük rapor

Üye, bugün ne yaptığını ve yarın ne yapacağını yazar. Engel varsa onu da ekleyebilir. Aynı gün tekrar yazarsa kayıt güncellenir, ikinci bir rapor açılmaz.

Admin, ekibin bugün raporu doldurup doldurmadığına bakar. Boş olan kişiye hatırlatma gider. Üye kendi ekranında bu hatırlatmayı görür.

| Ne yapılacak | Adres | Kim |
|--------------|--------|-----|
| Bugünkü durum | GET `/gunluk-raporlar/bugun` | üye |
| Raporu kaydet | POST `/gunluk-raporlar` | üye |
| Ekibe bak | GET `/gunluk-raporlar/takip` | admin |
| Hatırlat | POST `/gunluk-raporlar/takip/hatirlat` | admin |

## Panel

Girişten sonra sol menüden görevler, projeler, bildirimler, Fly Bird ve Hafıza açılır. Üstteki zil bildirim sayfasına gider. Bildirimde günlük rapor hatırlatması ve sabit duyurular durur.

Fly Bird yavaş uçan bir kuş oyunu. Boruların arasından geçince skor artar. Sağda ekip sıralaması var. Skor tarayıcıda saklanır, sayfa yenilenince de durur.

Hafıza, aynı kartı eşleştirme oyunu. En iyi hamle sayısı da tarayıcıda kalır.

## Yemek ve kahve

Sol menünün altında bir kart var. Giriş yapan kişiye, bu hafta en çok ne yediğini ve en çok ne içtiğini gösterir. Başkasının kaydı o kartta çıkmaz.

Hafta İstanbul saatine göre sayılır. Pazartesi başlar, pazar biter. Bu aralıktaki kayıtlar toplanır. Yemekte en yüksek sayı kartın bir yanına, içecekte en yüksek sayı öbür yanına yazılır. Dört kez mercimek çorbası, beş kez Türk kahvesi girildiyse kartta bu ikisi görünür. Altında kısa bir cümle vardır: bu hafta en çok ne yediğin ve ne içtiğin.

Kartın içindeki form bugünü ekler. Yemek yazılır, içecek yazılır ya da ikisi birden yazılır. İkisi de boş bırakılırsa kayıt olmaz. Ad en az 2, en fazla 40 karakter olabilir. Gün, formdan seçilmez. Sunucu o anki İstanbul tarihini yazar. Her kayıt sayıyı bir artırır. “Türk kahvesi” ile “türk kahvesi” aynı içecek sayılır.

Kayıtlar `data/ikramlar.json` dosyasındadır. Bu iki adres oturum ister:

Bugünü eklemek:

```json
POST /ikram
{
  "yemek": "Mercimek çorbası",
  "icecek": "Türk kahvesi"
}
```

Bu haftayı okumak: `GET /ikram/hafta`

## Nasıl açılır

Bilgisayarda Node.js 18 veya daha yenisi olmalı.

```bash
cd taskflow
npm install
npm run dev
```

Dosya değişince sunucu kendiliğinden yeniden başlar. Bir kez açıp bırakmak için `npm start` yeter.

3000 portu başka programdaysa PowerShell’de şunu yaz:

```powershell
$env:PORT=3010; npm run dev
```

O zaman panel `http://localhost:3010` olur. Postman görüntüleri de bu yüzden 3010 üzerinden çekildi. Proje kendi haline bırakılırsa 3000 kullanır.

## Postman

Sunucu açıkken Postman’de iki dosya içe aktarılır:

- `postman/TASKFLOW.postman_collection.json`
- `postman/TASKFLOW-Yerel.postman_environment.json`

Sağ üstten **TASKFLOW Yerel** seçilir. `temel_url`, sunucunun açık olduğu adrestir.

Beş görüntü sırayla çekildi: liste, ekleme, tek görev, güncelleme, silme. Dosyalar burada:

| Dosya | Ne görünüyor |
|--------|----------------|
| `docs/ekran-goruntuleri/01-listeleme.png` | GET `/gorevler` |
| `docs/ekran-goruntuleri/02-ekleme.png` | POST `/gorevler` |
| `docs/ekran-goruntuleri/03-detay.png` | GET `/gorevler/:id` |
| `docs/ekran-goruntuleri/04-guncelleme.png` | PUT `/gorevler/:id` |
| `docs/ekran-goruntuleri/05-silme.png` | DELETE `/gorevler/:id` |

Tıklama sırası `docs/POSTMAN.md` içinde. Adreslerin tam listesi `docs/API_TASARIM.md` içinde. Görev alanları `docs/VERI_MODELI.md` içinde. Kısa tanıtım `docs/PROJE_TANITIM.md` içinde.

## Dosyalar

```
src/sunucu.js         program buradan başlar
src/uygulama.js       Express ayarı
src/rotalar/          adresler
src/denetleyiciler/   isteğe verilen cevap
src/servisler/        JSON dosyasını okuyup yazan kısım
src/araKatman/        istek günlüğü
public/               panelin sayfası
data/                 JSON kayıtlar
postman/              Postman dosyaları
docs/                 tanıtım, API notu, ekran görüntüleri
```
