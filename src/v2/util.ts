import { context } from '../context'

export interface ReadResponseV2<T> {
  success: boolean
  message?: string
  item: T | null
}

export interface WriteResponseV2<T> {
  success: boolean
  message?: string
  /* The item is returned when the write operation succeeds */
  item?: T
}

export interface UpdateResponseV2<T> {
  success: boolean
  message?: string
  /* The item is returned when the update operation succeeds */
  item?: T
}

export interface DeleteResponseV2 {
  success: boolean
  message?: string
}

export interface PaginationResponseV2<T> {
  success: boolean
  message?: string
  page: number
  num_pages: number
  page_size: number
  items: T[]
}

export interface ErrorResponseV2 {
  success: false
  message: string
}

export default {
  get: (path: string, useSynthesisServer: boolean = false) => {
    return fetch(
      useSynthesisServer
        ? context.synServerUrl(path)
        : context.endpoint('v2', path),
      {
        method: 'GET',
        headers: useSynthesisServer
          ? context.synthesisServerHeaders()
          : context.headers(),
      },
    )
  },
  post: (
    path: string,
    data: Record<string, any> = {},
    useSynthesisServer: boolean = false,
  ) =>
    fetch(
      useSynthesisServer
        ? context.synServerUrl(path)
        : context.endpoint('v2', path),
      {
        method: 'POST',
        headers: useSynthesisServer
          ? context.synthesisServerHeaders()
          : context.headers(),
        body: JSON.stringify(data),
      },
    ),
  put: (
    path: string,
    data: Record<string, any> = {},
    useSynthesisServer: boolean = false,
  ) =>
    fetch(
      useSynthesisServer
        ? context.synServerUrl(path)
        : context.endpoint('v2', path),
      {
        method: 'PUT',
        headers: useSynthesisServer
          ? context.synthesisServerHeaders()
          : context.headers(),
        body: JSON.stringify(data),
      },
    ),
  delete: (path: string, useSynthesisServer: boolean = false) =>
    fetch(
      useSynthesisServer
        ? context.synServerUrl(path)
        : context.endpoint('v2', path),
      {
        method: 'DELETE',
        headers: useSynthesisServer
          ? context.synthesisServerHeaders()
          : context.headers(),
      },
    ),

  errorResponse: (e: any): ErrorResponseV2 => ({
    success: false,
    message: `Library error: ${e}`,
  }),
}

// https://github.com/sindresorhus/uint8array-extras

export function concatUint8Arrays(arrays: Uint8Array[], totalLength?: number) {
  if (arrays.length === 0) {
    return new Uint8Array(0)
  }

  totalLength ??= arrays.reduce(
    (accumulator, currentValue) => accumulator + currentValue.length,
    0,
  )

  const returnValue = new Uint8Array(totalLength)

  let offset = 0
  for (const array of arrays) {
    returnValue.set(array, offset)
    offset += array.length
  }

  return returnValue
}
