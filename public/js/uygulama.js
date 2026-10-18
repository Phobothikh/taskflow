(function () {
  "use strict";

  const OTURUM_ANAHTAR = "taskflow_oturum";
  const TEMA_ANAHTAR = "taskflow_tema";

  let girisEkrani;
  let uygulamaKabuk;
  let girisForm;
  let girisHata;
  let girisDugme;
  let gorevModal;
  let gorevForm;
  let fab;
  let guncelSayfa = "genel-bakis";
  let tumGorevler = [];

  const SAYFA_BASLIKLARI = {
    "genel-bakis": "Genel bakış",
    gorevler: "Görevlerim",
    projeler: "Projeler",
    ekip: "Ekip",
    bildirimler: "Bildirimler",
    duyurular: "Duyurular",
    notlar: "Notlar",
    dokumanlar: "Dökümanlar",
    raporlar: "Günlük rapor",
    takvim: "Takvim",
    flybird: "Fly Bird",
    hafiza: "Hafıza",
    profilim: "Profilim",
  };

  function escapeHtml(metin) {
    const div = document.createElement("div");
    div.textContent = metin;
    return div.innerHTML;
  }

  function oturumOku() {
    try {
      const ham = localStorage.getItem(OTURUM_ANAHTAR);
      return ham ? JSON.parse(ham) : null;
    } catch {
      return null;
    }
  }

  function oturumKaydet(oturumAnahtari, kullanici) {
    const kayit = { oturumAnahtari, kullanici };
    localStorage.setItem(OTURUM_ANAHTAR, JSON.stringify(kayit));
    return kayit;
  }

  function oturumSil() {
    localStorage.removeItem(OTURUM_ANAHTAR);
  }

  function oturumBasliklari() {
    const oturum = oturumOku();
    if (!oturum?.oturumAnahtari) return {};
    return { "X-Oturum-Anahtari": oturum.oturumAnahtari };
  }

  function arayuzuGuncelle(kullanici) {
    document.getElementById("kullaniciAdi").textContent = kullanici.gorunenAd;
    document.getElementById("profilAd").textContent = kullanici.gorunenAd;
    const profilEposta = document.getElementById("profilEposta");
    if (profilEposta) profilEposta.textContent = kullanici.eposta;
    const harfler = kullanici.gorunenAd
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    document.getElementById("profilHarf").textContent = harfler || "?";
    const ustHarf = document.getElementById("ustProfilHarf");
    if (ustHarf) ustHarf.textContent = harfler || "?";
    document.getElementById("profilRol").textContent = kullanici.rol === "admin" ? "Admin" : "Üye";
  }

  let kaydirmaDinleyiciAktif = false;
  let kaydirmaRaf = null;
  let kaydirmaHedef = 0;
  let kaydirmaGosterilen = 0;
  let kaydirmaAnimasyonRaf = null;

  function masaustuKaydirAlani() {
    if (!window.matchMedia("(min-width: 1024px)").matches) return null;
    if (!document.body.classList.contains("uygulama-acik")) return null;
    return document.querySelector(".ana-sutun");
  }

  function kaydirmaOrani() {
    if (!document.body.classList.contains("uygulama-acik")) return 0;

    const alan = masaustuKaydirAlani();
    let ham = 0;

    if (alan) {
      const max = alan.scrollHeight - alan.clientHeight;
      ham = max <= 4 ? 0 : alan.scrollTop / max;
    } else {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ham = max <= 4 ? 0 : window.scrollY / max;
    }

    /* İlk ~55vh kaydırmada arka plan geçişi tamamlansın */
    const yumusak = Math.min(1, ham * 1.15);
    return Math.min(1, Math.max(0, yumusak));
  }

  function kaydirmaDegeriniYaz(deger) {
    document.documentElement.style.setProperty("--kaydir-ilerleme", deger.toFixed(3));
  }

  function kaydirmaAnimasyonu() {
    kaydirmaAnimasyonRaf = null;
    const fark = kaydirmaHedef - kaydirmaGosterilen;
    if (Math.abs(fark) < 0.004) {
      kaydirmaGosterilen = kaydirmaHedef;
      kaydirmaDegeriniYaz(kaydirmaGosterilen);
      return;
    }
    kaydirmaGosterilen += fark * 0.14;
    kaydirmaDegeriniYaz(kaydirmaGosterilen);
    kaydirmaAnimasyonRaf = requestAnimationFrame(kaydirmaAnimasyonu);
  }

  function arkaPlanKaydirmaGuncelle() {
    kaydirmaHedef = kaydirmaOrani();
    if (!kaydirmaAnimasyonRaf) kaydirmaAnimasyonRaf = requestAnimationFrame(kaydirmaAnimasyonu);
  }

  function arkaPlanKaydirmaBaslat() {
    if (kaydirmaDinleyiciAktif) return;
    kaydirmaDinleyiciAktif = true;

    const dinle = () => {
      if (kaydirmaRaf) return;
      kaydirmaRaf = requestAnimationFrame(() => {
        arkaPlanKaydirmaGuncelle();
        kaydirmaRaf = null;
      });
    };

    window.addEventListener("scroll", dinle, { passive: true });

    const sutun = document.querySelector(".ana-sutun");
    if (sutun) sutun.addEventListener("scroll", dinle, { passive: true });

    window.addEventListener("resize", () => {
      kaydirmaGosterilen = kaydirmaOrani();
      kaydirmaHedef = kaydirmaGosterilen;
      kaydirmaDegeriniYaz(kaydirmaGosterilen);
    });

    kaydirmaHedef = kaydirmaOrani();
    kaydirmaGosterilen = kaydirmaHedef;
    kaydirmaDegeriniYaz(kaydirmaGosterilen);
  }

  function kaydirmaSifirla() {
    const alan = masaustuKaydirAlani();
    if (alan) alan.scrollTo({ top: 0, behavior: "auto" });
    else window.scrollTo(0, 0);
    kaydirmaHedef = 0;
    kaydirmaGosterilen = 0;
    kaydirmaDegeriniYaz(0);
  }

  function sayfaUsteKaydir() {
    const alan = masaustuKaydirAlani();
    if (alan) alan.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function girisGoster() {
    document.body.classList.remove("uygulama-acik");
    document.body.classList.remove("menu-acik");
    girisEkrani.hidden = false;
    uygulamaKabuk.hidden = true;
    kaydirmaSifirla();
  }

  function haftaAraligiMetni(hafta) {
    if (!hafta?.baslangic || !hafta?.bitis) return "";
    const bicim = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
    const baslangic = bicim.format(new Date(hafta.baslangic + "T12:00:00"));
    const bitis = bicim.format(new Date(hafta.bitis + "T12:00:00"));
    return baslangic + " – " + bitis;
  }

  function haftaSatirHtml(etiket, kayit) {
    if (!kayit) {
      return (
        '<div class="hafta-satir"><p class="hafta-etiket">' +
        escapeHtml(etiket) +
        '</p><p class="hafta-ad">Henüz yok</p></div>'
      );
    }
    const kez = kayit.adet === 1 ? "1 kez" : kayit.adet + " kez";
    return (
      '<div class="hafta-satir"><p class="hafta-etiket">' +
      escapeHtml(etiket) +
      '</p><p class="hafta-ad">' +
      escapeHtml(kayit.ad) +
      '</p><p class="hafta-adet">' +
      escapeHtml(kez) +
      "</p></div>"
    );
  }

  function haftaFavorisiniCiz(veri) {
    const kart = document.getElementById("haftaFavoriKart");
    const baslik = document.querySelector("#haftaFavori .menu-baslik");
    if (!kart) return;
    if (baslik) {
      const aralik = haftaAraligiMetni(veri.hafta);
      baslik.textContent = aralik ? "Bu hafta · " + aralik : "Bu hafta";
    }
    kart.innerHTML =
      haftaSatirHtml("En çok yediğin", veri.yemek) +
      haftaSatirHtml("En çok içtiğin", veri.icecek) +
      '<p class="hafta-not">' +
      escapeHtml(veri.mesaj || "") +
      "</p>";
  }

  async function haftaFavorisiniYukle() {
    const kart = document.getElementById("haftaFavoriKart");
    if (!kart) return;
    try {
      const cevap = await fetch("/ikram/hafta", { headers: oturumBasliklari() });
      const veri = await cevap.json();
      if (!cevap.ok || !veri.basarili) {
        kart.innerHTML = '<p class="hafta-durum">Şu an gösterilemiyor.</p>';
        return;
      }
      haftaFavorisiniCiz(veri);
    } catch {
      kart.innerHTML = '<p class="hafta-durum">Şu an gösterilemiyor.</p>';
    }
  }

  function uygulamaGoster(kullanici) {
    document.body.classList.add("uygulama-acik");
    girisEkrani.hidden = true;
    uygulamaKabuk.hidden = false;
    arayuzuGuncelle(kullanici);
    sayfayaGit("genel-bakis");
    gorevleriYukle();
    haftaFavorisiniYukle();
    kaydirmaSifirla();
    requestAnimationFrame(() => {
      arkaPlanKaydirmaGuncelle();
      requestAnimationFrame(arkaPlanKaydirmaGuncelle);
    });
  }

  function menuAcKapat(acik) {
    const yanMenu = document.getElementById("yanMenu");
    const menuPerde = document.getElementById("menuPerde");
    yanMenu.classList.toggle("acik", acik);
    menuPerde.classList.toggle("acik", acik);
    document.body.classList.toggle("menu-acik", acik);
    yanMenu.setAttribute("aria-hidden", acik ? "false" : "true");
  }

  function menuAktifGuncelle(sayfaId) {
    document.querySelectorAll("#anaMenu .menu-oge").forEach((btn) => {
      btn.classList.toggle("aktif", btn.dataset.sayfa === sayfaId);
    });
  }

  function ustBasligiGuncelle(sayfaId) {
    const baslik = SAYFA_BASLIKLARI[sayfaId] || "TASKFLOW";
    const el = document.getElementById("ustSayfaBaslik");
    if (el) el.textContent = baslik;
    const masaustu = document.getElementById("masaustuSayfaBaslik");
    if (masaustu) masaustu.textContent = baslik;
  }

  function masaustuTarihGuncelle() {
    const el = document.getElementById("masaustuTarihMetin");
    if (!el) return;
    const simdi = new Date();
    el.textContent = simdi.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function gorevModalAc() {
    if (gorevModal && typeof gorevModal.showModal === "function") gorevModal.showModal();
  }

  function sayfayaGit(sayfaId) {
    if (!SAYFA_BASLIKLARI[sayfaId]) return;

    guncelSayfa = sayfaId;
    document.querySelectorAll(".sayfa").forEach((el) => {
      const aktif = el.dataset.sayfa === sayfaId;
      el.hidden = !aktif;
      el.classList.toggle("aktif", aktif);
    });

    menuAktifGuncelle(sayfaId);

    ustBasligiGuncelle(sayfaId);
    if (fab) fab.hidden = !(sayfaId === "genel-bakis" || sayfaId === "gorevler");
    menuAcKapat(false);
    sayfaUsteKaydir();
    arkaPlanKaydirmaGuncelle();

    if (sayfaId === "genel-bakis" || sayfaId === "gorevler") {
      gorevleriYukle();
    }

    if (window.taskflowSayfalar) window.taskflowSayfalar.sayfaYukle(sayfaId);
    if (sayfaId === "flybird" && window.taskflowFlyBird) window.taskflowFlyBird.baslat();
    if (sayfaId === "hafiza" && window.taskflowHafiza) window.taskflowHafiza.baslat();
  }

  function durumEtiketi(durum) {
    const sozluk = {
      beklemede: { sinif: "beklemede", yazi: "Beklemede" },
      devam_ediyor: { sinif: "devam", yazi: "Devam ediyor" },
      tamamlandi: { sinif: "tamam", yazi: "Tamamlandı" },
    };
    return sozluk[durum] || { sinif: "beklemede", yazi: durum };
  }

  function gorevHtml(g, uzunListe) {
    const d = durumEtiketi(g.durum);
    const oncelik = g.oncelik === "acil" ? '<span class="etiket acil">Acil</span>' : "";
    const silBtn = uzunListe
      ? `<button type="button" class="baglanti tehlike gorev-sil" data-id="${g.id}">Sil</button>`
      : "";
    return `
      <article class="gorev-oge">
        <div class="gorev-oge-icerik">
          <h4>${escapeHtml(g.baslik)}</h4>
          <p>${escapeHtml(g.aciklama || "Açıklama yok")}</p>
          <span class="etiket ${d.sinif}">${d.yazi}</span>
          ${oncelik}
        </div>
        ${silBtn}
      </article>`;
  }

  function ozetleriHesapla(gorevler) {
    const toplam = gorevler.length;
    const tamamlanan = gorevler.filter((g) => g.durum === "tamamlandi").length;
    const devam = gorevler.filter((g) => g.durum === "devam_ediyor").length;
    const acil = gorevler.filter((g) => g.oncelik === "acil" && g.durum !== "tamamlandi").length;
    const yuzde = toplam === 0 ? 0 : Math.round((tamamlanan / toplam) * 100);

    document.getElementById("sayiToplam").textContent = toplam;
    document.getElementById("sayiTamamlanma").textContent = yuzde + "%";
    document.getElementById("sayiDevam").textContent = devam;
    document.getElementById("sayiAcil").textContent = acil;
  }

  function listeleriCiz(gorevler) {
    const ozetEl = document.getElementById("gorevListesiOzet");
    const tamEl = document.getElementById("gorevListesiTam");
    const acik = gorevler.filter((g) => g.durum !== "tamamlandi");

    if (gorevler.length === 0) {
      ozetEl.innerHTML = `
        <div class="bos-durum">
          <div class="bos-ikon bos-harf">G</div>
          <p>Henüz görev yok.</p>
          <p class="bos-not">Sağ alttaki + ile ilk görevini ekle.</p>
        </div>`;
    } else if (acik.length === 0) {
      ozetEl.innerHTML = `
        <div class="bos-durum">
          <div class="bos-ikon">✓</div>
          <p>Tüm görevlerin tamamlandı!</p>
        </div>`;
    } else {
      ozetEl.innerHTML = acik.slice(0, 5).map((g) => gorevHtml(g, false)).join("");
    }

    if (gorevler.length === 0) {
      tamEl.innerHTML = `<div class="bos-durum"><p>Henüz görev yok.</p><p class="bos-not">+ ile yeni görev ekle.</p></div>`;
    } else {
      tamEl.innerHTML = gorevler.map((g) => gorevHtml(g, true)).join("");
      tamEl.querySelectorAll(".gorev-sil").forEach((btn) => {
        btn.addEventListener("click", () => gorevSil(btn.dataset.id));
      });
    }
  }

  async function gorevleriYukle() {
    const ozetEl = document.getElementById("gorevListesiOzet");
    try {
      const cevap = await fetch("/gorevler", { headers: oturumBasliklari() });
      const veri = await cevap.json();
      if (!veri.basarili) throw new Error(veri.mesaj || "Liste alınamadı");
      tumGorevler = veri.gorevler || [];
      ozetleriHesapla(tumGorevler);
      listeleriCiz(tumGorevler);
      if (window.taskflowSayfalar?.sayfaYukle) window.taskflowSayfalar.sayfaYukle("genel-bakis");
    } catch {
      ozetEl.innerHTML =
        '<p class="bos-durum">Sunucuya bağlanılamadı. Terminalde <code>npm run dev</code> çalışsın.</p>';
    }
  }

  async function gorevSil(id) {
    if (!confirm("Bu görev silinsin mi?")) return;
    const cevap = await fetch("/gorevler/" + id, {
      method: "DELETE",
      headers: oturumBasliklari(),
    });
    const veri = await cevap.json();
    if (veri.basarili) gorevleriYukle();
    else alert(veri.mesaj || "Silinemedi");
  }

  function temaUygula(ad) {
    document.documentElement.dataset.tema = ad;
    const dugme = document.getElementById("temaDegistir");
    if (dugme) dugme.textContent = ad === "koyu" ? "☀" : "🌙";
    localStorage.setItem(TEMA_ANAHTAR, ad);
  }

  function temaDegistir() {
    const simdi = document.documentElement.dataset.tema || "koyu";
    temaUygula(simdi === "koyu" ? "acik" : "koyu");
  }

  function hataGoster(mesaj) {
    if (!girisHata) return;
    girisHata.textContent = mesaj;
    girisHata.hidden = false;
  }

  async function girisYap(eposta, sifre) {
    if (girisHata) girisHata.hidden = true;
    const mail = (eposta || "").trim();
    const parola = sifre || "";

    if (!mail || !parola) {
      hataGoster("E-posta ve şifre gerekli.");
      return;
    }

    if (girisDugme) {
      girisDugme.disabled = true;
      girisDugme.textContent = "Giriş yapılıyor…";
    }

    try {
      const cevap = await fetch("/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: mail, sifre: parola }),
      });
      const veri = await cevap.json();

      if (!cevap.ok || !veri.basarili) {
        hataGoster(veri.mesaj || "Giriş başarısız.");
        return;
      }

      oturumKaydet(veri.oturumAnahtari, veri.kullanici);
      if (girisForm) girisForm.reset();
      uygulamaGoster(veri.kullanici);
    } catch {
      hataGoster("Bağlantı kurulamadı. Sunucunun çalıştığından emin olun.");
    } finally {
      if (girisDugme) {
        girisDugme.disabled = false;
        girisDugme.textContent = "Giriş yap";
      }
    }
  }

  async function oturumuDogrula() {
    const kayit = oturumOku();
    if (!kayit?.oturumAnahtari || !kayit?.kullanici) return false;

    try {
      const cevap = await fetch("/ben", {
        headers: { "X-Oturum-Anahtari": kayit.oturumAnahtari },
      });
      const veri = await cevap.json();
      if (!cevap.ok || !veri.basarili) {
        oturumSil();
        return false;
      }
      oturumKaydet(kayit.oturumAnahtari, veri.kullanici);
      uygulamaGoster(veri.kullanici);
      return true;
    } catch {
      // Sunucu yeniden başladıysa oturum sunucuda silinmiş olabilir — yerel kayıtla devam etme
      oturumSil();
      return false;
    }
  }

  async function cikisYap() {
    const kayit = oturumOku();
    if (kayit?.oturumAnahtari) {
      try {
        await fetch("/cikis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oturumAnahtari: kayit.oturumAnahtari }),
        });
      } catch {
        /* sunucu kapalı olsa bile yerel oturumu kapat */
      }
    }
    oturumSil();
    if (girisForm) girisForm.reset();
    girisGoster();
  }

  function olaylariBagla() {
    if (girisForm) {
      girisForm.addEventListener("submit", function (e) {
        e.preventDefault();
        girisYap(
          document.getElementById("girisEposta").value,
          document.getElementById("girisSifre").value
        );
      });
    }

    const demoBtn = document.getElementById("demoUyeGiris");
    if (demoBtn) {
      demoBtn.addEventListener("click", function () {
        document.getElementById("girisEposta").value = "uye@taskflow.com";
        document.getElementById("girisSifre").value = "123456";
        if (girisHata) girisHata.hidden = true;
        document.getElementById("girisEposta").focus();
      });
    }

    const cikis = document.getElementById("cikisYap");
    if (cikis) cikis.addEventListener("click", cikisYap);

    const menuAc = document.getElementById("menuAc");
    const menuKapat = document.getElementById("menuKapat");
    const menuPerde = document.getElementById("menuPerde");
    if (menuAc) menuAc.addEventListener("click", () => menuAcKapat(true));
    if (menuKapat) menuKapat.addEventListener("click", () => menuAcKapat(false));
    if (menuPerde) menuPerde.addEventListener("click", () => menuAcKapat(false));

    const anaMenu = document.getElementById("anaMenu");
    if (anaMenu) {
      anaMenu.addEventListener("click", (e) => {
        const btn = e.target.closest(".menu-oge");
        if (btn) sayfayaGit(btn.dataset.sayfa);
      });
    }

    document.querySelectorAll("[data-git]").forEach((el) => {
      el.addEventListener("click", () => sayfayaGit(el.dataset.git));
    });

    const ustProfil = document.getElementById("ustProfil");
    if (ustProfil) ustProfil.addEventListener("click", () => sayfayaGit("profilim"));

    const bildirimZil = document.getElementById("bildirimZil");
    if (bildirimZil) bildirimZil.addEventListener("click", () => sayfayaGit("bildirimler"));

    const temaBtn = document.getElementById("temaDegistir");
    if (temaBtn) temaBtn.addEventListener("click", temaDegistir);

    const haftaForm = document.getElementById("haftaFavoriForm");
    if (haftaForm) {
      haftaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const hata = document.getElementById("haftaFormHata");
        const dugme = haftaForm.querySelector("button[type='submit']");
        const govde = {
          yemek: haftaForm.yemek.value,
          icecek: haftaForm.icecek.value,
        };
        if (hata) hata.hidden = true;
        if (dugme) dugme.disabled = true;
        try {
          const cevap = await fetch("/ikram", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...oturumBasliklari() },
            body: JSON.stringify(govde),
          });
          const veri = await cevap.json();
          if (!cevap.ok || !veri.basarili) {
            if (hata) {
              hata.textContent = veri.mesaj || "Kaydedilemedi.";
              hata.hidden = false;
            }
            return;
          }
          haftaForm.reset();
          haftaFavorisiniCiz(veri);
        } catch {
          if (hata) {
            hata.textContent = "Bağlantı kurulamadı.";
            hata.hidden = false;
          }
        } finally {
          if (dugme) dugme.disabled = false;
        }
      });
    }

    if (fab) fab.addEventListener("click", gorevModalAc);

    const masaustuYeni = document.getElementById("masaustuYeniGorev");
    if (masaustuYeni) masaustuYeni.addEventListener("click", gorevModalAc);

    const modalIptal = document.getElementById("modalIptal");
    if (modalIptal && gorevModal) modalIptal.addEventListener("click", () => gorevModal.close());

    if (gorevForm) {
      gorevForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(gorevForm);
        const govde = {
          baslik: fd.get("baslik"),
          aciklama: fd.get("aciklama"),
          oncelik: fd.get("oncelik"),
          durum: fd.get("durum"),
        };

        const cevap = await fetch("/gorevler", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...oturumBasliklari() },
          body: JSON.stringify(govde),
        });
        const veri = await cevap.json();
        if (veri.basarili) {
          gorevModal.close();
          gorevForm.reset();
          gorevleriYukle();
        } else {
          alert(veri.mesaj || "Kaydedilemedi");
        }
      });
    }
  }

  async function baslat() {
    girisEkrani = document.getElementById("girisEkrani");
    uygulamaKabuk = document.getElementById("uygulamaKabuk");
    girisForm = document.getElementById("girisForm");
    girisHata = document.getElementById("girisHata");
    girisDugme = document.getElementById("girisDugme");
    gorevModal = document.getElementById("gorevModal");
    gorevForm = document.getElementById("gorevForm");
    fab = document.getElementById("yeniGorevFab");

    if (!girisForm || !girisEkrani || !uygulamaKabuk) {
      console.error("TASKFLOW: Giriş ekranı bulunamadı.");
      return;
    }

    temaUygula(localStorage.getItem(TEMA_ANAHTAR) || "koyu");
    masaustuTarihGuncelle();
    olaylariBagla();
    arkaPlanKaydirmaBaslat();

    // Her açılışta önce giriş ekranı; panel yalnızca "Giriş yap" sonrası açılır
    oturumSil();
    girisGoster();
  }

  window.taskflowGiris = girisYap;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
