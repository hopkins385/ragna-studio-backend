import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions<TParams = never, TData = never> {
  method: HttpMethod;
  url: string;
  params?: TParams;
  data?: TData;
  headers?: Record<string, string>;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

class RequestBuilder<TResponse, TParams = never, TData = never> {
  private instance: AxiosInstance;
  private config: RequestOptions<TParams, TData> = {
    method: 'GET',
    url: '',
  };

  constructor(baseURL: string) {
    this.instance = axios.create({ baseURL });
  }

  setMethod(method: HttpMethod): this {
    this.config.method = method;
    return this;
  }

  setUrl(url: string): this {
    this.config.url = url;
    return this;
  }

  setParams(params: TParams): this {
    this.config.params = params;
    return this;
  }

  setData(data: TData): this {
    this.config.data = data;
    return this;
  }

  setHeaders(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  setTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  setResponseType(
    responseType: 'json' | 'text' | 'blob' | 'arraybuffer',
  ): this {
    this.config.responseType = responseType;
    return this;
  }

  async execute(): Promise<AxiosResponse<TResponse>> {
    try {
      const axiosConfig: AxiosRequestConfig = {
        ...this.config,
        method: this.config.method,
        url: this.config.url,
      };
      return await this.instance.request<TResponse>(axiosConfig);
    } catch (error) {
      // Handle or rethrow the error as needed
      throw error;
    }
  }
}

// API client factory
export function createApiClient(baseURL: string) {
  return {
    request<TResponse, TParams = never, TData = never>() {
      return new RequestBuilder<TResponse, TParams, TData>(baseURL);
    },
  };
}
