import * as React from 'react'
import { TabRouter } from '@react-navigation/core'
import { SceneView } from '@react-navigation/core'
import { StackActions } from '@react-navigation/core'
import { createNavigator } from '@react-navigation/core'
import { NavigationActions } from '@react-navigation/core'
import { Screen, screensEnabled, ScreenContainer } from 'react-native-screens'
import { Platform, StyleSheet, View } from 'react-native'

/**
 * 自定义导航栏
 * @param {*} CustomTabView
 * @param {*} BackgroundView
 */
export function customNavTab(CustomTabView, BackgroundView, _mode) {
  return class TabNavigationView extends React.PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
      const { index } = nextProps.navigation.state

      return {
        // Set the current tab to be loaded if it was not loaded before
        loaded: prevState.loaded.includes(index)
          ? prevState.loaded
          : [...prevState.loaded, index]
      }
    }

    tab = null
    view = null

    /**
     * 改变试图样式
     */
    onStyleChange = style => {
      this.setState({ style: style })
      if (this.view.onStyleChange) {
        this.view.onStyleChange(style)
      }
    }

    /**
     * 点击背景视图
     */
    onClickBackground = () => {
      if (this.tab.onClickBackground) {
        this.tab.onClickBackground()
      }
    }

    /**
     * 改变模式
     */
    onModeChange = mode => {
      this.setState({ mode: mode })
      if (this.tab.onModeChange) {
        this.tab.onModeChange(mode)
      }
      if (this.view.onModeChange) {
        this.view.onModeChange(mode)
      }
    }

    /**
     * 渲染路由
     */
    renderRouteScene = () => {
      const { navigation } = this.props
      const { renderScene } = this.props
      const { routes } = navigation.state
      const { loaded, style } = this.state
      return (
        <ScreenContainer style={[styles.pages, style]}>
          {routes.map((route, index) => {
            if (!loaded.includes(index)) {
              // Don't render a screen if we've never navigated to it
              return null
            }

            const isFocused = navigation.state.index === index

            return (
              <ResourceSavingScene
                key={route.key}
                style={StyleSheet.absoluteFill}
                isVisible={isFocused}
              >
                {renderScene({ route })}
              </ResourceSavingScene>
            )
          })}
        </ScreenContainer>
      )
    }

    /**
     * 渲染导航栏
     */
    renderTabView = () => {
      const { navigation } = this.props
      const { routes } = navigation.state
      return (
        <CustomTabView
          routes={routes}
          navigation={navigation}
          ref={ref => (this.tab = ref)}
          onTabPress={this.props.onTabPress}
          onIndexChange={this.props.onIndexChange}
          onTabLongPress={this.props.onTabLongPress}
          onStyleChange={this.onStyleChange}
          onModeChange={this.onModeChange}
        />
      )
    }

    onClickTabItem = key => {
      if (this.tab.onClickTabItem) {
        this.tab.onClickTabItem(key)
      }
    }

    state = {
      style: {},
      mode: _mode || 'bottom',
      loaded: [this.props.navigation.state.index]
    }

    render() {
      const { mode } = this.state
      const Background = BackgroundView || View
      switch (mode) {
        case 'top':
          return (
            <Background
              style={styles.views}
              ref={ref => (this.view = ref)}
              onClickTabItem={this.onClickTabItem}
              onClickBackground={this.onClickBackground}
            >
              <View style={styles.views_top}>
                {this.renderTabView()}
                {this.renderRouteScene()}
              </View>
            </Background>
          )
        case 'bottom':
          return (
            <Background
              style={styles.views}
              ref={ref => (this.view = ref)}
              onClickTabItem={this.onClickTabItem}
              onClickBackground={this.onClickBackground}
            >
              <View style={styles.views_bottom}>
                {this.renderRouteScene()}
                {this.renderTabView()}
              </View>
            </Background>
          )
        case 'left':
          return (
            <Background
              style={styles.views}
              ref={ref => (this.view = ref)}
              onClickTabItem={this.onClickTabItem}
              onClickBackground={this.onClickBackground}
            >
              <View style={styles.views_left}>
                {this.renderTabView()}
                {this.renderRouteScene()}
              </View>
            </Background>
          )
        case 'right':
          return (
            <Background
              style={styles.views}
              ref={ref => (this.view = ref)}
              onClickTabItem={this.onClickTabItem}
              onClickBackground={this.onClickBackground}
            >
              <View style={styles.views_right}>
                {this.renderRouteScene()}
                {this.renderTabView()}
              </View>
            </Background>
          )
        default:
          return null
      }
    }
  }
}

/**
 * 创建导航栏
 * @param {*} TabView
 */
export function createNavTab(TabView) {
  class NavigationView extends React.Component {
    _renderScene = ({ route }) => {
      const { screenProps, descriptors } = this.props
      const descriptor = descriptors[route.key]
      const TabComponent = descriptor.getComponent()
      return (
        <SceneView
          screenProps={screenProps}
          navigation={descriptor.navigation}
          component={TabComponent}
        />
      )
    }

    _makeDefaultHandler = ({ route, navigation }) => () => {
      if (navigation.isFocused()) {
        if (route.hasOwnProperty('index') && route.index > 0) {
          // If current tab has a nested navigator, pop to top
          navigation.dispatch(StackActions.popToTop({ key: route.key }))
        } else {
          navigation.emit('refocus')
        }
      } else {
        this._jumpTo(route.routeName)
      }
    }

    _handleTabPress = ({ route }) => {
      if (!route) return
      this._isTabPress = true

      const { descriptors } = this.props
      const descriptor = descriptors[route.key]
      const { navigation, options } = descriptor

      const defaultHandler = this._makeDefaultHandler({ route, navigation })

      if (options.tabBarOnPress) {
        options.tabBarOnPress({ navigation, defaultHandler })
      } else {
        defaultHandler()
      }
    }

    _handleTabLongPress = ({ route }) => {
      if (!route) return
      const { descriptors } = this.props
      const descriptor = descriptors[route.key]
      const { navigation, options } = descriptor

      const defaultHandler = this._makeDefaultHandler({ route, navigation })

      if (options.tabBarOnLongPress) {
        options.tabBarOnLongPress({ navigation, defaultHandler })
      } else {
        defaultHandler()
      }
    }

    _handleIndexChange = index => {
      if (this._isTabPress) {
        this._isTabPress = false
        return
      }

      this._jumpTo(this.props.navigation.state.routes[index].routeName)
    }

    _jumpTo = routeName => {
      this.props.navigation.dispatch(NavigationActions.navigate({ routeName }))
    }

    _isTabPress = false

    render() {
      const { descriptors, navigation, screenProps } = this.props
      const { state } = navigation
      const route = state.routes[state.index]
      const descriptor = descriptors[route.key]
      const options = {
        ...this.props.navigationConfig,
        ...descriptor.options
      }

      return (
        <TabView
          {...options}
          renderScene={this._renderScene}
          onIndexChange={this._handleIndexChange}
          onTabPress={this._handleTabPress}
          onTabLongPress={this._handleTabLongPress}
          navigation={navigation}
          descriptors={descriptors}
          screenProps={screenProps}
        />
      )
    }
  }

  return (routes, config = {}) => {
    const router = TabRouter(routes, config)
    return createNavigator(NavigationView, router, config)
  }
}

class ResourceSavingScene extends React.Component {
  render() {
    if (screensEnabled && screensEnabled()) {
      const { isVisible, ...rest } = this.props
      return <Screen active={isVisible ? 1 : 0} {...rest} />
    }
    const { isVisible, children, style, ...rest } = this.props

    return (
      <View
        style={[styles.container, style, { opacity: isVisible ? 1 : 0 }]}
        collapsable={false}
        removeClippedSubviews={
          // On iOS, set removeClippedSubviews to true only when not focused
          // This is an workaround for a bug where the clipped view never re-appears
          Platform.OS === 'ios' ? !isVisible : true
        }
        pointerEvents={isVisible ? 'auto' : 'none'}
        {...rest}
      >
        <View style={isVisible ? styles.attached : styles.detached}>
          {children}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  attached: {
    flex: 1
  },
  detached: {
    flex: 1,
    // this should be big enough to move the whole view out of its container
    top: 3000
  },
  views: {
    flex: 1
  },
  pages: {
    flex: 1
  },
  views_top: {
    flex: 1
  },
  views_bottom: {
    flex: 1
  },
  views_left: {
    flex: 1,
    flexDirection: 'row'
  },
  views_right: {
    flex: 1,
    flexDirection: 'row'
  }
})
