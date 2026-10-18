const gorevServisi = require("../servisler/gorevServisi");

function listeCevabi(res, sonuc) {
  const cevap = { basarili: true, adet: sonuc.adet, gorevler: sonuc.gorevler };
  if (sonuc.sayfa) {
    cevap.sayfa = sonuc.sayfa;
    cevap.limit = sonuc.limit;
    cevap.sayfaSayisi = sonuc.sayfaSayisi;
  }
  res.json(cevap);
}

function listele(req, res) {
  const sonuc = gorevServisi.filtrele(req.query);
  if (sonuc.hata) {
    return res.status(400).json({ basarili: false, mesaj: sonuc.hata });
  }
  listeCevabi(res, sonuc);
}

function ara(req, res) {
  const kelime = req.query.kelime || req.query.keyword || req.query.q;
  if (!kelime || !String(kelime).trim()) {
    return res.status(400).json({ basarili: false, mesaj: "kelime veya keyword gerekli" });
  }
  const sonuc = gorevServisi.filtrele({ kelime });
  listeCevabi(res, sonuc);
}

function atanan(req, res) {
  const gorevler = gorevServisi.atananaGore(req.params.kisi);
  res.json({ basarili: true, adet: gorevler.length, gorevler });
}

function detay(req, res) {
  const gorev = gorevServisi.idIleBul(req.params.id);
  if (!gorev) {
    return res.status(404).json({ basarili: false, mesaj: "Görev bulunamadı" });
  }
  res.json({ basarili: true, gorev });
}

function ekle(req, res) {
  const hatalar = gorevServisi.girdiKontrol(req.body, true);
  if (hatalar.length > 0) {
    return res.status(400).json({ basarili: false, mesaj: hatalar.join(" | ") });
  }

  const gorev = gorevServisi.yeniGorevEkle(req.body);
  res.status(201).json({ basarili: true, gorev });
}

function guncelle(req, res) {
  const mevcut = gorevServisi.idIleBul(req.params.id);
  if (!mevcut) {
    return res.status(404).json({ basarili: false, mesaj: "Görev bulunamadı" });
  }

  const hatalar = gorevServisi.girdiKontrol(req.body, false);
  if (hatalar.length > 0) {
    return res.status(400).json({ basarili: false, mesaj: hatalar.join(" | ") });
  }

  if (!req.body.baslik || !String(req.body.baslik).trim()) {
    return res.status(400).json({ basarili: false, mesaj: "baslik alanı boş bırakılamaz" });
  }

  const gorev = gorevServisi.gorevGuncelle(req.params.id, req.body);
  res.json({ basarili: true, gorev });
}

function sil(req, res) {
  const silindi = gorevServisi.gorevSil(req.params.id);
  if (!silindi) {
    return res.status(404).json({ basarili: false, mesaj: "Görev bulunamadı" });
  }
  res.json({ basarili: true, mesaj: "Görev silindi" });
}

module.exports = { listele, ara, atanan, detay, ekle, guncelle, sil };
