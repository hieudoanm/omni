package internal

import (
	"net/url"
	"strings"
)

func ExtractHost(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil || u.Hostname() == "" {
		return "output"
	}
	host := strings.ReplaceAll(u.Hostname(), "www.", "")
	host = strings.ReplaceAll(host, ".", "_")
	return host
}
