import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language: string;
  showCopyButton?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  showCopyButton = true,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="rounded-lg overflow-hidden">
        <Highlight theme={themes.vsDark} code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} p-4 text-sm overflow-x-auto`}
              style={style}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              Copied!
              <Check className="ml-2 h-3 w-3" />
            </>
          ) : (
            <>
              Copy
              <Copy className="ml-2 h-3 w-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
