package dns

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"strings"
	"time"
)

type dnsResult struct {
	Domain string   `json:"domain"`
	A      []string `json:"a,omitempty"`
	AAAA   []string `json:"aaaa,omitempty"`
	CNAME  string   `json:"cname,omitempty"`
	MX     []string `json:"mx,omitempty"`
	NS     []string `json:"ns,omitempty"`
	TXT    []string `json:"txt,omitempty"`
}

var (
	dnsJSON       bool
	dnsLookupHost = func(ctx context.Context, host string) ([]string, error) {
		return net.DefaultResolver.LookupHost(ctx, host)
	}
	dnsLookupCNAME = func(ctx context.Context, host string) (string, error) {
		return net.DefaultResolver.LookupCNAME(ctx, host)
	}
	dnsLookupMX = func(ctx context.Context, name string) ([]*net.MX, error) {
		return net.DefaultResolver.LookupMX(ctx, name)
	}
	dnsLookupNS = func(ctx context.Context, name string) ([]*net.NS, error) {
		return net.DefaultResolver.LookupNS(ctx, name)
	}
	dnsLookupTXT = func(ctx context.Context, name string) ([]string, error) {
		return net.DefaultResolver.LookupTXT(ctx, name)
	}
)

func dnsRun(domain string, recordType string) error {
	result := dnsResult{Domain: domain}
	types := []string{"a", "aaaa", "cname", "mx", "ns", "txt"}

	if recordType != "" {
		types = []string{strings.ToLower(recordType)}
	}

	for _, t := range types {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		switch t {
		case "a":
			ips, err := dnsLookupHost(ctx, result.Domain)
			cancel()
			if err == nil {
				for _, ip := range ips {
					if net.ParseIP(ip).To4() != nil {
						result.A = append(result.A, ip)
					}
				}
			}
		case "aaaa":
			ips, err := dnsLookupHost(ctx, result.Domain)
			cancel()
			if err == nil {
				for _, ip := range ips {
					if net.ParseIP(ip).To4() == nil {
						result.AAAA = append(result.AAAA, ip)
					}
				}
			}
		case "cname":
			cname, err := dnsLookupCNAME(ctx, result.Domain)
			cancel()
			if err == nil {
				result.CNAME = strings.TrimRight(cname, ".")
			}
		case "mx":
			mxs, err := dnsLookupMX(ctx, result.Domain)
			cancel()
			if err == nil {
				for _, mx := range mxs {
					host := strings.TrimRight(mx.Host, ".")
					if host == "" {
						continue
					}
					result.MX = append(result.MX, fmt.Sprintf("%s (priority %d)", host, mx.Pref))
				}
			}
		case "ns":
			nss, err := dnsLookupNS(ctx, result.Domain)
			cancel()
			if err == nil {
				for _, ns := range nss {
					host := strings.TrimRight(ns.Host, ".")
					if host == "" {
						continue
					}
					result.NS = append(result.NS, host)
				}
			}
		case "txt":
			txts, err := dnsLookupTXT(ctx, result.Domain)
			cancel()
			if err == nil {
				result.TXT = txts
			}
		default:
			cancel()
			return fmt.Errorf("unsupported record type: %s", t)
		}
	}

	if dnsJSON {
		b, _ := json.MarshalIndent(result, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("Domain: %s\n", result.Domain)
		if len(result.A) > 0 {
			fmt.Printf("A:      %s\n", strings.Join(result.A, ", "))
		}
		if len(result.AAAA) > 0 {
			fmt.Printf("AAAA:   %s\n", strings.Join(result.AAAA, ", "))
		}
		if result.CNAME != "" {
			fmt.Printf("CNAME:  %s\n", result.CNAME)
		}
		if len(result.MX) > 0 {
			fmt.Printf("MX:     %s\n", strings.Join(result.MX, ", "))
		}
		if len(result.NS) > 0 {
			fmt.Printf("NS:     %s\n", strings.Join(result.NS, ", "))
		}
		if len(result.TXT) > 0 {
			fmt.Printf("TXT:    %s\n", strings.Join(result.TXT, ", "))
		}
		if result.A == nil && result.AAAA == nil && result.CNAME == "" && result.MX == nil && result.NS == nil && result.TXT == nil {
			fmt.Println("(no records found)")
		}
	}
	return nil
}
