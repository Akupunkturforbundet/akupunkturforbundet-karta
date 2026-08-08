import L, { type Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import { practitioners } from "./data/practitioners";
import { filterPractitioners } from "./search";
import type { Practitioner } from "./types";

const swedenBounds = L.latLngBounds([55.1, 10.5], [69.2, 24.5]);
const map = L.map("map", { scrollWheelZoom: false }).fitBounds(swedenBounds);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18
}).addTo(map);

const markerIcon = L.divIcon({
  className: "practitioner-marker",
  html: '<span aria-hidden="true"></span>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38]
});

const markers = new Map<string, Marker>();
const markerLayer = L.layerGroup().addTo(map);
const form = document.querySelector<HTMLFormElement>("#search-form")!;
const nameInput = document.querySelector<HTMLInputElement>("#name-input")!;
const input = document.querySelector<HTMLInputElement>("#search-input")!;
const resetButton = document.querySelector<HTMLButtonElement>("#reset-button")!;
const results = document.querySelector<HTMLElement>("#results")!;
const resultCount = document.querySelector<HTMLElement>("#result-count")!;

function escapeHtml(value: string): string {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function safeWebsiteUrl(value: string | undefined): string | null {
  if (!value || !URL.canParse(value)) return null;

  const url = new URL(value);
  return url.protocol === "https:" ? url.href : null;
}

function contactContent(item: Practitioner): string {
  const phoneHref = item.phone?.replace(/[^+\d]/g, "");
  const emailIsValid = item.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email);
  const websiteUrl = safeWebsiteUrl(item.website);
  const links = [
    phoneHref && item.phone
      ? `<a href="tel:${escapeHtml(phoneHref)}"><span aria-hidden="true">Tel: </span>${escapeHtml(item.phone)}<span class="sr-only">, ring telefonnumret</span></a>`
      : "",
    emailIsValid && item.email
      ? `<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}<span class="sr-only">, skicka e-post</span></a>`
      : "",
    websiteUrl
      ? `<a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer">Besök mottagningens webbplats<span class="sr-only"> (öppnas i ny flik)</span></a>`
      : ""
  ].filter(Boolean);

  return links.length ? `<div class="contact-links">${links.join("")}</div>` : "";
}

function popupContent(item: Practitioner): string {
  return `<div class="popup-content">
    <strong>${escapeHtml(item.name)}</strong>
    ${item.clinic ? `<span>${escapeHtml(item.clinic)}</span>` : ""}
    <address>${escapeHtml(item.streetAddress)}<br>${escapeHtml(item.postalCode)} ${escapeHtml(item.locality)}</address>
    ${contactContent(item)}
  </div>`;
}

function focusPractitioner(item: Practitioner): void {
  map.setView([item.latitude, item.longitude], Math.max(map.getZoom(), 14), { animate: true });
  markers.get(item.id)?.openPopup();
  document.querySelector("#map")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderResults(items: Practitioner[], hasQuery: boolean): void {
  markerLayer.clearLayers();
  markers.clear();
  results.replaceChildren();

  resultCount.textContent = items.length === 1 ? "1 akupunktör hittades" : `${items.length} akupunktörer hittades`;
  resetButton.hidden = !hasQuery;

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-result";
    empty.innerHTML = "<h3>Inga träffar</h3><p>Kontrollera stavningen eller prova ett annat postnummer.</p>";
    results.append(empty);
    map.fitBounds(swedenBounds);
    return;
  }

  const bounds = L.latLngBounds([]);
  items.forEach((item) => {
    const marker = L.marker([item.latitude, item.longitude], { icon: markerIcon, title: item.name })
      .bindPopup(popupContent(item))
      .addTo(markerLayer);
    markers.set(item.id, marker);
    bounds.extend([item.latitude, item.longitude]);

    const article = document.createElement("article");
    article.className = "result-card";
    article.innerHTML = `<h3>${escapeHtml(item.name)}</h3>
      ${item.clinic ? `<p class="clinic">${escapeHtml(item.clinic)}</p>` : ""}
      <address>${escapeHtml(item.streetAddress)}<br>${escapeHtml(item.postalCode)} ${escapeHtml(item.locality)}</address>
      ${contactContent(item)}
      <button type="button">Visa på kartan</button>`;
    article.querySelector("button")?.addEventListener("click", () => focusPractitioner(item));
    results.append(article);
  });

  if (hasQuery) {
    if (items.length === 1) map.setView(bounds.getCenter(), 14);
    else map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
  } else {
    map.fitBounds(swedenBounds);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value;
  const nameQuery = nameInput.value;
  renderResults(filterPractitioners(practitioners, query, nameQuery), Boolean(query.trim() || nameQuery.trim()));
});

resetButton.addEventListener("click", () => {
  nameInput.value = "";
  input.value = "";
  renderResults(practitioners, false);
  nameInput.focus();
});

renderResults(practitioners, false);
