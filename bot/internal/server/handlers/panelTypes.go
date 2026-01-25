package handlers

type PanelInfo struct {
	ID        string     `json:"id"`
	Title     string     `json:"title"`
	BtnText   string     `json:"btnText"`
	BtnColor  string     `json:"btnColor"`
	BtnEmoji  *string    `json:"btnEmoji"`
	Questions *Questions `json:"questions"`
}

type QuestionItem struct {
	ID     string `json:"id"`
	Prompt string `json:"prompt"`
}

type Questions struct {
	AskQuestions bool           `json:"askQuestions"`
	Questions    []QuestionItem `json:"questions"`
}

type EmbedInfo struct {
	Color       string  `json:"color"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Author      *struct {
		Name    string  `json:"name"`
		URL     *string `json:"url"`
		IconURL *string `json:"iconURL"`
	} `json:"author"`
	Image *struct {
		URL string `json:"url"`
	} `json:"image"`
	Thumbnail *struct {
		URL string `json:"url"`
	} `json:"thumbnail"`
	Footer *struct {
		Text    string  `json:"text"`
		IconURL *string `json:"iconURL"`
	} `json:"footer"`
}

type SendMultiPanelRequest struct {
	GuildID             string      `json:"guildId"`
	ChannelID           string      `json:"channelId"`
	Panels              []PanelInfo `json:"panels"`
	UseDropdown         bool        `json:"useDropdown"`
	DropdownPlaceholder string      `json:"dropdownPlaceholder"`
	Embed               EmbedInfo   `json:"embed"`
}

type SendMultiPanelResponse struct {
	MessageID string `json:"messageId"`
}

type SendPanelRequest struct {
	PanelID     string     `json:"panelId"`
	ServerID    string     `json:"serverId"`
	ChannelID   string     `json:"channelId"`
	Title       string     `json:"title"`
	Content     string     `json:"content"`
	Color       string     `json:"color"`
	BtnColor    string     `json:"btnColor"`
	BtnText     string     `json:"btnText"`
	BtnEmoji    *string    `json:"btnEmoji"`
	LargeImgUrl *string    `json:"largeImgUrl"`
	SmallImgUrl *string    `json:"smallImgUrl"`
	Questions   *Questions `json:"questions"`
}

type SendPanelResponse struct {
	MessageID string `json:"messageId"`
}