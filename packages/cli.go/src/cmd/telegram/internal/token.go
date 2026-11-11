package internal

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func TelegramBotToken() string {
	return os.Getenv("TELEGRAM_BOT_TOKEN")
}

func ResolveToken(cmd *cobra.Command) (string, error) {
	token, _ := cmd.Flags().GetString("token")
	if token != "" {
		return token, nil
	}
	token = TelegramBotToken()
	if token == "" {
		return "", fmt.Errorf("telegram bot token required: use --token flag or set TELEGRAM_BOT_TOKEN env var")
	}
	return token, nil
}
