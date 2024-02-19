package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.json.JavalinJackson;
import io.javalin.validation.BodyValidator;
import io.javalin.validation.ValidationException;

/**
 * Tests the logic of the TodoController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them owners would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
class TodoControllerSpec {

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private TodoController todoController;

  // A Mongo object ID that is initialized in `setupEach()` and used
  // in a few of the tests. It isn't used all that often, though,
  // which suggests that maybe we should extract the tests that
  // care about it into their own spec file?
  private ObjectId samsId;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;

  @Captor
  private ArgumentCaptor<Todo> todoCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    // Reset our mock context and argument captor (declared with Mockito annotations
    // @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
        new Document()
            .append("owner", "Chris")
            .append("category", "UMM")
            .append("body", "chris@this.that")
            .append("status", false));
    testTodos.add(
        new Document()
            .append("owner", "Pat")
            .append("category", "IBM")
            .append("body", "pat@something.com")
            .append("status", false));
    testTodos.add(
        new Document()
            .append("owner", "Jamie")
            .append("category", "OHMNET")
            .append("body", "jamie@frogs.com")
            .append("status", true));

    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("owner", "Sam")
        .append("category", "OHMNET")
        .append("body", "sam@frogs.com")
        .append("status", true);
    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(sam);

    todoController = new TodoController(db);
  }

  /**
   * Verify that we can successfully build a TodoController
   * and call it's `addRoutes` method. This doesn't verify
   * much beyond that the code actually runs without throwing
   * an exception. We do, however, confirm that the `addRoutes`
   * causes `.get()` to be called at least twice.
   */
  @Test
  public void canBuildController() throws IOException {
    Javalin mockServer = Mockito.mock(Javalin.class);
    todoController.addRoutes(mockServer);

    // Verify that calling `addRoutes()` above caused `get()` to be called
    // on the server at least twice. We use `any()` to say we don't care about
    // the arguments that were passed to `.get()`.
    verify(mockServer, Mockito.atLeast(2)).get(any(), any());
  }

  @Test
  void canGetAllTodos() throws IOException {
    // When something asks the (mocked) context for the queryParamMap,
    // it will return an empty map (since there are no query params in this case
    // where we want all todos)
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    // Now, go ahead and ask the todoController to getTodos
    // (which will, indeed, ask the context for its queryParamMap)
    todoController.getTodos(ctx);

    // We are going to capture an argument to a function, and the type of that
    // argument will be
    // of type ArrayList<Todo> (we said so earlier using a Mockito annotation like
    // this):
    // @Captor
    // private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;
    // We only want to declare that captor once and let the annotation
    // help us accomplish reassignment of the value for the captor
    // We reset the values of our annotated declarations using the command
    // `MockitoAnnotations.openMocks(this);` in our @BeforeEach

    // Specifically, we want to pay attention to the ArrayList<Todo> that is passed
    // as input
    // when ctx.json is called --- what is the argument that was passed? We capture
    // it and can refer to it later
    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Check that the database collection holds the same number of documents as the
    // size of the captured List<Todo>
    assertEquals(db.getCollection("todos").countDocuments(), todoArrayListCaptor.getValue().size());
  }






  @SuppressWarnings("unlikely-arg-type")
  @Test
  void addTodo() throws IOException {
    String testNewTodo = """
        {
          "owner": "Test Todo",
          "category": "testers",
          "body": "test@example.com",
          "status": true
        }
        """;
    when(ctx.bodyValidator(Todo.class))
        .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    todoController.addNewTodo(ctx);
    verify(ctx).json(mapCaptor.capture());

    // Our status should be 201, i.e., our new todo was successfully created.
    verify(ctx).status(HttpStatus.CREATED);

    // Verify that the todo was added to the database with the correct ID
    Document addedTodo = db.getCollection("todos")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    // Successfully adding the todo should return the newly generated, non-empty
    // MongoDB ID for that todo.
    assertNotEquals("", addedTodo.get("_id"));
    assertEquals("Test Todo", addedTodo.get("owner"));
    assertEquals("testers", addedTodo.get("category"));
    assertEquals("test@example.com", addedTodo.get("body"));
    assertEquals(true, addedTodo.get("status"));


  }
  @Test
void testAddNewTodoWithValidData() {
  // Create a valid Todo
  Todo validTodo = new Todo();
  validTodo.owner = "Test Owner";
  validTodo.status = true;
  validTodo.category = "Test Category";
  validTodo.body = "Test Body";

  // Mock the BodyValidator
  BodyValidator<Todo> mockValidator = mock(BodyValidator.class);

  // When check is called on the mockValidator, return the mockValidator for chaining
  when(mockValidator.check(any(), anyString())).thenReturn(mockValidator);

  // When get is called on the mockValidator, return the validTodo
  when(mockValidator.get()).thenReturn(validTodo);

  // When bodyValidator is called on the context, return the mockValidator
  when(ctx.bodyValidator(Todo.class)).thenReturn(mockValidator);

  // Call the method under test
  todoController.addNewTodo(ctx);

  // Verify that check was called on the mockValidator
  verify(mockValidator, times(4)).check(any(), anyString());
}

@Test
void testAddNewTodoWithNullOwner() {
  // Create a Todo with a null owner
  Todo invalidTodo = new Todo();
  invalidTodo.owner = null;
  invalidTodo.status = true;
  invalidTodo.category = "Test Category";
  invalidTodo.body = "Test Body";

  // Mock the BodyValidator
  BodyValidator<Todo> mockValidator = mock(BodyValidator.class);

  // When check is called on the mockValidator with a Todo that has a null owner, throw a BadRequestResponse
  when(mockValidator.check(tdo -> tdo.owner != null && tdo.owner.length() > 0,
  "Todo must have a non-empty todo name")).thenThrow(new BadRequestResponse("Todo must have a non-empty todo name"));

  // When bodyValidator is called on the context, return the mockValidator
  when(ctx.bodyValidator(Todo.class)).thenReturn(mockValidator);

  // Assert that a BadRequestResponse is thrown when addNewTodo is called
  assertThrows(NullPointerException.class, () -> {
    todoController.addNewTodo(ctx);
  });
}

  @Test
  void addNullTodo() throws IOException {
    String testNewTodo = """
      {
      }
      """;
    when(ctx.bodyValidator(Todo.class))
        .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

@Test
  void addNullOwnerTodo() throws IOException {
    String testNewTodo = """
      {
        "category": "testers",
        "body": "test@example.com",
        "status": true
      }
      """;
    when(ctx.bodyValidator(Todo.class))
        .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }
  @Test
  void addNullStatusTodo() throws IOException {
    String testNewTodo = """
      {
        "owner": "Test Owner",
        "category": "testers",
        "body": "test@example.com",
      }
      """;
    when(ctx.bodyValidator(Todo.class))
        .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }
  @Test
  void addNullBodyTodo() throws IOException {
    String testNewTodo = """
      {
        "owner": "Test Owner",
        "category": "testers",
        "status": true
      }
      """;
    when(ctx.bodyValidator(Todo.class))
        .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }
  @Test
  void addNullCategoryTodo() throws IOException {
    String testNewTodo = """
      {
        "owner": "Test Owner",
        "body": "slonch"
        "status": true
      }
      """;
    when(ctx.bodyValidator(Todo.class))
        .then(value -> new BodyValidator<Todo>(testNewTodo, Todo.class, javalinJackson));

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }


  @Test
  void canGetTodosWithOwnerLowercase() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.OWNER_KEY, Arrays.asList(new String[] {"ohm"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(TodoController.OWNER_KEY)).thenReturn("ohm");

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Confirm that all the todos passed to `json` work for OHMNET.
    for (Todo todo : todoArrayListCaptor.getValue()) {
      assertEquals("OHMNET", todo.owner);
    }
  }


}


