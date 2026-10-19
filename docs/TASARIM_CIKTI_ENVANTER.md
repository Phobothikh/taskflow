# TASKFLOW — Backend Geliştirme Proje Envanteri (Tasarım Çıktısı)

**Eğitim:** Node.js Backend Programlama Eğitimi  
**Teslim türü:** Backend Geliştirme Proje Envanteri — Tasarım Çıktısı (PDF)  
**Proje adı:** TASKFLOW — Görev ve Proje Yönetim Sistemi API  
**Öğrenci adı soyadı:** Hatice Kübra Elma

---

## 1. Proje tanıtımı

### 1.1 Amaç

Yazılım ekibinin görevlerini takip edebileceği, REST mantığında çalışan bir API tasarlamak ve geliştirmek. Proje; Node.js, Express.js, routing, CRUD işlemleri ve temel middleware (istek günlüğü) konularını uygular.

### 1.2 Senaryo

Bir yazılım şirketi ekip içindeki görevleri, projeleri ve çalışan sorumluluklarını tek yerden izlemek istemektedir. TASKFLOW; görev oluşturma, çalışana atama, durum ve öncelik takibi sunan API katmanını hedefler. Sistem tamamen REST API mantığında tasarlanmıştır.

### 1.3 Sistem özeti (tasarım kapsamı)

| Beklenti | Tasarım karşılığı |
|----------|-------------------|
| Görev oluşturma | `POST /gorevler` |
| Görev listeleme | `GET /gorevler` |
| Görev detayı | `GET /gorevler/:id` |
| Görev güncelleme | `PUT /gorevler/:id` |
| Görev silme | `DELETE /gorevler/:id` |
| Atama | Görevde `atanan` alanı (e-posta veya isim) |
| Öncelik / durum | `oncelik`, `durum` alanları (sabit değer listesi) |
| Veri saklama | JSON dosya (`data/gorevler.json`) |
| İstek izleme | Logger middleware → konsol + `gunluk/istekler.log` |

### 1.4 Teknoloji

Node.js, Express.js, JSON dosya tabanlı kalıcı veri.

---

## 2. Veri modeli tasarımı

### 2.1 Görev (Task)

Kalıcılık: `data/gorevler.json` (dizi).

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| id | string (UUID) | evet | Sunucu üretir |
| baslik | string | evet | Görev adı |
| aciklama | string | hayır | Detay |
| oncelik | enum | hayır | dusuk, orta, yuksek, acil (varsayılan: orta) |
| durum | enum | hayır | beklemede, devam_ediyor, tamamlandi (varsayılan: beklemede) |
| atanan | string | hayır | Atanan kişi (e-posta veya isim) |
| olusturulma | ISO datetime | evet | Sunucu üretir |
| guncellenme | ISO datetime | evet | Sunucu günceller |

### 2.2 Örnek kayıt

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "baslik": "Veritabanı şeması",
  "aciklama": "Tabloları çiz",
  "oncelik": "yuksek",
  "durum": "devam_ediyor",
  "atanan": "uye@taskflow.com",
  "olusturulma": "2026-10-12T09:00:00.000Z",
  "guncellenme": "2026-10-12T10:30:00.000Z"
}
```

---

## 3. API tasarım dokümanı (çekirdek uçlar)

**Temel URL:** `http://localhost:3000`

### 3.1 Sağlık

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/durum` | API çalışıyor mu |

### 3.2 Görev CRUD (zorunlu modül)

| Method | Endpoint | Açıklama | Başarı kodu |
|--------|----------|----------|-------------|
| GET | `/gorevler` | Tüm görevler | 200 |
| GET | `/gorevler/:id` | Tek görev | 200 / 404 |
| POST | `/gorevler` | Yeni görev | 201 |
| PUT | `/gorevler/:id` | Güncelle | 200 / 404 |
| DELETE | `/gorevler/:id` | Sil | 200 / 404 |

**POST / PUT gövde (örnek):**

```json
{
  "baslik": "Postman test görevi",
  "aciklama": "CRUD testi",
  "oncelik": "orta",
  "durum": "beklemede",
  "atanan": "uye@taskflow.com"
}
```

**Liste cevabı (özet):**

```json
{
  "basarili": true,
  "adet": 1,
  "gorevler": [ { "...": "..." } ]
}
```

### 3.3 Temel middleware — Logger

Tüm HTTP istekleri için middleware:

- Konsola yazar: method, URL, zaman
- Dosyaya ekler: `gunluk/istekler.log`

Bu, eğitim yönergesindeki zorunlu **tek temel middleware** tasarımıdır.

---

## 4. Proje envanteri (klasör / modül)

| Bileşen | Konum | Görevi |
|---------|--------|--------|
| Sunucu girişi | `src/sunucu.js` | Port, uygulama başlatma |
| Express uygulaması | `src/uygulama.js` | JSON, logger, rotalar |
| Rotalar | `src/rotalar/` | URL → denetleyici |
| Denetleyiciler | `src/denetleyiciler/` | İstek/cevap |
| Servisler | `src/servisler/` | JSON okuma/yazma |
| Middleware | `src/araKatman/istekGunlugu.js` | Logger |
| Veri | `data/gorevler.json` | Görev kayıtları |
| Bağımlılıklar | `package.json` | express, bcryptjs vb. |

---

## 5. Envanter özeti

Bu belge, **proje envanteri** kapsamında sunulan **tasarım çıktısıdır**: ihtiyaç analizi, veri modeli ve API uçlarının planı ile kaynak kod klasör yapısının özeti. Uygulama kodu, Postman testleri ve bitirme teslimi bu PDF’ten ayrı süreçlerde değerlendirilir.

---

**Belge sonu — TASKFLOW Tasarım Çıktısı**
