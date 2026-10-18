const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const veriDosyasi = path.join(__dirname, "..", "..", "data", "gunlukRaporlar.json");
const hatirlatmaDosyasi = path.join(__dirname, "..", "..", "data", "gunlukRaporHatirlatmalari.json");

function bugunTarihi() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}

function dosyadanOku() {
  const ham = fs.readFileSync(veriDosyasi, "utf8");
  return JSON.parse(ham);
}

function dosyayaYaz(liste) {
  fs.writeFileSync(veriDosyasi, JSON.stringify(liste, null, 2), "utf8");
}

function hatirlatmalariOku() {
  if (!fs.existsSync(hatirlatmaDosyasi)) return [];
  return JSON.parse(fs.readFileSync(hatirlatmaDosyasi, "utf8"));
}

function hatirlatmalariYaz(liste) {
  fs.writeFileSync(hatirlatmaDosyasi, JSON.stringify(liste, null, 2), "utf8");
}

function tumunuGetir() {
  return dosyadanOku();
}

function kullanicininRaporlari(kullaniciId) {
  return dosyadanOku().filter((r) => r.kullaniciId === kullaniciId);
}

function tarihVeKullaniciIleBul(kullaniciId, tarih) {
  return dosyadanOku().find((r) => r.kullaniciId === kullaniciId && r.tarih === tarih);
}

function girdiKontrol(govde) {
  const hatalar = [];
  if (!govde.yapilanlar || !String(govde.yapilanlar).trim()) {
    hatalar.push("yapilanlar alanı zorunludur");
  }
  if (!govde.planlar || !String(govde.planlar).trim()) {
    hatalar.push("planlar alanı zorunludur");
  }
  return hatalar;
}

function kaydetVeyaGuncelle(kullanici, govde) {
  const tarih = govde.tarih && /^\d{4}-\d{2}-\d{2}$/.test(govde.tarih) ? govde.tarih : bugunTarihi();
  const simdi = new Date().toISOString();
  const liste = dosyadanOku();
  const sira = liste.findIndex((r) => r.kullaniciId === kullanici.id && r.tarih === tarih);

  const govdeRapor = {
    yapilanlar: String(govde.yapilanlar).trim(),
    planlar: String(govde.planlar).trim(),
    engeller: govde.engeller ? String(govde.engeller).trim() : "",
    tarih,
    kullaniciId: kullanici.id,
    eposta: kullanici.eposta,
    gorunenAd: kullanici.gorunenAd,
    guncellenme: simdi,
  };

  if (sira === -1) {
    const yeni = {
      id: crypto.randomUUID(),
      ...govdeRapor,
      olusturulma: simdi,
    };
    liste.push(yeni);
    dosyayaYaz(liste);
    hatirlatmaTemizle(kullanici.id, tarih);
    return yeni;
  }

  liste[sira] = { ...liste[sira], ...govdeRapor };
  dosyayaYaz(liste);
  hatirlatmaTemizle(kullanici.id, tarih);
  return liste[sira];
}

function hatirlatmaVarMi(kullaniciId, tarih) {
  const gun = tarih || bugunTarihi();
  return hatirlatmalariOku().some((h) => h.kullaniciId === kullaniciId && h.tarih === gun);
}

function hatirlatmaTemizle(kullaniciId, tarih) {
  const gun = tarih || bugunTarihi();
  const kalan = hatirlatmalariOku().filter((h) => !(h.kullaniciId === kullaniciId && h.tarih === gun));
  hatirlatmalariYaz(kalan);
}

function hatirlatmaOlustur(kullaniciId, isteyen) {
  const tarih = bugunTarihi();
  const liste = hatirlatmalariOku();
  if (liste.some((h) => h.kullaniciId === kullaniciId && h.tarih === tarih)) {
    return null;
  }
  const kayit = {
    id: crypto.randomUUID(),
    tarih,
    kullaniciId,
    isteyenId: isteyen.id,
    isteyenAd: isteyen.gorunenAd,
    olusturulma: new Date().toISOString(),
  };
  liste.push(kayit);
  hatirlatmalariYaz(liste);
  return kayit;
}

function bugunTakipOzeti(kullanicilar) {
  const tarih = bugunTarihi();
  const raporlar = dosyadanOku().filter((r) => r.tarih === tarih);
  const hatirlatmalar = hatirlatmalariOku().filter((h) => h.tarih === tarih);

  const satirlar = kullanicilar.map((k) => {
    const rapor = raporlar.find((r) => r.kullaniciId === k.id);
    const hatirlatildi = hatirlatmalar.some((h) => h.kullaniciId === k.id);
    return {
      id: k.id,
      eposta: k.eposta,
      gorunenAd: k.gorunenAd,
      rol: k.rol,
      dolduruldu: Boolean(rapor),
      hatirlatildi,
      guncellenme: rapor ? rapor.guncellenme : null,
    };
  });

  const dolduran = satirlar.filter((s) => s.dolduruldu).length;
  return {
    tarih,
    ozet: {
      toplam: satirlar.length,
      dolduran,
      bekleyen: satirlar.length - dolduran,
    },
    kullanicilar: satirlar,
  };
}

module.exports = {
  bugunTarihi,
  tumunuGetir,
  kullanicininRaporlari,
  tarihVeKullaniciIleBul,
  girdiKontrol,
  kaydetVeyaGuncelle,
  hatirlatmaVarMi,
  hatirlatmaOlustur,
  bugunTakipOzeti,
};
