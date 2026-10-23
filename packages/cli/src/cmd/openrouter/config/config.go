package config

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	OpenRouterAPIKey string `json:"open_router_api_key"`
	WeatherAPIKey    string `json:"weather_api_key"`
	TelegramBotToken string `json:"telegram_bot_token"`
	GithubToken      string `json:"github_token"`
}

var cached *Config

func configPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("home dir: %w", err)
	}
	return filepath.Join(home, ".omni", "config.json"), nil
}

func Load() (*Config, error) {
	if cached != nil {
		return cached, nil
	}

	path, err := configPath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			cached = &Config{}
			return cached, nil
		}
		return nil, fmt.Errorf("read config: %w", err)
	}

	cfg := &Config{}
	if err := json.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	cached = cfg
	return cfg, nil
}

func OpenRouterKey() string {
	if key := os.Getenv("OPEN_ROUTER_API_KEY"); key != "" {
		return key
	}
	cfg, err := Load()
	if err != nil {
		return ""
	}
	return cfg.OpenRouterAPIKey
}

func LoadAPIKey() string {
	if v := os.Getenv("OPEN_ROUTER_API_KEY"); v != "" {
		return v
	}

	if v := OpenRouterKey(); v != "" {
		return v
	}

	if v := readKeyFromFile(os.ExpandEnv("$HOME/.fr")); v != "" {
		return v
	}

	if v := readKeyFromFile(".env"); v != "" {
		return v
	}

	fmt.Println("OPEN_ROUTER_API_KEY is not set.")
	fmt.Print("Please enter your OpenRouter API key: ")

	reader := bufio.NewReader(os.Stdin)
	key, err := reader.ReadString('\n')
	if err != nil {
		log.Fatal("failed to read API key:", err)
	}

	key = strings.TrimSpace(key)

	if key == "" {
		log.Fatal("API key cannot be empty")
	}

	os.Setenv("OPEN_ROUTER_API_KEY", key)

	return key
}

func readKeyFromFile(path string) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if strings.HasPrefix(line, "OPEN_ROUTER_API_KEY=") {
			return strings.TrimPrefix(line, "OPEN_ROUTER_API_KEY=")
		}
		if strings.HasPrefix(line, "sk-") {
			return line
		}
	}
	return ""
}
