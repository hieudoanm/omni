package lichess

type LightUser struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Flair       *string `json:"flair,omitempty"`
	Title       *string `json:"title,omitempty"`
	Patron      bool    `json:"patron,omitempty"`
	PatronColor *string `json:"patronColor,omitempty"`
}

type VariantKey string

const (
	VariantStandard   VariantKey = "standard"
	VariantChess960   VariantKey = "chess960"
	VariantCrazyhouse VariantKey = "crazyhouse"
	VariantAntichess  VariantKey = "antichess"
	VariantAtomic     VariantKey = "atomic"
	VariantHorde      VariantKey = "horde"
	VariantKOTH       VariantKey = "kingOfTheHill"
	VariantRacingK    VariantKey = "racingKings"
	VariantThreeCheck VariantKey = "threeCheck"
	VariantFromPos    VariantKey = "fromPosition"
)

type Perfs map[string]Perf

type Perf struct {
	Games  int   `json:"games"`
	Rating int   `json:"rating"`
	Rd     int   `json:"rd"`
	Prog   int   `json:"prog"`
	Prov   *bool `json:"prov,omitempty"`
}

type Profile struct {
	Bio       string `json:"bio,omitempty"`
	Country   string `json:"country,omitempty"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
	Location  string `json:"location,omitempty"`
}

type PlayTime struct {
	Total int `json:"total"`
	Tv    int `json:"tv"`
}
