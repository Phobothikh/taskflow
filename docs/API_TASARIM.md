# API adresleri

Sunucu: `http://localhost:3000`

| İşlem | Adres | Açıklama |
|--------|--------|----------|
| GET | `/` | Kısa bilgi |
| GET | `/durum` | API çalışıyor mu |
| POST | `/giris` | Oturum aç (eposta, sifre) |
| GET | `/ben` | Oturumlu kullanıcı (`X-Oturum-Anahtari`) |
| POST | `/cikis` | Oturum kapat |
| GET | `/gorevler` | Bütün görevler |
| GET | `/gorevler/:id` | Tek görev |
| POST | `/gorevler` | Yeni görev |
| PUT | `/gorevler/:id` | Görev güncelle |
| DELETE | `/gorevler/:id` | Görev sil |
| GET | `/gorevler?durum=tamamlandi` | Duruma göre süz (`status=completed` de olur) |
| GET | `/gorevler?oncelik=yuksek` | Önceliğe göre süz (`priority=high` de olur) |
| GET | `/gorevler/ara?kelime=şema` | Başlık, açıklama ve atananda ara (`/search?keyword=` de olur) |
| GET | `/gorevler/atanan/:kisi` | Atanan kişiye göre liste (`/assignee/:kisi` de olur) |
| GET | `/gorevler?sayfa=1&limit=10` | Sayfalama. Parametre yoksa liste eskisi gibi tam gelir |
| GET | `/gorevler?sirala=olusturulma` | Sırala. Başına `-` konursa ters döner (`sort=createdAt`) |
| GET | `/reports/completed` | Tamamlanan görevler (`/raporlar/tamamlanan`) |
| GET | `/reports/pending` | Bekleyen görevler (`/raporlar/bekleyen`) |
| GET | `/reports/summary` | Toplam, durum ve öncelik sayıları (`/raporlar/ozet`) |
| GET | `/gunluk-raporlar` | Oturumlu kullanıcının raporları |
| GET | `/gunluk-raporlar/bugun` | Bugün dolduruldu mu + kayıt + yönetici hatırlatması |
| POST | `/gunluk-raporlar` | Günlük rapor kaydet/güncelle (oturum) |
| GET | `/gunluk-raporlar/takip` | Admin: bugün kim doldurdu (oturum, rol admin) |
| POST | `/gunluk-raporlar/takip/hatirlat` | Admin: eksiklere hatırlat (`tumu: true` veya `kullaniciId`) |
| GET | `/ikram/hafta` | Oturumdaki çalışanın bu hafta en çok yediği ve içtiği |
| POST | `/ikram` | Bugünkü yemek ve/veya içecek kaydı (`yemek`, `icecek`) |

## Görev alanları

| Alan | Zorunlu | Değerler |
|------|---------|----------|
| baslik | evet | metin |
| aciklama | hayır | metin |
| oncelik | hayır | dusuk, orta, yuksek, acil (varsayılan: orta) |
| durum | hayır | beklemede, devam_ediyor, tamamlandi (varsayılan: beklemede) |
| atanan | hayır | e-posta veya isim |

Sunucu otomatik ekler: `id`, `olusturulma`, `guncellenme`

## Örnek cevap (liste)

```json
{
  "basarili": true,
  "adet": 1,
  "gorevler": [
    {
      "id": "...",
      "baslik": "Toplantı notları",
      "aciklama": "",
      "oncelik": "orta",
      "durum": "beklemede",
      "atanan": null,
      "olusturulma": "2026-10-12T12:00:00.000Z",
      "guncellenme": "2026-10-12T12:00:00.000Z"
    }
  ]
}
```

İstek günlüğü: her istek konsola ve `gunluk/istekler.log` dosyasına yazılır.
