import axios from "axios";
import {
  TodoService,
  ChallengerService,
  HeartbeatService,
  SecretService,
} from "./index";

export class ApiClient {
  constructor(token) {
    const baseUrl = "https://apichallenges.herokuapp.com";
    this.todos = new TodoService(baseUrl, token);
    this.challenger = new ChallengerService(baseUrl, token);
    this.heartbeat = new HeartbeatService(baseUrl, token);
    this.secret = new SecretService(baseUrl, token);
  }

  static async loginAs() {
    const token = await this.getToken();
    return new ApiClient(token);
  }

  static async getToken() {
    const response = await axios.post(
      "https://apichallenges.herokuapp.com/challenger"
    );
    return response.headers["x-challenger"];
  }
}
