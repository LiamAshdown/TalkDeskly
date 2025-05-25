import { contactsService } from "@/lib/api/services/contacts";
import type { Contact, Conversation } from "@/lib/interfaces";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface PreviousConversationsProps {
  contact: Contact;
  activeConversationId: string;
}

export function PreviousConversations({
  contact,
  activeConversationId,
}: PreviousConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await contactsService.getContactConversations(
          contact.id
        );

        setConversations(
          response.data.filter(
            (conv) => conv.conversationId !== activeConversationId
          )
        );
      } catch {
        // Catched in axios
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [contact.id]);

  return (
    <div>
      <h3 className="font-semibold mb-2">{t("contacts.previous.title")}</h3>
      <ul className="space-y-2">
        {isLoading ? (
          <ScrollableContainer>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-muted/50">
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollableContainer>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("contacts.previous.noConversations")}
          </p>
        ) : (
          conversations.map((conv, index) => (
            <li key={index} className="text-sm">
              <Link
                to={`/portal/conversations/${conv.conversationId}`}
                className="p-0 h-auto text-sm hover:underline"
              >
                {conv.inbox.name} - {format(conv.lastMessageAt, "MM/dd/yyyy")}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
