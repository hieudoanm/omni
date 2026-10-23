package internal

import "testing"

func TestTelegramBotToken(t *testing.T) {
	t.Setenv("TELEGRAM_BOT_TOKEN", "test-token-123")
	token := TelegramBotToken()
	if token != "test-token-123" {
		t.Errorf("TelegramBotToken() = %q, want 'test-token-123'", token)
	}
}
