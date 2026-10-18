(function () {
  "use strict";

  const GENISLIK = 360;
  const YUKSEKLIK = 520;
  const ZEMIN = 48;
  const KUS_X = 86;
  const KUS_R = 13;
  const BORU_GEN = 54;
  const DELIK = 148;
  const SKOR_ANAHTAR = "taskflow_flybird_skorlar";

  const EKIP = [
    { ad: "Mehmet Yılmaz", eposta: "mehmet@taskflow.com", harf: "MY", varsayilan: 24 },
    { ad: "Ayşe Kaya", eposta: "ayse@taskflow.com", harf: "AK", varsayilan: 17 },
    { ad: "Sistem Yöneticisi", eposta: "admin@taskflow.com", harf: "SY", varsayilan: 11 },
    { ad: "Demo Üye", eposta: "uye@taskflow.com", harf: "DÜ", varsayilan: 0 },
  ];

  let tuval;
  let ctx;
  let anim = 0;
  let olayBagli = false;
  let durum = "hazir";
  let y = 210;
  let hiz = 0;
  let skor = 0;
  let borular = [];
  let zaman = 0;
  let sonZaman = 0;

  function sayfaAcikMi() {
    const sayfa = document.querySelector('[data-sayfa="flybird"]');
    return Boolean(sayfa && !sayfa.hidden);
  }

  function oyuncu() {
    try {
      const oturum = JSON.parse(localStorage.getItem("taskflow_oturum") || "null");
      return oturum && oturum.kullanici ? oturum.kullanici : null;
    } catch {
      return null;
    }
  }

  function skorlarOku() {
    let kayit = {};
    try {
      kayit = JSON.parse(localStorage.getItem(SKOR_ANAHTAR) || "{}") || {};
    } catch {
      kayit = {};
    }
    let degisti = false;
    EKIP.forEach(function (uye) {
      if (typeof kayit[uye.eposta] !== "number") {
        kayit[uye.eposta] = uye.varsayilan;
        degisti = true;
      }
    });
    if (degisti) localStorage.setItem(SKOR_ANAHTAR, JSON.stringify(kayit));
    return kayit;
  }

  function skorKaydet(puan) {
    const ben = oyuncu();
    if (!ben || !ben.eposta) return;
    const kayit = skorlarOku();
    const onceki = kayit[ben.eposta] || 0;
    if (puan > onceki) {
      kayit[ben.eposta] = puan;
      localStorage.setItem(SKOR_ANAHTAR, JSON.stringify(kayit));
    }
  }

  function kacis(metin) {
    return String(metin)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function siralamaCiz() {
    const liste = document.getElementById("flybirdSira");
    if (!liste) return;
    const ben = oyuncu();
    const kayit = skorlarOku();
    const sirali = EKIP.map(function (uye) {
      return {
        ad: ben && ben.eposta === uye.eposta && ben.gorunenAd ? ben.gorunenAd : uye.ad,
        harf: uye.harf,
        eposta: uye.eposta,
        puan: kayit[uye.eposta] || 0,
        sen: Boolean(ben && ben.eposta === uye.eposta),
      };
    }).sort(function (a, b) {
      return b.puan - a.puan || a.ad.localeCompare(b.ad, "tr");
    });

    liste.innerHTML = sirali
      .map(function (uye, index) {
        return (
          '<li class="flybird-sira-oge' +
          (uye.sen ? " sen" : "") +
          '"><span class="flybird-sira-no">' +
          (index + 1) +
          '</span><span class="flybird-harf">' +
          kacis(uye.harf) +
          '</span><span class="flybird-ad">' +
          kacis(uye.ad) +
          (uye.sen ? " · sen" : "") +
          '</span><span class="flybird-puan">' +
          uye.puan +
          "</span></li>"
        );
      })
      .join("");
  }

  function ortuGoster(metin, dugme) {
    const ortu = document.getElementById("flybirdOrtu");
    const yazi = document.getElementById("flybirdOrtuMetin");
    const btn = document.getElementById("flybirdBasla");
    if (!ortu || !yazi || !btn) return;
    yazi.textContent = metin;
    btn.textContent = dugme;
    ortu.hidden = false;
  }

  function ortuGizle() {
    const ortu = document.getElementById("flybirdOrtu");
    if (ortu) ortu.hidden = true;
  }

  function sifirla() {
    y = 210;
    hiz = 0;
    skor = 0;
    zaman = 0;
    borular = [];
    boruEkle(GENISLIK + 40);
    boruEkle(GENISLIK + 230);
  }

  function boruEkle(x) {
    const ust = 70;
    const alt = YUKSEKLIK - ZEMIN - DELIK - 70;
    const delikY = ust + Math.random() * Math.max(1, alt - ust);
    borular.push({ x: x, delikY: delikY, gecti: false });
  }

  function zipla() {
    if (!sayfaAcikMi()) return;
    if (durum !== "oynuyor") {
      basla();
      return;
    }
    hiz = -5.2;
  }

  function basla() {
    sifirla();
    durum = "oynuyor";
    ortuGizle();
    hiz = -5.2;
  }

  function bitir() {
    if (durum !== "oynuyor") return;
    durum = "bitti";
    skorKaydet(skor);
    siralamaCiz();
    ortuGoster("Skorun " + skor + ". Ekip tablosu güncellendi.", "Tekrar");
  }

  function carpisma(boru) {
    const kusUst = y - KUS_R;
    const kusAlt = y + KUS_R;
    const kusSol = KUS_X - KUS_R;
    const kusSag = KUS_X + KUS_R;
    const boruSol = boru.x;
    const boruSag = boru.x + BORU_GEN;
    if (kusSag < boruSol || kusSol > boruSag) return false;
    return kusUst < boru.delikY || kusAlt > boru.delikY + DELIK;
  }

  function guncelle(kare) {
    zaman += kare;
    if (durum === "hazir") {
      y = 220 + Math.sin(zaman * 0.05) * 8;
      return;
    }
    if (durum !== "oynuyor") return;

    hiz += 0.22 * kare;
    y += hiz * kare;
    borular.forEach(function (boru) {
      boru.x -= 1.45 * kare;
      if (!boru.gecti && boru.x + BORU_GEN < KUS_X) {
        boru.gecti = true;
        skor += 1;
      }
    });
    if (borular.length && borular[borular.length - 1].x < GENISLIK - 190) {
      boruEkle(GENISLIK + 30);
    }
    borular = borular.filter(function (boru) {
      return boru.x > -BORU_GEN;
    });

    if (y + KUS_R >= YUKSEKLIK - ZEMIN || y - KUS_R <= 0) {
      bitir();
      return;
    }
    for (let i = 0; i < borular.length; i++) {
      if (carpisma(borular[i])) {
        bitir();
        return;
      }
    }
  }

  function renk(ad, yedek) {
    const deger = getComputedStyle(document.documentElement).getPropertyValue(ad).trim();
    return deger || yedek;
  }

  function yuvarlak(x, y0, w, h, r) {
    const yaricap = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + yaricap, y0);
    ctx.arcTo(x + w, y0, x + w, y0 + h, yaricap);
    ctx.arcTo(x + w, y0 + h, x, y0 + h, yaricap);
    ctx.arcTo(x, y0 + h, x, y0, yaricap);
    ctx.arcTo(x, y0, x + w, y0, yaricap);
    ctx.closePath();
  }

  function ciz() {
    if (!ctx) return;
    const gokyuzu = renk("--zemin", "#0a0f16");
    const boruRenk = renk("--birincil", "#4a7eb8");
    const kusRenk = renk("--yazi", "#f1f5fa");

    ctx.clearRect(0, 0, GENISLIK, YUKSEKLIK);
    ctx.fillStyle = gokyuzu === "transparent" ? "#d7e4f2" : gokyuzu;
    ctx.fillRect(0, 0, GENISLIK, YUKSEKLIK);

    ctx.fillStyle = boruRenk;
    borular.forEach(function (boru) {
      yuvarlak(boru.x, 0, BORU_GEN, boru.delikY - 8, 8);
      ctx.fill();
      yuvarlak(boru.x, boru.delikY + DELIK + 8, BORU_GEN, YUKSEKLIK - ZEMIN - (boru.delikY + DELIK + 8), 8);
      ctx.fill();
    });

    ctx.fillStyle = "#1c2836";
    ctx.fillRect(0, YUKSEKLIK - ZEMIN, GENISLIK, ZEMIN);

    ctx.save();
    ctx.translate(KUS_X, y);
    ctx.rotate(Math.max(-0.5, Math.min(0.7, hiz * 0.06)));
    ctx.fillStyle = kusRenk;
    ctx.beginPath();
    ctx.arc(0, 0, KUS_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = boruRenk;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(16, 2);
    ctx.lineTo(6, 6);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = kusRenk;
    ctx.font = "600 28px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(skor), GENISLIK / 2, 48);
  }

  function dongu(simdi) {
    if (!sayfaAcikMi()) {
      anim = 0;
      sonZaman = 0;
      return;
    }
    if (!sonZaman) sonZaman = simdi;
    const gecen = Math.min(0.05, (simdi - sonZaman) / 1000);
    sonZaman = simdi;
    guncelle(gecen * 60);
    ciz();
    anim = requestAnimationFrame(dongu);
  }

  function olaylariBagla() {
    if (olayBagli || !tuval) return;
    olayBagli = true;
    tuval.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      zipla();
    });
    const baslaBtn = document.getElementById("flybirdBasla");
    if (baslaBtn) {
      baslaBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (durum === "oynuyor") return;
        basla();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (!sayfaAcikMi()) return;
      if (e.code !== "Space" && e.code !== "ArrowUp") return;
      e.preventDefault();
      zipla();
    });
  }

  function baslat() {
    tuval = document.getElementById("flybirdTuval");
    if (!tuval) return;
    ctx = tuval.getContext("2d");
    olaylariBagla();
    siralamaCiz();
    if (durum === "hazir" && !borular.length) sifirla();
    if (!anim) anim = requestAnimationFrame(dongu);
  }

  window.taskflowFlyBird = { baslat };
})();
