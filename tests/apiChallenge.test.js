import { test, expect } from "@playwright/test";
import { ApiClient } from "../app/services/ApiClient";
import { TodoBuilder } from "../app/helpers/builders/TodoBuilder";

test.describe("API challenges", () => {
  let client;
  let todo;
  let challengeStatus;

  test.beforeAll(async ({}) => {
    client = await ApiClient.loginAs();
  });

  test("2 Получить список испытаний GET /challenges @API", async ({}) => {
    let response = await client.challenger.getChallenges();
    expect(response.status).toBe(200);
    expect(response.data.challenges.length).toBe(59);
  });

  test("3 Получить список заданий GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos();
    expect(response.status).toBe(200);
    expect(response.data.todos.length).toBe(10);
  });

  test("4 Получить список заданий [некорректный эндпоинт] GET /todo @API", async ({}) => {
    let response = await client.todos.getTodos("todo");
    expect(response.status).toBe(404);
  });

  test("5 Получить задание по айди GET /todos/{id} @API", async ({}) => {
    let response = await client.todos.getTodos("todos/1");
    expect(response.status).toBe(200);
    expect(response.data.todos[0].title).toBe("scan paperwork");
  });

  test("6 Получить задание по идентификатору [несуществующее задание] GET /todos/{id} @API", async ({}) => {
    let response = await client.todos.getTodos("todos/1337");
    expect(response.status).toBe(404);
  });

  test("7 Получить список завершённых заданий GET /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus(true)
      .build();
    await client.todos.addTodo("todos", todo);
    let response = await client.todos.getTodos("todos?doneStatus=true");
    expect(response.status).toBe(200);
    expect(response.data.todos).toBeDefined();
  });

  test("8 Получить заголовки заданий HEAD /todos @API", async ({}) => {
    let response = await client.todos.getHeaders();
    expect(response.status).toBe(200);
    expect(response.headers["x-challenger"]).toBe(client.todos.token);
  });

  test("9 Добавить задание POST /todos @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(201);
    expect(response.data.title).toBe(todo.title);
  });

  test("10 Добавить задание [валидация типа данных в doneStatus] POST /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus("true")
      .build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(400);
  });

  test("11 Добавить задание [выход за границы длины в title] POST /todos @API", async ({}) => {
    todo = new TodoBuilder().addTitle(51).addDescription().addStatus().build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(400);
  });

  test("12 Добавить задание [выход за границы длины в description] POST /todos @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription(201).addStatus().build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(400);
  });

  test("13 Добавить задание [граничные значения в title и description] POST /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle(50)
      .addDescription(200)
      .addStatus(true)
      .build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(201);
    expect(response.data).toBeInstanceOf(Object);
  });

  test("14 Добавить задание [выход за границы длины payload] POST /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription(4950)
      .addStatus()
      .build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(413);
  });

  test("15 Добавить задание [нераспознанное поле priority] POST /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus(true)
      .addPriority(10)
      .build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(400);
  });

  test("16 Добавить задание [ошибка метода] PUT /todos/{id} @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    let response = await client.todos.updateTodo("todos/1337", todo);
    expect(response.status).toBe(400);
  });

  test("17 Обновить задание по айди POST /todos/{id} @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    let response = await client.todos.addTodo("todos/1", todo);
    expect(response.status).toBe(200);
    expect(response.data.title).toBe(todo.title);
  });

  test("18 Обновить задание по айди [несуществующее задание] POST /todos/{id} @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    let response = await client.todos.addTodo("todos/1337", todo);
    expect(response.status).toBe(404);
  });

  test("19 Обновить задание PUT /todos/{id} @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus(false)
      .build();
    let response = await client.todos.updateTodo("todos/1", todo);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Object);
  });

  test("20 Обновить задание [только обязательное поле] PUT /todos/{id} @API", async ({}) => {
    todo = {
      title: "new title",
    };
    let response = await client.todos.updateTodo("todos/1", todo);
    expect(response.status).toBe(200);
  });

  test("21 Обновить задание [отсутствует обязательное поле] PUT /todos/{id} @API", async ({}) => {
    todo = new TodoBuilder().addDescription().addStatus(true).build();
    let response = await client.todos.updateTodo("todos/1", todo);
    expect(response.status).toBe(400);
  });

  test("22 Обновить задание [разные айди в params и payload] PUT /todos/{id} @API", async ({}) => {
    todo = new TodoBuilder()
      .addId(2)
      .addTitle()
      .addDescription()
      .addStatus()
      .build();
    let response = await client.todos.updateTodo("todos/1", todo);
    expect(response.status).toBe(400);
  });

  test("23 Удалить запись DELETE /todos/{id} @API", async ({}) => {
    let response = await client.todos.deleteTodo("todos/1");
    expect(response.status).toBe(200);
  });

  test("24 Получить список доступных методов | OPTIONS /todos/{id} @API", async ({}) => {
    let response = await client.todos.getOptions();
    expect(response.status).toBe(200);
    expect(response.headers.allow).toBe("OPTIONS, GET, HEAD, POST");
  });

  test("25 Получить список заданий [XML] | GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos("todos", "application/xml");
    expect(response.status).toBe(200);
    expect(response.data).toMatch(/<todos>[\s\S]*<\/todos>/);
  });

  test("26 Получить список заданий [JSON] | GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos();
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Object);
  });

  test("27 Получить список заданий [стандартный формат] | GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos("todos", "*/*");
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Object);
  });

  test("28 Получить список заданий [предпочтительный XML] | GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos(
      "todos",
      "application/xml, application/json"
    );
    expect(response.status).toBe(200);
    expect(response.data).toMatch(/<todos>[\s\S]*<\/todos>/);
  });

  test("29 Получить список заданий [отсутвует хэдер Accept] | GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos("todos", null);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Object);
  });

  test("30 Получить список заданий [недопустимый формат GZIP] | GET /todos @API", async ({}) => {
    let response = await client.todos.getTodos("todos", "application/gzip");
    expect(response.status).toBe(406);
  });

  test("31 Добавить задание [XML контент] | POST /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus(false)
      .buildWithXML();
    let response = await client.todos.addTodo(
      "todos",
      todo,
      "application/xml",
      "application/xml"
    );
    expect(response.status).toBe(201);
    expect(response.data).toMatch(/<todo>[\s\S]*<\/todo>/);
  });

  test("32 Добавить задание [JSON контент] | POST /todos @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    let response = await client.todos.addTodo("todos", todo);
    expect(response.status).toBe(201);
    expect(response.data.title).toBe(todo.title);
  });

  test("33 Добавить задание [неподдерживаемый контент] | POST /todos @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    let response = await client.todos.addTodo(
      "todos",
      todo,
      "application/gzip"
    );
    expect(response.status).toBe(415);
  });

  test("34 Получить прогресс по испытаниям | GET /challenger/{guid} @API", async ({}) => {
    const response = await client.challenger.getChallengeStatus();
    expect(response.status).toBe(200);
    challengeStatus = response.data;
  });

  test("35 Восстановить прогресс по испытаниям | PUT /challenger/{guid} @API", async ({}) => {
    const payload = await client.challenger.getChallengeStatus();
    challengeStatus = payload.data;
    const response = await client.challenger.updateChallengeStatus(
      `challenger/${client.challenger.token}`,
      challengeStatus
    );
    expect(response.status).toBe(200);
  });

  test("37 Получить прогресс по испытаниям из БД | GET /challenger/database/{guid} @API", async ({}) => {
    const response = await client.challenger.getChallengeProgress();
    challengeStatus = response.data;
    expect(response.status).toBe(200);
  });

  test("38 Восстановить прогресс по испытаниям из БД | PUT /challenger/database/{guid} @API", async ({}) => {
    const payload = await client.challenger.getChallengeProgress();
    challengeStatus = payload.data;
    const response = await client.challenger.updateChallengeProgress(
      `challenger/database/${client.challenger.token}`,
      challengeStatus
    );
    expect(response.status).toBe(204);
  });

  test("39 Добавить задание [XML контент, JSON формат] | POST /todos @API", async ({}) => {
    todo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus(false)
      .buildWithXML();
    const response = await client.todos.addTodo(
      "todos",
      todo,
      "application/xml"
    );
    expect(response.status).toBe(201);
  });

  test("40 Добавить задание [JSON контент, XML формат] | POST /todos @API", async ({}) => {
    todo = new TodoBuilder().addTitle().addDescription().addStatus().build();
    const response = await client.todos.addTodo(
      "todos",
      todo,
      "application/json",
      "application/xml"
    );
    expect(response.status).toBe(201);
  });

  test("41 Удалить запись [неподдерживаемый метод] | DELETE /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.deleteHeartbeat();
    expect(response.status).toBe(405);
  });

  test("42 Обновить запись [внутренняя ошибка сервера] | PATCH /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.updateHeartbeat();
    expect(response.status).toBe(500);
  });

  test("43 Получить трассировку запроса [метод не реализован] | TRACE /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.getTrace();
    expect(response.status).toBe(501);
  });

  test("44 Получить запись | GET /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.getHeartbeat();
    expect(response.status).toBe(204);
  });

  test("45 Создать запись [перезапись метода на DELETE] | POST /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.addHeartbeat("heartbeat", "DELETE");
    expect(response.status).toBe(405);
  });

  test("46 ВСоздать запись [перезапись метода на PATCH] | POST /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.addHeartbeat("heartbeat", "PATCH");
    expect(response.status).toBe(500);
  });

  test("47 Создать запись [перезапись метода на TRACE] | POST /heartbeat @API", async ({}) => {
    const response = await client.heartbeat.addHeartbeat("heartbeat", "TRACE");
    expect(response.status).toBe(501);
  });

  test("48 Получить токен [некорректные креды] | POST /secret/token @API", async ({}) => {
    const response = await client.secret.addSecret(
      "secret/token",
      null,
      "Basic YWRtaW46YWRtaW4="
    );
    expect(response.status).toBe(401);
  });

  test("49 Получить токен | POST /secret/token @API", async ({}) => {
    const response = await client.secret.addSecret(
      "secret/token",
      null,
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    expect(response.status).toBe(201);
  });

  test("50 Получить заметку [невалидный токен] | GET /secret/note @API", async ({}) => {
    const response = await client.secret.getSecret(
      "secret/note",
      null,
      "random"
    );
    expect(response.status).toBe(403);
  });

  test("51 Получить заметку [отсутствует токен] | GET /secret/note @API", async ({}) => {
    const response = await client.secret.getSecret("secret/note");
    expect(response.status).toBe(401);
  });

  test("52 Получить заметку | GET /secret/note @API", async ({}) => {
    const payload = await client.secret.addSecret(
      "secret/token",
      null,
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    const authToken = payload.headers["x-auth-token"];
    const response = await client.secret.getSecret(
      "secret/note",
      null,
      authToken
    );
    expect(response.status).toBe(200);
  });

  test("53 Создать заметку | POST /secret/note @API", async ({}) => {
    const payload = await client.secret.addSecret(
      "secret/token",
      null,
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    const authToken = payload.headers["x-auth-token"];
    const note = { note: "my note" };
    const response = await client.secret.addSecret(
      "secret/note",
      note,
      "Basic YWRtaW46cGFzc3dvcmQ=",
      authToken
    );
    expect(response.status).toBe(200);
  });

  test("54 Создать заметку [отсутствует токен] | POST /secret/note @API", async ({}) => {
    const note = { note: "my note" };
    const response = await client.secret.addSecret(
      "secret/note",
      note,
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    expect(response.status).toBe(401);
  });

  test("55 Создать заметку [невалидный токен] | POST /secret/note @API", async ({}) => {
    const note = { note: "my note" };
    const response = await client.secret.addSecret(
      "secret/note",
      note,
      "random",
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    expect(response.status).toBe(403);
  });

  test("56 Получить заметку [Bearer] | GET /secret/note @API", async ({}) => {
    const payload = await client.secret.addSecret(
      "secret/token",
      null,
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    const authToken = payload.headers["x-auth-token"];
    const response = await client.secret.getSecret(
      "secret/note",
      null,
      null,
      `Bearer ${authToken}`
    );
    expect(response.status).toBe(200);
  });

  test("57 Создать заметку [Bearer] | POST /secret/note @API", async ({}) => {
    const payload = await client.secret.addSecret(
      "secret/token",
      null,
      "Basic YWRtaW46cGFzc3dvcmQ="
    );
    const authToken = payload.headers["x-auth-token"];
    const note = { note: "my note" };
    const response = await client.secret.addSecret(
      "secret/note",
      note,
      `Bearer ${authToken}`
    );
    expect(response.status).toBe(200);
  });

  test("58 Удалить все задания | DELETE /todos @API", async ({}) => {
    const todosResponse = await client.todos.getTodos();
    expect(todosResponse.status).toBe(200);

    for (const todo of todosResponse.data.todos) {
      const deleteResponse = await client.todos.deleteTodo(`todos/${todo.id}`);
      expect(deleteResponse.status).toBe(200);
    }

    const checkTodosResponse = await client.todos.getTodos();
    expect(checkTodosResponse.status).toBe(200);
    expect(checkTodosResponse.data.todos).toHaveLength(0);
  });

  test("59 Создать максимальное количество заданий | POST /todos @API", async ({}) => {
    const maxTodos = 20;
    const createdTodos = [];

    for (let i = 0; i < maxTodos; i++) {
      const todo = new TodoBuilder()
        .addTitle()
        .addDescription()
        .addStatus()
        .build();

      const response = await client.todos.addTodo("todos", todo);
      expect(response.status).toBe(201);
      createdTodos.push(response.data);
    }

    const extraTodo = new TodoBuilder()
      .addTitle()
      .addDescription()
      .addStatus()
      .build();
    const extraResponse = await client.todos.addTodo("todos", extraTodo);

    expect(extraResponse.status).toBe(400);
  });

  test("36 Восстановить прогресс [новый пользователь] @API", async ({}) => {
    const uuid = crypto.randomUUID();
    const payload = await client.challenger.getChallengeStatus();
    challengeStatus = payload.data;
    challengeStatus["xChallenger"] = uuid;
    const response = await client.challenger.updateChallengeStatus(
      `challenger/${uuid}`,
      challengeStatus
    );
    expect(response.status).toBe(201);
    console.log(response.headers);
  });
});
