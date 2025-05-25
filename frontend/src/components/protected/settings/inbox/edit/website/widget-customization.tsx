import { useState } from "react";
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

export function WidgetCustomization() {
  const {
    inbox,
    widgetColor,
    setWidgetColor,
    widgetPosition,
    setWidgetPosition,
  } = useEditInbox();

  if (!inbox) return null;

  const installationCode = `<script>
(function(d,t) {
  var BASE_URL="https://chat.example.com";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/packs/js/sdk.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({
      websiteToken: "${inbox.id}",
      baseUrl: BASE_URL
    })
  }
})(document,"script");
</script>`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Widget</CardTitle>
        <CardDescription>
          Customize the appearance of your chat widget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="widgetColor">Widget Color</Label>
            <Input
              id="widgetColor"
              type="color"
              value={widgetColor}
              onChange={(e) => setWidgetColor(e.target.value)}
              className="w-32 h-10 p-1"
            />
          </div>

          <div>
            <Label htmlFor="widgetPosition">Widget Position</Label>
            <select
              id="widgetPosition"
              value={widgetPosition}
              onChange={(e) => setWidgetPosition(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Label>Installation Code</Label>
          <CodeBlock code={installationCode} language="javascript" />
        </div>
      </CardContent>
    </Card>
  );
}
