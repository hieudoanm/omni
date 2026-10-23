package weather

import (
	"fmt"

	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var forecast bool
	var city, units string

	cmd := &cobra.Command{
		Use:   "weather [city]",
		Short: "Check current weather for a city",
		Long:  `Get current weather conditions using wttr.in (free, no API key needed).`,
		Example: `  weather London
  weather "Ho Chi Minh City"
  weather --forecast Tokyo
  weather --json London
  weather --units us "New York"`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) > 0 {
				city = args[0]
			}
			if city == "" && !forecast {
				ipCity, err := detectLocation()
				if err == nil {
					city = ipCity
				}
			}
			if city == "" {
				return fmt.Errorf("provide a city name")
			}

			jsonOutput, _ := cmd.Flags().GetBool("json")
			return weatherRun(city, forecast, units, jsonOutput)
		},
	}

	cmd.Flags().BoolVarP(&forecast, "forecast", "f", false, "Show 3-day forecast")
	cmd.Flags().BoolP("json", "j", false, "Output in JSON format")
	cmd.Flags().StringVarP(&units, "units", "u", "metric", "Units: metric, imperial, uk")
	return cmd
}
