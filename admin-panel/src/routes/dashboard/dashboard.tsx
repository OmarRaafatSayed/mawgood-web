import { Heading, Text, Container, Button } from "@medusajs/ui"
import { ArrowUpRightMini, ShoppingCart, Tag, Cube, Users } from "@medusajs/icons"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const Dashboard = () => {
  const { t } = useTranslation()

  const quickLinks = [
    {
      title: t("orders.domain"),
      description: "Manage and track all orders",
      icon: ShoppingCart,
      link: "/orders",
      color: "text-ui-fg-interactive",
    },
    {
      title: t("products.domain"),
      description: "View and manage products",
      icon: Cube,
      link: "/products",
      color: "text-blue-500",
    },
    {
      title: t("promotions.domain"),
      description: "Create and manage promotions",
      icon: Tag,
      link: "/promotions",
      color: "text-purple-500",
    },
    {
      title: "Customers",
      description: "Manage customer accounts",
      icon: Users,
      link: "/customers",
      color: "text-green-500",
    },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-y-3 p-6">
        <Heading level="h1" className="text-ui-fg-base">
          {t("dashboard.title") || "Dashboard"}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Welcome to your admin panel. Quick access to main sections:
        </Text>
      </div>

      <Container className="m-6 mt-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="group flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4 transition-all hover:border-ui-border-interactive hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <item.icon className={item.color} />
                <ArrowUpRightMini className="text-ui-fg-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="flex flex-col gap-y-1">
                <Text
                  size="xsmall"
                  weight="plus"
                  className="text-ui-fg-base"
                >
                  {item.title}
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {item.description}
                </Text>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  )
}
