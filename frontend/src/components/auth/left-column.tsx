"use client";

import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LeftColumn() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("auth.leftColumn.features.realTimeMessaging.title"),
      description: t("auth.leftColumn.features.realTimeMessaging.description"),
    },
    {
      title: t("auth.leftColumn.features.teamCollaboration.title"),
      description: t("auth.leftColumn.features.teamCollaboration.description"),
    },
    {
      title: t("auth.leftColumn.features.openSource.title"),
      description: t("auth.leftColumn.features.openSource.description"),
    },
    {
      title: t("auth.leftColumn.features.easyIntegration.title"),
      description: t("auth.leftColumn.features.easyIntegration.description"),
    },
  ];

  return (
    <div className="flex min-h-[600px] md:min-h-screen flex-col justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white md:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-xl">
        {/* TalkDeskly Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="inline-block rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-white"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t("auth.leftColumn.brandName")}
            </h2>
            <p className="text-sm text-slate-400">
              {t("auth.leftColumn.tagline")}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {t("auth.leftColumn.heroTitle")}
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              {t("auth.leftColumn.heroTitleAccent")}
            </span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            {t("auth.leftColumn.description")}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="rounded-full bg-gradient-to-br from-teal-400/20 to-blue-500/20 p-1 mt-1">
                <Check className="h-4 w-4 text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400/10 to-blue-500/10 px-4 py-2 text-sm text-slate-300">
            <div className="h-2 w-2 rounded-full bg-teal-400"></div>
            {t("auth.leftColumn.trustBadge")}
          </div>
        </div>
      </div>
    </div>
  );
}
