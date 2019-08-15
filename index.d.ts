import * as React from 'react'
import { ViewStyle } from 'react-native'

export declare function createNavTab(
  tabView: React.ComponentType
): (routes: any, config?: any) => any

export declare function customNavTab(
  CustomTabView: any,
  BackgroundView?: any
): React.ComponentType

export interface ICustomTabView {
  routes: Array<{ key: string }>
  onIndexChange(index: number): void
  onTabPress({ route }: { route: { key: string } }): void
  onTabLongPress({ route }: { route: { key: string } }): void
  navigation: {
    navigate(
      routeNameOrOptions: string,
      params?: { [key: string]: any },
      action?: { [key: string]: any }
    ): boolean
  }
  onStyleChange(style: ViewStyle): void
}
export {}
