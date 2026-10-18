const fs = require("fs");
const path = require("path");

const gunlukKlasoru = path.join(__dirname, "..", "..", "gunluk");
const gunlukDosyasi = path.join(gunlukKlasoru, "istekler.log");

function istekGunlugu(req, res, next) {
  const zaman = new Date().toLocaleString("tr-TR");
  const satir = `[${zaman}] ${req.method} ${req.originalUrl}\n`;

  console.log(satir.trim());

  try {
    if (!fs.existsSync(gunlukKlasoru)) {
      fs.mkdirSync(gunlukKlasoru, { recursive: true });
    }
    fs.appendFileSync(gunlukDosyasi, satir, "utf8");
  } catch (hata) {
    console.log("Log dosyasına yazılamadı:", hata.message);
  }

  next();
}

module.exports = istekGunlugu;
