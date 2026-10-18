const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ONCELIKLER, DURUMLAR } = require("../yapilandirma/sabitler");

const veriDosyasi = path.join(__dirname, "..", "..", "data", "gorevler.json");

function dosyadanOku() {
  const ham = fs.readFileSync(veriDosyasi, "utf8");
  return JSON.parse(ham);
}

function dosyayaYaz(gorevler) {
  fs.writeFileSync(veriDosyasi, JSON.stringify(gorevler, null, 2), "utf8");
}

function tumunuGetir() {
  return dosyadanOku();
}

function idIleBul(id) {
  return dosyadanOku().find((g) => g.id === id);
}

function girdiKontrol(govde, yeniKayitMi) {
  const hatalar = [];

  if (yeniKayitMi && (!govde.baslik || !String(govde.baslik).trim())) {
    hatalar.push("baslik alanı boş bırakılamaz");
  }

  if (govde.oncelik !== undefined && !ONCELIKLER.includes(govde.oncelik)) {
    hatalar.push("oncelik: dusuk, orta, yuksek veya acil olmalı");
  }

  if (govde.durum !== undefined && !DURUMLAR.includes(govde.durum)) {
    hatalar.push("durum: beklemede, devam_ediyor veya tamamlandi olmalı");
  }

  return hatalar;
}

function yeniGorevEkle(govde) {
  const simdi = new Date().toISOString();
  const gorev = {
    id: crypto.randomUUID(),
    baslik: String(govde.baslik).trim(),
    aciklama: govde.aciklama ? String(govde.aciklama).trim() : "",
    oncelik: govde.oncelik || "orta",
    durum: govde.durum || "beklemede",
    atanan: govde.atanan ? String(govde.atanan).trim() : null,
    olusturulma: simdi,
    guncellenme: simdi,
  };

  const liste = dosyadanOku();
  liste.push(gorev);
  dosyayaYaz(liste);
  return gorev;
}

function gorevGuncelle(id, govde) {
  const liste = dosyadanOku();
  const sira = liste.findIndex((g) => g.id === id);
  if (sira === -1) return null;

  const eski = liste[sira];
  const guncel = {
    ...eski,
    baslik: govde.baslik !== undefined ? String(govde.baslik).trim() : eski.baslik,
    aciklama:
      govde.aciklama !== undefined ? String(govde.aciklama).trim() : eski.aciklama,
    oncelik: govde.oncelik !== undefined ? govde.oncelik : eski.oncelik,
    durum: govde.durum !== undefined ? govde.durum : eski.durum,
    atanan:
      govde.atanan !== undefined
        ? govde.atanan
          ? String(govde.atanan).trim()
          : null
        : eski.atanan,
    guncellenme: new Date().toISOString(),
  };

  liste[sira] = guncel;
  dosyayaYaz(liste);
  return guncel;
}

function gorevSil(id) {
  const liste = dosyadanOku();
  const sira = liste.findIndex((g) => g.id === id);
  if (sira === -1) return false;
  liste.splice(sira, 1);
  dosyayaYaz(liste);
  return true;
}

module.exports = {
  tumunuGetir,
  idIleBul,
  girdiKontrol,
  yeniGorevEkle,
  gorevGuncelle,
  gorevSil,
};
