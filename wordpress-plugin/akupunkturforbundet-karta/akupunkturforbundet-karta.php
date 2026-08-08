<?php
/**
 * Plugin Name: Svenska Akupunkturförbundet – Karttest
 * Description: Testversion av kartan för att hitta anslutna akupunktörer. Innehåller endast fiktiva uppgifter.
 * Version: 0.1.0
 * Author: Svenska Akupunkturförbundet
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

function saf_karta_testdata() {
    return array(
        array('id' => 'test-01', 'name' => 'Anna Lind', 'clinic' => 'Lugnets mottagning', 'streetAddress' => 'Kungsgatan 18', 'postalCode' => '111 35', 'locality' => 'Stockholm', 'latitude' => 59.3352, 'longitude' => 18.0641, 'phone' => '070-000 00 01', 'email' => 'anna.lind@example.com', 'website' => 'https://example.com'),
        array('id' => 'test-02', 'name' => 'Erik Sjöberg', 'clinic' => 'Balanskliniken', 'streetAddress' => 'S:t Olofsgatan 12', 'postalCode' => '753 12', 'locality' => 'Uppsala', 'latitude' => 59.8605, 'longitude' => 17.6428, 'phone' => '070-000 00 02', 'email' => 'erik.sjoberg@example.com'),
        array('id' => 'test-03', 'name' => 'Maria Ek', 'clinic' => 'Västerhöjds mottagning', 'streetAddress' => 'Linnégatan 31', 'postalCode' => '413 04', 'locality' => 'Göteborg', 'latitude' => 57.6989, 'longitude' => 11.9511, 'phone' => '070-000 00 03', 'email' => 'maria.ek@example.com', 'website' => 'https://example.com'),
        array('id' => 'test-04', 'name' => 'Johan Berg', 'clinic' => 'Sundets akupunktur', 'streetAddress' => 'Stora Nygatan 22', 'postalCode' => '211 37', 'locality' => 'Malmö', 'latitude' => 55.6045, 'longitude' => 13.0002),
        array('id' => 'test-05', 'name' => 'Sara Holm', 'clinic' => 'Harmoni i norr', 'streetAddress' => 'Rådhusesplanaden 7', 'postalCode' => '903 28', 'locality' => 'Umeå', 'latitude' => 63.8268, 'longitude' => 20.263),
        array('id' => 'test-06', 'name' => 'Lena Nyström', 'clinic' => 'Örebro hälsorum', 'streetAddress' => 'Drottninggatan 16', 'postalCode' => '702 10', 'locality' => 'Örebro', 'latitude' => 59.2719, 'longitude' => 15.2106, 'phone' => '070-000 00 06', 'email' => 'lena.nystrom@example.com', 'website' => 'https://example.com'),
        array('id' => 'test-07', 'name' => 'Oskar Vik', 'clinic' => 'Trädgårdens mottagning', 'streetAddress' => 'Borgmästargränd 4', 'postalCode' => '553 20', 'locality' => 'Jönköping', 'latitude' => 57.7815, 'longitude' => 14.1618),
        array('id' => 'test-08', 'name' => 'Karin Lund', 'clinic' => 'Kustens klinik', 'streetAddress' => 'Norra Kyrkogatan 8', 'postalCode' => '252 23', 'locality' => 'Helsingborg', 'latitude' => 56.047, 'longitude' => 12.694)
    );
}

function saf_karta_shortcode() {
    $version = '0.1.0';
    $base_url = plugin_dir_url(__FILE__);

    wp_enqueue_style('saf-leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', array(), '1.9.4');
    wp_enqueue_style('saf-karta', $base_url . 'assets/karta.css', array('saf-leaflet'), $version);
    wp_enqueue_script('saf-leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', array(), '1.9.4', true);
    wp_enqueue_script('saf-karta', $base_url . 'assets/karta.js', array('saf-leaflet'), $version, true);
    wp_add_inline_script('saf-karta', 'window.safKartaData = ' . wp_json_encode(saf_karta_testdata()) . ';', 'before');

    ob_start();
    ?>
    <section class="saf-karta" data-saf-karta aria-label="Sök efter akupunktör">
        <p class="saf-karta__notice"><strong>Testmiljö:</strong> Alla personer och kontaktuppgifter i kartan är fiktiva.</p>
        <div class="saf-karta__layout">
            <aside class="saf-karta__sidebar">
                <form class="saf-karta__form" role="search">
                    <label>Namn<input name="name" type="search" placeholder="Sök på akupunktör" autocomplete="name"></label>
                    <label>Ort eller postnummer<input name="location" type="search" placeholder="Till exempel Uppsala eller 753 20" autocomplete="postal-code"></label>
                    <button type="submit">Sök och visa på kartan</button>
                    <button class="saf-karta__reset" type="button" hidden>Visa alla akupunktörer</button>
                </form>
                <div class="saf-karta__result-heading"><h2>Sökresultat</h2><p role="status" aria-live="polite"></p></div>
                <div class="saf-karta__results"></div>
            </aside>
            <div class="saf-karta__map-wrap">
                <div class="saf-karta__map" aria-label="Karta med akupunktörernas mottagningar"></div>
                <p>Zooma eller flytta kartan och välj en markör för mer information.</p>
            </div>
        </div>
    </section>
    <?php
    return ob_get_clean();
}
add_shortcode('akupunktor_karta', 'saf_karta_shortcode');
