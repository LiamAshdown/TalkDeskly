package cmd

import (
	"fmt"
	"live-chat-server/config"
	"live-chat-server/models"
	"live-chat-server/types"
	"live-chat-server/utils"
	"math/rand"
	"strings"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// seedCmd represents the seed command
var seedCmd = &cobra.Command{
	Use:   "seed",
	Short: "Database seeding commands",
	Long: `Run database seeders to populate the database with sample data.
Similar to Laravel Artisan's seeding commands.`,
}

// seedRunCmd runs all seeders
var seedRunCmd = &cobra.Command{
	Use:   "run",
	Short: "Run all database seeders",
	Long:  `Execute all database seeders to populate the database with sample data.`,
	Run: func(cmd *cobra.Command, args []string) {
		runAllSeeders()
	},
}

// seedUsersCmd seeds users table
var seedUsersCmd = &cobra.Command{
	Use:   "users",
	Short: "Seed users table",
	Long:  `Populate the users table with sample user data.`,
	Run: func(cmd *cobra.Command, args []string) {
		seedUsers()
	},
}

// seedCompaniesCmd seeds companies table
var seedCompaniesCmd = &cobra.Command{
	Use:   "companies",
	Short: "Seed companies table",
	Long:  `Populate the companies table with sample company data.`,
	Run: func(cmd *cobra.Command, args []string) {
		seedCompanies()
	},
}

// seedInboxesCmd seeds inboxes table
var seedInboxesCmd = &cobra.Command{
	Use:   "inboxes",
	Short: "Seed inboxes table",
	Long:  `Populate the inboxes table with sample inbox data.`,
	Run: func(cmd *cobra.Command, args []string) {
		seedInboxes()
	},
}

// seedContactsCmd seeds contacts table
var seedContactsCmd = &cobra.Command{
	Use:   "contacts",
	Short: "Seed contacts table",
	Long:  `Populate the contacts table with sample contact data.`,
	Run: func(cmd *cobra.Command, args []string) {
		seedContacts()
	},
}

// seedConversationsCmd seeds conversations table
var seedConversationsCmd = &cobra.Command{
	Use:   "conversations",
	Short: "Seed conversations table",
	Long:  `Populate the conversations table with sample conversation data.`,
	Run: func(cmd *cobra.Command, args []string) {
		seedConversations()
	},
}

// seedClearCmd clears all seeded data
var seedClearCmd = &cobra.Command{
	Use:   "clear",
	Short: "Clear all seeded data",
	Long:  `Remove all seeded data from the database (keeps structure).`,
	Run: func(cmd *cobra.Command, args []string) {
		clearSeedData(cmd)
	},
}

func init() {
	rootCmd.AddCommand(seedCmd)

	// Add subcommands
	seedCmd.AddCommand(seedRunCmd)
	seedCmd.AddCommand(seedUsersCmd)
	seedCmd.AddCommand(seedCompaniesCmd)
	seedCmd.AddCommand(seedInboxesCmd)
	seedCmd.AddCommand(seedContactsCmd)
	seedCmd.AddCommand(seedConversationsCmd)
	seedCmd.AddCommand(seedClearCmd)

	// Add flags
	seedClearCmd.Flags().BoolP("force", "f", false, "Force clear without confirmation")
	seedRunCmd.Flags().IntP("count", "c", 10, "Number of records to seed for each entity")
}

func initSeedDatabase() {
	_ = godotenv.Load()
	config.Load()
	models.ConnectDatabase(config.App.DatabaseDSN)
}

func runAllSeeders() {
	fmt.Println("🌱 Running database seeders...")

	initSeedDatabase()
	gofakeit.Seed(time.Now().UnixNano())

	// Create one main company with admin
	company := createAdminCompany()
	admin := createAdminUser(company.ID)
	fmt.Printf("🔑 Admin created: %s (password: admin)\n", admin.Email)

	// Create more agents for realistic team size
	agentCount := 8
	fmt.Printf("👥 Creating %d agents...\n", agentCount)
	agents := createCompanyAgents(company.ID, agentCount)

	// Create standard set of inboxes
	fmt.Printf("📮 Creating %d inboxes...\n", 8)
	inboxes := createCompanyInboxes(company.ID, 8)

	// Create many contacts for realistic customer base
	contactCount := 25
	fmt.Printf("👤 Creating %d contacts...\n", contactCount)
	contacts := createCompanyContacts(company.ID, contactCount)

	// Create many conversations for realistic workload
	conversationCount := 40
	fmt.Printf("💬 Creating %d conversations...\n", conversationCount)
	createCompanyConversations(inboxes, contacts, agents, conversationCount)

	// Assign agents to inboxes for realistic workflow (including admin)
	fmt.Printf("🔗 Assigning users to inboxes...\n")
	allUsers := append(agents, admin) // Include admin in the assignments
	assignAgentsToInboxes(inboxes, allUsers)

	fmt.Println("\n✅ Seeding completed!")
	fmt.Printf("🔑 Login as: %s / password123\n", admin.Email)
	fmt.Printf("🏢 Company: %s\n", company.Name)
	fmt.Printf("👥 %d agents created\n", len(agents))
	fmt.Printf("📮 %d inboxes created\n", len(inboxes))
	fmt.Printf("👤 %d contacts created\n", len(contacts))
	fmt.Printf("💬 %d conversations created\n", conversationCount)
}

func seedCompanies() {
	fmt.Println("🌱 Seeding companies...")
	initSeedDatabase()
	createSampleCompanies(10)
	fmt.Println("✅ Companies seeded successfully!")
}

func seedUsers() {
	fmt.Println("🌱 Seeding users...")
	initSeedDatabase()
	createSampleUsers(10)
	fmt.Println("✅ Users seeded successfully!")
}

func seedInboxes() {
	fmt.Println("🌱 Seeding inboxes...")
	initSeedDatabase()
	createSampleInboxes(10)
	fmt.Println("✅ Inboxes seeded successfully!")
}

func seedContacts() {
	fmt.Println("🌱 Seeding contacts...")
	initSeedDatabase()
	createSampleContacts(10)
	fmt.Println("✅ Contacts seeded successfully!")
}

func seedConversations() {
	fmt.Println("🌱 Seeding conversations...")
	initSeedDatabase()
	createSampleConversations(10)
	fmt.Println("✅ Conversations seeded successfully!")
}

func createSampleCompanies(count int) {
	// Seed the random generator for consistent but varied results
	gofakeit.Seed(time.Now().UnixNano())

	for i := 0; i < count; i++ {
		companyName := gofakeit.Company()

		company := models.Company{
			ID:        uuid.New().String(),
			Name:      companyName,
			Email:     fmt.Sprintf("contact@%s.com", gofakeit.DomainName()),
			Website:   fmt.Sprintf("https://www.%s.com", gofakeit.DomainName()),
			Phone:     gofakeit.Phone(),
			Address:   gofakeit.Address().Address,
			CreatedAt: time.Now().AddDate(0, 0, -i),
			UpdatedAt: time.Now(),
		}

		if err := models.DB.FirstOrCreate(&company, models.Company{Name: company.Name}).Error; err != nil {
			fmt.Printf("Error creating company %s: %v\n", company.Name, err)
		} else {
			fmt.Printf("  ✓ Created company: %s (%s)\n", company.Name, company.Email)
		}
	}
}

func createSampleUsers(count int) {
	// Get existing companies
	var companies []models.Company
	models.DB.Limit(5).Find(&companies)

	if len(companies) == 0 {
		fmt.Println("⚠️  No companies found. Creating sample companies first...")
		createSampleCompanies(5)
		models.DB.Limit(5).Find(&companies)
	}

	roles := []string{"admin", "agent", "agent", "agent"} // More agents than admins
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)

	for i := 0; i < count; i++ {
		companyID := companies[i%len(companies)].ID
		firstName := gofakeit.FirstName()
		lastName := gofakeit.LastName()
		email := fmt.Sprintf("%s.%s@%s",
			gofakeit.Username(),
			gofakeit.RandomString([]string{"work", "office", "team"}),
			"example.com")

		user := models.User{
			ID:        uuid.New().String(),
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			Password:  string(hashedPassword),
			Role:      roles[i%len(roles)],
			CompanyID: &companyID,
			Language:  gofakeit.RandomString([]string{"en", "es", "fr", "de"}),
			CreatedAt: time.Now().AddDate(0, 0, -i),
			UpdatedAt: time.Now(),
		}

		if err := models.DB.FirstOrCreate(&user, models.User{Email: user.Email}).Error; err != nil {
			fmt.Printf("Error creating user %s: %v\n", user.Email, err)
		} else {
			fmt.Printf("  ✓ Created user: %s %s (%s) - %s\n", user.FirstName, user.LastName, user.Role, user.Email)
		}
	}
}

func createSampleInboxes(count int) {
	// Get existing companies
	var companies []models.Company
	models.DB.Limit(5).Find(&companies)

	if len(companies) == 0 {
		fmt.Println("⚠️  No companies found. Creating sample companies first...")
		createSampleCompanies(5)
		models.DB.Limit(5).Find(&companies)
	}

	inboxTypes := []struct {
		Name string
		Type string
	}{
		{fmt.Sprintf("%s Support", gofakeit.JobTitle()), "email"},
		{fmt.Sprintf("%s Inquiries", gofakeit.JobDescriptor()), "email"},
		{fmt.Sprintf("%s Department", gofakeit.Noun()), "email"},
		{"Live Chat", "webchat"},
		{fmt.Sprintf("%s Team", gofakeit.Adjective()), "email"},
	}

	for i := 0; i < count; i++ {
		template := inboxTypes[i%len(inboxTypes)]
		companyID := companies[i%len(companies)].ID

		// Generate a more realistic inbox name
		inboxName := template.Name
		if i >= len(inboxTypes) {
			inboxName = fmt.Sprintf("%s %s", gofakeit.Adjective(), gofakeit.Noun())
		}

		inbox := models.Inbox{
			ID:          uuid.New().String(),
			Name:        inboxName,
			Description: gofakeit.Sentence(rand.Intn(8) + 5), // 5-12 words
			CompanyID:   companyID,
			Type:        models.InboxType(template.Type),
			Enabled:     gofakeit.Bool(),
			CreatedAt:   time.Now().AddDate(0, 0, -i),
			UpdatedAt:   time.Now(),
		}

		if err := models.DB.FirstOrCreate(&inbox, models.Inbox{Name: inbox.Name, CompanyID: companyID}).Error; err != nil {
			fmt.Printf("Error creating inbox %s: %v\n", inbox.Name, err)
		} else {
			fmt.Printf("  ✓ Created inbox: %s (%s)\n", inbox.Name, inbox.Type)

			// Create inbox-specific records based on type
			if template.Type == "email" {
				createInboxEmail(inbox.ID)
			} else if template.Type == "webchat" {
				createInboxWebChat(inbox.ID)
			}
		}
	}
}

func createInboxEmail(inboxID string) {
	inboxEmail := models.InboxEmail{
		ID:         uuid.New().String(),
		InboxID:    inboxID,
		ImapServer: "imap.example.com",
		ImapPort:   993,
		Username:   fmt.Sprintf("inbox-%s@example.com", inboxID[:8]),
		Password:   "encrypted_password",
		SmtpServer: "smtp.example.com",
		SmtpPort:   587,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	models.DB.Create(&inboxEmail)
}

func createInboxWebChat(inboxID string) {
	inboxWebChat := models.InboxWebChat{
		ID:             uuid.New().String(),
		InboxID:        inboxID,
		WelcomeMessage: "Hello! How can we help you today?",
		WorkingHours: types.WorkingHoursMap{
			"monday":    types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
			"tuesday":   types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
			"wednesday": types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
			"thursday":  types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
			"friday":    types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: true},
			"saturday":  types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: false},
			"sunday":    types.WorkingHours{StartTime: "09:00", EndTime: "17:00", Enabled: false},
		},
		WidgetCustomization: types.WidgetCustomization{
			PrimaryColor: "#0A2540",
			Position:     "bottom-right",
		},
		PreChatForm: types.PreChatForm{
			Enabled:     false,
			Title:       "Contact Information",
			Description: "Please provide your contact information before starting the chat.",
			Fields: []types.PreChatFormField{
				{
					ID:           "field-" + utils.GenerateRandomID(),
					Type:         "text",
					Label:        "Full Name",
					Placeholder:  "Enter your full name",
					Required:     true,
					ContactField: "name",
				},
			},
		},
	}

	models.DB.Create(&inboxWebChat)
}

func createSampleContacts(count int) {
	// Get existing companies
	var companies []models.Company
	models.DB.Limit(5).Find(&companies)

	if len(companies) == 0 {
		fmt.Println("⚠️  No companies found. Creating sample companies first...")
		createSampleCompanies(5)
		models.DB.Limit(5).Find(&companies)
	}

	for i := 0; i < count; i++ {
		companyID := companies[i%len(companies)].ID
		fullName := gofakeit.Name()
		email := gofakeit.Email()
		phone := gofakeit.Phone()
		customerCompany := gofakeit.Company()

		contact := models.Contact{
			ID:        uuid.New().String(),
			Name:      &fullName,
			Email:     &email,
			Phone:     &phone,
			Company:   &customerCompany,
			CompanyID: companyID,
			CreatedAt: time.Now().AddDate(0, 0, -i),
			UpdatedAt: time.Now(),
		}

		if err := models.DB.FirstOrCreate(&contact, models.Contact{Email: contact.Email}).Error; err != nil {
			fmt.Printf("Error creating contact %s: %v\n", *contact.Email, err)
		} else {
			fmt.Printf("  ✓ Created contact: %s (%s) from %s\n", *contact.Name, *contact.Email, *contact.Company)
		}
	}
}

func createSampleConversations(count int) {
	// Get existing data
	var inboxes []models.Inbox
	var contacts []models.Contact
	var users []models.User
	var companies []models.Company

	models.DB.Limit(5).Find(&inboxes)
	models.DB.Limit(10).Find(&contacts)
	models.DB.Where("role = ?", "agent").Limit(5).Find(&users)
	models.DB.Limit(5).Find(&companies)

	if len(inboxes) == 0 || len(contacts) == 0 || len(companies) == 0 {
		fmt.Println("⚠️  Insufficient data. Creating dependencies first...")
		if len(inboxes) == 0 {
			createSampleInboxes(5)
			models.DB.Limit(5).Find(&inboxes)
		}
		if len(contacts) == 0 {
			createSampleContacts(10)
			models.DB.Limit(10).Find(&contacts)
		}
		if len(companies) == 0 {
			createSampleCompanies(5)
			models.DB.Limit(5).Find(&companies)
		}
	}

	statuses := []models.ConversationStatus{
		models.ConversationStatusActive,
		models.ConversationStatusPending,
		models.ConversationStatusResolved,
	}

	for i := 0; i < count; i++ {
		if len(inboxes) == 0 || len(contacts) == 0 || len(companies) == 0 {
			break
		}

		var assigneeID *string
		if len(users) > 0 && i%3 != 0 { // 2/3 of conversations are assigned
			userID := users[i%len(users)].ID
			assigneeID = &userID
		}

		conversation := models.Conversation{
			ID:           uuid.New().String(),
			InboxID:      inboxes[i%len(inboxes)].ID,
			ContactID:    contacts[i%len(contacts)].ID,
			CompanyID:    companies[i%len(companies)].ID,
			AssignedToID: assigneeID,
			Status:       statuses[i%len(statuses)],
			CreatedAt:    time.Now().AddDate(0, 0, -i),
			UpdatedAt:    time.Now(),
		}

		if err := models.DB.Create(&conversation).Error; err != nil {
			fmt.Printf("Error creating conversation: %v\n", err)
		} else {
			fmt.Printf("  ✓ Created conversation #%d (%s)\n", i+1, conversation.Status)

			// Create some sample messages for each conversation
			createSampleMessages(conversation.ID, conversation.ContactID, assigneeID)
		}
	}
}

func createSampleMessages(conversationID, contactID string, assigneeID *string) {
	// Generate realistic conversation messages
	messageTemplates := []string{
		gofakeit.Question(),
		gofakeit.Sentence(rand.Intn(10) + 5),
		fmt.Sprintf("I'm having trouble with %s. Can you help?", gofakeit.Noun()),
		fmt.Sprintf("Thank you for your help with %s!", gofakeit.Verb()),
		gofakeit.HipsterSentence(rand.Intn(8) + 3),
	}

	senderTypes := []models.SenderType{
		models.SenderTypeContact,
		models.SenderTypeAgent,
		models.SenderTypeContact,
		models.SenderTypeAgent,
	}

	numMessages := rand.Intn(6) + 2 // 2-7 messages per conversation

	for i := 0; i < numMessages; i++ {
		senderType := senderTypes[i%len(senderTypes)]
		var senderID *string
		var content string

		if senderType == models.SenderTypeContact {
			senderID = &contactID
			// Customer messages tend to be questions or issues
			content = gofakeit.RandomString(messageTemplates)
		} else if senderType == models.SenderTypeAgent && assigneeID != nil {
			senderID = assigneeID
			// Agent responses tend to be helpful
			content = fmt.Sprintf("Hi! %s. %s",
				gofakeit.Sentence(rand.Intn(5)+3),
				gofakeit.Sentence(rand.Intn(8)+4))
		} else {
			continue // Skip if no agent assigned
		}

		message := models.Message{
			ID:             uuid.New().String(),
			ConversationID: conversationID,
			SenderType:     senderType,
			SenderID:       senderID,
			Type:           models.MessageTypeText,
			Content:        content,
			CreatedAt:      time.Now().Add(time.Duration(-i*rand.Intn(120)) * time.Minute), // Random times
			UpdatedAt:      time.Now(),
		}

		models.DB.Create(&message)
	}
}

func clearSeedData(cmd *cobra.Command) {
	force, _ := cmd.Flags().GetBool("force")

	if !force {
		fmt.Print("⚠️  This will clear all seeded data. Are you sure? (y/N): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Clear operation cancelled.")
			return
		}
	}

	fmt.Println("🧹 Clearing seeded data...")

	initSeedDatabase()

	// Clear in reverse dependency order
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Message{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Conversation{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Contact{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.InboxWebChat{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.InboxEmail{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Inbox{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.User{})
	models.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Company{})

	fmt.Println("✅ All seeded data cleared!")
}

func createAdminCompany() models.Company {
	company := models.Company{
		ID:        uuid.New().String(),
		Name:      gofakeit.Company(),
		Email:     "admin@talkdeskly.com",
		Website:   fmt.Sprintf("https://www.%s.com", gofakeit.DomainName()),
		Phone:     gofakeit.Phone(),
		Address:   gofakeit.Address().Address,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := models.DB.FirstOrCreate(&company, models.Company{Email: company.Email}).Error; err != nil {
		fmt.Printf("Error creating company: %v\n", err)
		panic(err)
	}

	fmt.Printf("🏢 Created company: %s (ID: %s)\n", company.Name, company.ID)
	return company
}

func createAdminUser(companyID string) models.User {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	admin := models.User{
		ID:        uuid.New().String(),
		FirstName: "Admin",
		LastName:  "User",
		Email:     "admin@talkdeskly.com",
		Password:  string(hashedPassword),
		Role:      "admin",
		CompanyID: &companyID,
		Language:  "en",
		NotificationSettings: &models.NotificationSettings{
			NewConversation: true,
			NewMessage:      true,
			Mentions:        true,
			EmailEnabled:    true,
			BrowserEnabled:  false,
		},
	}

	if err := models.DB.FirstOrCreate(&admin, models.User{Email: admin.Email}).Error; err != nil {
		fmt.Printf("Error creating admin user: %v\n", err)
		panic(err)
	}

	fmt.Printf("  ✓ Created admin: %s %s (ID: %s)\n", admin.FirstName, admin.LastName, admin.ID)
	return admin
}

func createCompanyAgents(companyID string, count int) []models.User {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	var agents []models.User

	for i := 0; i < count; i++ {
		firstName := gofakeit.FirstName()
		lastName := gofakeit.LastName()
		email := fmt.Sprintf("%s.%s@talkdeskly.com",
			strings.ToLower(firstName),
			strings.ToLower(lastName))

		agent := models.User{
			ID:        uuid.New().String(),
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			Password:  string(hashedPassword),
			Role:      "agent",
			CompanyID: &companyID,
			Language:  gofakeit.RandomString([]string{"en", "es", "fr"}),
			CreatedAt: time.Now().AddDate(0, 0, -i),
			UpdatedAt: time.Now(),
			NotificationSettings: &models.NotificationSettings{
				NewConversation: true,
				NewMessage:      true,
				Mentions:        true,
				EmailEnabled:    true,
				BrowserEnabled:  false,
			},
		}

		if err := models.DB.FirstOrCreate(&agent, models.User{Email: agent.Email}).Error; err != nil {
			fmt.Printf("Error creating agent %s: %v\n", agent.Email, err)
		} else {
			fmt.Printf("  ✓ Created agent: %s %s (%s)\n", agent.FirstName, agent.LastName, agent.Email)
			agents = append(agents, agent)
		}
	}

	return agents
}

func createCompanyInboxes(companyID string, count int) []models.Inbox {
	var inboxes []models.Inbox

	// Define realistic inbox types
	inboxTemplates := []struct {
		Name string
		Type models.InboxType
	}{
		{"General Support", models.InboxTypeEmail},
		{"Sales Inquiries", models.InboxTypeEmail},
		{"Technical Support", models.InboxTypeEmail},
		{"Live Chat", models.InboxTypeWebChat},
		{"Billing Support", models.InboxTypeEmail},
		{"Customer Success", models.InboxTypeEmail},
		{"Product Feedback", models.InboxTypeEmail},
		{"Emergency Support", models.InboxTypeEmail},
		{"Partnership Inquiries", models.InboxTypeEmail},
		{"VIP Customers", models.InboxTypeEmail},
	}

	for i := 0; i < count && i < len(inboxTemplates); i++ {
		template := inboxTemplates[i]

		inbox := models.Inbox{
			ID:          uuid.New().String(),
			Name:        template.Name,
			Description: fmt.Sprintf("%s - %s", template.Name, gofakeit.Sentence(rand.Intn(6)+4)),
			CompanyID:   companyID,
			Type:        template.Type,
			Enabled:     true, // Keep all enabled for testing
			CreatedAt:   time.Now().AddDate(0, 0, -i),
			UpdatedAt:   time.Now(),
		}

		if err := models.DB.FirstOrCreate(&inbox, models.Inbox{Name: inbox.Name, CompanyID: companyID}).Error; err != nil {
			fmt.Printf("Error creating inbox %s: %v\n", inbox.Name, err)
		} else {
			fmt.Printf("  ✓ Created inbox: %s (%s)\n", inbox.Name, inbox.Type)
			inboxes = append(inboxes, inbox)

			createInboxWebChat(inbox.ID)

			// Create inbox-specific records
			// TODO; Finish implementing email chat
			// if template.Type == models.InboxTypeEmail {
			// 	createInboxEmail(inbox.ID)
			// } else if template.Type == models.InboxTypeWebChat {
			// 	createInboxWebChat(inbox.ID)
			// }
		}
	}

	return inboxes
}

func createCompanyContacts(companyID string, count int) []models.Contact {
	var contacts []models.Contact

	for i := 0; i < count; i++ {
		fullName := gofakeit.Name()
		email := gofakeit.Email()
		phone := gofakeit.Phone()
		customerCompany := gofakeit.Company()

		contact := models.Contact{
			ID:        uuid.New().String(),
			Name:      &fullName,
			Email:     &email,
			Phone:     &phone,
			Company:   &customerCompany,
			CompanyID: companyID,
			CreatedAt: time.Now().AddDate(0, 0, -i),
			UpdatedAt: time.Now(),
		}

		if err := models.DB.FirstOrCreate(&contact, models.Contact{Email: contact.Email}).Error; err != nil {
			fmt.Printf("Error creating contact %s: %v\n", *contact.Email, err)
		} else {
			fmt.Printf("  ✓ Created contact: %s (%s)\n", *contact.Name, *contact.Email)
			contacts = append(contacts, contact)
		}
	}

	return contacts
}

func createCompanyConversations(inboxes []models.Inbox, contacts []models.Contact, agents []models.User, count int) {
	if len(inboxes) == 0 || len(contacts) == 0 {
		fmt.Println("⚠️  No inboxes or contacts available for conversations")
		return
	}

	statuses := []models.ConversationStatus{
		models.ConversationStatusActive,
		models.ConversationStatusPending,
		models.ConversationStatusResolved,
	}

	for i := 0; i < count; i++ {
		// Assign 80% of conversations to agents, 20% unassigned
		var assigneeID *string
		if len(agents) > 0 && rand.Float32() < 0.8 {
			agent := agents[rand.Intn(len(agents))]
			assigneeID = &agent.ID
		}

		conversation := models.Conversation{
			ID:           uuid.New().String(),
			InboxID:      inboxes[rand.Intn(len(inboxes))].ID,
			ContactID:    contacts[rand.Intn(len(contacts))].ID,
			CompanyID:    inboxes[0].CompanyID, // All inboxes belong to same company
			AssignedToID: assigneeID,
			Status:       statuses[rand.Intn(len(statuses))],
			CreatedAt:    time.Now().AddDate(0, 0, -rand.Intn(30)), // Random date within last 30 days
			UpdatedAt:    time.Now(),
		}

		if err := models.DB.Create(&conversation).Error; err != nil {
			fmt.Printf("Error creating conversation: %v\n", err)
		} else {
			fmt.Printf("  ✓ Created conversation #%d (%s)\n", i+1, conversation.Status)

			// Create realistic messages for the conversation
			createSampleMessages(conversation.ID, conversation.ContactID, assigneeID)
		}
	}
}

func assignAgentsToInboxes(inboxes []models.Inbox, users []models.User) {
	if len(inboxes) == 0 || len(users) == 0 {
		fmt.Println("⚠️  No inboxes or users available for assignment")
		return
	}

	// Separate admins from regular agents
	var admins []models.User
	var agents []models.User

	for _, user := range users {
		if user.Role == "admin" {
			admins = append(admins, user)
		} else {
			agents = append(agents, user)
		}
	}

	// Assign admins to ALL inboxes
	for _, inbox := range inboxes {
		var inboxUsers []models.User

		// Add all admins to every inbox
		inboxUsers = append(inboxUsers, admins...)

		// Add 2-4 regular agents per inbox for realistic coverage
		if len(agents) > 0 {
			agentsPerInbox := rand.Intn(3) + 2 // 2-4 agents

			// Make sure we don't assign more agents than we have
			if agentsPerInbox > len(agents) {
				agentsPerInbox = len(agents)
			}

			// Start from different agent each time to distribute evenly
			startIdx := (len(inboxUsers) * 2) % len(agents)

			usedIndices := make(map[int]bool)

			for j := 0; j < agentsPerInbox; j++ {
				agentIdx := (startIdx + j) % len(agents)

				// Avoid duplicates within the same inbox
				if !usedIndices[agentIdx] {
					inboxUsers = append(inboxUsers, agents[agentIdx])
					usedIndices[agentIdx] = true
				}
			}
		}

		// Use GORM's Association to create the many-to-many relationship
		if err := models.DB.Model(&inbox).Association("Users").Append(inboxUsers); err != nil {
			fmt.Printf("Error assigning users to inbox %s: %v\n", inbox.Name, err)
		} else {
			adminCount := len(admins)
			agentCount := len(inboxUsers) - adminCount
			fmt.Printf("  ✓ Assigned %d admin(s) + %d agent(s) to %s\n", adminCount, agentCount, inbox.Name)
		}
	}
}
