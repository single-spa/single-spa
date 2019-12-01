let delay = 0

export function bootstrap() {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}

export function mount() {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}

export function unmount() {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}

export const timeouts = {
  bootstrap: {
    warningMillis: 5,
  },
  mount: {
    warningMillis: 5,
  },
  unmount: {
    warningMillis: 5,
  },
  unload: {
    warningMillis: 5,
  }
}

export function reset() {
  delay = 0
}

export function setDelay(millis) {
  delay = millis
}