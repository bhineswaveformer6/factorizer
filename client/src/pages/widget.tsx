import { DiscoveryWidget } from "@/components/DiscoveryWidget";

/**
 * Standalone Discovery Widget page — embeddable via iframe
 * URL: /#/widget
 * 
 * Embed anywhere: <iframe src="https://factorizer.vercel.app/#/widget" width="400" height="600" />
 */
export default function WidgetPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <DiscoveryWidget 
        embedded={true} 
        factorizerUrl="/#/reality-lens"
      />
    </div>
  );
}
