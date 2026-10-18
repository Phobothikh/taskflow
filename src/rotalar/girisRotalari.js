const express = require("express");
const girisDenetleyici = require("../denetleyiciler/girisDenetleyici");

const router = express.Router();

router.post("/giris", girisDenetleyici.giris);
router.post("/cikis", girisDenetleyici.cikis);
router.get("/ben", girisDenetleyici.ben);

module.exports = router;
