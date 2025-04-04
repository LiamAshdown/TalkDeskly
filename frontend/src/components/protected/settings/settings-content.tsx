import SettingsHeader from "./settings-header";

interface SettingsContentProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBackButton?: boolean;
}

export default function SettingsContent({
  children,
  title,
  description,
  showBackButton = true,
}: SettingsContentProps) {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <SettingsHeader
        title={title}
        description={description}
        showBackButton={showBackButton}
      />
      {children}
    </div>
  );
}
