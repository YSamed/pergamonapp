export const apiClient = {
  async get<T>(_path: string): Promise<T> {
    throw new Error('Implement GET request in src/services/api/client.ts');
  },
  async post<T>(_path: string, _payload: unknown): Promise<T> {
    throw new Error('Implement POST request in src/services/api/client.ts');
  },
};
