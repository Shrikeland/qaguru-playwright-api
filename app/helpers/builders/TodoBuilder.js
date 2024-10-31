import { faker } from "@faker-js/faker";
import { json2xml } from "xml-js";

export class TodoBuilder {
  constructor() {
    this.todo = {
      title: null,
      description: null,
      doneStatus: null,
    };
  }

  addTitle(length = 50) {
    this.todo.title = faker.string.alpha(length);
    return this;
  }

  addDescription(length = 200) {
    this.todo.description = faker.string.alpha(length);
    return this;
  }

  addStatus(status) {
    this.todo.doneStatus = status;
    return this;
  }

  addPriority(priority) {
    this.todo.priority = priority;
    return this;
  }

  addId(id) {
    this.todo.id = id;
    return this;
  }

  build() {
    return { ...this.todo };
  }

  buildWithXML() {
    return json2xml(this.todo, { compact: true, spaces: 4 });
  }
}
