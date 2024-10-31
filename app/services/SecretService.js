import axios from "axios";

export class SecretService {
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

  addSecret(endpoint, data = null, authorization = null, authToken = null) {
    return this.request("POST", endpoint, data, {
      Authorization: authorization,
      "X-Auth-Token": authToken,
    });
  }

  getSecret(endpoint, body = null, authToken = null, authorization = null) {
    return this.request("GET", endpoint, body, {
      "X-Auth-Token": authToken,
      Authorization: authorization,
    });
  }
}
