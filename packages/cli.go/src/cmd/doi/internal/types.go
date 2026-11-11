package internal

type Author struct {
	Given  string `json:"given"`
	Family string `json:"family"`
}

type Message struct {
	Authors        []Author `json:"author"`
	Title          []string `json:"title"`
	ContainerTitle []string `json:"container-title"`
	Volume         string   `json:"volume"`
	Issue          string   `json:"issue"`
	Page           string   `json:"page"`
	PublishedPrint struct {
		DateParts [][]int `json:"date-parts"`
	} `json:"published-print"`
}

type CrossRefData struct {
	Status  string  `json:"status"`
	Message Message `json:"message"`
}
