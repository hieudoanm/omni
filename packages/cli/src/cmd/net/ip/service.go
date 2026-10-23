package ip

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type IPInfo struct {
	IP          string `json:"ip"`
	Version     string `json:"version"`
	City        string `json:"city,omitempty"`
	Region      string `json:"region,omitempty"`
	CountryName string `json:"country_name,omitempty"`
	CountryCode string `json:"country_code,omitempty"`
	Postal      string `json:"postal,omitempty"`
	Latitude    string `json:"latitude,omitempty"`
	Longitude   string `json:"longitude,omitempty"`
	Timezone    string `json:"timezone,omitempty"`
	Org         string `json:"org,omitempty"`
	ASN         string `json:"asn,omitempty"`
}

func fetchPublicIP() (string, error) {
	body, err := netFetch("https://api.ipify.org?format=json", requests.Options{})
	if err != nil {
		return "", fmt.Errorf("failed to fetch public IP: %w", err)
	}
	return parsePublicIPResponse(body)
}

func parsePublicIPResponse(body []byte) (string, error) {
	var result struct {
		IP string `json:"ip"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse IP response: %w", err)
	}
	return result.IP, nil
}

func detectVPN(org string) bool {
	lower := strings.ToLower(org)
	keywords := []string{"cloudflare", "amazon", "google", "digitalocean", "microsoft"}
	for _, kw := range keywords {
		if strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}

func printIPInfo(info *IPInfo, provider string, raw bool) {
	if raw {
		b, _ := json.MarshalIndent(info, "", "  ")
		fmt.Println(string(b))
		return
	}

	fmt.Printf("Provider    : %s\n", provider)
	fmt.Println()
	fmt.Println("── Network Info ──────────────────────")
	fmt.Printf("IP          : %s\n", info.IP)
	fmt.Printf("Version     : %s\n", info.Version)
	fmt.Printf("ASN         : %s\n", info.ASN)
	fmt.Printf("Organization: %s\n", info.Org)
	fmt.Printf("Timezone    : %s\n", info.Timezone)
	fmt.Println()
	fmt.Println("── Location ──────────────────────────")
	fmt.Printf("Country     : %s\n", info.CountryName)
	fmt.Printf("Region      : %s\n", info.Region)
	fmt.Printf("City        : %s\n", info.City)
	fmt.Printf("Postal      : %s\n", info.Postal)
	fmt.Printf("Coordinates : %s, %s\n", info.Latitude, info.Longitude)

	if detectVPN(info.Org) {
		fmt.Println()
		fmt.Println("⚠  Shared hosting / VPN detected. Rate limiting may occur.")
	}
}
