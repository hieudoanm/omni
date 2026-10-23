package unit

import "strings"

type unitConv struct {
	cat      string
	aliases  []string
	toBase   func(v float64) float64
	fromBase func(v float64) float64
}

var unitTable = []unitConv{
	{"length", []string{"mm", "millimeter", "millimetre"}, func(v float64) float64 { return v / 1000 }, func(v float64) float64 { return v * 1000 }},
	{"length", []string{"cm", "centimeter", "centimetre"}, func(v float64) float64 { return v / 100 }, func(v float64) float64 { return v * 100 }},
	{"length", []string{"m", "meter", "metre"}, func(v float64) float64 { return v }, func(v float64) float64 { return v }},
	{"length", []string{"km", "kilometer", "kilometre"}, func(v float64) float64 { return v * 1000 }, func(v float64) float64 { return v / 1000 }},
	{"length", []string{"in", "inch"}, func(v float64) float64 { return v * 0.0254 }, func(v float64) float64 { return v / 0.0254 }},
	{"length", []string{"ft", "foot", "feet"}, func(v float64) float64 { return v * 0.3048 }, func(v float64) float64 { return v / 0.3048 }},
	{"length", []string{"yd", "yard"}, func(v float64) float64 { return v * 0.9144 }, func(v float64) float64 { return v / 0.9144 }},
	{"length", []string{"mi", "mile"}, func(v float64) float64 { return v * 1609.344 }, func(v float64) float64 { return v / 1609.344 }},

	{"weight", []string{"mg", "milligram"}, func(v float64) float64 { return v / 1e6 }, func(v float64) float64 { return v * 1e6 }},
	{"weight", []string{"g", "gram"}, func(v float64) float64 { return v / 1000 }, func(v float64) float64 { return v * 1000 }},
	{"weight", []string{"kg", "kilogram"}, func(v float64) float64 { return v }, func(v float64) float64 { return v }},
	{"weight", []string{"t", "tonne", "metric-ton"}, func(v float64) float64 { return v * 1000 }, func(v float64) float64 { return v / 1000 }},
	{"weight", []string{"lb", "lbs", "pound"}, func(v float64) float64 { return v * 0.453592 }, func(v float64) float64 { return v / 0.453592 }},
	{"weight", []string{"oz", "ounce"}, func(v float64) float64 { return v * 0.0283495 }, func(v float64) float64 { return v / 0.0283495 }},

	{"temperature", []string{"c", "celsius"}, func(v float64) float64 { return v }, func(v float64) float64 { return v }},
	{"temperature", []string{"f", "fahrenheit"}, func(v float64) float64 { return (v - 32) * 5 / 9 }, func(v float64) float64 { return v*9/5 + 32 }},
	{"temperature", []string{"k", "kelvin"}, func(v float64) float64 { return v - 273.15 }, func(v float64) float64 { return v + 273.15 }},

	{"speed", []string{"m/s", "mps"}, func(v float64) float64 { return v }, func(v float64) float64 { return v }},
	{"speed", []string{"km/h", "kph"}, func(v float64) float64 { return v / 3.6 }, func(v float64) float64 { return v * 3.6 }},
	{"speed", []string{"mph"}, func(v float64) float64 { return v * 0.44704 }, func(v float64) float64 { return v / 0.44704 }},
	{"speed", []string{"kn", "knot", "knots"}, func(v float64) float64 { return v * 0.514444 }, func(v float64) float64 { return v / 0.514444 }},
}

func findUnit(name string) *unitConv {
	name = strings.ToLower(name)
	for i := range unitTable {
		for _, a := range unitTable[i].aliases {
			if a == name {
				return &unitTable[i]
			}
		}
	}
	return nil
}
