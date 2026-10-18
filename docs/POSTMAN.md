# Postman kurulumu (TASKFLOW)

Yönerge için **5 CRUD ekran görüntüsü** (görevler) + isteğe bağlı oturum, durum ve **günlük rapor** istekleri.

## 1. Sunucuyu çalıştır

```bash
cd taskflow
npm run dev
```

Tarayıcıda `http://localhost:3000/durum` açıldığında JSON dönmeli.

## 2. Dosyaları içe aktar

Postman → **Import** → **File** veya sürükle-bırak:

| Dosya | Açıklama |
|--------|----------|
| `postman/TASKFLOW.postman_collection.json` | Tüm istekler + otomatik testler |
| `postman/TASKFLOW-Yerel.postman_environment.json` | URL, kullanıcılar, `gorev_id`, oturum |

Sağ üstten ortam: **TASKFLOW Yerel** seçili olsun.

## 3. Ortam değişkenleri

| Değişken | Varsayılan | Ne işe yarar |
|----------|------------|----------------|
| `temel_url` | `http://localhost:3000` | Tüm isteklerin kök adresi |
| `eposta` / `sifre` | üye hesabı | **Giriş yap (üye)** |
| `admin_eposta` / `admin_sifre` | admin hesabı | **Giriş yap (admin)** |
| `oturum_anahtari` | (boş → girişte dolar) | `X-Oturum-Anahtari` başlığı |
| `gorev_id` | (POST sonrası dolar) | GET/PUT/DELETE tek görev |
| `kullanici_id` | `2` | Admin hatırlat (tek kullanıcı); **Ben** isteği de günceller |

## 4. Test hesapları

| E-posta | Şifre | Rol |
|---------|--------|-----|
| uye@taskflow.com | 123456 | Üye |
| admin@taskflow.com | admin123 | Admin |

## 5. CRUD — ekran görüntüsü sırası (5 adet)

Koleksiyon: **2 — Görevler (CRUD)**. Her adımda **Send** → yanıt gövdesi görünürken ekran görüntüsü al (method, URL, status, JSON).

| # | İstek | Method | Adres |
|---|--------|--------|--------|
| 1 | GET — Tüm görevler | GET | `/gorevler` |
| 2 | POST — Yeni görev | POST | `/gorevler` |
| 3 | GET — Tek görev | GET | `/gorevler/{{gorev_id}}` |
| 4 | PUT — Görev güncelle | PUT | `/gorevler/{{gorev_id}}` |
| 5 | DELETE — Görev sil | DELETE | `/gorevler/{{gorev_id}}` |

**Not:** Görev uçları oturum istemez. Sadece CRUD teslimi için **1 — Oturum** zorunlu değil; istersen önce **0 — Sağlık → Durum kontrol** ekran görüntüsü ekleyebilirsin.

POST çalıştıktan sonra Tests sekmesinde yeşil tikler görünür; `gorev_id` ortama yazılır. GET/PUT/DELETE öncesi `gorev_id` boşsa önce POST’u tekrarla.

### Gövde örneği (POST /gorevler)

```json
{
  "baslik": "Veritabanı şeması",
  "aciklama": "Tabloları çiz",
  "oncelik": "yuksek",
  "durum": "devam_ediyor",
  "atanan": "uye@taskflow.com"
}
```

`oncelik`: dusuk | orta | yuksek | acil  
`durum`: beklemede | devam_ediyor | tamamlandi

## 6. Oturum (isteğe bağlı ekran görüntüsü)

| Sıra | İstek |
|------|--------|
| 1 | **Giriş yap (üye)** — `POST /giris` |
| 2 | **Ben (oturum)** — `GET /ben`, header: `X-Oturum-Anahtari: {{oturum_anahtari}}` |

## 7. Günlük rapor — Postman akışı

Oturum zorunlu. Header: `X-Oturum-Anahtari: {{oturum_anahtari}}`

### Üye

1. **1 — Oturum → Giriş yap (üye)**
2. **3 — Günlük raporlar → Üye → GET — Bugün durum** (`/gunluk-raporlar/bugun`)
3. **POST — Günlük rapor gönder** (`/gunluk-raporlar`)
4. Tekrar **GET — Bugün durum** → `dolduruldu: true` kontrolü (isteğe bağlı ekran görüntüsü)

Zorunlu alanlar: `yapilanlar`, `planlar`. İsteğe bağlı: `engeller`.

### Admin (ekip takibi + hatırlat)

1. **Giriş yap (admin)**
2. **GET — Ekip takibi (bugün)** → `/gunluk-raporlar/takip`
3. **POST — Hatırlat (tek kullanıcı)** → gövde: `{ "kullaniciId": "{{kullanici_id}}" }`
4. veya **POST — Hatırlat (tüm eksikler)** → `{ "tumu": true }`

Üye oturumuyla **GET — Bugün durum** → `yoneticiHatirlatma: true` (rapor hâlâ boşsa).

403 alırsan admin girişi yapılmamış demektir; **Giriş yap (admin)** ile `oturum_anahtari` yenile.

## 8. Collection Runner (toplu deneme)

Postman → koleksiyon → **Run**:

1. Ortam: **TASKFLOW Yerel**
2. Önerilen sıra: **0 — Sağlık** → **1 — Oturum (Giriş üye)** → **2 — CRUD** (5 istek) → **3 — Üye (rapor)**  
3. Admin rapor istekleri için ayrı koşu: önce runner’da sadece **Giriş yap (admin)** + **3 — Admin** klasörü

Runner sonunda failed test varsa ilgili isteğin **Tests** sekmesine bak.

## 9. Sorun giderme

| Sorun | Çözüm |
|--------|--------|
| Could not send request | `npm run dev` çalışıyor mu? Port 3000 boş mu? |
| `gorev_id` boş | Önce **POST — Yeni görev**; Tests’te `gorev_id kaydedildi` |
| 401 günlük rapor | **Giriş yap** sonrası `oturum_anahtari` dolu mu? Ortam seçili mi? |
| 403 takip / hatırlat | **Giriş yap (admin)** kullan |
| Something went wrong (Postman) | URL `http://localhost:3000` — `https` değil |
| SSL / proxy | Postman Settings → SSL verification kapalı (yerel için) |

Sunucu istek günlüğü: `gunluk/istekler.log`

## 10. Teslim checklist

- [ ] 5 CRUD ekran görüntüsü (method + URL + status + JSON)
- [ ] Koleksiyon ve ortam dosyaları projede (`postman/` klasörü)
- [ ] (İsteğe bağlı) Giriş + GET `/ben`
- [ ] (İsteğe bağlı) Günlük rapor POST + admin GET `/takip`
