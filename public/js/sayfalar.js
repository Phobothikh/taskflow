(function () {
  "use strict";

  const PROJE_ANAHTAR = "taskflow_projeler";
  const NOT_ANAHTAR = "taskflow_notlar";

  function idUret() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function depoOku(anahtar, varsayilan) {
    try {
      const ham = localStorage.getItem(anahtar);
      return ham ? JSON.parse(ham) : varsayilan;
    } catch {
      return varsayilan;
    }
  }

  function depoYaz(anahtar, veri) {
    localStorage.setItem(anahtar, JSON.stringify(veri));
  }

  function escapeHtml(metin) {
    const div = document.createElement("div");
    div.textContent = metin;
    return div.innerHTML;
  }

  function oturumOku() {
    try {
      const ham = localStorage.getItem("taskflow_oturum");
      return ham ? JSON.parse(ham) : null;
    } catch {
      return null;
    }
  }

  function oturumBasliklari() {
    const o = oturumOku();
    if (!o?.oturumAnahtari) return {};
    return { "X-Oturum-Anahtari": o.oturumAnahtari };
  }

  function tarihOkunakli(tarihStr) {
    try {
      return new Date(tarihStr + "T12:00:00").toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return tarihStr;
    }
  }

  function projeleriAl() {
    let liste = depoOku(PROJE_ANAHTAR, null);
    if (!liste || !liste.length) {
      liste = [
        { id: "p1", ad: "TASKFLOW Panel", durum: "devam", ilerleme: 72 },
        { id: "p2", ad: "API Dokümantasyonu", durum: "devam", ilerleme: 45 },
        { id: "p3", ad: "Postman Koleksiyonu", durum: "beklemede", ilerleme: 10 },
      ];
      depoYaz(PROJE_ANAHTAR, liste);
    }
    return liste;
  }

  function notlariAl() {
    return depoOku(NOT_ANAHTAR, []);
  }

  function projeDurumYazi(durum) {
    const m = { devam: "Devam ediyor", beklemede: "Beklemede", tamam: "Tamamlandı" };
    return m[durum] || durum;
  }

  function projeKartHtml(p) {
    return `
      <article class="liste-oge proje-oge">
        <div class="liste-oge-ust">
          <h3>${escapeHtml(p.ad)}</h3>
          <span class="etiket ${p.durum === "tamam" ? "tamam" : p.durum === "devam" ? "devam" : "beklemede"}">${projeDurumYazi(p.durum)}</span>
        </div>
        <div class="ilerleme-cubuk" aria-hidden="true"><span style="width:${p.ilerleme}%"></span></div>
        <p class="liste-oge-alt">İlerleme: %${p.ilerleme}</p>
      </article>`;
  }

  function projeleriCiz() {
    const el = document.getElementById("projelerIcerik");
    if (!el) return;
    const liste = projeleriAl();
    el.innerHTML =
      liste.map(projeKartHtml).join("") +
      `
      <form class="satir-form" id="projeEkleForm">
        <input type="text" name="ad" required placeholder="Yeni proje adı" maxlength="80" />
        <button type="submit" class="dugme birincil">Ekle</button>
      </form>`;

    document.getElementById("projeEkleForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const ad = new FormData(e.target).get("ad")?.toString().trim();
      if (!ad) return;
      const yeni = [...projeleriAl(), { id: idUret(), ad, durum: "beklemede", ilerleme: 0 }];
      depoYaz(PROJE_ANAHTAR, yeni);
      projeleriCiz();
      yanProjeOzetGuncelle();
    });

    yanProjeOzetGuncelle();
  }

  function yanProjeOzetGuncelle() {
    const bos = document.querySelector(".menu-bos");
    if (!bos) return;
    const liste = projeleriAl();
    if (!liste.length) {
      bos.textContent = "Proje bulunamadı";
      return;
    }
    bos.innerHTML = liste
      .slice(0, 3)
      .map((p) => `<span class="menu-mini-proje">${escapeHtml(p.ad)}</span>`)
      .join("");
  }

  function genelProjeOzetGuncelle() {
    const panel = document.querySelector('[data-sayfa="genel-bakis"] .panel-cift .panel:last-child .panel-govde');
    if (!panel) return;
    const liste = projeleriAl();
    if (!liste.length) {
      panel.innerHTML = `<div class="bos-durum"><div class="bos-ikon bos-harf">P</div><p>Henüz proje yok</p></div>`;
      return;
    }
    panel.innerHTML = liste
      .slice(0, 3)
      .map(
        (p) => `
        <article class="gorev-oge">
          <div class="gorev-oge-icerik">
            <h4>${escapeHtml(p.ad)}</h4>
            <p>İlerleme %${p.ilerleme}</p>
            <span class="etiket ${p.durum === "devam" ? "devam" : "beklemede"}">${projeDurumYazi(p.durum)}</span>
          </div>
        </article>`
      )
      .join("");
  }

  function ekipCiz() {
    const el = document.getElementById("ekipIcerik");
    if (!el) return;
    const uyeler = [
      { ad: "Demo Üye", rol: "Üye", eposta: "uye@taskflow.com", harf: "DÜ" },
      { ad: "Sistem Yöneticisi", rol: "Admin", eposta: "admin@taskflow.com", harf: "SY" },
      { ad: "Ayşe Kaya", rol: "Proje Yöneticisi", eposta: "ayse@taskflow.com", harf: "AK" },
      { ad: "Mehmet Yılmaz", rol: "Geliştirici", eposta: "mehmet@taskflow.com", harf: "MY" },
    ];
    el.innerHTML = uyeler
      .map(
        (u) => `
      <article class="liste-oge ekip-oge">
        <span class="profil-harf">${escapeHtml(u.harf)}</span>
        <div>
          <h3>${escapeHtml(u.ad)}</h3>
          <p class="liste-oge-alt">${escapeHtml(u.rol)} · ${escapeHtml(u.eposta)}</p>
        </div>
      </article>`
      )
      .join("");
  }

  async function bildirimCiz() {
    const el = document.getElementById("bildirimIcerik");
    if (!el) return;
    const items = [
      { baslik: "Görev hatırlatması", metin: "Yarın teslim: API test senaryoları", zaman: "2 saat önce", okunmadi: true },
      { baslik: "Ekip daveti", metin: "TASKFLOW Panel projesine eklendin", zaman: "Dün", okunmadi: true },
      { baslik: "Tamamlandı", metin: "Giriş ekranı tasarımı onaylandı", zaman: "3 gün önce", okunmadi: false },
    ];
    try {
      const cevap = await fetch("/gunluk-raporlar/bugun", { headers: oturumBasliklari() });
      if (cevap.ok) {
        const veri = await cevap.json();
        if (!veri.dolduruldu) {
          items.unshift({
            baslik: "Günlük rapor",
            metin: veri.yoneticiHatirlatma
              ? "Yönetici bugünkü günlük raporunu istedi — lütfen doldur."
              : "Bugünkü raporunu henüz göndermedin.",
            zaman: "Şimdi",
            okunmadi: true,
          });
        }
      }
    } catch {
      /* yoksay */
    }
    el.innerHTML = items
      .map(
        (b) => `
      <article class="liste-oge bildirim-oge ${b.okunmadi ? "yeni" : ""}">
        <div class="liste-oge-ust">
          <h3>${escapeHtml(b.baslik)}</h3>
          <time class="liste-zaman">${escapeHtml(b.zaman)}</time>
        </div>
        <p>${escapeHtml(b.metin)}</p>
      </article>`
      )
      .join("");
  }

  function duyuruCiz() {
    const el = document.getElementById("duyuruIcerik");
    if (!el) return;
    const items = [
      { baslik: "Eğitim ortamı bakımı", metin: "Cumartesi 02:00–04:00 arası kısa kesinti olabilir.", tarih: "12 Eki 2026" },
      { baslik: "Fly Bird açıldı", metin: "Molalarda Fly Bird ile uç, ekip sıralamasına gir.", tarih: "10 Eki 2026" },
      { baslik: "Postman teslimi", metin: "CRUD ekran görüntüleri için son tarih yaklaşıyor.", tarih: "8 Eki 2026" },
    ];
    el.innerHTML = items
      .map(
        (d) => `
      <article class="liste-oge">
        <div class="liste-oge-ust">
          <h3>${escapeHtml(d.baslik)}</h3>
          <span class="liste-zaman">${escapeHtml(d.tarih)}</span>
        </div>
        <p>${escapeHtml(d.metin)}</p>
      </article>`
      )
      .join("");
  }

  function notlariCiz() {
    const el = document.getElementById("notlarIcerik");
    if (!el) return;
    const notlar = notlariAl();
    const liste =
      notlar.length === 0
        ? `<p class="bos-durum kisa">Henüz not yok. Aşağıdan ekle.</p>`
        : notlar
            .map(
              (n) => `
        <article class="liste-oge not-oge">
          <p>${escapeHtml(n.metin)}</p>
          <div class="liste-oge-alt satir">
            <time>${escapeHtml(n.tarih)}</time>
            <button type="button" class="baglanti tehlike not-sil" data-id="${n.id}">Sil</button>
          </div>
        </article>`
            )
            .join("");

    el.innerHTML =
      liste +
      `
      <form class="satir-form dikey-form" id="notEkleForm">
        <textarea name="metin" rows="3" required placeholder="Hızlı not…" maxlength="500"></textarea>
        <button type="submit" class="dugme birincil">Notu kaydet</button>
      </form>`;

    el.querySelectorAll(".not-sil").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kalan = notlariAl().filter((n) => n.id !== btn.dataset.id);
        depoYaz(NOT_ANAHTAR, kalan);
        notlariCiz();
      });
    });

    document.getElementById("notEkleForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const metin = new FormData(e.target).get("metin")?.toString().trim();
      if (!metin) return;
      const yeni = [
        {
          id: idUret(),
          metin,
          tarih: new Date().toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }),
        },
        ...notlariAl(),
      ];
      depoYaz(NOT_ANAHTAR, yeni);
      notlariCiz();
    });
  }

  function dokumanCiz() {
    const el = document.getElementById("dokumanIcerik");
    if (!el) return;
    const dosyalar = [
      { ad: "API_TASARIM.md", boyut: "24 KB", tur: "Markdown" },
      { ad: "VERI_MODELI.md", boyut: "18 KB", tur: "Markdown" },
      { ad: "Postman-Koleksiyon.json", boyut: "12 KB", tur: "JSON" },
      { ad: "Sunum-Taslak.pdf", boyut: "1,2 MB", tur: "PDF" },
    ];
    el.innerHTML = dosyalar
      .map(
        (d) => `
      <article class="liste-oge dokuman-oge">
        <span class="dosya-ikon">📄</span>
        <div>
          <h3>${escapeHtml(d.ad)}</h3>
          <p class="liste-oge-alt">${escapeHtml(d.tur)} · ${escapeHtml(d.boyut)}</p>
        </div>
        <button type="button" class="dugme ikincil kucuk-dugme" disabled>İndir</button>
      </article>`
      )
      .join("");
  }

  function raporFormuBagla(rapor) {
    const form = document.getElementById("gunlukRaporForm");
    const mesaj = document.getElementById("gunlukRaporMesaj");
    if (!form) return;

    if (rapor) {
      form.yapilanlar.value = rapor.yapilanlar || "";
      form.planlar.value = rapor.planlar || "";
      form.engeller.value = rapor.engeller || "";
    }

    if (form.dataset.bagli) return;
    form.dataset.bagli = "1";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (mesaj) {
        mesaj.hidden = true;
        mesaj.textContent = "";
      }
      const govde = {
        yapilanlar: form.yapilanlar.value.trim(),
        planlar: form.planlar.value.trim(),
        engeller: form.engeller.value.trim(),
      };
      try {
        const cevap = await fetch("/gunluk-raporlar", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...oturumBasliklari() },
          body: JSON.stringify(govde),
        });
        const veri = await cevap.json();
        if (!cevap.ok || !veri.basarili) {
          if (mesaj) {
            mesaj.textContent = veri.mesaj || "Kaydedilemedi.";
            mesaj.hidden = false;
          }
          return;
        }
        if (mesaj) {
          mesaj.className = "gunluk-rapor-mesaj basari";
          mesaj.textContent = "Günlük rapor kaydedildi.";
          mesaj.hidden = false;
        }
        gunlukRaporHatirlatGuncelle();
        raporCiz();
      } catch {
        if (mesaj) {
          mesaj.textContent = "Sunucuya ulaşılamadı.";
          mesaj.hidden = false;
        }
      }
    });
  }

  function raporTakipAdminHtml(takip) {
    if (!takip?.kullanicilar) return "";
    const satirlar = takip.kullanicilar
      .map((k) => {
        const durum = k.dolduruldu
          ? `<span class="etiket tamam">Doldurdu</span>`
          : `<span class="etiket acil">Bekliyor</span>`;
        const hatirlat = k.dolduruldu
          ? ""
          : `<button type="button" class="dugme ikincil kucuk-dugme rapor-hatirlat-btn" data-kullanici-id="${escapeHtml(k.id)}">Hatırlat</button>`;
        const hatirlatildi = k.hatirlatildi && !k.dolduruldu ? `<span class="etiket beklemede">İstendi</span>` : "";
        return `
        <tr>
          <td>${escapeHtml(k.gorunenAd)}<br><span class="liste-oge-alt">${escapeHtml(k.eposta)}</span></td>
          <td>${escapeHtml(k.rol)}</td>
          <td>${durum} ${hatirlatildi}</td>
          <td class="rapor-takip-aksiyon">${hatirlat}</td>
        </tr>`;
      })
      .join("");

    return `
      <section class="panel gunluk-takip-panel">
        <div class="panel-baslik">
          <h2>Ekip takibi (bugün)</h2>
          <span class="etiket devam">${takip.ozet.dolduran}/${takip.ozet.toplam} doldurdu</span>
        </div>
        <div class="panel-govde">
          <p class="gunluk-rapor-aciklama">Admin: eksik raporları tek tıkla iste. Üyeler genel bakış ve bildirimlerde uyarı görür.</p>
          <p class="gunluk-rapor-mesaj" id="raporTakipMesaj" hidden></p>
          <div class="rapor-takip-ust">
            <button type="button" class="dugme birincil rapor-hatirlat-btn" data-tumu="1">Tüm eksiklere hatırlat</button>
          </div>
          <div class="rapor-takip-tablo-wrap">
            <table class="rapor-takip-tablo">
              <thead><tr><th>Kullanıcı</th><th>Rol</th><th>Durum</th><th></th></tr></thead>
              <tbody>${satirlar}</tbody>
            </table>
          </div>
        </div>
      </section>`;
  }

  function raporTakipBagla(kapsayici) {
    if (!kapsayici || kapsayici.dataset.takipBagli) return;
    kapsayici.dataset.takipBagli = "1";
    kapsayici.addEventListener("click", async (e) => {
      const btn = e.target.closest(".rapor-hatirlat-btn");
      if (!btn) return;
      const mesaj = document.getElementById("raporTakipMesaj");
      const govde = btn.dataset.tumu ? { tumu: true } : { kullaniciId: btn.dataset.kullaniciId };
      btn.disabled = true;
      try {
        const cevap = await fetch("/gunluk-raporlar/takip/hatirlat", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...oturumBasliklari() },
          body: JSON.stringify(govde),
        });
        const veri = await cevap.json();
        if (mesaj) {
          mesaj.hidden = false;
          mesaj.className = cevap.ok && veri.basarili ? "gunluk-rapor-mesaj basari" : "gunluk-rapor-mesaj";
          mesaj.textContent =
            cevap.ok && veri.basarili ? veri.mesaj || "Hatırlatma kaydedildi." : veri.mesaj || "Hatırlatma gönderilemedi.";
        }
        if (cevap.ok && veri.basarili) raporCiz();
      } catch {
        if (mesaj) {
          mesaj.textContent = "Sunucuya ulaşılamadı.";
          mesaj.hidden = false;
        }
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function raporCiz() {
    const el = document.getElementById("raporIcerik");
    if (!el) return;
    el.innerHTML = `<p class="yukleniyor">Günlük rapor yükleniyor…</p>`;

    const adminMi = oturumOku()?.kullanici?.rol === "admin";

    try {
      const istekler = [
        fetch("/gunluk-raporlar/bugun", { headers: oturumBasliklari() }),
        fetch("/gunluk-raporlar", { headers: oturumBasliklari() }),
        fetch("/gorevler", { headers: oturumBasliklari() }),
      ];
      if (adminMi) istekler.push(fetch("/gunluk-raporlar/takip", { headers: oturumBasliklari() }));

      const cevaplar = await Promise.all(istekler);
      const [bugunCevap, listeCevap, gorevCevap] = cevaplar;
      const takipCevap = adminMi ? cevaplar[3] : null;

      if (!bugunCevap.ok || !listeCevap.ok) {
        el.innerHTML = `<p class="bos-durum">Oturum gerekli veya sunucu kapalı.</p>`;
        return;
      }

      const bugun = await bugunCevap.json();
      const liste = await listeCevap.json();
      const rapor = bugun.rapor;
      const dolduruldu = bugun.dolduruldu;
      const yoneticiHatirlatma = Boolean(bugun.yoneticiHatirlatma);
      const tarihMetin = tarihOkunakli(bugun.tarih);

      let adminBlok = "";
      if (adminMi && takipCevap?.ok) {
        adminBlok = raporTakipAdminHtml(await takipCevap.json());
      }

      let gorevOzet = "";
      try {
        const gVeri = await gorevCevap.json();
        const g = gVeri.gorevler || [];
        gorevOzet = `
          <div class="rapor-grid rapor-grid-kucuk">
            <div class="rapor-kutu"><span class="rapor-sayi">${g.length}</span><span class="rapor-etiket">Görev</span></div>
            <div class="rapor-kutu"><span class="rapor-sayi">${g.filter((x) => x.durum === "tamamlandi").length}</span><span class="rapor-etiket">Tamamlanan</span></div>
          </div>`;
      } catch {
        gorevOzet = "";
      }

      const durumEtiket = dolduruldu
        ? `<span class="etiket tamam">Bugün dolduruldu</span>`
        : `<span class="etiket acil">Doldurulması bekleniyor</span>`;

      const gecmis = (liste.raporlar || [])
        .filter((r) => r.tarih !== bugun.tarih)
        .slice(0, 8)
        .map(
          (r) => `
        <article class="liste-oge gunluk-gecmis">
          <div class="liste-oge-ust">
            <h3>${escapeHtml(tarihOkunakli(r.tarih))}</h3>
            <span class="liste-zaman">${escapeHtml(r.tarih)}</span>
          </div>
          <p><strong>Bugün:</strong> ${escapeHtml(r.yapilanlar.slice(0, 120))}${r.yapilanlar.length > 120 ? "…" : ""}</p>
          <p class="liste-oge-alt"><strong>Yarın:</strong> ${escapeHtml(r.planlar.slice(0, 100))}${r.planlar.length > 100 ? "…" : ""}</p>
        </article>`
        )
        .join("");

      const yoneticiUyari = yoneticiHatirlatma
        ? `<div class="gunluk-yonetici-uyari">Yönetici bugünkü günlük raporunu istedi. Lütfen aşağıdaki formu doldur.</div>`
        : "";

      el.innerHTML = `
        ${adminBlok}
        ${gorevOzet}
        <section class="panel gunluk-rapor-panel">
          <div class="panel-baslik">
            <h2>${escapeHtml(tarihMetin)}</h2>
            ${durumEtiket}
          </div>
          <div class="panel-govde">
            ${yoneticiUyari}
            <p class="gunluk-rapor-aciklama">Kısa tut: bugün ne yaptın, yarın ne planlıyorsun?</p>
            <p class="gunluk-rapor-mesaj" id="gunlukRaporMesaj" hidden></p>
            <form id="gunlukRaporForm" class="gunluk-rapor-form">
              <label>Bugün yaptıklarım *
                <textarea name="yapilanlar" rows="4" required placeholder="Örn. API testleri, arayüz düzenlemesi…"></textarea>
              </label>
              <label>Yarın planlarım *
                <textarea name="planlar" rows="3" required placeholder="Örn. Postman ekran görüntüleri, dokümantasyon…"></textarea>
              </label>
              <label>Engeller / not (isteğe bağlı)
                <textarea name="engeller" rows="2" placeholder="Takıldığın konular, ihtiyaç duyduğun destek…"></textarea>
              </label>
              <button type="submit" class="dugme birincil">${dolduruldu ? "Güncelle" : "Günlük raporu gönder"}</button>
            </form>
          </div>
        </section>
        <section class="panel">
          <div class="panel-baslik"><h2>Geçmiş raporlar</h2></div>
          <div class="panel-govde sayfa-icerik">
            ${gecmis || '<p class="bos-durum kisa">Henüz geçmiş rapor yok.</p>'}
          </div>
        </section>`;

      raporFormuBagla(rapor);
      raporTakipBagla(el);
    } catch {
      el.innerHTML = `<p class="bos-durum">Günlük rapor yüklenemedi. <code>npm run dev</code> çalışsın.</p>`;
    }
  }

  async function gunlukRaporHatirlatGuncelle() {
    const box = document.getElementById("gunlukRaporHatirlat");
    if (!box) return;
    if (!oturumOku()?.oturumAnahtari) {
      box.hidden = true;
      return;
    }
    try {
      const cevap = await fetch("/gunluk-raporlar/bugun", { headers: oturumBasliklari() });
      if (!cevap.ok) {
        box.hidden = true;
        return;
      }
      const veri = await cevap.json();
      const rozet = document.getElementById("raporMenuRozet");
      if (veri.dolduruldu) {
        box.hidden = true;
        if (rozet) rozet.hidden = true;
        return;
      }
      box.hidden = false;
      if (rozet) rozet.hidden = false;
      box.classList.toggle("gunluk-rapor-hatirlat--acil", Boolean(veri.yoneticiHatirlatma));
      const altMetin = veri.yoneticiHatirlatma
        ? "Yönetici bugünkü raporunu istedi — birkaç dakikada doldurabilirsin."
        : "Bugünkü özetini paylaş — ekip ve hoca takibi için.";
      const baslik = veri.yoneticiHatirlatma ? "Yönetici rapor istedi" : "Günlük rapor bekleniyor";
      box.innerHTML = `
        <div class="gunluk-rapor-hatirlat-icerik">
          <div>
            <strong>${escapeHtml(baslik)}</strong>
            <p>${escapeHtml(altMetin)}</p>
          </div>
          <button type="button" class="dugme birincil" data-git="raporlar">Raporu doldur</button>
        </div>`;
    } catch {
      box.hidden = true;
    }
  }

  function genelBakisYukle() {
    genelProjeOzetGuncelle();
    gunlukRaporHatirlatGuncelle();
  }

  function profilHarfler(ad) {
    return (ad || "?")
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function profilCiz() {
    const el = document.getElementById("profilIcerik");
    if (!el) return;
    const oturum = oturumOku();
    const k = oturum?.kullanici;
    if (!k) {
      el.innerHTML = `<p class="bos-durum">Oturum bulunamadı. Tekrar giriş yap.</p>`;
      return;
    }

    const rolYazi = k.rol === "admin" ? "Admin" : "Üye";
    const harf = profilHarfler(k.gorunenAd);
    let istatistik = { toplam: 0, tamam: 0, devam: 0 };

    try {
      const cevap = await fetch("/gorevler", { headers: oturumBasliklari() });
      const veri = await cevap.json();
      const g = veri.gorevler || [];
      istatistik.toplam = g.length;
      istatistik.tamam = g.filter((x) => x.durum === "tamamlandi").length;
      istatistik.devam = g.filter((x) => x.durum === "devam_ediyor").length;
    } catch {
      /* sunucu kapalı */
    }

    const ilkGirisUyari =
      k.ilkGiris === true
        ? `<div class="profil-uyari">İlk giriş: şifreni en kısa sürede değiştirmen önerilir. (Admin paneli sonraki sürümde)</div>`
        : "";

    el.innerHTML = `
      ${ilkGirisUyari}
      <section class="panel profil-hero-kart">
        <div class="profil-hero">
          <span class="profil-hero-harf" id="profilHeroHarf">${escapeHtml(harf)}</span>
          <div>
            <h2 class="profil-hero-ad" id="profilHeroAd">${escapeHtml(k.gorunenAd)}</h2>
            <p class="profil-hero-eposta">${escapeHtml(k.eposta)}</p>
            <span class="etiket ${k.rol === "admin" ? "devam" : "beklemede"} profil-rol-etiket">${rolYazi}</span>
          </div>
        </div>
      </section>
      <div class="profil-istatistik-grid">
        <div class="profil-mini-kart"><span class="profil-mini-sayi">${istatistik.toplam}</span><span class="profil-mini-etiket">Görevlerim</span></div>
        <div class="profil-mini-kart"><span class="profil-mini-sayi">${istatistik.devam}</span><span class="profil-mini-etiket">Devam eden</span></div>
        <div class="profil-mini-kart"><span class="profil-mini-sayi">${istatistik.tamam}</span><span class="profil-mini-etiket">Tamamlanan</span></div>
      </div>
      <section class="panel">
        <div class="panel-baslik"><h2>Hesap</h2></div>
        <div class="panel-govde profil-detay-liste">
          <div class="profil-detay-satir"><span>Kullanıcı ID</span><strong>${escapeHtml(k.id)}</strong></div>
          <div class="profil-detay-satir"><span>E-posta</span><strong>${escapeHtml(k.eposta)}</strong></div>
          <div class="profil-detay-satir"><span>Rol</span><strong>${rolYazi}</strong></div>
          <div class="profil-detay-satir"><span>Oturum</span><strong class="profil-oturum-durum">Aktif</strong></div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-baslik"><h2>Tercihler</h2></div>
        <div class="panel-govde profil-aksiyonlar">
          <button type="button" class="dugme ikincil" id="profilTemaDegistir">Tema değiştir</button>
          <button type="button" class="dugme birincil tehlike-outline" id="profilCikis">Çıkış yap</button>
        </div>
      </section>
      <p class="profil-not">Şifre değiştirme ve profil fotoğrafı ileride admin modülüyle eklenecek.</p>`;

    document.getElementById("profilTemaDegistir")?.addEventListener("click", () => {
      document.getElementById("temaDegistir")?.click();
    });
    document.getElementById("profilCikis")?.addEventListener("click", () => {
      document.getElementById("cikisYap")?.click();
    });

    const sidebarAd = document.getElementById("profilAd");
    if (sidebarAd) sidebarAd.textContent = k.gorunenAd;
    const profilRol = document.getElementById("profilRol");
    if (profilRol) profilRol.textContent = rolYazi;
    const profilHarf = document.getElementById("profilHarf");
    if (profilHarf) profilHarf.textContent = harf;
  }

  function takvimCiz() {
    const el = document.getElementById("takvimIcerik");
    if (!el) return;
    const simdi = new Date();
    const yil = simdi.getFullYear();
    const ay = simdi.getMonth();
    const ilkGun = new Date(yil, ay, 1);
    const sonGun = new Date(yil, ay + 1, 0);
    const baslangic = (ilkGun.getDay() + 6) % 7;
    const gunSayisi = sonGun.getDate();
    const ayAd = simdi.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

    const etkinlikler = {
      [simdi.getDate()]: "Bugün",
      [Math.min(simdi.getDate() + 2, gunSayisi)]: "Sprint review",
      15: "Duyuru toplantısı",
    };

    let hucreler = "";
    for (let i = 0; i < baslangic; i++) hucreler += `<span class="takvim-bos"></span>`;
    for (let g = 1; g <= gunSayisi; g++) {
      const sinif = g === simdi.getDate() ? "bugun" : etkinlikler[g] ? "etkin" : "";
      hucreler += `<span class="takvim-gun ${sinif}" title="${escapeHtml(etkinlikler[g] || "")}">${g}</span>`;
    }

    el.innerHTML = `
      <p class="takvim-ay">${ayAd}</p>
      <div class="takvim-hafta">
        <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
      </div>
      <div class="takvim-grid">${hucreler}</div>
      <ul class="takvim-liste">
        <li><strong>Bugün:</strong> Genel bakış ve görev takibi</li>
        <li><strong>Bu hafta:</strong> Fly Bird ve arayüz teslimi</li>
      </ul>`;
  }

  const yukleyiciler = {
    projeler: projeleriCiz,
    ekip: ekipCiz,
    bildirimler: bildirimCiz,
    duyurular: duyuruCiz,
    notlar: notlariCiz,
    dokumanlar: dokumanCiz,
    raporlar: raporCiz,
    takvim: takvimCiz,
    profilim: profilCiz,
    "genel-bakis": genelBakisYukle,
  };

  function sayfaYukle(sayfaId) {
    const fn = yukleyiciler[sayfaId];
    if (fn) fn();
    if (sayfaId !== "genel-bakis") yanProjeOzetGuncelle();
  }

  window.taskflowSayfalar = { sayfaYukle, projeleriAl, gunlukRaporHatirlatGuncelle };
})();
