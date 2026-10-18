# TASKFLOW

Ekibin görevlerini tek yerden açıp takip etmesi için yazılmış bir eğitim projesi. Sunucu Node.js ve Express ile çalışır. Kayıtlar JSON dosyalarında durur. Aynı projede tarayıcıdan açılan bir panel de vardır.

## Yönergede istenenler

Eğitimin zorunlu teslimi şunlardı. Hepsi bu depoda hazır:

- Çalışan bir REST API
- Görev ekleme, listeleme, detay görme, güncelleme ve silme
- Her isteğin yöntemini, adresini ve zamanını kaydeden bir ara katman
- Kısa proje tanıtımı (`docs/PROJE_TANITIM.md`)
- Kurulum notu (bu dosya)
- Kaynak kod ve `package.json`
- Postman’de beş CRUD ekran görüntüsü (`docs/ekran-goruntuleri`)
- Herkese açık GitHub deposu

Yönergedeki filtre, arama, sayfalama ve rapor adresleri nota dahil değildi. Onlar bu projede yok.

## Benim eklediklerim

Aşağıdakiler yönergede yoktu. Panele ve API’ye sonradan eklendi:

- Üye ve admin girişi. Ayrı bir admin sitesi yok; aynı ekrandan girilir.
- Üyenin günlük raporu. Admin, ekibin bugün raporu yazıp yazmadığına bakar ve eksik olana hatırlatma gönderir.
- Görev listesi, projeler ve bildirim zili olan tarayıcı paneli
- Fly Bird oyunu ve ekip sıralaması
- Hafıza oyunu
- Sol menüde, o hafta en çok yenilen yemek ve en çok içilen içecek. Ayrıntısı bir sonraki başlıkta.

## Haftalık yemek ve içecek

Bu kart, giriş yapan kişiye haftalık bir hatırlatma olsun diye duruyor. Başka bir çalışanın tabağı görünmez.

Hafta İstanbul saatine göre pazartesiden pazara kadardır. Sistem bu aralıktaki kayıtları sayar. En yüksek sayıyı alan yemek ve en yüksek sayıyı alan içecek kartta yazar. Örneğin bir kişi o hafta dört kez mercimek çorbası, beş kez Türk kahvesi girdiyse kartta bunlar görünür. Altında kısa bir cümle vardır: bu hafta en çok ne yediği ve ne içtiği.

Sol menünün altındaki form bugünün kaydını ekler. Yemek, içecek ya da ikisi birden yazılabilir. İkisi de boşsa kayıt alınmaz. Ad en az 2, en fazla 40 karakter olabilir. Tarih sunucuda bugünün tarihi olarak yazılır; formdan eski bir gün seçilmez. Her kayıt o kişinin sayısına bir ekler. Türk kahvesi ile türk kahvesi aynı içecek sayılır.

Kayıtlar `data/ikramlar.json` dosyasındadır. İki adres oturum ister. Başlık: `X-Oturum-Anahtari`.

Bugünkü öğünü yazmak:

```json
POST /ikram
{
  "yemek": "Mercimek çorbası",
  "icecek": "Türk kahvesi"
}
```

Bu haftanın özetini okumak: `GET /ikram/hafta`

## Gereksinimler

- Node.js 18 veya üzeri
- npm

## Kurulum

```bash
cd taskflow
npm install
```

## Çalıştırma

Dosya değişince yeniden başlasın:

```bash
npm run dev
```

Bir kez başlatmak için:

```bash
npm start
```

Panel: [http://localhost:3000](http://localhost:3000)

Durum kontrolü: [http://localhost:3000/durum](http://localhost:3000/durum)

Beklenen cevap:

```json
{ "basarili": true, "mesaj": "TASKFLOW API ayakta" }
```

3000 portu doluysa:

```powershell
$env:PORT=3010; npm run dev
```

Adres o zaman `http://localhost:3010` olur. Depodaki Postman görüntüleri bu yüzden 3010 üzerinden alınmıştır. Varsayılan port 3000’dir.

## Demo hesaplar

| E-posta | Şifre | Rol |
|---------|--------|-----|
| uye@taskflow.com | 123456 | Üye |
| admin@taskflow.com | admin123 | Admin |

Şifreler yalnızca bu deneme içindir. Veritabanında düz metin durmaz; bcrypt ile saklanır.

## API

Kök adres: `http://localhost:3000`

Görev adresleri giriş istemez. Giriş, rapor ve ikram adresleri `X-Oturum-Anahtari` başlığını bekler. Anahtar, `POST /giris` cevabında gelir.

| Yöntem | Adres | Kim | Sonuç |
|--------|--------|-----|--------|
| GET | `/durum` | herkes | API çalışıyor mu |
| POST | `/giris` | herkes | oturum anahtarı |
| GET | `/ben` | oturum | giriş yapan kişi |
| POST | `/cikis` | oturum | oturumu kapatır |
| GET | `/gorevler` | herkes | bütün görevler |
| GET | `/gorevler/:id` | herkes | tek görev |
| POST | `/gorevler` | herkes | yeni görev, 201 |
| PUT | `/gorevler/:id` | herkes | güncellenmiş görev |
| DELETE | `/gorevler/:id` | herkes | silindi onayı |
| GET | `/gunluk-raporlar/bugun` | üye | bugünkü rapor |
| POST | `/gunluk-raporlar` | üye | raporu kaydeder |
| GET | `/gunluk-raporlar/takip` | admin | ekibin bugünkü hali |
| POST | `/gunluk-raporlar/takip/hatirlat` | admin | eksik raporu hatırlatır |
| GET | `/ikram/hafta` | oturum | haftanın yemeği ve içeceği |
| POST | `/ikram` | oturum | bugünkü öğün |

Ayrıntı: `docs/API_TASARIM.md`

### Görev gövdesi

```json
{
  "baslik": "Veritabanı şeması",
  "aciklama": "Tabloları çiz",
  "oncelik": "yuksek",
  "durum": "devam_ediyor",
  "atanan": "uye@taskflow.com"
}
```

| Alan | Zorunlu | Değer |
|------|---------|--------|
| baslik | evet | metin |
| aciklama | hayır | metin |
| oncelik | hayır | `dusuk`, `orta`, `yuksek`, `acil` (varsayılan `orta`) |
| durum | hayır | `beklemede`, `devam_ediyor`, `tamamlandi` (varsayılan `beklemede`) |
| atanan | hayır | e-posta veya isim |

`id`, `olusturulma` ve `guncellenme` alanlarını sunucu yazar. Başlık boşsa ya da öncelik ve durum listedekilerden biri değilse cevap **400** olur.

### Giriş gövdesi

```json
{
  "eposta": "uye@taskflow.com",
  "sifre": "123456"
}
```

Sonraki isteklerde başlık:

```
X-Oturum-Anahtari: <giris-cevabindaki-anahtar>
```

## İstek günlüğü

Her istekte yöntem, adres ve zaman yazılır. Satır hem terminalde hem `gunluk/istekler.log` dosyasında durur. Günlük dosyaları GitHub’a yüklenmez.

## Veri dosyaları

| Dosya | İçinde ne var |
|--------|----------------|
| `data/gorevler.json` | görevler |
| `data/kullanicilar.json` | deneme kullanıcıları |
| `data/gunlukRaporlar.json` | günlük raporlar |
| `data/ikramlar.json` | yemek ve içecek kayıtları |

Model: `docs/VERI_MODELI.md`  
Tanıtım: `docs/PROJE_TANITIM.md`

## Postman

1. Sunucuyu çalıştır.
2. Postman’de Import ile şu iki dosyayı al:
   - `postman/TASKFLOW.postman_collection.json`
   - `postman/TASKFLOW-Yerel.postman_environment.json`
3. Ortam olarak **TASKFLOW Yerel** seç.
4. `temel_url` değerini çalışan adrese yaz.

Beş görüntünün sırası: listeleme, ekleme, detay, güncelleme, silme.

| Dosya | İstek |
|--------|--------|
| `docs/ekran-goruntuleri/01-listeleme.png` | GET `/gorevler` |
| `docs/ekran-goruntuleri/02-ekleme.png` | POST `/gorevler` |
| `docs/ekran-goruntuleri/03-detay.png` | GET `/gorevler/:id` |
| `docs/ekran-goruntuleri/04-guncelleme.png` | PUT `/gorevler/:id` |
| `docs/ekran-goruntuleri/05-silme.png` | DELETE `/gorevler/:id` |

Adımlar: `docs/POSTMAN.md`

## Klasörler

```
src/sunucu.js            programın başladığı yer
src/uygulama.js          Express ayarı
src/rotalar/             adresler
src/denetleyiciler/      gelen isteğe verilen cevap
src/servisler/           dosyadan okuma ve yazma
src/araKatman/           istek günlüğü
public/                  panel
data/                    JSON kayıtlar
postman/                 koleksiyon ve ortam
docs/                    tanıtım, API notu, ekran görüntüleri
```

## Komutlar

| Komut | Ne yapar |
|--------|----------|
| `npm install` | paketleri kurar |
| `npm run dev` | geliştirme sunucusunu açar |
| `npm start` | sunucuyu bir kez başlatır |
