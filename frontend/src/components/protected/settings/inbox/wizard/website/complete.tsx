import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Highlight, themes } from "prism-react-renderer";
import { Inbox } from "@/lib/interfaces";

interface CompleteProps {
  inbox: Inbox;
}

export function Complete({ inbox }: CompleteProps) {
  const [copied, setCopied] = useState(false);

  const codeString = `<script>
(function(d,t) {
  var BASE_URL="http://0.0.0.0:3000";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/packs/js/sdk.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({
      websiteToken: "t5pazukXMfLGBXvzhpaKE3LA",
      baseUrl: BASE_URL
    })
  }
})(document,"script");
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Your Inbox is ready!
        </h2>
        <p className="text-muted-foreground">
          You have successfully finished creating a website channel. Copy the
          code shown below and paste it on your website. Next time a customer
          use the live chat, the conversation will automatically appear on your
          inbox.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Highlight
            theme={themes.vsDark}
            code={codeString}
            language="javascript"
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className="rounded-lg p-4 text-sm overflow-x-auto text-left"
                style={{ ...style, background: "#1E1E1E" }}
              >
                {tokens.map((line, i) => (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className="text-left"
                  >
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="outline" className="w-full sm:w-auto">
          More settings
        </Button>
        <Button className="w-full sm:w-auto">Take me there</Button>
      </div>
    </div>
  );
}
