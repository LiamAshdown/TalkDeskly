import type {
  Conversation,
  Contact,
  Message,
  Note,
  Inbox,
  TeamInbox,
} from "@/types/chat";

const mockMessages: Message[] = [
  {
    content:
      "Hello, I'm having an issue with my recent order #12345. Can you help me?",
    time: "10:30 AM",
    isAgent: false,
  },
  {
    content:
      "Hi there! I'd be happy to help you with your order. Could you please provide more details about the issue you're experiencing?",
    time: "10:32 AM",
    isAgent: true,
  },
  {
    content:
      "The product arrived damaged. The packaging was torn and the item inside has scratches.",
    time: "10:33 AM",
    isAgent: false,
  },
  {
    content:
      "I'm sorry to hear that. I understand how frustrating that must be. I'll help you get this resolved right away. Could you please upload a photo of the damaged item?",
    time: "10:35 AM",
    isAgent: true,
  },
  {
    content:
      "Sure, I'll take a photo and send it shortly. What are the next steps after that?",
    time: "10:36 AM",
    isAgent: false,
  },
  {
    content:
      "Once you send the photo, I'll process a replacement order for you immediately. You won't need to return the damaged item. The replacement should arrive within 2-3 business days. Would that work for you?",
    time: "10:38 AM",
    isAgent: true,
  },
];

const mockMessages2: Message[] = [
  {
    content: "When will my order be shipped?",
    time: "9:45 AM",
    isAgent: false,
  },
  {
    content: "Let me check that for you. Could you provide your order number?",
    time: "9:47 AM",
    isAgent: true,
  },
  {
    content: "It's #54321",
    time: "9:48 AM",
    isAgent: false,
  },
  {
    content:
      "Thank you. I can see your order is being processed and should ship within 24 hours.",
    time: "9:50 AM",
    isAgent: true,
  },
];

export const mockInboxes: Inbox[] = [
  {
    id: "inbox1",
    name: "Website Chat",
    type: "web",
    unreadCount: 3,
    isActive: true,
  },
  {
    id: "inbox2",
    name: "Facebook",
    type: "facebook",
    unreadCount: 1,
    isActive: true,
  },
  {
    id: "inbox3",
    name: "WhatsApp",
    type: "whatsapp",
    unreadCount: 0,
    isActive: true,
  },
  {
    id: "inbox4",
    name: "Email Support",
    type: "email",
    unreadCount: 2,
    isActive: true,
  },
];

export const mockTeamInboxes: TeamInbox[] = [
  {
    id: "inbox1",
    name: "Support",
    icon: "rocket",
    unreadCount: 2,
    isActive: true,
    description: "General customer support inquiries",
    createdAt: "2023-01-15",
    members: ["agent1", "agent2", "agent3"],
  },
  {
    id: "inbox2",
    name: "Sales",
    icon: "trending-up",
    unreadCount: 1,
    isActive: true,
    description: "Sales and pricing inquiries",
    createdAt: "2023-02-01",
    members: ["agent4", "agent5"],
  },
  {
    id: "inbox3",
    name: "Engineering",
    icon: "wrench",
    unreadCount: 3,
    isActive: true,
    description: "Technical support and bug reports",
    createdAt: "2023-03-10",
    members: ["agent6", "agent7"],
  },
  {
    id: "inbox4",
    name: "Escalation",
    icon: "alert-triangle",
    unreadCount: 2,
    isActive: true,
    description: "High-priority escalated issues",
    createdAt: "2023-04-15",
    members: ["agent8", "agent9"],
  },
  {
    id: "inbox5",
    name: "Tier-1 Support",
    icon: "flame",
    unreadCount: 1,
    isActive: true,
    description: "First level support triage",
    createdAt: "2023-05-01",
    members: ["agent10", "agent11"],
  },
];

// Update the mockConversations array to associate conversations with different inboxes

// First, let's modify the mockConversationsOriginal array to distribute conversations across different inboxes
const mockConversationsOriginal: Conversation[] = [
  {
    id: "conv1",
    contactId: "contact1",
    contactName: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I'll process a replacement order for you immediately.",
    time: "10:38 AM",
    status: "active",
    unread: 0,
    inboxId: "inbox1",
    messages: mockMessages,
  },
  {
    id: "conv2",
    contactId: "contact2",
    contactName: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "When will my order be shipped?",
    time: "9:45 AM",
    status: "active",
    unread: 2,
    inboxId: "inbox1",
    messages: mockMessages2,
  },
  {
    id: "conv3",
    contactId: "contact3",
    contactName: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for your help!",
    time: "Yesterday",
    status: "closed",
    unread: 0,
    inboxId: "inbox2",
  },
  {
    id: "conv4",
    contactId: "contact4",
    contactName: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I need to change my shipping address.",
    time: "Yesterday",
    status: "pending",
    unread: 1,
    inboxId: "inbox3",
  },
  {
    id: "conv5",
    contactId: "contact5",
    contactName: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Is there a discount code available?",
    time: "2 days ago",
    status: "closed",
    unread: 0,
    inboxId: "inbox4",
  },
];

// Now let's create more conversations for different inboxes
const additionalConversations: Conversation[] = [
  {
    id: "conv6",
    contactId: "contact1",
    contactName: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I have a question about my recent purchase.",
    time: "11:20 AM",
    status: "active",
    unread: 1,
    inboxId: "inbox2",
    teamInboxId: "inbox2",
  },
  {
    id: "conv7",
    contactId: "contact3",
    contactName: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can you provide a quote for 100 units?",
    time: "Yesterday",
    status: "active",
    unread: 0,
    inboxId: "inbox2",
    teamInboxId: "inbox2",
  },
  {
    id: "conv8",
    contactId: "contact4",
    contactName: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "The API integration is not working correctly.",
    time: "3 days ago",
    status: "active",
    unread: 3,
    inboxId: "inbox3",
    teamInboxId: "inbox3",
  },
  {
    id: "conv9",
    contactId: "contact5",
    contactName: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "This is a critical issue that needs immediate attention.",
    time: "1 hour ago",
    status: "pending",
    unread: 2,
    inboxId: "inbox4",
    teamInboxId: "inbox4",
  },
  {
    id: "conv10",
    contactId: "contact2",
    contactName: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I need help with setting up my account.",
    time: "Just now",
    status: "active",
    unread: 1,
    inboxId: "inbox5",
    teamInboxId: "inbox5",
  },
];

// Combine original and additional conversations
export const mockConversations: Conversation[] = [
  ...mockConversationsOriginal.map((conv) => ({
    ...conv,
    teamInboxId: conv.inboxId, // Map inboxId to teamInboxId for consistency
  })),
  ...additionalConversations,
];

const mockNotes: Note[] = [
  {
    id: "note1",
    content: "Customer prefers email communication over phone calls.",
    createdAt: "March 15, 2023",
    createdBy: "Agent Smith",
  },
  {
    id: "note2",
    content:
      "Has had issues with shipping in the past. Consider expedited shipping for future orders.",
    createdAt: "April 2, 2023",
    createdBy: "Agent Johnson",
  },
];

export const mockContacts: Contact[] = [
  {
    id: "contact1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc.",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "New York, NY",
    customerSince: "January 15, 2023",
    previousConversations: [
      {
        id: "prev1",
        topic: "Order Refund",
        date: "March 10, 2023",
      },
      {
        id: "prev2",
        topic: "Account Setup",
        date: "January 15, 2023",
      },
    ],
    notes: mockNotes,
  },
  {
    id: "contact2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 987-6543",
    company: "Johnson & Co",
    avatar: "/placeholder.svg?height=80&width=80",
    customerSince: "February 22, 2023",
    notes: [],
  },
  {
    id: "contact3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 456-7890",
    company: "Brown Enterprises",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Chicago, IL",
    customerSince: "November 5, 2022",
    notes: [],
  },
  {
    id: "contact4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 234-5678",
    company: "Davis Design",
    avatar: "/placeholder.svg?height=80&width=80",
    customerSince: "March 18, 2023",
    notes: [],
  },
  {
    id: "contact5",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+1 (555) 876-5432",
    company: "Wilson Tech",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Austin, TX",
    customerSince: "December 10, 2022",
    notes: [],
  },
];
