package internal

import "fmt"

func TelegramAPIURL(token, method string) string {
	return fmt.Sprintf("https://api.telegram.org/bot%s/%s", token, method)
}
