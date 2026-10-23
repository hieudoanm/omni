package internal

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"strings"
	"time"
)

type CertJSON struct {
	Subject       string   `json:"subject"`
	Issuer        string   `json:"issuer"`
	Serial        string   `json:"serial"`
	Version       int      `json:"version"`
	NotBefore     string   `json:"notBefore"`
	NotAfter      string   `json:"notAfter"`
	Expired       bool     `json:"expired"`
	Remaining     string   `json:"remaining"`
	DNSNames      []string `json:"dnsNames,omitempty"`
	IPAddresses   []string `json:"ipAddresses,omitempty"`
	SignatureAlgo string   `json:"signatureAlgorithm"`
	PublicKeyAlgo string   `json:"publicKeyAlgorithm"`
}

type CertCheck struct {
	Host      string   `json:"host"`
	Subject   string   `json:"subject"`
	Issuer    string   `json:"issuer"`
	NotAfter  string   `json:"notAfter"`
	Remaining string   `json:"remaining"`
	Status    string   `json:"status"`
	DNSNames  []string `json:"dnsNames"`
	DNSCount  int      `json:"dnsNamesCount"`
}

type TLSConn interface {
	ConnectionState() tls.ConnectionState
	Close() error
}

var CertDialFn = DialTLS

func DialTLS(host string) (TLSConn, error) {
	if _, _, err := net.SplitHostPort(host); err != nil {
		host = net.JoinHostPort(host, "443")
	}
	conn, err := tls.Dial("tcp", host, &tls.Config{InsecureSkipVerify: true})
	if err != nil {
		return nil, fmt.Errorf("connection failed: %w", err)
	}
	return conn, nil
}

func PrintJSON(v interface{}) {
	b, _ := json.MarshalIndent(v, "", "  ")
	fmt.Println(string(b))
}

func FormatCerts(certs []*x509.Certificate) []CertJSON {
	now := time.Now()
	var result []CertJSON
	for _, c := range certs {
		remaining := c.NotAfter.Sub(now)
		ips := make([]string, len(c.IPAddresses))
		for i, ip := range c.IPAddresses {
			ips[i] = ip.String()
		}
		result = append(result, CertJSON{
			Subject:       c.Subject.String(),
			Issuer:        c.Issuer.String(),
			Serial:        c.SerialNumber.String(),
			Version:       c.Version,
			NotBefore:     c.NotBefore.Format("2006-01-02 15:04:05"),
			NotAfter:      c.NotAfter.Format("2006-01-02 15:04:05"),
			Expired:       remaining < 0,
			Remaining:     remaining.Round(time.Second).String(),
			DNSNames:      c.DNSNames,
			IPAddresses:   ips,
			SignatureAlgo: c.SignatureAlgorithm.String(),
			PublicKeyAlgo: c.PublicKeyAlgorithm.String(),
		})
	}
	return result
}

func PrintCertInfo(certs []CertJSON) {
	for i, c := range certs {
		fmt.Printf("── Certificate %d ──────────────────────\n", i+1)
		fmt.Printf("Subject   : %s\n", c.Subject)
		fmt.Printf("Issuer    : %s\n", c.Issuer)
		fmt.Printf("Serial    : %s\n", c.Serial)
		fmt.Printf("Version   : %d\n", c.Version)

		fmt.Printf("\nValidity:\n")
		fmt.Printf("  Not Before: %s\n", c.NotBefore)
		fmt.Printf("  Not After : %s\n", c.NotAfter)
		if c.Expired {
			fmt.Printf("  Status    : EXPIRED (%s ago)\n", c.Remaining)
		} else {
			fmt.Printf("  Status    : Valid (%s remaining)\n", c.Remaining)
		}

		if len(c.DNSNames) > 0 {
			fmt.Printf("\nDNS Names:\n")
			for _, n := range c.DNSNames {
				fmt.Printf("  - %s\n", n)
			}
		}
		if len(c.IPAddresses) > 0 {
			fmt.Printf("\nIP Addresses:\n")
			for _, ip := range c.IPAddresses {
				fmt.Printf("  - %s\n", ip)
			}
		}
		fmt.Printf("\nSignature Algorithm: %s\n", c.SignatureAlgo)
		fmt.Printf("Public Key Algorithm: %s\n", c.PublicKeyAlgo)
		fmt.Println()
	}
}

func BuildCertCheck(host string, remaining time.Duration, dnsNames []string) CertCheck {
	status := "valid"
	if remaining < 0 {
		status = "expired"
	} else if remaining < 30*24*time.Hour {
		status = "expiring_soon"
	}
	return CertCheck{
		Host:      host,
		Remaining: remaining.String(),
		Status:    status,
		DNSNames:  dnsNames,
		DNSCount:  len(dnsNames),
	}
}

func PrintCertCheck(c CertCheck) {
	fmt.Printf("Host      : %s\n", c.Host)
	fmt.Printf("Status    : ")
	if c.Status == "expired" {
		fmt.Printf("EXPIRED\n")
	} else if c.Status == "expiring_soon" {
		fmt.Printf("Expiring soon\n")
	} else {
		fmt.Printf("Valid\n")
	}
	fmt.Printf("SANs      : %d DNS names\n", c.DNSCount)
}

func CaptureOutput(f func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	f()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return strings.TrimRight(string(out), "\n")
}
