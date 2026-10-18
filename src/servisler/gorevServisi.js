const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ONCELIKLER, DURUMLAR } = require("../yapilandirma/sabitler");

const veriDosyasi = path.join(__dirname, "..", "..", "data", "gorevler.json");

function dosyadanOku() {
  const ham = fs.readFileSync(veriDosyasi, "utf8");
  return JSON.parse(ham);
}

function dosyayaYaz(gorevler) {
  fs.writeFileSync(veriDosyasi, JSON.stringify(gorevler, null, 2), "utf8");
}

function tumunuGetir() {
  return dosyadanOku();
}

function idIleBul(id) {
  return dosyadanOku().find((g) => g.id === id);
}

function girdiKontrol(govde, yeniKayitMi) {
  const hatalar = [];

  if (yeniKayitMi && (!govde.baslik || !String(govde.baslik).trim())) {
    hatalar.push("baslik alanı boş bırakılamaz");
  }

  if (govde.oncelik !== undefined && !ONCELIKLER.includes(govde.oncelik)) {
    hatalar.push("oncelik: dusuk, orta, yuksek veya acil olmalı");
  }

  if (govde.durum !== undefined && !DURUMLAR.includes(govde.durum)) {
    hatalar.push("durum: beklemede, devam_ediyor veya tamamlandi olmalı");
  }

  return hatalar;
}

function yeniGorevEkle(govde) {
  const simdi = new Date().toISOString();
  const gorev = {
    id: crypto.randomUUID(),
    baslik: String(govde.baslik).trim(),
    aciklama: govde.aciklama ? String(govde.aciklama).trim() : "",
    oncelik: govde.oncelik || "orta",
    durum: govde.durum || "beklemede",
    atanan: govde.atanan ? String(govde.atanan).trim() : null,
    olusturulma: simdi,
    guncellenme: simdi,
  };

  const liste = dosyadanOku();
  liste.push(gorev);
  dosyayaYaz(liste);
  return gorev;
}

function gorevGuncelle(id, govde) {
  const liste = dosyadanOku();
  const sira = liste.findIndex((g) => g.id === id);
  if (sira === -1) return null;

  const eski = liste[sira];
  const guncel = {
    ...eski,
    baslik: govde.baslik !== undefined ? String(govde.baslik).trim() : eski.baslik,
    aciklama:
      govde.aciklama !== undefined ? String(govde.aciklama).trim() : eski.aciklama,
    oncelik: govde.oncelik !== undefined ? govde.oncelik : eski.oncelik,
    durum: govde.durum !== undefined ? govde.durum : eski.durum,
    atanan:
      govde.atanan !== undefined
        ? govde.atanan
          ? String(govde.atanan).trim()
          : null
        : eski.atanan,
    guncellenme: new Date().toISOString(),
  };

  liste[sira] = guncel;
  dosyayaYaz(liste);
  return guncel;
}

const ONCELIK_ESLEME = {
  dusuk: "dusuk",
  low: "dusuk",
  orta: "orta",
  medium: "orta",
  yuksek: "yuksek",
  high: "yuksek",
  acil: "acil",
  urgent: "acil",
};

const DURUM_ESLEME = {
  beklemede: "beklemede",
  pending: "beklemede",
  devam_ediyor: "devam_ediyor",
  in_progress: "devam_ediyor",
  tamamlandi: "tamamlandi",
  completed: "tamamlandi",
};

const SIRA_ALANLARI = {
  olusturulma: "olusturulma",
  createdat: "olusturulma",
  guncellenme: "guncellenme",
  updatedat: "guncellenme",
  baslik: "baslik",
  title: "baslik",
  oncelik: "oncelik",
  priority: "oncelik",
  durum: "durum",
  status: "durum",
};

function kucuk(deger) {
  return String(deger || "").toLocaleLowerCase("tr-TR");
}

function secenekCoz(ham, tablo, ad) {
  if (ham === undefined || ham === null || String(ham).trim() === "") {
    return { deger: null };
  }
  const deger = tablo[kucuk(ham).replace(/-/g, "_")];
  if (!deger) {
    return { hata: `${ad} bu listeden biri olmalı: ${[...new Set(Object.values(tablo))].join(", ")}` };
  }
  return { deger };
}

function filtrele(sorgu) {
  let liste = dosyadanOku();
  const durum = secenekCoz(sorgu.durum || sorgu.status, DURUM_ESLEME, "durum");
  if (durum.hata) return { hata: durum.hata };
  if (durum.deger) liste = liste.filter((gorev) => gorev.durum === durum.deger);

  const oncelik = secenekCoz(sorgu.oncelik || sorgu.priority, ONCELIK_ESLEME, "oncelik");
  if (oncelik.hata) return { hata: oncelik.hata };
  if (oncelik.deger) liste = liste.filter((gorev) => gorev.oncelik === oncelik.deger);

  const kelime = sorgu.kelime || sorgu.keyword || sorgu.q || sorgu.ara;
  if (kelime && String(kelime).trim()) {
    const aranan = kucuk(kelime);
    liste = liste.filter((gorev) =>
      [gorev.baslik, gorev.aciklama, gorev.atanan].some((alan) => kucuk(alan).includes(aranan))
    );
  }

  const sirala = sorgu.sirala || sorgu.sort;
  if (sirala && String(sirala).trim()) {
    const yazi = String(sirala).trim();
    const azalan = yazi.startsWith("-");
    const alan = SIRA_ALANLARI[kucuk(yazi.replace(/^-/, "")).replace(/_/g, "")];
    if (!alan) {
      return { hata: "sirala: olusturulma, guncellenme, baslik, oncelik veya durum olmalı" };
    }
    liste = [...liste].sort((a, b) => {
      const sonuc = String(a[alan] || "").localeCompare(String(b[alan] || ""), "tr");
      return azalan ? -sonuc : sonuc;
    });
  }

  const toplam = liste.length;
  const sayfaIstendi =
    sorgu.sayfa !== undefined || sorgu.page !== undefined || sorgu.limit !== undefined;
  if (!sayfaIstendi) return { gorevler: liste, adet: toplam };

  const sayfa = Number(sorgu.sayfa !== undefined ? sorgu.sayfa : sorgu.page || 1);
  const limit = Number(sorgu.limit !== undefined ? sorgu.limit : 10);
  if (!Number.isInteger(sayfa) || sayfa < 1) {
    return { hata: "sayfa 1 veya daha büyük bir tam sayı olmalı" };
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { hata: "limit 1 ile 100 arasında bir tam sayı olmalı" };
  }

  const baslangic = (sayfa - 1) * limit;
  return {
    gorevler: liste.slice(baslangic, baslangic + limit),
    adet: toplam,
    sayfa,
    limit,
    sayfaSayisi: Math.max(1, Math.ceil(toplam / limit)),
  };
}

function atananaGore(kisi) {
  const aranan = kucuk(kisi);
  return dosyadanOku().filter((gorev) => kucuk(gorev.atanan).includes(aranan));
}

function raporOzet() {
  const liste = dosyadanOku();
  const say = (alan, deger) => liste.filter((gorev) => gorev[alan] === deger).length;
  return {
    toplam: liste.length,
    tamamlanan: say("durum", "tamamlandi"),
    bekleyen: say("durum", "beklemede"),
    devamEden: say("durum", "devam_ediyor"),
    oncelik: {
      dusuk: say("oncelik", "dusuk"),
      orta: say("oncelik", "orta"),
      yuksek: say("oncelik", "yuksek"),
      acil: say("oncelik", "acil"),
    },
  };
}

function gorevSil(id) {
  const liste = dosyadanOku();
  const sira = liste.findIndex((g) => g.id === id);
  if (sira === -1) return false;
  liste.splice(sira, 1);
  dosyayaYaz(liste);
  return true;
}

module.exports = {
  tumunuGetir,
  idIleBul,
  girdiKontrol,
  yeniGorevEkle,
  gorevGuncelle,
  gorevSil,
  filtrele,
  atananaGore,
  raporOzet,
  ONCELIK_ESLEME,
  DURUM_ESLEME,
};
