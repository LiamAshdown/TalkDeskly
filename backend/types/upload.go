package types

type UploadResult struct {
	Filename  string `json:"filename"`
	Path      string `json:"path"`
	Size      int64  `json:"size"`
	Type      string `json:"type"`
	Extension string `json:"extension"`
}
