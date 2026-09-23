<?php
/**
 * Plugin Name: Enrollment Hub Backend API
 * Description: Endpoint REST para pagamentos M-Pesa com validação, persistência de logs e respostas seguras.
 * Version: 1.1.0
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

function enrollment_hub_normalize_mpesa_phone($phone) {
    $digits = preg_replace('/\D/', '', (string) $phone);

    if (strpos($digits, '258') === 0 && strlen($digits) === 12) {
        $digits = substr($digits, 3);
    }

    return $digits;
}

function enrollment_hub_mpesa_payment(WP_REST_Request $request) {
    global $wpdb;

    $body = $request->get_json_params();

    if (!is_array($body)) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Pedido inválido.',
        ], 400);
    }

    $enrollment_id = sanitize_text_field($body['enrollmentId'] ?? '');
    $phone = enrollment_hub_normalize_mpesa_phone($body['phone'] ?? '');
    $amount = isset($body['amount']) ? (float) $body['amount'] : 0;
    $reference = sanitize_text_field($body['reference'] ?? '');

    if (!$enrollment_id || !$reference) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Referência de inscrição ou pagamento em falta.',
        ], 400);
    }

    if (!preg_match('/^(84|85|86|87)\d{7}$/', $phone)) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Número M-Pesa inválido. Use um número Vodacom de 9 dígitos (84, 85, 86 ou 87).',
        ], 400);
    }

    if ($amount <= 0 || $amount > 1000000) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Valor de pagamento inválido.',
        ], 400);
    }

    $mpesa_url = rtrim((string) get_option('enrollment_hub_mpesa_url', ''), '/');
    $mpesa_token = (string) get_option('enrollment_hub_mpesa_token', '');
    $service_provider_code = (string) get_option('enrollment_hub_service_provider_code', '');

    if (!$mpesa_url || !$mpesa_token || !$service_provider_code) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'O serviço M-Pesa está temporariamente indisponível. Contacte a ALINVEST.',
        ], 503);
    }

    $transaction_reference = strtoupper(substr('ENR-' . $enrollment_id, 0, 20));
    $third_party_reference = substr($reference, 0, 20);

    $payload = [
        'input_TransactionReference' => $transaction_reference,
        'input_CustomerMSISDN' => $phone,
        'input_Amount' => number_format($amount, 2, '.', ''),
        'input_ThirdPartyReference' => $third_party_reference,
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
            'error' => 'Não foi possível comunicar com o M-Pesa. Tente novamente.',
        ], 502);
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $raw_body = wp_remote_retrieve_body($response);
    $data = json_decode($raw_body, true);

    $log_table = $wpdb->prefix . 'enrollment_mpesa_logs';
    $wpdb->insert(
        $log_table,
        [
            'enrollment_id' => $enrollment_id,
            'http_status' => $status_code,
            'response_payload' => $raw_body,
            'created_at' => current_time('mysql'),
        ],
        ['%s', '%d', '%s', '%s']
    );

    if (!is_array($data)) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Resposta inválida do serviço M-Pesa. Tente novamente.',
        ], 502);
    }

    $transaction_id = sanitize_text_field($data['output_TransactionID'] ?? '');
    $conversation_id = sanitize_text_field($data['output_ConversationID'] ?? '');
    $provider_message = sanitize_text_field($data['output_ResponseDesc'] ?? '');

    if ($status_code < 200 || $status_code >= 300 || !$transaction_id) {
        return new WP_REST_Response([
            'success' => false,
            'error' => $provider_message ?: 'O M-Pesa não confirmou o pedido. Verifique os dados e tente novamente.',
        ], 400);
    }

    return new WP_REST_Response([
        'success' => true,
        'transactionId' => $transaction_id,
        'conversationId' => $conversation_id ?: null,
        'message' => 'Pedido de pagamento M-Pesa enviado com sucesso.',
    ], 200);
}
