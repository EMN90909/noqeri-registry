// SPDX-License-Identifier: MIT
package hostbridge

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"
	"time"
)

// VerifyStripeSignature implements Stripe's timestamped v1 HMAC-SHA256 check.
// Signature verification is essential before any action is taken on a webhook.
// The caller still needs to enforce event idempotency and handle replayed event IDs.
func VerifyStripeSignature(payload, header, secret string, now time.Time) error {
	if len(payload) > 1<<20 || len(header) > 8192 {
		return errors.New("stripe_webhook_oversized")
	}
	if len(secret) < 12 || !strings.HasPrefix(secret, "whsec_") {
		return errors.New("stripe_webhook_secret_missing")
	}
	var timestamp int64 = -1
	var received [][]byte
	for _, item := range strings.Split(header, ",") {
		pair := strings.SplitN(strings.TrimSpace(item), "=", 2)
		if len(pair) != 2 {
			continue
		}
		if pair[0] == "t" {
			n, err := strconv.ParseInt(pair[1], 10, 64)
			if err != nil || n <= 0 {
				return errors.New("stripe_webhook_timestamp_invalid")
			}
			timestamp = n
		}
		if pair[0] == "v1" {
			digest, err := hex.DecodeString(pair[1])
			if err == nil && len(digest) == sha256.Size {
				received = append(received, digest)
			}
		}
	}
	if timestamp < 0 || len(received) == 0 || len(received) > 10 {
		return errors.New("stripe_webhook_signature_missing")
	}
	elapsed := now.Unix() - timestamp
	if elapsed < -300 || elapsed > 300 {
		return errors.New("stripe_webhook_timestamp_expired")
	}
	signed := strconv.FormatInt(timestamp, 10) + "." + payload
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(signed))
	want := mac.Sum(nil)
	for _, candidate := range received {
		if hmac.Equal(want, candidate) {
			return nil
		}
	}
	return errors.New("stripe_webhook_signature_mismatch")
}
