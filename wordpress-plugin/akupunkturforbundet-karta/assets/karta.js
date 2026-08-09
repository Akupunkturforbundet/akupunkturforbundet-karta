(function () {
  "use strict";

  const sourceData = Array.isArray(window.safKartaData) ? window.safKartaData : [];
  const shuffled = (items) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  };
  const data = [
    ...shuffled(sourceData.filter((item) => item.hasPhoto)),
    ...shuffled(sourceData.filter((item) => !item.hasPhoto))
  ];
  const swedenBounds = [[55.1, 10.5], [69.2, 24.5]];
  const mapLimits = [[53, 7], [71, 28]];
  const markerIcon = window.L.divIcon({
    className: "saf-karta__marker",
    html: '<span class="saf-karta__marker-pin" aria-hidden="true"></span>',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38]
  });

  const normalize = (value) => value.trim().toLocaleLowerCase("sv-SE");
  const postal = (value) => value.replace(/\s/g, "");
  const matchesCounty = (item, query) => {
    const normalizedQuery = normalize(query);
    if (normalize(item.county || "").includes(normalizedQuery)) return true;

    // Jämtlands län uses postal areas 83 and 84. This fallback makes the
    // county searchable while older member records receive saved county data.
    const isJamtland = normalizedQuery === "jämtland" || normalizedQuery === "jämtlands län";
    return isJamtland && /^(83|84)/.test(postal(item.postalCode || ""));
  };
  const escapeHtml = (value) => {
    const element = document.createElement("span");
    element.textContent = value || "";
    return element.innerHTML;
  };
  const httpUrl = (value) => {
    if (!value || !URL.canParse(value, window.location.origin)) return "";
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  };

  function filter(items, locationQuery, nameQuery) {
    const location = normalize(locationQuery);
    const name = normalize(nameQuery);
    const postalQuery = postal(location);
    const isPostal = /^\d+$/.test(postalQuery);

    return items.filter((item) => {
      if (name) {
        const matchesName = normalize(item.name).includes(name);
        const matchesLocality = normalize(item.locality).includes(name);
        const matchesMemberCounty = matchesCounty(item, name);
        const matchesPostalCode = /^\d+$/.test(postal(name)) && postal(item.postalCode).startsWith(postal(name));
        if (!matchesName && !matchesLocality && !matchesMemberCounty && !matchesPostalCode) return false;
      }
      if (!location) return true;
      if (isPostal) return postal(item.postalCode).startsWith(postalQuery);
      return normalize(item.locality) === location || matchesCounty(item, location);
    });
  }

  function contactHtml(item) {
    const links = [];
    if (item.phone) links.push(`<a href="tel:${escapeHtml(item.phone.replace(/[^+\d]/g, ""))}">Tel: ${escapeHtml(item.phone)}</a>`);
    if (item.email) links.push(`<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>`);
    if (item.website && URL.canParse(item.website) && new URL(item.website).protocol === "https:") {
      links.push(`<a href="${escapeHtml(item.website)}" target="_blank" rel="noopener noreferrer">Besök mottagningens webbplats<span class="saf-sr-only"> (öppnas i ny flik)</span></a>`);
    }
    return links.length ? `<div class="saf-karta__contacts">${links.join("")}</div>` : "";
  }

  function personHtml(item) {
    const profileUrl = httpUrl(item.profileUrl);
    const imageUrl = httpUrl(item.image);
    const image = imageUrl ? `<img class="saf-karta__popup-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy">` : "";
    const name = profileUrl ? `<a href="${escapeHtml(profileUrl)}"><strong>${escapeHtml(item.name)}</strong></a>` : `<strong>${escapeHtml(item.name)}</strong>`;
    const profileLink = profileUrl ? `<a class="saf-karta__popup-profile" href="${escapeHtml(profileUrl)}">Visa profil</a>` : "";
    return `${image}${name}${item.clinic ? `<span>${escapeHtml(item.clinic)}</span>` : ""}<address>${escapeHtml(item.streetAddress)}<br>${escapeHtml(item.postalCode)} ${escapeHtml(item.locality)}</address>${contactHtml(item)}${profileLink}`;
  }

  document.querySelectorAll("[data-saf-karta]").forEach((root) => {
    const logoContainer = root.querySelector("[data-saf-karta-logo]");
    if (logoContainer && !logoContainer.querySelector("img")) {
      const siteLogo = document.querySelector(".custom-logo, .elementor-widget-theme-site-logo img, .site-logo img, .site-branding img, header .elementor-widget-image img");
      if (siteLogo && !root.contains(siteLogo)) {
        const logo = siteLogo.cloneNode(true);
        logo.removeAttribute("id");
        logo.className = "saf-karta__logo-image";
        logo.alt = "Svenska Akupunkturförbundet";
        logoContainer.append(logo);
      } else {
        logoContainer.hidden = true;
      }
    }
    const mapElement = root.querySelector(".saf-karta__map");
    const form = root.querySelector(".saf-karta__form");
    const nameInput = form.elements.name;
    const locationInput = form.elements.location;
    const reset = root.querySelector(".saf-karta__reset");
    const results = root.querySelector(".saf-karta__results");
    const status = root.querySelector('[role="status"]');
    const map = window.L.map(mapElement, {
      scrollWheelZoom: false,
      maxBounds: mapLimits,
      maxBoundsViscosity: 1
    }).fitBounds(swedenBounds, { animate: false });
    const layer = window.L.layerGroup().addTo(map);
    const markers = new Map();

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);

    function render(items, hasQuery) {
      root.classList.toggle("saf-karta--has-query", hasQuery);
      layer.clearLayers();
      markers.clear();
      results.replaceChildren();
      status.textContent = `${items.length} ${items.length === 1 ? "akupunktör" : "akupunktörer"} hittades`;
      // Keep the form the same height before and after a search so that it
      // remains in exactly the same centred position beside the map.
      reset.hidden = false;

      if (!items.length) {
        results.innerHTML = '<div class="saf-karta__empty"><strong>Inga träffar</strong><p>Kontrollera stavningen eller prova ett annat postnummer.</p></div>';
        map.invalidateSize({ pan: false });
        map.fitBounds(swedenBounds, { animate: false });
        return;
      }

      const bounds = window.L.latLngBounds([]);
      items.forEach((item) => {
        const marker = window.L.marker([item.latitude, item.longitude], { title: item.name, icon: markerIcon }).bindPopup(`<div class="saf-karta__popup">${personHtml(item)}</div>`, {
          className: "saf-karta__leaflet-popup-below",
          offset: [0, 430],
          autoPanPaddingTopLeft: [30, 30],
          autoPanPaddingBottomRight: [30, 30]
        }).addTo(layer);
        markers.set(item.id, marker);
        bounds.extend([item.latitude, item.longitude]);

        const card = document.createElement("article");
        card.className = "saf-karta__card";
        const profileUrl = httpUrl(item.profileUrl);
        const imageUrl = httpUrl(item.image);
        const image = imageUrl ? `<img class="saf-karta__profile-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy">` : "";
        const linkedImage = profileUrl && image ? `<a href="${escapeHtml(profileUrl)}" tabindex="-1">${image}</a>` : image;
        const name = profileUrl ? `<a href="${escapeHtml(profileUrl)}">${escapeHtml(item.name)}</a>` : escapeHtml(item.name);
        const profileLink = profileUrl ? `<a class="saf-karta__profile-link" href="${escapeHtml(profileUrl)}">Läs mer</a>` : "";
        card.innerHTML = `${linkedImage}<h3>${name}</h3>${item.clinic ? `<p><strong>${escapeHtml(item.clinic)}</strong></p>` : ""}<address>${escapeHtml(item.streetAddress)}<br>${escapeHtml(item.postalCode)} ${escapeHtml(item.locality)}</address>${contactHtml(item)}<div class="saf-karta__card-actions"><button type="button">Visa på kartan</button>${profileLink}</div>`;
        card.querySelector("button").addEventListener("click", () => {
          map.setView([item.latitude, item.longitude], 14);
          marker.openPopup();
          mapElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        results.append(card);
      });

      map.invalidateSize({ pan: false });
      if (hasQuery) items.length === 1 ? map.setView(bounds.getCenter(), 14, { animate: false }) : map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: false });
      else map.fitBounds(swedenBounds, { animate: false });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render(filter(data, locationInput.value, nameInput.value), Boolean(locationInput.value.trim() || nameInput.value.trim()));
    });
    reset.addEventListener("click", () => {
      form.reset();
      render(data, false);
      nameInput.focus();
    });
    render(data, false);
    setTimeout(() => {
      map.invalidateSize({ pan: false });
      map.fitBounds(swedenBounds, { animate: false });
    }, 100);
  });
})();
