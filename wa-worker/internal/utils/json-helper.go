package utils

import (
	"bytes"
	"encoding/json"
)

func MakeJsonBody(values map[string]string) *bytes.Buffer {
	jsonValue, _ := json.Marshal(values)
	res := bytes.NewBuffer(jsonValue)
	return res
}
