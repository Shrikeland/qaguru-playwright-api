import axios from "axios";

export class TodoService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async request(method, endpoint, data = null, headers = {}) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/${endpoint}`,
        data,
        headers: {
          "x-challenger": this.token,
          ...headers,
        },
      });
      return response;
    } catch (error) {
      if (error.response) {
        return error.response;
      }
      throw error;
    }
  }

  getTodos(endpoint = "todos", accept = "application/json") {
    return this.request("GET", endpoint, null, {
      Accept: accept,
    });
  }

  addTodo(
    endpoint,
    data,
    contentType = "application/json",
    accept = "application/json",
    httpMethodOverride = "POST"
  ) {
    return this.request("POST", endpoint, data, {
      "Content-Type": contentType,
      Accept: accept,
      "X-HTTP-Method-Override": httpMethodOverride,
    });
  }

  updateTodo(endpoint, data, contentType = "application/json") {
    return this.request("PUT", endpoint, data, {
      "Content-Type": contentType,
    });
  }

  deleteTodo(endpoint) {
    return this.request("DELETE", endpoint);
  }

  getOptions(endpoint = "todos") {
    return this.request("OPTIONS", endpoint);
  }

  getHeaders(endpoint = "todos") {
    return this.request("HEAD", endpoint);
  }
}
