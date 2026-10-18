const express = require("express");
const path = require("path");
const istekGunlugu = require("./araKatman/istekGunlugu");
const anaRotalar = require("./rotalar/anaRotalar");

const uygulama = express();
const arayuzKlasoru = path.join(__dirname, "..", "public");

uygulama.use(express.json());
uygulama.use(istekGunlugu);

// API rotaları (Postman ve arayüz buradan veri çeker)
uygulama.use(anaRotalar);

// Görev paneli — tarayıcıda görünen arayüz
uygulama.use(express.static(arayuzKlasoru));

uygulama.get("/", (req, res) => {
  res.sendFile(path.join(arayuzKlasoru, "index.html"));
});

// Tanımsız adres
uygulama.use((req, res) => {
  if (
    req.path.startsWith("/gorevler") ||
    req.path === "/durum" ||
    req.path === "/giris" ||
    req.path === "/cikis" ||
    req.path === "/ben" ||
    req.path.startsWith("/gunluk-raporlar") ||
    req.path.startsWith("/ikram") ||
    req.path.startsWith("/reports") ||
    req.path.startsWith("/raporlar")
  ) {
    return res.status(404).json({ basarili: false, mesaj: "Böyle bir adres yok" });
  }
  res.status(404).send("Sayfa bulunamadı");
});

// JSON hatalı gönderilirse
uygulama.use((hata, req, res, next) => {
  if (hata instanceof SyntaxError && "body" in hata) {
    return res.status(400).json({ basarili: false, mesaj: "Gönderilen veri geçerli JSON değil" });
  }
  console.log(hata);
  res.status(500).json({ basarili: false, mesaj: "Sunucu tarafında bir sorun oluştu" });
});

module.exports = uygulama;
