package email

import (
	"fmt"

	"github.com/go-gomail/gomail"
)

type GoMailProvider struct {
	BaseEmailProvider
	Host     string
	Port     int
	Username string
	Password string
	From     string
	dialer   *gomail.Dialer
}

func (g *GoMailProvider) Connect() error {
	g.dialer = gomail.NewDialer(g.Host, g.Port, g.Username, g.Password)
	_, err := g.dialer.Dial()

	if err != nil {
		return fmt.Errorf("Failed to connect: %v", err)
	}

	return nil
}

func (g *GoMailProvider) Send(to string, subject string, body string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", g.From)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", body)

	return g.dialer.DialAndSend(msg)
}
