const oturumServisi = require("../servisler/oturumServisi");
const kullaniciServisi = require("../servisler/kullaniciServisi");
const ikramServisi = require("../servisler/ikramServisi");

function kullaniciAl(req) {
  const anahtar = req.headers["x-oturum-anahtari"];
  const oturum = oturumServisi.oturumBul(anahtar);
  if (!oturum) return null;
  const kayit = kullaniciServisi.idIleBul(oturum.kullaniciId);
  if (kayit) return kullaniciServisi.genelBilgi(kayit);
  return {
    id: oturum.kullaniciId,
    eposta: oturum.eposta,
    gorunenAd: oturum.gorunenAd,
    rol: oturum.rol,
  };
}

function hafta(req, res) {
  const kullanici = kullaniciAl(req);
  if (!kullanici) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }

  res.json({ basarili: true, ...ikramServisi.haftaOzeti(kullanici.id) });
}

function ekle(req, res) {
  const kullanici = kullaniciAl(req);
  if (!kullanici) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }

  const sonuc = ikramServisi.bugunEkle(kullanici, req.body || {});
  if (sonuc.hatalar.length) {
    return res.status(400).json({ basarili: false, mesaj: sonuc.hatalar.join(", ") });
  }

  res.status(201).json({ basarili: true, ...sonuc.ozet });
}

module.exports = { hafta, ekle };
