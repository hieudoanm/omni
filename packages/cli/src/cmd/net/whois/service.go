package whois

import (
	"fmt"
	"strings"
)

var whoisLookupServer = whoisLookupServerImpl

func whoisLookupServerImpl(domain string) string {
	parts := strings.Split(domain, ".")
	if len(parts) < 2 {
		return "whois.iana.org"
	}
	tld := parts[len(parts)-1]

	switch tld {
	case "com", "net":
		return "whois.verisign-grs.com"
	case "org":
		return "whois.pir.org"
	case "io":
		return "whois.nic.io"
	case "dev":
		return "whois.nic.dev"
	case "app":
		return "whois.nic.google"
	case "ai":
		return "whois.nic.ai"
	case "me":
		return "whois.nic.me"
	case "co":
		return "whois.nic.co"
	case "uk":
		return "whois.nic.uk"
	case "de":
		return "whois.denic.de"
	case "jp":
		return "whois.jprs.jp"
	case "fr":
		return "whois.nic.fr"
	case "xyz":
		return "whois.nic.xyz"
	default:
		return fmt.Sprintf("whois.nic.%s", tld)
	}
}
