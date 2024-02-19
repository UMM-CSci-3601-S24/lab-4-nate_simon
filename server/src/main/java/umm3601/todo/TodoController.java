package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import umm3601.Controller;
/**
 * Controller that manages requests for info about todos.
 */

 public class TodoController implements Controller {

  private static final String API_TODOS = "/api/todos";
  private static final String API_TODOS_BY_ID = "/api/todos/{id}";
  static final String OWNER_KEY = "owner";


  static final String SORT_ORDER_KEY = "sortorder";
public static String CATEGORY_KEY = "category";
public static Boolean STATUS_KEY = false | true;
public static String BODY_KEY  = "body";


  private final JacksonMongoCollection<Todo> todoCollection;


  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(
        database,
        "todos",
        Todo.class,
        UuidRepresentation.STANDARD);
  }


    /**
   * Set the JSON body of the response to be a list of all the todos returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */

   public void addNewTodo(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Todo` provided in this context is
     * a "legal" todo. It checks the following things (in order):
     *    - The todo has a value for the name (`tdo.name != null`)
     *    - The todo name is not blank (`tdo.name.length > 0`)
     *    - The provided email is valid (matches EMAIL_REGEX)
     *    - The provided age is > 0
     *    - The provided age is < REASONABLE_AGE_LIMIT
     *    - The provided role is valid (one of "admin", "editor", or "viewer")
     *    - A non-blank company is provided
     * If any of these checks fail, the validator will return a
     * `BadRequestResponse` with an appropriate error message.
     */
    Todo newTodo = ctx.bodyValidator(Todo.class)
      .check(tdo -> tdo.owner != null && tdo.owner.length() > 0, "Todo must have a non-empty todo name")
      .check(status -> status != null, "Status must be a boolean value")
      .check(tdo -> tdo.category != null && tdo.category.length() > 0, "Todo must have a non-empty company name")
      .check(tdo -> tdo.body != null && tdo.body.length() > 0, "Todo must have a non-empty company name")
      .get();

    // Generate a todo avatar (you won't need this part for todos)
    //newTodo.avatar = generateAvatar(newTodo.email);

    // Insert the new todo into the database
    todoCollection.insertOne(newTodo);

    // Set the JSON response to be the `_id` of the newly created todo.
    // This gives the client the opportunity to know the ID of the new todo,
    // which it can use to perform further operations (e.g., display the todo).
    ctx.json(Map.of("id", newTodo._id));
    // 201 (`HttpStatus.CREATED`) is the HTTP code for when we successfully
    // create a new resource (a todo in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpStatus.CREATED);
  }
  public void getTodos(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the todos with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Todo> matchingTodos = todoCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of todos returned by the database.
    // According to the Javalin documentation (https://javalin.io/documentation#context),
    // this calls result(jsonString), and also sets content type to json
    ctx.json(matchingTodos);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with an empty list of filters


    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(OWNER_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(OWNER_KEY, pattern));
    }


    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }


  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }



  public void addRoutes(Javalin server) {
    // Get the specified todo
    server.get(API_TODOS_BY_ID, this::getTodos);

    server.get(API_TODOS, this::getTodos);

    server.post(API_TODOS,  this::addNewTodo);

  }


 }
