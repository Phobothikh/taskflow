const kullaniciServisi = require("../servisler/kullaniciServisi");
const oturumServisi = require("../servisler/oturumServisi");

function giris(req, res) {
  const eposta = req.body?.eposta;
  const sifre = req.body?.sifre;

  if (!eposta || !sifre) {
    return res.status(400).json({ basarili: false, mesaj: "E-posta ve şifre gerekli." });
  }

  const kullanici = kullaniciServisi.epostaIleBul(eposta);
  if (!kullanici || !kullaniciServisi.sifreDogru(kullanici, sifre)) {
    return res.status(401).json({ basarili: false, mesaj: "E-posta veya şifre hatalı." });
  }

  const oturumAnahtari = oturumServisi.oturumAc(kullanici);
  res.json({
    basarili: true,
    mesaj: "Giriş başarılı",
    oturumAnahtari,
    kullanici: kullaniciServisi.genelBilgi(kullanici),
  });
}

function cikis(req, res) {
  const anahtar = req.body?.oturumAnahtari || req.headers["x-oturum-anahtari"];
  if (anahtar) oturumServisi.oturumKapat(anahtar);
  res.json({ basarili: true, mesaj: "Çıkış yapıldı" });
}

function ben(req, res) {
  const anahtar = req.headers["x-oturum-anahtari"];
  const oturum = oturumServisi.oturumBul(anahtar);
  if (!oturum) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum geçersiz veya süresi doldu." });
  }
  const kayit = kullaniciServisi.idIleBul(oturum.kullaniciId);
  const kullanici = kayit
    ? kullaniciServisi.genelBilgi(kayit)
    : {
        id: oturum.kullaniciId,
        eposta: oturum.eposta,
        gorunenAd: oturum.gorunenAd,
        rol: oturum.rol,
        ilkGiris: false,
      };
  res.json({ basarili: true, kullanici });
}

module.exports = { giris, cikis, ben };
