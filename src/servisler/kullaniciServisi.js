const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dosya = path.join(__dirname, "..", "..", "data", "kullanicilar.json");

function oku() {
  return JSON.parse(fs.readFileSync(dosya, "utf8"));
}

function epostaIleBul(eposta) {
  const mail = eposta.trim().toLowerCase();
  return oku().find((k) => k.eposta === mail);
}

function idIleBul(id) {
  return oku().find((k) => k.id === id);
}

function sifreDogru(kullanici, sifre) {
  return bcrypt.compareSync(sifre, kullanici.sifreHash);
}

function genelBilgi(kullanici) {
  return {
    id: kullanici.id,
    eposta: kullanici.eposta,
    gorunenAd: kullanici.gorunenAd,
    rol: kullanici.rol,
    ilkGiris: kullanici.ilkGiris,
  };
}

function tumGenelBilgiler() {
  return oku().map(genelBilgi);
}

module.exports = { epostaIleBul, idIleBul, sifreDogru, genelBilgi, tumGenelBilgiler };
