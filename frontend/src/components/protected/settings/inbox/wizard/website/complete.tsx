import { Button } from "@/components/ui/button";
import { Inbox } from "@/lib/interfaces";
import { CodeBlock } from "@/components/ui/code-block";
import { useTranslation } from "react-i18next";

interface CompleteProps {
  inbox: Inbox;
}

export function Complete({ inbox }: CompleteProps) {
  const { t } = useTranslation();

  const installationCode = `<script>
(function(d,t) {
  var BASE_URL="${window.location.origin}";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/sdk/sdk.iife.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.talkDeskly.init({
      inboxId: "${inbox.id}",
      baseUrl: "${window.location.origin}"
    })
  }
})(document,"script");
</script>`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          {t("inbox.wizard.website.steps.complete.content.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("inbox.wizard.website.steps.complete.content.description")}
        </p>
      </div>

      <div className="mb-8">
        <CodeBlock code={installationCode} language="javascript" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button className="w-full sm:w-auto">
          {t("inbox.wizard.website.steps.complete.button")}
        </Button>
      </div>
    </div>
  );
}
