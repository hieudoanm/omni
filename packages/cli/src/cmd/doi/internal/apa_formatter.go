package internal

import "fmt"

func PrintCitation(data CrossRefData) {
	msg := data.Message

	year := "n.d."
	if len(msg.PublishedPrint.DateParts) > 0 && len(msg.PublishedPrint.DateParts[0]) > 0 {
		year = fmt.Sprintf("%d", msg.PublishedPrint.DateParts[0][0])
	}

	var citation string

	if len(msg.Authors) == 0 {
		citation = fmt.Sprintf("(Unknown, %s)", year)
	} else if len(msg.Authors) == 1 {
		a := msg.Authors[0]
		citation = fmt.Sprintf("(%s, %s)", a.Family, year)
	} else if len(msg.Authors) == 2 {
		a1 := msg.Authors[0].Family
		a2 := msg.Authors[1].Family
		citation = fmt.Sprintf("(%s & %s, %s)", a1, a2, year)
	} else {
		a1 := msg.Authors[0].Family
		citation = fmt.Sprintf("(%s et al., %s)", a1, year)
	}

	fmt.Println("Cite:")
	fmt.Println(citation)
}

func PrintReference(data CrossRefData) {
	msg := data.Message

	var authorsAPA string
	for i, a := range msg.Authors {
		part := fmt.Sprintf("%s, %s.", a.Family, string([]rune(a.Given)[0]))
		if i == 0 {
			authorsAPA += part
		} else if i == len(msg.Authors)-1 {
			authorsAPA += " & " + part
		} else {
			authorsAPA += ", " + part
		}
	}

	var year string
	if len(msg.PublishedPrint.DateParts) > 0 && len(msg.PublishedPrint.DateParts[0]) > 0 {
		year = fmt.Sprintf("%d", msg.PublishedPrint.DateParts[0][0])
	} else {
		year = "n.d."
	}

	var title string
	if len(msg.Title) > 0 {
		title = msg.Title[0]
	}

	var journal string
	if len(msg.ContainerTitle) > 0 {
		journal = msg.ContainerTitle[0]
	}

	pages := msg.Page

	apa := fmt.Sprintf("%s (%s). %s. %s, %s(%s), %s.",
		authorsAPA,
		year,
		title,
		journal,
		msg.Volume,
		msg.Issue,
		pages,
	)

	fmt.Println("APA:")
	fmt.Println(apa)
}
