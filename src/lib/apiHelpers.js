/**
 * API helpers: consistent success/error response shape for all admin API calls.
 * Use these when you need explicit status codes and a uniform { success, data, statusCode, message }.
 * axiosInstance interceptors still handle toasts and 401 redirects; these helpers add a normalised return value.
 */
import { axiosInstance } from "./authInstances";

/**
 * @typedef {Object} ApiResult
 * @property {boolean} success
 * @property {*} data - response data or null on error
 * @property {number|null} statusCode - HTTP status (e.g. 200, 400, 500)
 * @property {string} [message] - error message when success is false
 */

/**
 * Normalise axios response to { success, data, statusCode }.
 * @param {import('axios').AxiosResponse} response
 * @returns {ApiResult}
 */
function toResult(response) {
  const data = response?.data;
  const ok = response?.status >= 200 && response?.status < 300 && data?.success !== false;
  return {
    success: !!ok,
    data: ok ? data : null,
    statusCode: response?.status ?? null,
    message: ok ? undefined : (data?.message || "Request failed"),
  };
}

/**
 * Normalise axios error to { success, data, statusCode, message }.
 * @param {import('axios').AxiosError} err
 * @returns {ApiResult}
 */
function toErrorResult(err) {
  const statusCode = err?.response?.status ?? null;
  const data = err?.response?.data;
  const message = data?.message || err?.message || "Request failed";
  return {
    success: false,
    data: null,
    statusCode,
    message,
  };
}

/**
 * GET request with normalised result.
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<ApiResult>}
 */
export function apiGet(url, config = {}) {
  return axiosInstance.get(url, config).then(toResult).catch(toErrorResult);
}

/**
 * POST request with normalised result.
 * @param {string} url
 * @param {*} [body]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<ApiResult>}
 */
export function apiPost(url, body, config = {}) {
  return axiosInstance.post(url, body, config).then(toResult).catch(toErrorResult);
}

/**
 * PUT request with normalised result.
 * @param {string} url
 * @param {*} [body]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<ApiResult>}
 */
export function apiPut(url, body, config = {}) {
  return axiosInstance.put(url, body, config).then(toResult).catch(toErrorResult);
}

/**
 * DELETE request with normalised result.
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<ApiResult>}
 */
export function apiDelete(url, config = {}) {
  return axiosInstance.delete(url, config).then(toResult).catch(toErrorResult);
}
