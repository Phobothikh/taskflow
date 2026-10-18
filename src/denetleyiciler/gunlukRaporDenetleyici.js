const oturumServisi = require("../servisler/oturumServisi");
const kullaniciServisi = require("../servisler/kullaniciServisi");
const gunlukRaporServisi = require("../servisler/gunlukRaporServisi");

function oturumAl(req) {
  const anahtar = req.headers["x-oturum-anahtari"];
  return oturumServisi.oturumBul(anahtar);
}

function kullaniciAl(req) {
  const oturum = oturumAl(req);
  if (!oturum) return null;
  const kayit = kullaniciServisi.idIleBul(oturum.kullaniciId);
  if (kayit) return kullaniciServisi.genelBilgi(kayit);
  return {
    id: oturum.kullaniciId,
    eposta: oturum.eposta,
    gorunenAd: oturum.gorunenAd,
    rol: oturum.rol,
  };
}

function listele(req, res) {
  const kullanici = kullaniciAl(req);
  if (!kullanici) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }

  let raporlar = gunlukRaporServisi.kullanicininRaporlari(kullanici.id);
  raporlar = raporlar.sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

  res.json({
    basarili: true,
    adet: raporlar.length,
    bugun: gunlukRaporServisi.bugunTarihi(),
    raporlar,
  });
}

function bugunDurum(req, res) {
  const kullanici = kullaniciAl(req);
  if (!kullanici) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }

  const tarih = gunlukRaporServisi.bugunTarihi();
  const rapor = gunlukRaporServisi.tarihVeKullaniciIleBul(kullanici.id, tarih);

  res.json({
    basarili: true,
    tarih,
    dolduruldu: Boolean(rapor),
    yoneticiHatirlatma: !rapor && gunlukRaporServisi.hatirlatmaVarMi(kullanici.id, tarih),
    rapor: rapor || null,
  });
}

function takip(req, res) {
  const kullanici = kullaniciAl(req);
  if (!kullanici) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }
  if (kullanici.rol !== "admin") {
    return res.status(403).json({ basarili: false, mesaj: "Sadece admin erişebilir." });
  }

  const kullanicilar = kullaniciServisi.tumGenelBilgiler();
  const ozet = gunlukRaporServisi.bugunTakipOzeti(kullanicilar);
  res.json({ basarili: true, ...ozet });
}

function hatirlat(req, res) {
  const admin = kullaniciAl(req);
  if (!admin) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }
  if (admin.rol !== "admin") {
    return res.status(403).json({ basarili: false, mesaj: "Sadece admin erişebilir." });
  }

  const govde = req.body || {};
  const kullanicilar = kullaniciServisi.tumGenelBilgiler();
  const tarih = gunlukRaporServisi.bugunTarihi();
  let hedefler = [];

  if (govde.tumu === true) {
    hedefler = kullanicilar.filter((k) => k.id !== admin.id);
  } else if (govde.kullaniciId) {
    const hedef = kullanicilar.find((k) => k.id === String(govde.kullaniciId));
    if (!hedef) {
      return res.status(404).json({ basarili: false, mesaj: "Kullanıcı bulunamadı." });
    }
    hedefler = [hedef];
  } else {
    return res.status(400).json({ basarili: false, mesaj: "kullaniciId veya tumu: true gerekli." });
  }

  const gonderilen = [];
  const atlanan = [];
  for (const hedef of hedefler) {
    if (gunlukRaporServisi.tarihVeKullaniciIleBul(hedef.id, tarih)) {
      atlanan.push({ kullaniciId: hedef.id, neden: "zaten_dolduruldu" });
      continue;
    }
    const kayit = gunlukRaporServisi.hatirlatmaOlustur(hedef.id, admin);
    if (kayit) gonderilen.push({ kullaniciId: hedef.id, hatirlatmaId: kayit.id });
    else atlanan.push({ kullaniciId: hedef.id, neden: "zaten_hatirlatildi" });
  }

  res.status(201).json({
    basarili: true,
    mesaj: "Hatırlatma kaydedildi (uygulama bildirimi)",
    tarih,
    gonderilen,
    atlanan,
  });
}

function kaydet(req, res) {
  const kullanici = kullaniciAl(req);
  if (!kullanici) {
    return res.status(401).json({ basarili: false, mesaj: "Oturum gerekli." });
  }

  const hatalar = gunlukRaporServisi.girdiKontrol(req.body || {});
  if (hatalar.length) {
    return res.status(400).json({ basarili: false, mesaj: hatalar.join(" | ") });
  }

  const rapor = gunlukRaporServisi.kaydetVeyaGuncelle(kullanici, req.body || {});
  res.status(201).json({ basarili: true, mesaj: "Günlük rapor kaydedildi", rapor });
}

module.exports = { listele, bugunDurum, kaydet, takip, hatirlat };
