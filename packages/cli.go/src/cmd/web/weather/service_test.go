package weather

import (
	"testing"
)

func TestWeatherKey(t *testing.T) {
	t.Setenv("WEATHER_API_KEY", "test-key")
	key := WeatherKey()
	if key != "test-key" {
		t.Errorf("WeatherKey() = %q, want 'test-key'", key)
	}
}
