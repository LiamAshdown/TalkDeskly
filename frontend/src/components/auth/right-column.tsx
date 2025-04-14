interface RightColumnProps {
  children: React.ReactNode;
}

export function RightColumn({ children }: RightColumnProps) {
  return (
    <div className="flex min-h-[600px] md:min-h-screen flex-col justify-center bg-white dark:bg-slate-950 p-8 md:p-12 lg:p-16">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}
