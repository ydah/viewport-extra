import { ContentString } from './ContentString'
import {
  NonnumericInitialScaleError,
  NoOptionsError,
  NonnumericMinWidthError,
  NonnumericMaxWidthError,
  ReversedOptionsError
} from './Error'

export interface ContentMap {
  [key: string]: string
}

const defaultInitialScale = '1'
const forcedWidth = 'device-width'
export const defaultViewportProps = { 'initial-scale': defaultInitialScale }
export const forcedViewportProps = { width: forcedWidth }
export const defaultViewportExtraProps = {}
export const forcedViewportExtraProps = {}

export const initializeViewportProps = (
  contentMap: ContentMap
): ContentMap => ({
  ...defaultViewportProps,
  ...contentMap,
  ...forcedViewportProps
})

export const initializeViewportExtraProps = (
  contentMap: ContentMap
): ContentMap => ({
  ...defaultViewportExtraProps,
  ...contentMap,
  ...forcedViewportExtraProps
})

export const applyViewportExtraPropsToViewportProps = (
  viewportContentMap: ContentMap,
  viewportExtraContentMap: ContentMap,
  originalViewportContentMap: ContentMap,
  documentClientWidth: number
): ContentMap => {
  const initialScaleNumber = +originalViewportContentMap['initial-scale']
  // Nonnumeric string
  if (isNaN(initialScaleNumber)) throw new NonnumericInitialScaleError()

  const minWidthDefined = viewportExtraContentMap['min-width'] != null
  const maxWidthDefined = viewportExtraContentMap['max-width'] != null
  // No options
  if (!minWidthDefined && !maxWidthDefined) throw new NoOptionsError()

  const minWidthNumber = +viewportExtraContentMap['min-width']
  const maxWidthNumber = +viewportExtraContentMap['max-width']
  // Nonnumeric string
  if (minWidthDefined && isNaN(minWidthNumber))
    throw new NonnumericMinWidthError()
  if (maxWidthDefined && isNaN(maxWidthNumber))
    throw new NonnumericMaxWidthError()
  // mix-width > max-width
  if (minWidthNumber > maxWidthNumber) throw new ReversedOptionsError()

  // Try to apply min-width or max-width to width
  const contentMap = { ...viewportContentMap }
  if (minWidthDefined && documentClientWidth < minWidthNumber) {
    contentMap.width = `${minWidthNumber}`
    contentMap['initial-scale'] = `${
      (documentClientWidth / minWidthNumber) * initialScaleNumber
    }`
  } else if (maxWidthDefined && documentClientWidth > maxWidthNumber) {
    contentMap.width = `${maxWidthNumber}`
    contentMap['initial-scale'] = `${
      (documentClientWidth / maxWidthNumber) * initialScaleNumber
    }`
  } else {
    contentMap.width = forcedWidth
    contentMap['initial-scale'] = `${initialScaleNumber}`
  }
  return contentMap
}

export const stringify = (contentMap: ContentMap): ContentString =>
  Object.keys(contentMap)
    // For testing
    .sort()
    .map(key => `${key}=${contentMap[key]}`)
    .join(',')
