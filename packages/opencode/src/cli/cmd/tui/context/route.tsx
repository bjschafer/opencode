import { createStore, reconcile } from "solid-js/store"
import { createSimpleContext } from "./helper"
import type { PromptInfo } from "../component/prompt/history"
import * as Log from "@opencode-ai/core/util/log"

const log = Log.create({ service: "tui.route" })

export type HomeRoute = {
  type: "home"
  prompt?: PromptInfo
}

export type SessionRoute = {
  type: "session"
  sessionID: string
  prompt?: PromptInfo
}

export type PluginRoute = {
  type: "plugin"
  id: string
  data?: Record<string, unknown>
}

export type Route = HomeRoute | SessionRoute | PluginRoute

const HOME_ROUTE: Route = { type: "home" }

function parseRouteFromEnv(value: string): Route {
  try {
    return JSON.parse(value) as Route
  } catch (error) {
    log.warn("ignoring invalid OPENCODE_ROUTE", { value, error: String(error) })
    return HOME_ROUTE
  }
}

export const { use: useRoute, provider: RouteProvider } = createSimpleContext({
  name: "Route",
  init: (props: { initialRoute?: Route }) => {
    const [store, setStore] = createStore<Route>(
      props.initialRoute ?? (process.env["OPENCODE_ROUTE"] ? parseRouteFromEnv(process.env["OPENCODE_ROUTE"]) : HOME_ROUTE),
    )

    return {
      get data() {
        return store
      },
      navigate(route: Route) {
        setStore(reconcile(route))
      },
    }
  },
})

export type RouteContext = ReturnType<typeof useRoute>

export function useRouteData<T extends Route["type"]>(type: T) {
  const route = useRoute()
  return route.data as Extract<Route, { type: typeof type }>
}
