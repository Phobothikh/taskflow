const gorevServisi = require("../servisler/gorevServisi");

function listeCevabi(res, gorevler) {
  res.json({ basarili: true, adet: gorevler.length, gorevler });
}

function tamamlanan(req, res) {
  const gorevler = gorevServisi.tumunuGetir().filter((gorev) => gorev.durum === "tamamlandi");
  listeCevabi(res, gorevler);
}

function bekleyen(req, res) {
  const gorevler = gorevServisi.tumunuGetir().filter((gorev) => gorev.durum === "beklemede");
  listeCevabi(res, gorevler);
}

function ozet(req, res) {
  res.json({ basarili: true, ozet: gorevServisi.raporOzet() });
}

module.exports = { tamamlanan, bekleyen, ozet };
