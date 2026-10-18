const express = require("express");
const gunlukRaporDenetleyici = require("../denetleyiciler/gunlukRaporDenetleyici");

const router = express.Router();

router.get("/bugun", gunlukRaporDenetleyici.bugunDurum);
router.get("/takip", gunlukRaporDenetleyici.takip);
router.post("/takip/hatirlat", gunlukRaporDenetleyici.hatirlat);
router.get("/", gunlukRaporDenetleyici.listele);
router.post("/", gunlukRaporDenetleyici.kaydet);

module.exports = router;
