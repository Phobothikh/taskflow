const express = require("express");
const gorevRotalari = require("./gorevRotalari");
const girisRotalari = require("./girisRotalari");
const gunlukRaporRotalari = require("./gunlukRaporRotalari");
const ikramRotalari = require("./ikramRotalari");

const router = express.Router();

router.get("/durum", (req, res) => {
  res.json({ basarili: true, mesaj: "TASKFLOW API ayakta" });
});

router.use(girisRotalari);
router.use("/gorevler", gorevRotalari);
router.use("/gunluk-raporlar", gunlukRaporRotalari);
router.use("/ikram", ikramRotalari);

module.exports = router;
