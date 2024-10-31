import axios from "axios";

export class HeartbeatService {
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

  deleteHeartbeat(endpoint = "heartbeat") {
    return this.request("DELETE", endpoint);
  }

  updateHeartbeat(
    endpoint = "heartbeat",
    data,
    contentType = "application/json",
    accept = "application/json"
  ) {
    return this.request("PATCH", endpoint, data, {
      "Content-Type": contentType,
      Accept: accept,
    });
  }

  getHeartbeat(endpoint = "heartbeat", accept = "application/json") {
    return this.request("GET", endpoint, null, {
      Accept: accept,
    });
  }

  addHeartbeat(endpoint = "heartbeat", httpMethodOverride = "POST") {
    return this.request("POST", endpoint, null, {
      "X-HTTP-Method-Override": httpMethodOverride,
    });
  }

  getTrace(endpoint = "heartbeat") {
    return this.request("TRACE", endpoint);
  }
}
