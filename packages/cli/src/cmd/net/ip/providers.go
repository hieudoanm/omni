package ip

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

var netFetch = requests.Get

func fetchFromIPInfo(ip string) (*IPInfo, error) {
	body, err := netFetch(fmt.Sprintf("https://ipinfo.io/%s/json", ip), requests.Options{})
	if err != nil {
		return nil, fmt.Errorf("IPinfo request failed: %w", err)
	}
	return parseIPInfoResponse(body)
}

func parseIPInfoResponse(body []byte) (*IPInfo, error) {
	var data struct {
		IP       string `json:"ip"`
		City     string `json:"city"`
		Region   string `json:"region"`
		Country  string `json:"country"`
		Postal   string `json:"postal"`
		Loc      string `json:"loc"`
		Timezone string `json:"timezone"`
		Org      string `json:"org"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse IPinfo response: %w", err)
	}

	version := "IPv4"
	if strings.Contains(data.IP, ":") {
		version = "IPv6"
	}

	lat, lon := "", ""
	if parts := strings.SplitN(data.Loc, ",", 2); len(parts) == 2 {
		lat, lon = parts[0], parts[1]
	}

	return &IPInfo{
		IP:          data.IP,
		Version:     version,
		City:        data.City,
		Region:      data.Region,
		CountryName: data.Country,
		CountryCode: data.Country,
		Postal:      data.Postal,
		Latitude:    lat,
		Longitude:   lon,
		Timezone:    data.Timezone,
		Org:         data.Org,
		ASN:         data.Org,
	}, nil
}

func fetchFromIpapi(ip string) (*IPInfo, error) {
	body, err := netFetch(fmt.Sprintf("https://ipapi.co/%s/json/", ip), requests.Options{})
	if err != nil {
		return nil, fmt.Errorf("ipapi request failed: %w", err)
	}
	return parseIpapiResponse(body)
}

func parseIpapiResponse(body []byte) (*IPInfo, error) {
	var data struct {
		IP          string  `json:"ip"`
		Version     string  `json:"version"`
		City        string  `json:"city"`
		Region      string  `json:"region"`
		CountryName string  `json:"country_name"`
		CountryCode string  `json:"country_code"`
		Postal      string  `json:"postal"`
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		Timezone    string  `json:"timezone"`
		Org         string  `json:"org"`
		ASN         string  `json:"asn"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse ipapi response: %w", err)
	}

	return &IPInfo{
		IP:          data.IP,
		Version:     data.Version,
		City:        data.City,
		Region:      data.Region,
		CountryName: data.CountryName,
		CountryCode: data.CountryCode,
		Postal:      data.Postal,
		Latitude:    fmt.Sprintf("%f", data.Latitude),
		Longitude:   fmt.Sprintf("%f", data.Longitude),
		Timezone:    data.Timezone,
		Org:         data.Org,
		ASN:         data.ASN,
	}, nil
}
