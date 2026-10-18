const express = require("express");
const raporDenetleyici = require("../denetleyiciler/raporDenetleyici");

const router = express.Router();

router.get("/completed", raporDenetleyici.tamamlanan);
router.get("/pending", raporDenetleyici.bekleyen);
router.get("/summary", raporDenetleyici.ozet);
router.get("/tamamlanan", raporDenetleyici.tamamlanan);
router.get("/bekleyen", raporDenetleyici.bekleyen);
router.get("/ozet", raporDenetleyici.ozet);

module.exports = router;
