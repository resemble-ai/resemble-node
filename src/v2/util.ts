import { context } from "../context"

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
  success: boolean,
  message?: string,
  page: number,
  num_pages: number,
  page_size: number,
  items: T[]
}

export interface ErrorResponseV2 {
  success: false
  message: string
}
export default {
  get: (path: string, useSynthesisServer: boolean = false) => fetch((useSynthesisServer ? context.synServerUrl : context.endpoint)('v2', path), { method: 'GET', headers: useSynthesisServer ? context.synthesisServerHeaders() : context.headers() }),
  post: (path: string, data: Record<string, any> = {}, useSynthesisServer: boolean = false) =>  fetch((useSynthesisServer ? context.synServerUrl : context.endpoint)('v2', path), { method: 'POST', headers: useSynthesisServer ? context.synthesisServerHeaders() : context.headers(), body: JSON.stringify(data) }),
  put: (path: string, data: Record<string, any> = {}, useSynthesisServer: boolean = false) => fetch((useSynthesisServer ? context.synServerUrl : context.endpoint)('v2', path), { method: 'PUT', headers: useSynthesisServer ? context.synthesisServerHeaders() : context.headers(), body: JSON.stringify(data) }),
  delete: (path: string, useSynthesisServer: boolean = false) => fetch((useSynthesisServer ? context.synServerUrl : context.endpoint)('v2', path), { method: 'DELETE', headers: useSynthesisServer ? context.synthesisServerHeaders() : context.headers() }),

  errorResponse: (e: any): ErrorResponseV2 => ({
    success: false,
    message: `Library error: ${e}`
  })
}

// following two generator functions are equivalent
export async function* getAsyncIterableObject(stream: ReadableStream<Uint8Array>) {
  // Get a lock on the stream
  const reader = stream.getReader();

  return {
    next() {
      // Stream reads already resolve with {done, value}, so
      // we can just call read:
      return reader.read();
    },
    return() {
      // Release the lock if the iterator terminates.
      reader.releaseLock();
      return {};
    },
    // for-await calls this on whatever it's passed, so
    // iterators tend to return themselves.
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

export async function* streamAsyncIterator(stream: ReadableStream<Uint8Array>) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const {done, value} = await reader.read();
      // Exit if we're done
      if (done) return;
      // Else yield the chunk
      yield value;
    }
  }
  finally {
    // If the user breaks out of the loop it'll cause our async generator to 
    // return after the current (or next) yield point. 
    // If this happens, we still want to release the lock on the reader, 
    reader.releaseLock();
  }
}

