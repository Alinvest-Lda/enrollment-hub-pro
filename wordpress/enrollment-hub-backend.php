<?php
/**
 * Plugin Name: Enrollment Hub Backend API
 * Description: Endpoints REST para pagamentos M-Pesa com persistência em MySQL (WordPress).
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('enrollment-hub/v1', '/mpesa-payment', [
        'methods' => 'POST',
        'callback' => 'enrollment_hub_mpesa_payment',
        'permission_callback' => '__return_true',
    ]);
});

function enrollment_hub_mpesa_payment(WP_REST_Request $request) {
    global $wpdb;

    $body = $request->get_json_params();
    $enrollment_id = sanitize_text_field($body['enrollmentId'] ?? '');
    $phone = preg_replace('/\D/', '', sanitize_text_field($body['phone'] ?? ''));
    $amount = floatval($body['amount'] ?? 0);
    $reference = sanitize_text_field($body['reference'] ?? '');

    if (!$enrollment_id || !$phone || !$amount || !$reference) {
        return new WP_REST_Response(['success' => false, 'error' => 'Campos obrigatórios em falta'], 400);
    }

    $mpesa_url = rtrim(get_option('enrollment_hub_mpesa_url', ''), '/');
    $mpesa_token = get_option('enrollment_hub_mpesa_token', '');
    $service_provider_code = get_option('enrollment_hub_service_provider_code', '');

    if (!$mpesa_url || !$mpesa_token || !$service_provider_code) {
        return new WP_REST_Response(['success' => false, 'error' => 'Configuração M-Pesa incompleta no WordPress'], 500);
    }

    $payload = [
        'input_TransactionReference' => strtoupper(substr("ENR-{$enrollment_id}", 0, 20)),
        'input_CustomerMSISDN' => $phone,
        'input_Amount' => strval($amount),
        'input_ThirdPartyReference' => substr($reference, 0, 20),
        'input_ServiceProviderCode' => $service_provider_code,
    ];

    $response = wp_remote_post($mpesa_url, [
        'timeout' => 25,
        'headers' => [
            'Authorization' => 'Bearer ' . $mpesa_token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'body' => wp_json_encode($payload),
    ]);

    if (is_wp_error($response)) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Falha de comunicação com API M-Pesa',
            'details' => $response->get_error_message(),
        ], 502);
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $raw_body = wp_remote_retrieve_body($response);
    $data = json_decode($raw_body, true);

    $wpdb->insert(
        $wpdb->prefix . 'enrollment_mpesa_logs',
        [
            'enrollment_id' => $enrollment_id,
            'http_status' => $status_code,
            'response_payload' => $raw_body,
            'created_at' => current_time('mysql'),
        ],
        ['%s', '%d', '%s', '%s']
    );

    if ($status_code < 200 || $status_code >= 300) {
        return new WP_REST_Response([
            'success' => false,
            'error' => $data['output_ResponseDesc'] ?? "Erro HTTP M-Pesa ({$status_code})",
            'raw' => $data,
        ], 400);
    }

    return new WP_REST_Response([
        'success' => true,
        'transactionId' => $data['output_TransactionID'] ?? null,
        'conversationId' => $data['output_ConversationID'] ?? null,
        'message' => 'Pagamento M-Pesa processado com sucesso',
    ], 200);
}
