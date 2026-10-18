const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const veriDosyasi = path.join(__dirname, "..", "..", "data", "ikramlar.json");
const EN_FAZLA_UZUNLUK = 40;

function bugunTarihi() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}

function haftaAraligi(tarih) {
  const [yil, ay, gun] = tarih.split("-").map(Number);
  const tarihNesnesi = new Date(Date.UTC(yil, ay - 1, gun));
  const haftaninGunu = tarihNesnesi.getUTCDay();
  const pazartesiyeKalan = haftaninGunu === 0 ? 6 : haftaninGunu - 1;
  const baslangic = new Date(tarihNesnesi);
  baslangic.setUTCDate(tarihNesnesi.getUTCDate() - pazartesiyeKalan);
  const bitis = new Date(baslangic);
  bitis.setUTCDate(baslangic.getUTCDate() + 6);
  const iso = (deger) => deger.toISOString().slice(0, 10);
  return { baslangic: iso(baslangic), bitis: iso(bitis) };
}

function dosyadanOku() {
  if (!fs.existsSync(veriDosyasi)) return [];
  return JSON.parse(fs.readFileSync(veriDosyasi, "utf8"));
}

function dosyayaYaz(liste) {
  fs.writeFileSync(veriDosyasi, JSON.stringify(liste, null, 2), "utf8");
}

function adTemizle(ham) {
  return String(ham || "")
    .replace(/[\u0000-\u001F]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function adAnahtari(ad) {
  return ad.toLocaleLowerCase("tr-TR");
}

function enCokOlan(kayitlar, tur) {
  const harita = new Map();
  kayitlar.forEach((kayit) => {
    if (kayit.tur !== tur) return;
    const ad = adTemizle(kayit.ad);
    if (!ad) return;
    const anahtar = adAnahtari(ad);
    const mevcut = harita.get(anahtar) || { ad, adet: 0 };
    mevcut.adet += Number(kayit.adet) > 0 ? Number(kayit.adet) : 1;
    harita.set(anahtar, mevcut);
  });

  const sirali = [...harita.values()].sort(
    (a, b) => b.adet - a.adet || a.ad.localeCompare(b.ad, "tr")
  );
  return sirali[0] || null;
}

function mesajOlustur(yemek, icecek) {
  if (yemek && icecek) {
    return `Bu hafta en çok ${yemek.ad} yedin, ${icecek.ad} içtin. Afiyet olsun.`;
  }
  if (yemek) {
    return `Bu hafta masanda en çok ${yemek.ad} var. Güzel gidiyorsun.`;
  }
  if (icecek) {
    return `Bu hafta en çok ${icecek.ad} içtin. Molaların yerinde.`;
  }
  return "Bu hafta henüz bir kayıt yok. Küçük bir mola iyi gelir.";
}

function haftaOzeti(kullaniciId) {
  const bugun = bugunTarihi();
  const hafta = haftaAraligi(bugun);
  const kayitlar = dosyadanOku().filter(
    (kayit) =>
      kayit.kullaniciId === kullaniciId &&
      kayit.tarih >= hafta.baslangic &&
      kayit.tarih <= hafta.bitis
  );
  const yemek = enCokOlan(kayitlar, "yemek");
  const icecek = enCokOlan(kayitlar, "icecek");

  return {
    hafta,
    yemek,
    icecek,
    mesaj: mesajOlustur(yemek, icecek),
  };
}

function girdiKontrol(govde) {
  const yemek = adTemizle(govde.yemek);
  const icecek = adTemizle(govde.icecek);
  const hatalar = [];

  if (!yemek && !icecek) {
    hatalar.push("Yemek veya içecek adından en az biri gerekli");
  }
  if (yemek && yemek.length < 2) hatalar.push("Yemek adı en az 2 karakter olmalı");
  if (icecek && icecek.length < 2) hatalar.push("İçecek adı en az 2 karakter olmalı");
  if (yemek.length > EN_FAZLA_UZUNLUK || icecek.length > EN_FAZLA_UZUNLUK) {
    hatalar.push(`Ad en fazla ${EN_FAZLA_UZUNLUK} karakter olabilir`);
  }

  return { hatalar, yemek, icecek };
}

function bugunEkle(kullanici, govde) {
  const kontrol = girdiKontrol(govde);
  if (kontrol.hatalar.length) return { hatalar: kontrol.hatalar };

  const tarih = bugunTarihi();
  const simdi = new Date().toISOString();
  const liste = dosyadanOku();
  const eklenecekler = [];

  if (kontrol.yemek) {
    eklenecekler.push({
      id: crypto.randomUUID(),
      kullaniciId: kullanici.id,
      tarih,
      tur: "yemek",
      ad: kontrol.yemek,
      adet: 1,
      olusturulma: simdi,
    });
  }
  if (kontrol.icecek) {
    eklenecekler.push({
      id: crypto.randomUUID(),
      kullaniciId: kullanici.id,
      tarih,
      tur: "icecek",
      ad: kontrol.icecek,
      adet: 1,
      olusturulma: simdi,
    });
  }

  dosyayaYaz(liste.concat(eklenecekler));
  return { hatalar: [], ozet: haftaOzeti(kullanici.id) };
}

module.exports = { bugunTarihi, haftaAraligi, haftaOzeti, bugunEkle };
