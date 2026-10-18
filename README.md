# TASKFLOW

Yazılım ekibinin görevlerini tek bir REST API üzerinden açıp izleyebilmesi için yazılmış eğitim projesi. Node.js ve Express ile çalışır. Görevler, kullanıcılar ve günlük raporlar JSON dosyalarında durur; ayrıca tarayıcıdan açılan bir panel vardır.

## Ne yapar

- Görev ekleme, listeleme, tek kayıt getirme, güncelleme ve silme
- Her isteği konsola ve `gunluk/istekler.log` dosyasına yazan günlük katmanı
- E-posta ve şifre ile giriş, oturum anahtarı, çıkış
- Üye için günlük rapor, admin için ekip takibi ve hatırlatma
- Oturumdaki çalışanın bu hafta en çok yediği ve içtiği kaydı
- Panel: görev listesi, bildirimler, Fly Bird ve Hafıza

## Gereksinim

- Node.js 18 veya üzeri
- npm

## Kurulum

```bash
cd taskflow
npm install
```

## Çalıştırma

Geliştirme (dosya değişince yeniden başlar):

```bash
npm run dev
```

Tek seferlik:

```bash
npm start
```

Panel: [http://localhost:3000](http://localhost:3000)

Sağlık kontrolü: [http://localhost:3000/durum](http://localhost:3000/durum)

Beklenen cevap:

```json
{ "basarili": true, "mesaj": "TASKFLOW API ayakta" }
```

Port 3000 başka bir programdaysa:

```powershell
$env:PORT=3010; npm run dev
```

Bu durumda adres `http://localhost:3010` olur. Repodaki Postman görüntüleri bu yüzden 3010 portundan alınmıştır. Uygulama varsayılan olarak 3000 kullanır.

## Demo hesaplar

| E-posta | Şifre | Rol |
|---------|--------|-----|
| uye@taskflow.com | 123456 | Üye |
| admin@taskflow.com | admin123 | Admin |

Ayrı bir admin adresi yok. Aynı giriş ekranından admin hesabıyla girilir. Şifreler yalnızca bu demo içindir.

## Panel

Girişten sonra sol menüden görevler, projeler, bildirimler, Fly Bird ve Hafıza açılır. Üstteki zil bildirim sayfasına gider. Sol alttaki kart, giriş yapan kişinin bu hafta en çok yediği yemeği ve içtiği içeceği gösterir.

## API

Kök adres: `http://localhost:3000`

Oturum isteyen uçlar `X-Oturum-Anahtari` başlığını bekler. Bu değer `POST /giris` cevabındaki anahtardır. Görev uçları oturum istemez.

| İşlem | Adres | Kim kullanır | Ne döner |
|--------|--------|----------------|----------|
| GET | `/durum` | herkes | API ayakta mı |
| POST | `/giris` | herkes | oturum anahtarı |
| GET | `/ben` | oturum | giriş yapan kullanıcı |
| POST | `/cikis` | oturum | oturumu kapatır |
| GET | `/gorevler` | herkes | tüm görevler |
| GET | `/gorevler/:id` | herkes | tek görev |
| POST | `/gorevler` | herkes | yeni görev, 201 |
| PUT | `/gorevler/:id` | herkes | güncellenmiş görev |
| DELETE | `/gorevler/:id` | herkes | silme onayı |
| GET | `/gunluk-raporlar/bugun` | üye | bugünkü rapor durumu |
| POST | `/gunluk-raporlar` | üye | rapor kaydı |
| GET | `/gunluk-raporlar/takip` | admin | ekibin bugünkü durumu |
| POST | `/gunluk-raporlar/takip/hatirlat` | admin | eksik raporu hatırlatır |
| GET | `/ikram/hafta` | oturum | haftanın favori yemek ve içeceği |
| POST | `/ikram` | oturum | bugünkü öğün |

Ayrıntılı tablo: `docs/API_TASARIM.md`

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

Sunucu `id`, `olusturulma` ve `guncellenme` alanlarını kendisi yazar. Eksik veya hatalı `baslik`, `oncelik` ya da `durum` için cevap **400** olur.

Liste cevabı:

```json
{
  "basarili": true,
  "adet": 1,
  "gorevler": []
}
```

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

Her API isteğinde method, adres ve zaman yazılır. Kayıt hem terminalde hem `gunluk/istekler.log` dosyasında durur. Log dosyaları depoya girmez.

## Veri

| Dosya | İçerik |
|--------|--------|
| `data/gorevler.json` | görevler |
| `data/kullanicilar.json` | demo kullanıcılar, bcrypt şifre özeti |
| `data/gunlukRaporlar.json` | günlük raporlar |
| `data/ikramlar.json` | haftalık yemek ve içecek kayıtları |

Model özeti: `docs/VERI_MODELI.md`  
Proje tanıtımı: `docs/PROJE_TANITIM.md`

## Postman

1. Sunucuyu çalıştır.
2. Postman → Import:
   - `postman/TASKFLOW.postman_collection.json`
   - `postman/TASKFLOW-Yerel.postman_environment.json`
3. Ortam olarak **TASKFLOW Yerel** seç.
4. `temel_url` değerini sunucunun adresine yaz (`http://localhost:3000` veya kullanılan port).

CRUD kanıtı beş görüntüdür. Sıra: listeleme, ekleme, detay, güncelleme, silme.

| Dosya | İstek |
|--------|--------|
| `docs/ekran-goruntuleri/01-listeleme.png` | GET `/gorevler` |
| `docs/ekran-goruntuleri/02-ekleme.png` | POST `/gorevler` |
| `docs/ekran-goruntuleri/03-detay.png` | GET `/gorevler/:id` |
| `docs/ekran-goruntuleri/04-guncelleme.png` | PUT `/gorevler/:id` |
| `docs/ekran-goruntuleri/05-silme.png` | DELETE `/gorevler/:id` |

Adım adım not: `docs/POSTMAN.md`

## Klasörler

```
src/sunucu.js            giriş noktası
src/uygulama.js          Express uygulaması
src/rotalar/             URL eşlemesi
src/denetleyiciler/      istek cevapları
src/servisler/           dosyadan okuma ve yazma
src/araKatman/           istek günlüğü
public/                  panel (HTML, CSS, JS)
data/                    JSON kayıtlar
postman/                 koleksiyon ve ortam
docs/                    tanıtım, API, ekran görüntüleri
```

## Komutlar

| Komut | Ne yapar |
|--------|----------|
| `npm install` | bağımlılıkları kurar |
| `npm run dev` | geliştirme sunucusu |
| `npm start` | sunucuyu bir kez başlatır |
