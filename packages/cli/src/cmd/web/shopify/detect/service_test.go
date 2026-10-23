package detect

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestDetectRun_EmptyURL(t *testing.T) {
	err := detectRun([]string{""}, false, false)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "URL is required") {
		t.Errorf("expected 'URL is required' error, got %v", err)
	}
}

func TestCheckShopify_Detected(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Shopify-Stage", "production")
		w.Write([]byte(`<html>cdn.shopify.com</html>`))
	}))
	defer server.Close()

	isShopify, isPlus, signals, err := checkShopify(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	if !isShopify {
		t.Error("expected shopify detected")
	}
	if !isPlus {
		t.Error("expected shopify plus detected")
	}
	if len(signals) == 0 {
		t.Error("expected signals")
	}
}

func TestCheckShopify_NotDetected(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`<html>plain website</html>`))
	}))
	defer server.Close()

	isShopify, isPlus, _, err := checkShopify(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	if isShopify {
		t.Error("expected no shopify detected")
	}
	if isPlus {
		t.Error("expected no shopify plus detected")
	}
}

func TestCheckShopify_HTMLSignals(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`<html>shopify-section content</html>`))
	}))
	defer server.Close()

	isShopify, _, signals, err := checkShopify(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	if !isShopify {
		t.Error("expected shopify detected from HTML signal")
	}
	var found bool
	for _, s := range signals {
		if strings.Contains(s, "shopify-section") {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected shopify-section signal")
	}
}
