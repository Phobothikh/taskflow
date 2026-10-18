const express = require("express");
const gorevDenetleyici = require("../denetleyiciler/gorevDenetleyici");
const { dogrula } = require("../araKatman/gorevDogrulama");

const router = express.Router();

router.get("/", gorevDenetleyici.listele);
router.get("/ara", gorevDenetleyici.ara);
router.get("/search", gorevDenetleyici.ara);
router.get("/atanan/:kisi", gorevDenetleyici.atanan);
router.get("/assignee/:kisi", gorevDenetleyici.atanan);
router.get("/:id", gorevDenetleyici.detay);
router.post("/", dogrula(true), gorevDenetleyici.ekle);
router.put("/:id", dogrula(true), gorevDenetleyici.guncelle);
router.delete("/:id", gorevDenetleyici.sil);

module.exports = router;
