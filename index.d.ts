import * as React from 'react'
import { ViewStyle } from 'react-native'
import { NavigationScreenProp } from 'react-navigation'

type IRoute = {
  key: string
  [key: string]: any
}

type IPressData = {
  route: IRoute
}

type IMode = 'top' | 'bottom' | 'left' | 'right'

export declare function createNavTab(
  tabView: React.ComponentType
): (routes: any, config?: any) => any

export declare function customNavTab(
  CustomTabView: any,
  BackgroundView?: any
): React.ComponentType

export interface IBackgroundView extends React.SFC {
  onClickBackground(): void
}

export interface ICustomTabView {
  /**
   * 路由对象合集
   */
  routes: Array<IRoute>
  /**
   * 点击导航栏
   * @param data 当前路由对象
   */
  onTabPress(data: IPressData): void
  /**
   * 长按导航栏
   * @param data 当前路由对象
   */
  onTabLongPress(data: IPressData): void
  /**
   * navigation 对象
   */
  navigation: NavigationScreenProp<{}>
  /**
   * 改变屏幕容器样式
   */
  onStyleChange(style: ViewStyle): void
  /**
   * 改变导航栏模式
   *  @param mode // "top" | "bottom" | "left" | "right"
   */
  onModeChange(mode: IMode): void
}
export {}
