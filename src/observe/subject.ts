
export type callback<T = any> = (value: T) => void

export interface Subscriber {
  unsubscribe: () => void
}

export interface Subject<T> {
  subscribe: (value: callback<T>) => Subscriber
  next: (value: T) => void
}

export const createSubject = <T = any>() => {
    const subscribers: callback<T>[] = []

    const subscribe = (cb: callback<T>): Subscriber => {
      const i = subscribers.length - 1
      subscribers.push(cb)
      return {
        unsubscribe: () => subscribers.splice(i, 1)
      }
    }

    const next = (value: T) => {
      for (const subscriber of subscribers) {
        subscriber(value)
      }
    }

    return {
      subscribe,
      next
    }
}
