import React, { forwardRef, HTMLAttributes, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { CCarouselControl } from './CCarouselControl'
import { CCarouselIndicators } from './CCarouselIndicators'
import { CCarouselInner } from './CCarouselInner'

export interface CCarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Set 'animate' variable for created context. [docs]
   *
   * @type boolean
   */
  animate?: boolean
  /**
   * A string of all className you want applied to the base component. [docs]
   * 
   * @type string
   */
  className?: string
  /**
   * Adding in the previous and next controls. [docs]
   *
   * @type: boolean
   */
  controls?: boolean
  /**
   * Add darker controls, indicators, and captions. [docs]
   * 
   * @type boolean
   */
  dark?: boolean
  /**
   * The amount of time to delay between automatically cycling an item. If false, carousel will not automatically cycle. [docs]
   *
   * @type boolean | number
   */
  interval: boolean | number
  /**
   * index of the active item. [docs]
   *
   * @type number
   */
  index?: number
  /**
   * Adding indicators at the bottom of the carousel for each item. [docs]
   *
   * @type boolean
   */
  indicators?: boolean
  /**
   * On slide change callback. [docs]
   *
   * @type (a:number|string|null)=>void
   */
  onSlideChange?: (a: number | string | null) => void
  /**
   * On slide change callback. [docs]
   *
   * @type 'slide' | 'crossfade'
   * @default 'slide'
   */
  transition?: 'slide' | 'crossfade'
}

interface DataType {
  timeout?: null | ReturnType<typeof setTimeout>
}

export interface ContextType {
  itemsNumber: number
  state: [number | null, number, string?]
  animating: boolean
  animate?: boolean
  setItemsNumber: (a: number) => void
  setAnimating: (a: boolean) => void
  setState: (a: [number | null, number, string?]) => void
}

//

export const Context = React.createContext<ContextType>({
  itemsNumber: 0,
  state: [null, 0],
  animating: false,
  setItemsNumber: (_) => {},
  setAnimating: (_) => {},
  setState: (_) => {},
})

export const CCarousel = forwardRef<HTMLDivElement, CCarouselProps>(
  (
    {
      children,
      animate = true,
      className,
      controls,
      dark,
      index = 0,
      indicators,
      interval = 5000,
      onSlideChange,
      transition,
      ...rest
    },
    ref,
  ) => {
    const [state, setState] = useState<[number | null, number, string?]>([null, index])
    const [itemsNumber, setItemsNumber] = useState<number>(0)
    const [animating, setAnimating] = useState<boolean>(false)

    let data = useRef<DataType>({}).current

    const cycle = () => {
      pause()
      if (typeof interval === 'number') {
        data.timeout = setTimeout(() => nextItem(), interval)
      }
    }
    const pause = () => data.timeout && clearTimeout(data.timeout)
    const nextItem = () => {
      if (typeof state[1] === 'number')
        setState([state[1], itemsNumber === state[1] + 1 ? 0 : state[1] + 1, 'next'])
    }

    useEffect(() => {
      setState([state[1], index])
    }, [index])

    useEffect(() => {
      onSlideChange && onSlideChange(state[1])
      cycle()
      return () => {
        pause()
      }
    }, [state])

    // render

    const _className = classNames(
      'carousel slide',
      transition === 'crossfade' && 'carousel-fade',
      dark && 'carousel-dark',
      className,
    )

    return (
      <div className={_className} onMouseEnter={pause} onMouseLeave={cycle} {...rest} ref={ref}>
        <Context.Provider
          value={{
            state,
            setState,
            animate,
            itemsNumber,
            setItemsNumber,
            animating,
            setAnimating,
          }}
        >
          {indicators && <CCarouselIndicators/>}
          <CCarouselInner>{children}</CCarouselInner>
          {controls && (
            <>
              <CCarouselControl direction="prev" />
              <CCarouselControl direction="next" />
            </>
          )}
        </Context.Provider>
      </div>
    )
  },
)

CCarousel.propTypes = {
  animate: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  index: PropTypes.number,
  interval: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]).isRequired,
  onSlideChange: PropTypes.func,
}

CCarousel.displayName = 'CCarousel'