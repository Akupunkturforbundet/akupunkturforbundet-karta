(function () {
  "use strict";

  const data = Array.isArray(window.safKartaData) ? window.safKartaData : [];
  const swedenBounds = [[55.1, 10.5], [69.2, 24.5]];

  const normalize = (value) => value.trim().toLocaleLowerCase("sv-SE");
  const postal = (value) => value.replace(/\s/g, "");
  const escapeHtml = (value) => {
    const element = document.createElement("span");
    element.textContent = value || "";
    return element.innerHTML;
  };

  function filter(items, locationQuery, nameQuery) {
    const location = normalize(locationQuery);
    const name = normalize(nameQuery);
    const postalQuery = postal(location);
    const isPostal = /^\d+$/.test(postalQuery);

    return items.filter((item) => {
      if (name && !normalize(item.name).includes(name)) return false;
      if (!location) return true;
      return isPostal ? postal(item.postalCode).startsWith(postalQuery) : normalize(item.locality) === location;
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
    return `<strong>${escapeHtml(item.name)}</strong>${item.clinic ? `<span>${escapeHtml(item.clinic)}</span>` : ""}<address>${escapeHtml(item.streetAddress)}<br>${escapeHtml(item.postalCode)} ${escapeHtml(item.locality)}</address>${contactHtml(item)}`;
  }

  document.querySelectorAll("[data-saf-karta]").forEach((root) => {
    const mapElement = root.querySelector(".saf-karta__map");
    const form = root.querySelector(".saf-karta__form");
    const nameInput = form.elements.name;
    const locationInput = form.elements.location;
    const reset = root.querySelector(".saf-karta__reset");
    const results = root.querySelector(".saf-karta__results");
    const status = root.querySelector('[role="status"]');
    const map = window.L.map(mapElement, { scrollWheelZoom: false }).fitBounds(swedenBounds);
    const layer = window.L.layerGroup().addTo(map);
    const markers = new Map();

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);

    function render(items, hasQuery) {
      layer.clearLayers();
      markers.clear();
      results.replaceChildren();
      status.textContent = `${items.length} ${items.length === 1 ? "akupunktör" : "akupunktörer"} hittades`;
      reset.hidden = !hasQuery;

      if (!items.length) {
        results.innerHTML = '<div class="saf-karta__empty"><strong>Inga träffar</strong><p>Kontrollera stavningen eller prova ett annat postnummer.</p></div>';
        map.fitBounds(swedenBounds);
        return;
      }

      const bounds = window.L.latLngBounds([]);
      items.forEach((item) => {
        const marker = window.L.marker([item.latitude, item.longitude], { title: item.name }).bindPopup(`<div class="saf-karta__popup">${personHtml(item)}</div>`).addTo(layer);
        markers.set(item.id, marker);
        bounds.extend([item.latitude, item.longitude]);

        const card = document.createElement("article");
        card.className = "saf-karta__card";
        card.innerHTML = `<h3>${escapeHtml(item.name)}</h3>${item.clinic ? `<p><strong>${escapeHtml(item.clinic)}</strong></p>` : ""}<address>${escapeHtml(item.streetAddress)}<br>${escapeHtml(item.postalCode)} ${escapeHtml(item.locality)}</address>${contactHtml(item)}<button type="button">Visa på kartan</button>`;
        card.querySelector("button").addEventListener("click", () => {
          map.setView([item.latitude, item.longitude], 14);
          marker.openPopup();
          mapElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        results.append(card);
      });

      if (hasQuery) items.length === 1 ? map.setView(bounds.getCenter(), 14) : map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      else map.fitBounds(swedenBounds);
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
    setTimeout(() => map.invalidateSize(), 0);
  });
})();
