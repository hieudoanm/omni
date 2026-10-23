package internal

type MatchResponse struct {
	Name        string        `json:"name"`
	URL         string        `json:"url"`
	Description string        `json:"description"`
	StartTime   int64         `json:"start_time"`
	EndTime     int64         `json:"end_time,omitempty"`
	Status      string        `json:"status"`
	Boards      int           `json:"boards"`
	Settings    MatchSettings `json:"settings"`
	Teams       MatchTeams    `json:"teams"`
}

type MatchSettings struct {
	Rules            string `json:"rules"`
	TimeClass        string `json:"time_class"`
	TimeControl      string `json:"time_control"`
	TimeIncrement    int    `json:"time_increment"`
	MinTeamPlayers   int    `json:"min_team_players"`
	MaxTeamPlayers   int    `json:"max_team_players"`
	MinRequiredGames int    `json:"min_required_games"`
	MinRating        int    `json:"min_rating"`
	MaxRating        int    `json:"max_rating"`
	AutoStart        bool   `json:"autostart"`
}

type MatchTeams struct {
	Team1 MatchTeam `json:"team1"`
	Team2 MatchTeam `json:"team2"`
}

type MatchTeam struct {
	ID      string        `json:"@id"`
	Name    string        `json:"name"`
	URL     string        `json:"url,omitempty"`
	Score   float64       `json:"score"`
	Result  string        `json:"result,omitempty"`
	Players []MatchPlayer `json:"players"`
}

type MatchPlayer struct {
	Username       string  `json:"username"`
	Rating         int     `json:"rating"`
	RD             float64 `json:"rd,omitempty"`
	Status         string  `json:"status"`
	Board          string  `json:"board,omitempty"`
	PlayedAsWhite  string  `json:"played_as_white,omitempty"`
	PlayedAsBlack  string  `json:"played_as_black,omitempty"`
	Stats          string  `json:"stats,omitempty"`
	TimeoutPercent float64 `json:"timeout_percent,omitempty"`
}

type MatchBoardResponse struct {
	BoardScores map[string]float64 `json:"board_scores"`
	Games       []MatchBoardGame   `json:"games"`
}

type MatchBoardGame struct {
	URL         string           `json:"url"`
	PGN         string           `json:"pgn"`
	TimeControl string           `json:"time_control"`
	EndTime     int64            `json:"end_time"`
	Rated       bool             `json:"rated"`
	FEN         string           `json:"fen"`
	TimeClass   string           `json:"time_class"`
	Rules       string           `json:"rules"`
	White       MatchBoardPlayer `json:"white"`
	Black       MatchBoardPlayer `json:"black"`
	ECO         string           `json:"eco"`
}

type MatchBoardPlayer struct {
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	Result   string `json:"result"`
	ID       string `json:"@id"`
	Team     string `json:"team,omitempty"`
}
