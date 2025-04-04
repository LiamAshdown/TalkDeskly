import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEditInbox } from "@/context/edit-inbox-context";

export function WidgetCustomization() {
  const {
    inbox,
    widgetColor,
    setWidgetColor,
    widgetPosition,
    setWidgetPosition,
  } = useEditInbox();
  const [copied, setCopied] = useState(false);

  if (!inbox) return null;

  const handleCopyCode = () => {
    const code = `<script>
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

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <Label>Widget Preview</Label>
          <div className="border rounded-md p-4 h-64 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <p className="text-muted-foreground">
                Widget preview coming soon
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Label>Installation Code</Label>
          <div className="relative">
            <div className="rounded-lg p-4 text-sm overflow-x-auto text-left bg-zinc-900 text-zinc-100">
              <pre>{`<script>
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
</script>`}</pre>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={handleCopyCode}
            >
              {copied ? "Copied!" : "Copy"}
              {!copied && <Copy className="ml-2 h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
