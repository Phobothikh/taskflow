const { ONCELIKLER, DURUMLAR } = require("../yapilandirma/sabitler");
const { ONCELIK_ESLEME, DURUM_ESLEME } = require("../servisler/gorevServisi");

function yazi(deger) {
  return String(deger || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/-/g, "_");
}

function govdeyiEsle(govde) {
  if (govde.title !== undefined && govde.baslik === undefined) govde.baslik = govde.title;
  if (govde.description !== undefined && govde.aciklama === undefined) govde.aciklama = govde.description;
  if (govde.assignee !== undefined && govde.atanan === undefined) govde.atanan = govde.assignee;

  const oncelikHam = govde.oncelik !== undefined ? govde.oncelik : govde.priority;
  if (oncelikHam !== undefined && String(oncelikHam).trim() !== "") {
    govde.oncelik = ONCELIK_ESLEME[yazi(oncelikHam)] || oncelikHam;
  }

  const durumHam = govde.durum !== undefined ? govde.durum : govde.status;
  if (durumHam !== undefined && String(durumHam).trim() !== "") {
    govde.durum = DURUM_ESLEME[yazi(durumHam)] || durumHam;
  }
}

function dogrula(baslikZorunlu) {
  return function gorevDogrula(req, res, next) {
    const govde = req.body && typeof req.body === "object" ? req.body : {};
    req.body = govde;
    govdeyiEsle(govde);

    const hatalar = [];

    if (baslikZorunlu && (!govde.baslik || !String(govde.baslik).trim())) {
      hatalar.push("baslik (title) boş bırakılamaz");
    } else if (govde.baslik !== undefined && !String(govde.baslik).trim()) {
      hatalar.push("baslik (title) boş bırakılamaz");
    } else if (govde.baslik !== undefined && String(govde.baslik).trim().length > 120) {
      hatalar.push("baslik en fazla 120 karakter olabilir");
    }

    if (govde.aciklama !== undefined && typeof govde.aciklama !== "string") {
      hatalar.push("aciklama (description) metin olmalı");
    } else if (govde.aciklama && govde.aciklama.length > 1000) {
      hatalar.push("aciklama en fazla 1000 karakter olabilir");
    }

    if (
      govde.oncelik !== undefined &&
      String(govde.oncelik).trim() !== "" &&
      !ONCELIKLER.includes(govde.oncelik)
    ) {
      hatalar.push("oncelik (priority): dusuk, orta, yuksek veya acil olmalı");
    }

    if (govde.durum !== undefined && String(govde.durum).trim() !== "" && !DURUMLAR.includes(govde.durum)) {
      hatalar.push("durum (status): beklemede, devam_ediyor veya tamamlandi olmalı");
    }

    if (govde.atanan !== undefined && govde.atanan !== null && typeof govde.atanan !== "string") {
      hatalar.push("atanan (assignee) metin olmalı");
    } else if (typeof govde.atanan === "string" && govde.atanan.trim().length > 80) {
      hatalar.push("atanan en fazla 80 karakter olabilir");
    }

    if (hatalar.length > 0) {
      return res.status(400).json({ basarili: false, mesaj: hatalar.join(" | ") });
    }

    next();
  };
}

module.exports = { dogrula };
