CREATE TABLE IF NOT EXISTS wp_enrollment_mpesa_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enrollment_id VARCHAR(64) NOT NULL,
  http_status INT NOT NULL,
  response_payload LONGTEXT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_enrollment_id (enrollment_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
