import { DashboardApp } from "./dashboard-app"
import { DashboardPlugin } from "./dashboard-app/types"

import displayModule from "virtual:medusa/displays"
import formModule from "virtual:medusa/forms"
import menuItemModule from "virtual:medusa/menu-items"
import routeModule from "virtual:medusa/routes"
import widgetModule from "virtual:medusa/widgets"

import "./index.css"

const localPlugin = {
  widgetModule,
  routeModule,
  displayModule,
  formModule,
  menuItemModule,
}

interface AppProps {
  plugins?: DashboardPlugin[]
}

function App({ plugins = [] }: AppProps) {
  let app: DashboardApp

  try {
    app = new DashboardApp({
      plugins: [localPlugin, ...plugins],
    })
  } catch (error) {
    console.error("Failed to initialize DashboardApp:", error)
    throw error
  }

  return <div>{app.render()}</div>
}

export default App
