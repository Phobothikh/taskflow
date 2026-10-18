const express = require("express");
const gorevDenetleyici = require("../denetleyiciler/gorevDenetleyici");

const router = express.Router();

router.get("/", gorevDenetleyici.listele);
router.get("/:id", gorevDenetleyici.detay);
router.post("/", gorevDenetleyici.ekle);
router.put("/:id", gorevDenetleyici.guncelle);
router.delete("/:id", gorevDenetleyici.sil);

module.exports = router;
