const express = require("express");
const ikramDenetleyici = require("../denetleyiciler/ikramDenetleyici");

const router = express.Router();

router.get("/hafta", ikramDenetleyici.hafta);
router.post("/", ikramDenetleyici.ekle);

module.exports = router;
