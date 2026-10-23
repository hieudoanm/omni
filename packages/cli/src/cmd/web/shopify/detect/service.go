package detect

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/colors"
)

func detectRun(args []string, verbose, jsonOutput bool) error {
	var url string

	if len(args) == 1 {
		url = args[0]
	} else {
		fmt.Print("Enter website URL: ")
		reader := bufio.NewReader(os.Stdin)
		input, err := reader.ReadString('\n')
		if err != nil {
			return fmt.Errorf("failed to read input")
		}
		url = strings.TrimSpace(input)
	}

	if url == "" {
		return fmt.Errorf("URL is required")
	}

	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "https://" + url
	}

	isShopify, isPlus, signals, err := checkShopify(url)
	if err != nil {
		return fmt.Errorf("error checking shopify: %w", err)
	}

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"url":     url,
			"shopify": isShopify,
			"plus":    isPlus,
			"signals": signals,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	if !isShopify {
		return fmt.Errorf("shopify not detected")
	}

	fmt.Println(colors.Green("Shopify detected"))

	if isPlus {
		fmt.Println(colors.Green("Shopify Plus detected"))
	} else {
		fmt.Println(colors.Yellow("Shopify Plus not detected"))
	}

	if verbose {
		fmt.Println(colors.Dim("\nSignals:"))
		for _, s := range signals {
			fmt.Println(colors.Dim(" - " + s))
		}
	}
	return nil
}

func checkShopify(url string) (isShopify bool, isPlus bool, signals []string, err error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return
	}

	req.Header.Set("User-Agent", "shopify-check/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	for key, values := range resp.Header {
		lk := strings.ToLower(key)

		if strings.HasPrefix(lk, "x-shopify") {
			isShopify = true
			signals = append(signals, "Header: "+key)

			if lk == "x-shopify-stage" || lk == "x-shopify-shop-api-call-limit" {
				isPlus = true
			}
		}

		for _, v := range values {
			lv := strings.ToLower(v)
			if strings.Contains(lv, "shopify") {
				isShopify = true
				signals = append(signals, "Header value: "+key)
			}
		}
	}

	buf := make([]byte, 16*1024)
	n, _ := resp.Body.Read(buf)
	html := strings.ToLower(string(buf[:n]))

	if strings.Contains(html, "cdn.shopify.com") {
		isShopify = true
		signals = append(signals, "HTML: cdn.shopify.com")
	}

	if strings.Contains(html, "shopify-section") {
		isShopify = true
		signals = append(signals, "HTML: shopify-section")
	}

	if strings.Contains(html, "shopify-plus") {
		isPlus = true
		signals = append(signals, "HTML: shopify-plus")
	}

	return
}
