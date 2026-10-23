package weather

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

func detectLocation() (string, error) {
	resp, err := http.Get("https://ipinfo.io/json")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var data struct {
		City string `json:"city"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return "", err
	}
	if data.City == "" {
		return "", fmt.Errorf("could not detect city")
	}
	return data.City, nil
}

func weatherRun(city string, forecast bool, units string, jsonOutput bool) error {
	unitParam := "m"
	switch units {
	case "us", "imperial":
		unitParam = "u"
	case "uk":
		unitParam = "M"
	case "si", "metric":
		unitParam = "m"
	default:
		unitParam = "m"
	}

	var requestURL string
	if forecast {
		requestURL = fmt.Sprintf("https://wttr.in/%s?0&lang=en&%s", city, unitParam)
		if jsonOutput {
			requestURL = fmt.Sprintf("https://wttr.in/%s?format=j1&lang=en&%s", city, unitParam)
		}
	} else {
		if jsonOutput {
			requestURL = fmt.Sprintf("https://wttr.in/%s?format=j1&lang=en&%s", city, unitParam)
		} else {
			requestURL = fmt.Sprintf("https://wttr.in/%s?format=%%C+%%t+%%w+%%h&%s", city, unitParam)
		}
	}

	resp, err := http.Get(requestURL)
	if err != nil {
		return fmt.Errorf("fetch error: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if jsonOutput {
		var data interface{}
		if err := json.Unmarshal(body, &data); err != nil {
			return err
		}
		b, _ := json.MarshalIndent(data, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(strings.TrimSpace(string(body)))
	}
	return nil
}

func WeatherKey() string {
	return os.Getenv("WEATHER_API_KEY")
}

func init() {
	os.Setenv("WTTR_VERBOSE", "0")
}
