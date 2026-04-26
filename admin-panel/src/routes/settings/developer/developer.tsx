import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { 
  Key, 
  Workflow, 
  Search,
  ChevronRight
} from "lucide-react"

export const DeveloperSettings = () => {
  const { t } = useTranslation()

  const sections = [
    {
      title: t("apiKeyManagement.domain.publishable"),
      description: t("apiKeyManagement.subtitle.publishable"),
      to: "/settings/publishable-api-keys",
      icon: <Key className="text-ui-fg-subtle" size={20} />,
    },
    {
      title: t("apiKeyManagement.domain.secret"),
      description: t("apiKeyManagement.subtitle.secret"),
      to: "/settings/secret-api-keys",
      icon: <Key className="text-ui-fg-subtle" size={20} />,
    },
    {
      title: t("workflowExecutions.domain"),
      description: "Manage and monitor background workflow executions.",
      to: "/settings/workflows",
      icon: <Workflow className="text-ui-fg-subtle" size={20} />,
    },
    {
      title: t("algolia.domain"),
      description: "Configure Algolia search settings and indexing.",
      to: "/settings/algolia",
      icon: <Search className="text-ui-fg-subtle" size={20} />,
    },
  ]

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">{t("app.nav.settings.developer")}</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Manage your developer settings, API keys, and background workflows.
        </Text>
      </div>
      <div className="flex flex-col">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="flex items-center justify-between px-6 py-4 hover:bg-ui-bg-subtle-hover transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-ui-bg-base shadow-sm">
                {section.icon}
              </div>
              <div>
                <Text weight="plus" size="small">
                  {section.title}
                </Text>
                <Text className="text-ui-fg-subtle" size="small">
                  {section.description}
                </Text>
              </div>
            </div>
            <ChevronRight className="text-ui-fg-muted" size={20} />
          </Link>
        ))}
      </div>
    </Container>
  )
}
