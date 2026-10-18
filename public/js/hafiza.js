(function () {
  "use strict";

  const CIFTLER = [
    { id: "gorev", yazi: "Görev", harf: "☑" },
    { id: "rapor", yazi: "Rapor", harf: "R" },
    { id: "takvim", yazi: "Takvim", harf: "T" },
    { id: "ekip", yazi: "Ekip", harf: "E" },
    { id: "not", yazi: "Not", harf: "N" },
    { id: "dosya", yazi: "Dosya", harf: "F" },
    { id: "mola", yazi: "Mola", harf: "M" },
    { id: "hedef", yazi: "Hedef", harf: "H" },
  ];

  const REKOR_ANAHTAR = "taskflow_hafiza_rekor";

  let kartlar = [];
  let aciklar = [];
  let kilit = false;
  let hamle = 0;
  let eslesen = 0;
  let olayBaglandi = false;

  function karistir(liste) {
    const kopya = liste.slice();
    for (let i = kopya.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const gecici = kopya[i];
      kopya[i] = kopya[j];
      kopya[j] = gecici;
    }
    return kopya;
  }

  function rekorOku() {
    const deger = Number(localStorage.getItem(REKOR_ANAHTAR));
    return Number.isFinite(deger) && deger > 0 ? deger : 0;
  }

  function mesajYaz(metin, tur) {
    const el = document.getElementById("hafizaMesaj");
    if (!el) return;
    el.textContent = metin;
    el.className = "hafiza-mesaj" + (tur ? " " + tur : "");
  }

  function skorYaz() {
    const el = document.getElementById("hafizaSkor");
    if (!el) return;
    const rekor = rekorOku();
    el.textContent = rekor ? "Hamle " + hamle + " · Rekor " + rekor : "Hamle " + hamle;
  }

  function ciz() {
    const tahta = document.getElementById("hafizaTahta");
    if (!tahta) return;
    tahta.innerHTML = kartlar
      .map(function (kart, index) {
        const acik = kart.acik || kart.eslesti ? " acik" : "";
        const es = kart.eslesti ? " eslesti" : "";
        return (
          '<button type="button" class="hafiza-kart' +
          acik +
          es +
          '" data-i="' +
          index +
          '"' +
          (kart.eslesti ? " disabled" : "") +
          '><span class="hafiza-arka" aria-hidden="true">TF</span><span class="hafiza-on"><span class="hafiza-harf">' +
          kart.harf +
          '</span><span class="hafiza-yazi">' +
          kart.yazi +
          "</span></span></button>"
        );
      })
      .join("");

    tahta.querySelectorAll(".hafiza-kart").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cevir(Number(btn.dataset.i));
      });
    });
  }

  function cevir(index) {
    const kart = kartlar[index];
    if (!kart || kilit || kart.acik || kart.eslesti) return;

    kart.acik = true;
    aciklar.push(index);
    ciz();

    if (aciklar.length < 2) return;

    hamle += 1;
    skorYaz();
    const birinci = aciklar[0];
    const ikinci = aciklar[1];

    if (kartlar[birinci].id === kartlar[ikinci].id) {
      kartlar[birinci].eslesti = true;
      kartlar[ikinci].eslesti = true;
      eslesen += 1;
      aciklar = [];
      ciz();
      if (eslesen === CIFTLER.length) bitir();
      return;
    }

    kilit = true;
    window.setTimeout(function () {
      kartlar[birinci].acik = false;
      kartlar[ikinci].acik = false;
      aciklar = [];
      kilit = false;
      ciz();
    }, 700);
  }

  function bitir() {
    const rekor = rekorOku();
    if (!rekor || hamle < rekor) localStorage.setItem(REKOR_ANAHTAR, String(hamle));
    skorYaz();
    mesajYaz(hamle + " hamlede tamamladın. Kısa mola iyi geldi.", "basari");
  }

  function yeniOyun() {
    const deste = [];
    CIFTLER.forEach(function (cift) {
      deste.push({ id: cift.id, yazi: cift.yazi, harf: cift.harf, acik: false, eslesti: false });
      deste.push({ id: cift.id, yazi: cift.yazi, harf: cift.harf, acik: false, eslesti: false });
    });
    kartlar = karistir(deste);
    aciklar = [];
    kilit = false;
    hamle = 0;
    eslesen = 0;
    ciz();
    skorYaz();
    mesajYaz("Aynı iki kartı bul.");
  }

  function olaylariBagla() {
    if (olayBaglandi) return;
    const yenile = document.getElementById("hafizaYenile");
    if (!yenile) return;
    olayBaglandi = true;
    yenile.addEventListener("click", yeniOyun);
  }

  function baslat() {
    if (!document.getElementById("hafizaTahta")) return;
    olaylariBagla();
    if (!kartlar.length) yeniOyun();
    else {
      ciz();
      skorYaz();
    }
  }

  window.taskflowHafiza = { baslat };
})();
