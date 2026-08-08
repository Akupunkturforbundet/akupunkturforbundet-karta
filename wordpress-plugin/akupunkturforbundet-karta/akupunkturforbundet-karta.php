<?php
/**
 * Plugin Name: Svenska Akupunkturförbundet – Karttest
 * Description: Testversion av kartan för att hitta anslutna akupunktörer.
 * Version: 0.2.1
 * Author: Svenska Akupunkturförbundet
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

function saf_karta_parse_address($value, $fallback_locality = '') {
    $plain = preg_replace('/<br\s*\/?>/i', "\n", (string) $value);
    $lines = array_values(array_filter(array_map('trim', preg_split('/\R/', wp_strip_all_tags($plain)))));
    $postal_code = '';
    $locality = trim((string) $fallback_locality);

    if ($lines && preg_match('/^(\d{3})\s?(\d{2})\s+(.+)$/u', end($lines), $matches)) {
        $postal_code = $matches[1] . ' ' . $matches[2];
        $locality = trim($matches[3]);
        array_pop($lines);
    }

    $street_address = $lines ? array_pop($lines) : '';

    return array(
        'clinic' => implode(', ', $lines),
        'streetAddress' => $street_address,
        'postalCode' => $postal_code,
        'locality' => $locality,
    );
}

function saf_karta_website_url($value) {
    $value = trim((string) $value);
    if ($value && !preg_match('#^https?://#i', $value)) {
        $value = 'https://' . $value;
    }
    return $value;
}

function saf_karta_member_data() {
    $members = array();
    $posts = get_posts(array(
        'post_type' => 'medlemmar',
        'post_status' => 'publish',
        'numberposts' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
    ));

    foreach ($posts as $post) {
        $latitude = get_post_meta($post->ID, '_saf_karta_latitude', true);
        $longitude = get_post_meta($post->ID, '_saf_karta_longitude', true);
        if (!is_numeric($latitude) || !is_numeric($longitude)) {
            continue;
        }

        $address = saf_karta_parse_address(get_post_meta($post->ID, 'adress', true), get_post_meta($post->ID, 'ort', true));
        $members[] = array_merge(array(
            'id' => 'medlem-' . $post->ID,
            'name' => get_post_meta($post->ID, 'namn', true) ?: get_the_title($post),
            'latitude' => (float) $latitude,
            'longitude' => (float) $longitude,
            'phone' => get_post_meta($post->ID, 'telefonnummer', true),
            'email' => get_post_meta($post->ID, 'e-postadress', true),
            'website' => saf_karta_website_url(get_post_meta($post->ID, 'hemsida', true)),
        ), $address);
    }

    return $members;
}

function saf_karta_schedule_geocoding() {
    if (!wp_next_scheduled('saf_karta_geocode_member')) {
        wp_schedule_single_event(time() + 10, 'saf_karta_geocode_member');
    }
}

function saf_karta_geocode_member() {
    $needs_reschedule = false;
    $posts = get_posts(array(
        'post_type' => 'medlemmar',
        'post_status' => 'publish',
        'numberposts' => -1,
        'fields' => 'ids',
    ));

    foreach ($posts as $post_id) {
        $raw_address = get_post_meta($post_id, 'adress', true);
        $locality = get_post_meta($post_id, 'ort', true);
        $address_hash = md5($raw_address . '|' . $locality);
        if (get_post_meta($post_id, '_saf_karta_address_hash', true) === $address_hash) {
            continue;
        }

        $address = saf_karta_parse_address($raw_address, $locality);
        $query = trim(implode(', ', array_filter(array($address['streetAddress'], $address['postalCode'], $address['locality'], 'Sverige'))));
        if (!$address['streetAddress'] || !$address['locality']) {
            update_post_meta($post_id, '_saf_karta_address_hash', $address_hash);
            continue;
        }

        $response = wp_remote_get(add_query_arg(array(
            'format' => 'jsonv2',
            'limit' => 1,
            'countrycodes' => 'se',
            'q' => $query,
        ), 'https://nominatim.openstreetmap.org/search'), array(
            'timeout' => 15,
            'user-agent' => 'Svenska Akupunkturforbundet karttest; ' . home_url('/'),
        ));

        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $results = json_decode(wp_remote_retrieve_body($response), true);
            if (!empty($results[0]['lat']) && !empty($results[0]['lon'])) {
                update_post_meta($post_id, '_saf_karta_latitude', $results[0]['lat']);
                update_post_meta($post_id, '_saf_karta_longitude', $results[0]['lon']);
            }
            update_post_meta($post_id, '_saf_karta_address_hash', $address_hash);
        }
        $needs_reschedule = true;
        break;
    }

    if ($needs_reschedule && !wp_next_scheduled('saf_karta_geocode_member')) {
        wp_schedule_single_event(time() + 90, 'saf_karta_geocode_member');
    }
}
register_activation_hook(__FILE__, 'saf_karta_schedule_geocoding');
add_action('saf_karta_geocode_member', 'saf_karta_geocode_member');
add_action('save_post_medlemmar', 'saf_karta_schedule_geocoding');

function saf_karta_shortcode() {
    $version = '0.2.1';
    $base_url = plugin_dir_url(__FILE__);

    wp_enqueue_style('saf-leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', array(), '1.9.4');
    wp_enqueue_style('saf-karta', $base_url . 'assets/karta.css', array('saf-leaflet'), $version);
    wp_enqueue_script('saf-leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', array(), '1.9.4', true);
    wp_enqueue_script('saf-karta', $base_url . 'assets/karta.js', array('saf-leaflet'), $version, true);
    saf_karta_schedule_geocoding();
    wp_add_inline_script('saf-karta', 'window.safKartaData = ' . wp_json_encode(saf_karta_member_data()) . ';', 'before');

    ob_start();
    ?>
    <section class="saf-karta" data-saf-karta aria-label="Sök efter akupunktör">
        <p class="saf-karta__notice"><strong>Testmiljö:</strong> Kartan använder de publicerade uppgifterna under Medlemmar. Kartpositioner skapas stegvis från mottagningsadresserna.</p>
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
