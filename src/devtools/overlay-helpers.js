const overlayDivClassName = `single-spa_overlay--div`;
const hexRegex = /^#[A-Fa-f0-9]{6}$/g

export function setOverlaysOnApp(app) {
  const { options, selectors } = getSelectorsAndOptions(app)
  applyOverlays(selectors, options, app.name)
}

function applyOverlays(selectors, options, appName) {
  selectors.forEach((selector) => {
    createOverlayWithText(selector, options, appName)
  })
}

export function removeOverlaysFromApp(app) {
  const { options, selectors } = getSelectorsAndOptions(app)
  removeOverlayFromSelectors(selectors)
}

function deleteNode(node) {
  node && node.remove && node.remove()
}

function getSelectorsAndOptions(app) {
  return {
    selectors: app.devtools.overlays.selectors.map((selector) => {
      if (document.querySelector(selector)) {
        return selector
      } else {
        return undefined
      }
    }).filter(selection => selection),
    options: app.devtools.overlays.options || {}
  }
}

function removeOverlayFromSelectors(selectors) {
  selectors.forEach(selector => {
    removeOverlay(selector)
  })
}

function removeOverlay(selector) {
  const element = document.querySelector(selector)
  if (!element) {
    return null
  }
  const existingOverlayDiv = element.querySelector(`.${overlayDivClassName}`)
  deleteNode(existingOverlayDiv)
}

function createOverlayWithText(selector, options, appName) {
  const className = `${overlayDivClassName} ${(options.classes || []).join(" ")}`
  const element = document.querySelector(selector)
  if (!element) {
    return null
  }
  const existingOverlayDiv = element.querySelector(`.${overlayDivClassName}`)
  if (existingOverlayDiv) {
    return existingOverlayDiv
  }
  const div = element.appendChild(document.createElement('div'))
  // setup main overlay div
  div.className = className;
  div.style.width = options.width || '100%'
  div.style.height = options.height || '100%'
  div.style.zIndex = options.zIndex || 40
  div.style.position = options.position || 'absolute'
  div.style.top = options.top || 0
  div.style.left = options.left || 0
  div.style.pointerEvents = 'none'
  let backgroundColor
  if (options.color && hexRegex.test(options.color)) {
    backgroundColor = getRGBAFromHex(options.color.replace('#', ''))
  } else if (options.background) {
    backgroundColor = options.background
  } else {
    backgroundColor = getColorFromString(appName)
  }
  div.style.background = backgroundColor

  const childDiv = div.appendChild(document.createElement('div'))
  childDiv.style.display = 'flex'
  childDiv.style.flexDirection = element.clientHeight > 80 ? 'column' : 'row';
  childDiv.style.alignItems = 'center'
  childDiv.style.justifyContent = 'center'
  childDiv.style.color = options.color || options.textColor || getColorFromString(appName, 1)
  childDiv.style.fontWeight = 'bold'
  childDiv.style.height = '100%'
  childDiv.style.fontSize = '32px'

  const appNameDiv = document.createElement('div');
  appNameDiv.appendChild(document.createTextNode(appName));
  childDiv.appendChild(appNameDiv);

  if (options.textBlocks && options.textBlocks.length >= 1) {
    options.textBlocks.forEach((textBlock) => {
      const textBlockDiv = document.createElement('div')
      textBlockDiv.appendChild(document.createTextNode(textBlock))
      childDiv.appendChild(textBlockDiv)
    })
  }

  return div
}


function getColorFromString (string, opacity = 0.1) {
  const hex = getHexFromString(string)
  return getRGBAFromHex(hex, opacity)
}

function getHexFromString (string) {
  let result = (parseInt(
    parseInt(string, 36)
    .toExponential()
    .slice(2, -5)
    , 10) & 0XFFFFFF).toString(16).toUpperCase()
  return result.split('').concat([0,0,0,0,0,0]).slice(0,6).join('')
}

function getRGBAFromHex (hex, opacity = 0.1) {
  const rgba = [`0x${hex.slice(0, 2)}`, `0x${hex.slice(2, 4)}`, `0x${hex.slice(4, 6)}`]
  return `rgba(${parseInt(rgba[0])}, ${parseInt(rgba[1])}, ${parseInt(rgba[2])}, ${opacity})`
}
