import EditInbox from "@/components/protected/settings/inbox/edit/edit-inbox";
import { useParams } from "react-router-dom";

export default function EditInboxPage() {
  const { id } = useParams();
  if (!id) {
    return <div>No id provided</div>;
  }
  return <EditInbox id={id} />;
}
