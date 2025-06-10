import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { useEditInbox } from "@/context/edit-inbox-context";
import { useTranslation } from "react-i18next";

export function WidgetCustomization() {
  const {
    inbox,
    widgetColor,
    setWidgetColor,
    widgetPosition,
    setWidgetPosition,
  } = useEditInbox();
  const { t } = useTranslation();

  if (!inbox) return null;

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
      position: "${widgetPosition}",
      primaryColor: "${widgetColor}",
      zIndex: 9999,
      baseUrl: "${window.location.origin}"
    })
  }
})(document,"script");
</script>`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("inbox.edit.tabs.widgetCustomization.title")}</CardTitle>
        <CardDescription>
          {t("inbox.edit.tabs.widgetCustomization.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="widgetColor">
              {t("inbox.edit.tabs.widgetCustomization.form.widgetColor")}
            </Label>
            <Input
              id="widgetColor"
              type="color"
              value={widgetColor}
              onChange={(e) => setWidgetColor(e.target.value)}
              className="w-32 h-10 p-1"
            />
            {widgetColor}
          </div>

          <div>
            <Label htmlFor="widgetPosition">
              {t(
                "inbox.edit.tabs.widgetCustomization.form.widgetPosition.label"
              )}
            </Label>
            <select
              id="widgetPosition"
              value={widgetPosition}
              onChange={(e) => setWidgetPosition(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="bottom-right">
                {t(
                  "inbox.edit.tabs.widgetCustomization.form.widgetPosition.bottomRight"
                )}
              </option>
              <option value="bottom-left">
                {t(
                  "inbox.edit.tabs.widgetCustomization.form.widgetPosition.bottomLeft"
                )}
              </option>
              <option value="top-right">
                {t(
                  "inbox.edit.tabs.widgetCustomization.form.widgetPosition.topRight"
                )}
              </option>
              <option value="top-left">
                {t(
                  "inbox.edit.tabs.widgetCustomization.form.widgetPosition.topLeft"
                )}
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Label>
            {t("inbox.edit.tabs.widgetCustomization.form.installationCode")}
          </Label>
          <CodeBlock code={installationCode} language="javascript" />
        </div>
      </CardContent>
    </Card>
  );
}
