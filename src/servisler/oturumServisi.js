const crypto = require("crypto");

const oturumlar = new Map();

function oturumAc(kullanici) {
  const anahtar = crypto.randomBytes(24).toString("hex");
  oturumlar.set(anahtar, {
    kullaniciId: kullanici.id,
    eposta: kullanici.eposta,
    gorunenAd: kullanici.gorunenAd,
    rol: kullanici.rol,
    acilis: Date.now(),
  });
  return anahtar;
}

function oturumBul(anahtar) {
  if (!anahtar) return null;
  return oturumlar.get(anahtar) || null;
}

function oturumKapat(anahtar) {
  oturumlar.delete(anahtar);
}

module.exports = { oturumAc, oturumBul, oturumKapat };
