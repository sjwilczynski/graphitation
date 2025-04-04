import gql from 'graphql-tag';
import fetchMock from 'fetch-mock';
import { ASTNode, print, stripIgnoredCharacters } from 'graphql';

import { Observable, Observer, ObservableSubscription } from '../../../utilities/observables/Observable';
import { ApolloLink } from '../../core/ApolloLink';
import { execute } from '../../core/execute';
import { HttpLink } from '../HttpLink';
import { createHttpLink } from '../createHttpLink';
import { ClientParseError } from '../serializeFetchParameter';
import { ServerParseError } from '../parseAndCheckHttpResponse';
import { ServerError } from '../../..';
import { voidFetchDuringEachTest } from './helpers';
import { itAsync } from '../../../testing';

const sampleQuery = gql`
  query SampleQuery {
    stub {
      id
    }
  }
`;

const sampleMutation = gql`
  mutation SampleMutation {
    stub {
      id
    }
  }
`;

function makeCallback<TArgs extends any[]>(
  resolve: () => void,
  reject: (error: Error) => void,
  callback: (...args: TArgs) => any,
) {
  return function () {
    try {
      callback.apply(this, arguments);
      resolve();
    } catch (error) {
      reject(error);
    }
  } as typeof callback;
}

function convertBatchedBody(body: BodyInit | null | undefined) {
  return JSON.parse(body as string);
}

function makePromise(res: any) {
  return new Promise((resolve) => setTimeout(() => resolve(res)));
}

describe.skip('HttpLink', () => {
  describe('General', () => {
    const data = { data: { hello: 'world' } };
    const data2 = { data: { hello: 'everyone' } };
    const mockError = { throws: new TypeError('mock me') };
    let subscriber: Observer<any>;
    const subscriptions = new Set<ObservableSubscription>();

    beforeEach(() => {
      fetchMock.restore();
      fetchMock.post('begin:/data2', makePromise(data2));
      fetchMock.post('begin:/data', makePromise(data));
      fetchMock.post('begin:/error', mockError);
      fetchMock.post('begin:/apollo', makePromise(data));

      fetchMock.get('begin:/data', makePromise(data));
      fetchMock.get('begin:/data2', makePromise(data2));

      const next = jest.fn();
      const error = jest.fn();
      const complete = jest.fn();

      subscriber = {
        next,
        error,
        complete,
      };

      subscriptions.clear();
    });

    afterEach(() => {
      fetchMock.restore();
      if (subscriptions.size) {
        // Tests within this describe block can add subscriptions to this Set
        // that they want to be canceled/unsubscribed after the test finishes.
        subscriptions.forEach(sub => sub.unsubscribe());
      }
    });

    it('does not need any constructor arguments', () => {
      expect(() => new HttpLink()).not.toThrow();
    });

    itAsync('constructor creates link that can call next and then complete', (resolve, reject) => {
      const next = jest.fn();
      const link = new HttpLink({ uri: '/data' });
      const observable = execute(link, {
        query: sampleQuery,
      });
      observable.subscribe({
        next,
        error: error => expect(false),
        complete: () => {
          expect(next).toHaveBeenCalledTimes(1);
          resolve();
        },
      });
    });

    itAsync('supports using a GET request', (resolve, reject) => {
      const variables = { params: 'stub' };
      const extensions = { myExtension: 'foo' };

      const link = createHttpLink({
        uri: '/data',
        fetchOptions: { method: 'GET' },
        includeExtensions: true,
        includeUnusedVariables: true,
      });

      execute(link, { query: sampleQuery, variables, extensions }).subscribe({
        next: makeCallback(resolve, reject, () => {
          const [uri, options] = fetchMock.lastCall()!;
          const { method, body } = options!;
          expect(body).toBeUndefined();
          expect(method).toBe('GET');
          expect(uri).toBe(
            '/data?query=query%20SampleQuery%20%7B%0A%20%20stub%20%7B%0A%20%20%20%20id%0A%20%20%7D%0A%7D&operationName=SampleQuery&variables=%7B%22params%22%3A%22stub%22%7D&extensions=%7B%22myExtension%22%3A%22foo%22%7D',
          );
        }),
        error: error => reject(error),
      });
    });

    itAsync('supports using a GET request with search', (resolve, reject) => {
      const variables = { params: 'stub' };

      const link = createHttpLink({
        uri: '/data?foo=bar',
        fetchOptions: { method: 'GET' },
      });

      execute(link, { query: sampleQuery, variables }).subscribe({
        next: makeCallback(resolve, reject, () => {
          const [uri, options] = fetchMock.lastCall()!;
          const { method, body } = options!;
          expect(body).toBeUndefined();
          expect(method).toBe('GET');
          expect(uri).toBe(
            '/data?foo=bar&query=query%20SampleQuery%20%7B%0A%20%20stub%20%7B%0A%20%20%20%20id%0A%20%20%7D%0A%7D&operationName=SampleQuery&variables=%7B%7D',
          );
        }),
        error: error => reject(error),
      });
    });

    itAsync('supports using a GET request on the context', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: '/data',
      });

      execute(link, {
        query: sampleQuery,
        variables,
        context: {
          fetchOptions: { method: 'GET' },
        },
      }).subscribe(
        makeCallback(resolve, reject, () => {
          const [uri, options] = fetchMock.lastCall()!;
          const { method, body } = options!;
          expect(body).toBeUndefined();
          expect(method).toBe('GET');
          expect(uri).toBe(
            '/data?query=query%20SampleQuery%20%7B%0A%20%20stub%20%7B%0A%20%20%20%20id%0A%20%20%7D%0A%7D&operationName=SampleQuery&variables=%7B%7D',
          );
        }),
      );
    });

    itAsync('uses GET with useGETForQueries', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: '/data',
        useGETForQueries: true,
      });

      execute(link, {
        query: sampleQuery,
        variables,
      }).subscribe(
        makeCallback(resolve, reject, () => {
          const [uri, options] = fetchMock.lastCall()!;
          const { method, body } = options!;
          expect(body).toBeUndefined();
          expect(method).toBe('GET');
          expect(uri).toBe(
            '/data?query=query%20SampleQuery%20%7B%0A%20%20stub%20%7B%0A%20%20%20%20id%0A%20%20%7D%0A%7D&operationName=SampleQuery&variables=%7B%7D',
          );
        }),
      );
    });

    itAsync('uses POST for mutations with useGETForQueries', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: '/data',
        useGETForQueries: true,
      });

      execute(link, {
        query: sampleMutation,
        variables,
      }).subscribe(
        makeCallback(resolve, reject, () => {
          const [uri, options] = fetchMock.lastCall()!;
          const { method, body } = options!;
          expect(body).toBeDefined();
          expect(method).toBe('POST');
          expect(uri).toBe('/data');
        }),
      );
    });

    itAsync('strips unused variables, respecting nested fragments', (resolve, reject) => {
      const link = createHttpLink({ uri: '/data' });

      const query = gql`
        query PEOPLE (
          $declaredAndUsed: String,
          $declaredButUnused: Int,
        ) {
          people(
            surprise: $undeclared,
            noSurprise: $declaredAndUsed,
          ) {
            ... on Doctor {
              specialty(var: $usedByInlineFragment)
            }
            ...LawyerFragment
          }
        }
        fragment LawyerFragment on Lawyer {
          caseCount(var: $usedByNamedFragment)
        }
      `;

      const variables = {
        unused: 'strip',
        declaredButUnused: 'strip',
        declaredAndUsed: 'keep',
        undeclared: 'keep',
        usedByInlineFragment: 'keep',
        usedByNamedFragment: 'keep',
      };

      execute(link, {
        query,
        variables,
      }).subscribe({
        next: makeCallback(resolve, reject, () => {
          const [uri, options] = fetchMock.lastCall()!;
          const { method, body } = options!;
          expect(JSON.parse(body as string)).toEqual({
            operationName: "PEOPLE",
            query: print(query),
            variables: {
              declaredAndUsed: 'keep',
              undeclared: 'keep',
              usedByInlineFragment: 'keep',
              usedByNamedFragment: 'keep',
            },
          });
          expect(method).toBe('POST');
          expect(uri).toBe('/data');
        }),
        error: error => reject(error),
      });
    });

    itAsync('should add client awareness settings to request headers', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: '/data',
      });

      const clientAwareness = {
        name: 'Some Client Name',
        version: '1.0.1',
      };

      execute(link, {
        query: sampleQuery,
        variables,
        context: {
          clientAwareness,
        },
      }).subscribe(
        makeCallback(resolve, reject, () => {
          const [, options] = fetchMock.lastCall()!;
          const { headers } = options as any;
          expect(headers['apollographql-client-name']).toBeDefined();
          expect(headers['apollographql-client-name']).toEqual(
            clientAwareness.name,
          );
          expect(headers['apollographql-client-version']).toBeDefined();
          expect(headers['apollographql-client-version']).toEqual(
            clientAwareness.version,
          );
        }),
      );
    });

    itAsync('should not add empty client awareness settings to request headers', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: '/data',
      });

      const hasOwn = Object.prototype.hasOwnProperty;
      const clientAwareness = {};
      execute(link, {
        query: sampleQuery,
        variables,
        context: {
          clientAwareness,
        },
      }).subscribe(
        makeCallback(resolve, reject, () => {
          const [, options] = fetchMock.lastCall()!;
          const { headers } = options as any;
          expect(hasOwn.call(headers, 'apollographql-client-name')).toBe(false);
          expect(hasOwn.call(headers, 'apollographql-client-version')).toBe(
            false,
          );
        }),
      );
    });

    itAsync("throws for GET if the variables can't be stringified", (resolve, reject) => {
      const link = createHttpLink({
        uri: '/data',
        useGETForQueries: true,
        includeUnusedVariables: true,
      });

      let b;
      const a: any = { b };
      b = { a };
      a.b = b;
      const variables = {
        a,
        b,
      };
      execute(link, { query: sampleQuery, variables }).subscribe(
        result => {
          reject('next should have been thrown from the link');
        },
        makeCallback(resolve, reject, (e: ClientParseError) => {
          expect(e.message).toMatch(/Variables map is not serializable/);
          expect(e.parseError.message).toMatch(
            /Converting circular structure to JSON/,
          );
        }),
      );
    });

    itAsync("throws for GET if the extensions can't be stringified", (resolve, reject) => {
      const link = createHttpLink({
        uri: '/data',
        useGETForQueries: true,
        includeExtensions: true,
      });

      let b;
      const a: any = { b };
      b = { a };
      a.b = b;
      const extensions = {
        a,
        b,
      };
      execute(link, { query: sampleQuery, extensions }).subscribe(
        result => {
          reject('next should have been thrown from the link');
        },
        makeCallback(resolve, reject, (e: ClientParseError) => {
          expect(e.message).toMatch(/Extensions map is not serializable/);
          expect(e.parseError.message).toMatch(
            /Converting circular structure to JSON/,
          );
        }),
      );
    });

    it('raises warning if called with concat', () => {
      const link = createHttpLink();
      const _warn = console.warn;
      console.warn = (warning: any) => expect(warning['message']).toBeDefined();
      expect(link.concat((operation, forward) => forward(operation))).toEqual(
        link,
      );
      console.warn = _warn;
    });

    it('does not need any constructor arguments', () => {
      expect(() => createHttpLink()).not.toThrow();
    });

    itAsync('calls next and then complete', (resolve, reject) => {
      const next = jest.fn();
      const link = createHttpLink({ uri: 'data' });
      const observable = execute(link, {
        query: sampleQuery,
      });
      observable.subscribe({
        next,
        error: error => reject(error),
        complete: makeCallback(resolve, reject, () => {
          expect(next).toHaveBeenCalledTimes(1);
        }),
      });
    });

    itAsync('calls error when fetch fails', (resolve, reject) => {
      const link = createHttpLink({ uri: 'error' });
      const observable = execute(link, {
        query: sampleQuery,
      });
      observable.subscribe(
        result => reject('next should not have been called'),
        makeCallback(resolve, reject, (error: TypeError) => {
          expect(error).toEqual(mockError.throws);
        }),
        () => reject('complete should not have been called'),
      );
    });

    itAsync('calls error when fetch fails', (resolve, reject) => {
      const link = createHttpLink({ uri: 'error' });
      const observable = execute(link, {
        query: sampleMutation,
      });
      observable.subscribe(
        result => reject('next should not have been called'),
        makeCallback(resolve, reject, (error: TypeError) => {
          expect(error).toEqual(mockError.throws);
        }),
        () => reject('complete should not have been called'),
      );
    });

    itAsync('unsubscribes without calling subscriber', (resolve, reject) => {
      const link = createHttpLink({ uri: 'data' });
      const observable = execute(link, {
        query: sampleQuery,
      });
      const subscription = observable.subscribe(
        result => reject('next should not have been called'),
        error => reject(error),
        () => reject('complete should not have been called'),
      );
      subscription.unsubscribe();
      expect(subscription.closed).toBe(true);
      setTimeout(resolve, 50);
    });

    const verifyRequest = (
      link: ApolloLink,
      resolve: () => void,
      includeExtensions: boolean,
      reject: (error: any) => any,
    ) => {
      const next = jest.fn();
      const context = { info: 'stub' };
      const variables = { params: 'stub' };

      const observable = execute(link, {
        query: sampleMutation,
        context,
        variables,
      });
      observable.subscribe({
        next,
        error: error => reject(error),
        complete: () => {
          try {
            let body = convertBatchedBody(fetchMock.lastCall()![1]!.body);
            expect(body.query).toBe(print(sampleMutation));
            expect(body.variables).toEqual({});
            expect(body.context).not.toBeDefined();
            if (includeExtensions) {
              expect(body.extensions).toBeDefined();
            } else {
              expect(body.extensions).not.toBeDefined();
            }
            expect(next).toHaveBeenCalledTimes(1);

            resolve();
          } catch (e) {
            reject(e);
          }
        },
      });
    };

    itAsync('passes all arguments to multiple fetch body including extensions', (resolve, reject) => {
      const link = createHttpLink({ uri: 'data', includeExtensions: true });
      verifyRequest(
        link,
        () => verifyRequest(link, resolve, true, reject),
        true,
        reject,
      );
    });

    itAsync('passes all arguments to multiple fetch body excluding extensions', (resolve, reject) => {
      const link = createHttpLink({ uri: 'data' });
      verifyRequest(
        link,
        () => verifyRequest(link, resolve, false, reject),
        false,
        reject,
      );
    });

    itAsync('calls multiple subscribers', (resolve, reject) => {
      const link = createHttpLink({ uri: 'data' });
      const context = { info: 'stub' };
      const variables = { params: 'stub' };

      const observable = execute(link, {
        query: sampleMutation,
        context,
        variables,
      });
      observable.subscribe(subscriber);
      observable.subscribe(subscriber);

      setTimeout(() => {
        expect(subscriber.next).toHaveBeenCalledTimes(2);
        expect(subscriber.complete).toHaveBeenCalledTimes(2);
        expect(subscriber.error).not.toHaveBeenCalled();
        resolve();
      }, 50);
    });

    itAsync('calls remaining subscribers after unsubscribe', (resolve, reject) => {
      const link = createHttpLink({ uri: 'data' });
      const context = { info: 'stub' };
      const variables = { params: 'stub' };

      const observable = execute(link, {
        query: sampleMutation,
        context,
        variables,
      });

      observable.subscribe(subscriber);

      setTimeout(() => {
        const subscription = observable.subscribe(subscriber);
        subscription.unsubscribe();
      }, 10);

      setTimeout(
        makeCallback(resolve, reject, () => {
          expect(subscriber.next).toHaveBeenCalledTimes(1);
          expect(subscriber.complete).toHaveBeenCalledTimes(1);
          expect(subscriber.error).not.toHaveBeenCalled();
          resolve();
        }),
        50,
      );
    });

    itAsync('allows for dynamic endpoint setting', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({ uri: 'data' });

      execute(link, {
        query: sampleQuery,
        variables,
        context: { uri: 'data2' },
      }).subscribe(result => {
        expect(result).toEqual(data2);
        resolve();
      });
    });

    itAsync('adds headers to the request from the context', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          headers: { authorization: '1234' },
        });
        return forward(operation).map(result => {
          const { headers } = operation.getContext();
          try {
            expect(headers).toBeDefined();
          } catch (e) {
            reject(e);
          }
          return result;
        });
      });
      const link = middleware.concat(createHttpLink({ uri: 'data' }));

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const headers = fetchMock.lastCall()![1]!.headers as any;
          expect(headers.authorization).toBe('1234');
          expect(headers['content-type']).toBe('application/json');
          expect(headers.accept).toBe('*/*');
        }),
      );
    });

    itAsync('adds headers to the request from the setup', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: 'data',
        headers: { authorization: '1234' },
      });

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const headers = fetchMock.lastCall()![1]!.headers as any;
          expect(headers.authorization).toBe('1234');
          expect(headers['content-type']).toBe('application/json');
          expect(headers.accept).toBe('*/*');
        }),
      );
    });

    itAsync('prioritizes context headers over setup headers', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          headers: { authorization: '1234' },
        });
        return forward(operation);
      });
      const link = middleware.concat(
        createHttpLink({ uri: 'data', headers: { authorization: 'no user' } }),
      );

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const headers = fetchMock.lastCall()![1]!.headers as any;
          expect(headers.authorization).toBe('1234');
          expect(headers['content-type']).toBe('application/json');
          expect(headers.accept).toBe('*/*');
        }),
      );
    });

    itAsync('adds headers to the request from the context on an operation', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({ uri: 'data' });

      const context = {
        headers: { authorization: '1234' },
      };
      execute(link, {
        query: sampleQuery,
        variables,
        context,
      }).subscribe(
        makeCallback(resolve, reject, () => {
          const headers = fetchMock.lastCall()![1]!.headers as any;
          expect(headers.authorization).toBe('1234');
          expect(headers['content-type']).toBe('application/json');
          expect(headers.accept).toBe('*/*');
        }),
      );
    });

    itAsync('adds creds to the request from the context', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          credentials: 'same-team-yo',
        });
        return forward(operation);
      });
      const link = middleware.concat(createHttpLink({ uri: 'data' }));

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const creds = fetchMock.lastCall()![1]!.credentials;
          expect(creds).toBe('same-team-yo');
        }),
      );
    });

    itAsync('adds creds to the request from the setup', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({ uri: 'data', credentials: 'same-team-yo' });

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const creds = fetchMock.lastCall()![1]!.credentials;
          expect(creds).toBe('same-team-yo');
        }),
      );
    });

    itAsync('prioritizes creds from the context over the setup', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          credentials: 'same-team-yo',
        });
        return forward(operation);
      });
      const link = middleware.concat(
        createHttpLink({ uri: 'data', credentials: 'error' }),
      );

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const creds = fetchMock.lastCall()![1]!.credentials;
          expect(creds).toBe('same-team-yo');
        }),
      );
    });

    itAsync('adds uri to the request from the context', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          uri: 'data',
        });
        return forward(operation);
      });
      const link = middleware.concat(createHttpLink());

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const uri = fetchMock.lastUrl();
          expect(uri).toBe('/data');
        }),
      );
    });

    itAsync('adds uri to the request from the setup', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({ uri: 'data' });

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const uri = fetchMock.lastUrl();
          expect(uri).toBe('/data');
        }),
      );
    });

    itAsync('prioritizes context uri over setup uri', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          uri: 'apollo',
        });
        return forward(operation);
      });
      const link = middleware.concat(
        createHttpLink({ uri: 'data', credentials: 'error' }),
      );

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const uri = fetchMock.lastUrl();

          expect(uri).toBe('/apollo');
        }),
      );
    });

    itAsync('allows uri to be a function', (resolve, reject) => {
      const variables = { params: 'stub' };
      const customFetch: WindowOrWorkerGlobalScope['fetch'] = (uri, options) => {
        const { operationName } = convertBatchedBody(options!.body);
        try {
          expect(operationName).toBe('SampleQuery');
        } catch (e) {
          reject(e);
        }
        return fetch('dataFunc', options);
      };

      const link = createHttpLink({ fetch: customFetch });

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          expect(fetchMock.lastUrl()).toBe('/dataFunc');
        }),
      );
    });

    itAsync('adds fetchOptions to the request from the setup', (resolve, reject) => {
      const variables = { params: 'stub' };
      const link = createHttpLink({
        uri: 'data',
        fetchOptions: { someOption: 'foo', mode: 'no-cors' },
      });

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const { someOption, mode, headers } = fetchMock.lastCall()![1] as any;
          expect(someOption).toBe('foo');
          expect(mode).toBe('no-cors');
          expect(headers['content-type']).toBe('application/json');
        }),
      );
    });

    itAsync('adds fetchOptions to the request from the context', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          fetchOptions: {
            someOption: 'foo',
          },
        });
        return forward(operation);
      });
      const link = middleware.concat(createHttpLink({ uri: 'data' }));

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const { someOption } = fetchMock.lastCall()![1] as any;
          expect(someOption).toBe('foo');
          resolve();
        }),
      );
    });

    itAsync('uses the latest window.fetch function if options.fetch not configured', (resolve, reject) => {
      const httpLink = createHttpLink({ uri: 'data' });

      const fetch = window.fetch;
      expect(typeof fetch).toBe('function');

      const fetchSpy = jest.spyOn(window, 'fetch');
      fetchSpy.mockImplementation(() => Promise.resolve<Response>({
        text() {
          return Promise.resolve(JSON.stringify({
            data: { hello: "from spy" },
          }));
        },
      } as Response));

      const spyFn = window.fetch;
      expect(spyFn).not.toBe(fetch);

      subscriptions.add(execute(httpLink, {
        query: sampleQuery,
      }).subscribe({
        error: reject,

        next(result) {
          expect(fetchSpy).toHaveBeenCalledTimes(1);
          expect(result).toEqual({
            data: { hello: "from spy" },
          });

          fetchSpy.mockRestore();
          expect(window.fetch).toBe(fetch);

          subscriptions.add(execute(httpLink, {
            query: sampleQuery,
          }).subscribe({
            error: reject,
            next(result) {
              expect(result).toEqual({
                data: { hello: "world" },
              });
              resolve();
            },
          }));
        },
      }));
    });

    itAsync('uses the print option function when defined', (resolve, reject) => {
      const customPrinter = jest.fn(
        (ast: ASTNode, originalPrint: typeof print) => {
          return stripIgnoredCharacters(originalPrint(ast));
        }
      );

      const httpLink = createHttpLink({ uri: 'data', print: customPrinter });

      execute(httpLink, {
        query: sampleQuery,
        context: {
          fetchOptions: { method: 'GET' },
        },
      }).subscribe(
        makeCallback(resolve, reject, () => {
          expect(customPrinter).toHaveBeenCalledTimes(1);
          const [uri] = fetchMock.lastCall()!;
          expect(uri).toBe(
            '/data?query=query%20SampleQuery%7Bstub%7Bid%7D%7D&operationName=SampleQuery&variables=%7B%7D',
          );
        }),
      );
    });

    itAsync('prioritizes context over setup', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          fetchOptions: {
            someOption: 'foo',
          },
        });
        return forward(operation);
      });
      const link = middleware.concat(
        createHttpLink({ uri: 'data', fetchOptions: { someOption: 'bar' } }),
      );

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          const { someOption } = fetchMock.lastCall()![1] as any;
          expect(someOption).toBe('foo');
        }),
      );
    });

    itAsync('allows for not sending the query with the request', (resolve, reject) => {
      const variables = { params: 'stub' };
      const middleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          http: {
            includeQuery: false,
            includeExtensions: true,
          },
        });
        operation.extensions.persistedQuery = { hash: '1234' };
        return forward(operation);
      });
      const link = middleware.concat(createHttpLink({ uri: 'data' }));

      execute(link, { query: sampleQuery, variables }).subscribe(
        makeCallback(resolve, reject, () => {
          let body = convertBatchedBody(fetchMock.lastCall()![1]!.body);

          expect(body.query).not.toBeDefined();
          expect(body.extensions).toEqual({ persistedQuery: { hash: '1234' } });
          resolve();
        }),
      );
    });

    itAsync('sets the raw response on context', (resolve, reject) => {
      const middleware = new ApolloLink((operation, forward) => {
        return new Observable(ob => {
          const op = forward(operation);
          const sub = op.subscribe({
            next: ob.next.bind(ob),
            error: ob.error.bind(ob),
            complete: makeCallback(resolve, reject, () => {
              expect(operation.getContext().response.headers.toBeDefined);
              ob.complete();
            }),
          });

          return () => {
            sub.unsubscribe();
          };
        });
      });

      const link = middleware.concat(createHttpLink({ uri: 'data', fetch }));

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          resolve();
        },
        () => {},
      );
    });
  });

  describe('Dev warnings', () => {
    voidFetchDuringEachTest();

    itAsync('warns if fetch is undeclared', (resolve, reject) => {
      try {
        createHttpLink({ uri: 'data' });
        reject("warning wasn't called");
      } catch (e) {
        makeCallback(resolve, reject, () =>
          expect(e.message).toMatch(/has not been found globally/),
        )();
      }
    });

    itAsync('warns if fetch is undefined', (resolve, reject) => {
      window.fetch = undefined as any;
      try {
        createHttpLink({ uri: 'data' });
        reject("warning wasn't called");
      } catch (e) {
        makeCallback(resolve, reject, () =>
          expect(e.message).toMatch(/has not been found globally/),
        )();
      }
    });

    it('does not warn if fetch is undeclared but a fetch is passed', () => {
      expect(() => {
        createHttpLink({ uri: 'data', fetch: (() => {}) as any });
      }).not.toThrow();
    });
  });

  describe('Error handling', () => {
    let responseBody: any;
    const text = jest.fn(() => {
      const responseBodyText = '{}';
      responseBody = JSON.parse(responseBodyText);
      return Promise.resolve(responseBodyText);
    });
    const textWithData = jest.fn(() => {
      responseBody = {
        data: { stub: { id: 1 } },
        errors: [{ message: 'dangit' }],
      };

      return Promise.resolve(JSON.stringify(responseBody));
    });

    const textWithErrors = jest.fn(() => {
      responseBody = {
        errors: [{ message: 'dangit' }],
      };

      return Promise.resolve(JSON.stringify(responseBody));
    });
    const fetch = jest.fn((uri, options) => {
      return Promise.resolve({ text });
    });
    beforeEach(() => {
      fetch.mockReset();
    });
    itAsync('makes it easy to do stuff on a 401', (resolve, reject) => {
      const middleware = new ApolloLink((operation, forward) => {
        return new Observable(ob => {
          fetch.mockReturnValueOnce(Promise.resolve({ status: 401, text }));
          const op = forward(operation);
          const sub = op.subscribe({
            next: ob.next.bind(ob),
            error: makeCallback(resolve, reject, (e: ServerError) => {
              expect(e.message).toMatch(/Received status code 401/);
              expect(e.statusCode).toEqual(401);
              ob.error(e);
            }),
            complete: ob.complete.bind(ob),
          });

          return () => {
            sub.unsubscribe();
          };
        });
      });

      const link = middleware.concat(createHttpLink({ uri: 'data', fetch: fetch as any }));

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          reject('next should have been thrown from the network');
        },
        () => {},
      );
    });

    itAsync('throws an error if response code is > 300', (resolve, reject) => {
      fetch.mockReturnValueOnce(Promise.resolve({ status: 400, text }));
      const link = createHttpLink({ uri: 'data', fetch: fetch as any });

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          reject('next should have been thrown from the network');
        },
        makeCallback(resolve, reject, (e: ServerError) => {
          expect(e.message).toMatch(/Received status code 400/);
          expect(e.statusCode).toBe(400);
          expect(e.result).toEqual(responseBody);
        }),
      );
    });
    itAsync('throws an error if response code is > 300 and returns data', (resolve, reject) => {
      fetch.mockReturnValueOnce(
        Promise.resolve({ status: 400, text: textWithData }),
      );

      const link = createHttpLink({ uri: 'data', fetch: fetch as any });

      let called = false;

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          called = true;
          expect(result).toEqual(responseBody);
        },
        e => {
          expect(called).toBe(true);
          expect(e.message).toMatch(/Received status code 400/);
          expect(e.statusCode).toBe(400);
          expect(e.result).toEqual(responseBody);
          resolve();
        },
      );
    });
    itAsync('throws an error if only errors are returned', (resolve, reject) => {
      fetch.mockReturnValueOnce(
        Promise.resolve({ status: 400, text: textWithErrors }),
      );

      const link = createHttpLink({ uri: 'data', fetch: fetch as any });

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          reject('should not have called result because we have no data');
        },
        e => {
          expect(e.message).toMatch(/Received status code 400/);
          expect(e.statusCode).toBe(400);
          expect(e.result).toEqual(responseBody);
          resolve();
        },
      );
    });
    itAsync('throws an error if empty response from the server ', (resolve, reject) => {
      fetch.mockReturnValueOnce(Promise.resolve({ text }));
      text.mockReturnValueOnce(Promise.resolve('{ "body": "boo" }'));
      const link = createHttpLink({ uri: 'data', fetch: fetch as any });

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          reject('next should have been thrown from the network');
        },
        makeCallback(resolve, reject, (e: Error) => {
          expect(e.message).toMatch(
            /Server response was missing for query 'SampleQuery'/,
          );
        }),
      );
    });
    itAsync("throws if the body can't be stringified", (resolve, reject) => {
      fetch.mockReturnValueOnce(Promise.resolve({ data: {}, text }));
      const link = createHttpLink({
        uri: 'data',
        fetch: fetch as any,
        includeUnusedVariables: true,
      });

      let b;
      const a: any = { b };
      b = { a };
      a.b = b;
      const variables = {
        a,
        b,
      };
      execute(link, { query: sampleQuery, variables }).subscribe(
        result => {
          reject('next should have been thrown from the link');
        },
        makeCallback(resolve, reject, (e: ClientParseError) => {
          expect(e.message).toMatch(/Payload is not serializable/);
          expect(e.parseError.message).toMatch(
            /Converting circular structure to JSON/,
          );
        }),
      );
    });
    itAsync('supports being cancelled and does not throw', (resolve, reject) => {
      let called = false;
      class AbortController {
        signal: {};
        abort = () => {
          called = true;
        };
      }

      (global as any).AbortController = AbortController;

      fetch.mockReturnValueOnce(Promise.resolve({ text }));
      text.mockReturnValueOnce(
        Promise.resolve('{ "data": { "hello": "world" } }'),
      );

      const link = createHttpLink({ uri: 'data', fetch: fetch as any });

      const sub = execute(link, { query: sampleQuery }).subscribe({
        next: result => {
          reject('result should not have been called');
        },
        error: e => {
          reject(e);
        },
        complete: () => {
          reject('complete should not have been called');
        },
      });
      sub.unsubscribe();

      setTimeout(
        makeCallback(resolve, reject, () => {
          delete (global as any).AbortController;
          expect(called).toBe(true);
          fetch.mockReset();
          text.mockReset();
        }),
        150,
      );
    });

    const body = '{';
    const unparsableJson = jest.fn(() => Promise.resolve(body));
    itAsync('throws an error if response is unparsable', (resolve, reject) => {
      fetch.mockReturnValueOnce(
        Promise.resolve({ status: 400, text: unparsableJson }),
      );
      const link = createHttpLink({ uri: 'data', fetch: fetch as any });

      execute(link, { query: sampleQuery }).subscribe(
        result => {
          reject('next should have been thrown from the network');
        },
        makeCallback(resolve, reject, (e: ServerParseError) => {
          expect(e.message).toMatch(/JSON/);
          expect(e.statusCode).toBe(400);
          expect(e.response).toBeDefined();
          expect(e.bodyText).toBe(body);
        }),
      );
    });
  });
});
