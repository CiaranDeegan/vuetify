// Extensions
import { Service } from '../service'

// Utilities
import * as easingPatterns from './easing-patterns'
import {
  getContainer,
  getOffset,
} from './util'

// Types
import { VuetifyGoToOptions, VuetifyGoToTarget } from 'vuetify/types/services/goto'

import { VuetifyServiceContract } from 'vuetify/types/services'

export default function goTo (
  _target: VuetifyGoToTarget,
  _settings: Partial<VuetifyGoToOptions> = {}
): Promise<number> {
  const settings: VuetifyGoToOptions = {
    container: (document.scrollingElement as HTMLElement | null) || document.body || document.documentElement,
    duration: 500,
    offset: 0,
    easing: 'easeInOutCubic',
    appOffset: true,
    ..._settings,
  }
  const container = getContainer(settings.container)

  /* istanbul ignore else */
  if (settings.appOffset && goTo.framework.application) {
    const isDrawer = container.classList.contains('v-navigation-drawer')
    const isClipped = container.classList.contains('v-navigation-drawer--clipped')
    const { bar, top } = goTo.framework.application as any

    settings.offset += bar
    /* istanbul ignore else */
    if (!isDrawer || isClipped) settings.offset += top
  }

  const startTime = performance.now()
  const targetLocation = getOffset(_target) - settings.offset!
  const startLocation = container.scrollTop
  if (targetLocation === startLocation) return Promise.resolve(targetLocation)

  const ease = typeof settings.easing === 'function'
    ? settings.easing
    : easingPatterns[settings.easing!]
  /* istanbul ignore else */
  if (!ease) throw new TypeError(`Easing function "${settings.easing}" not found.`)

  // Cannot be tested properly in jsdom
  // tslint:disable-next-line:promise-must-complete
  /* istanbul ignore next */
  return new Promise(resolve => requestAnimationFrame(function step (currentTime: number) {
    const timeElapsed = currentTime - startTime
    const progress = Math.abs(settings.duration ? Math.min(timeElapsed / settings.duration, 1) : 1)

    container.scrollTop = Math.floor(startLocation + (targetLocation - startLocation) * ease(progress))

    if (progress === 1 || container.clientHeight + container.scrollTop === container.scrollHeight) {
      return resolve(targetLocation)
    }

    requestAnimationFrame(step)
  }))
}

goTo.framework = {} as Record<string, VuetifyServiceContract>
goTo.init = () => {}

export class Goto extends Service {
  public static property = 'goTo'

  constructor () {
    super()

    return goTo
  }
}
