import fetch, { Response } from 'node-fetch';
import url from 'url';

import { CLIContext } from '../types';

function defaultHeaders(context: CLIContext) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Skygear-API-Key': (context.cluster && context.cluster.apiKey) || '',
    'X-Skygear-Access-Token': (context.user && context.user.accessToken) || ''
  };
}

async function handleFailureResponse(response: Response) {
  const payload = await response
    .json()
    .then((p) => {
      return p;
    })
    .catch((_error) => {
      throw new Error(response.statusText);
    });

  const message = payload.error && payload.error.message;
  throw new Error(message || `Fail to parse error: ${JSON.stringify(payload)}`);
}

export function callAPI(
  context: CLIContext,
  path: string,
  method: string,
  // tslint:disable-next-line:no-any
  data?: any
  // tslint:disable-next-line:no-any
): Promise<any> {
  const endpoint = context.cluster && context.cluster.endpoint;
  if (!endpoint) {
    return Promise.reject(new Error('no endpoint'));
  }
  return fetch(url.resolve(endpoint, path), {
    body: data && JSON.stringify(data),
    headers: defaultHeaders(context),
    method
  }).then((response) => {
    if (response.status === 200) {
      return response.json();
    }
    return handleFailureResponse(response);
  });
}
