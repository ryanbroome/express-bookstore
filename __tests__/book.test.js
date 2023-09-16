// Test for app express-bookstore

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");

const db = require("../db");

const TEST_BOOK = {
  isbn: "testCreate",
  amazon_url: "www.testCreate.com",
  author: "John Doe",
  language: "english",
  pages: 100,
  publisher: "testCPublisher",
  title: "testCTitle",
  year: 2023,
};

describe("book database integration tests", function () {
  beforeAll(async function () {});
  beforeEach(async function () {
    await db.query(`DELETE FROM books`);
    const result = await db.query(
      `INSERT INTO books (
        isbn,
        amazon_url,
         author,
          language,
           pages,
            publisher,
             title,
              year )
      VALUES ('testID', 'www.test.com', 'John Doe', 'english', 100, 'testPublisher', 'testTitle', 2023)
      RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`
    );
  });
  afterEach(async function () {
    await db.query(`DELETE FROM books`);
  });
  afterAll(async function () {
    db.end();
  });

  test("GET / books", async function () {
    const resp = await request(app).get("/books/");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      books: [
        {
          isbn: "testID",
          amazon_url: "www.test.com",
          author: "John Doe",
          language: "english",
          pages: 100,
          publisher: "testPublisher",
          title: "testTitle",
          year: 2023,
        },
      ],
    });
  });

  test("GET / books / :isbn", async function () {
    const resp = await request(app).get("/books/testID");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      book: {
        isbn: "testID",
        amazon_url: "www.test.com",
        author: "John Doe",
        language: "english",
        pages: 100,
        publisher: "testPublisher",
        title: "testTitle",
        year: 2023,
      },
    });
  });

  test("POST / books / { book => book, 201} ", async function () {
    const resp = await request(app).post("/books").send({
      isbn: "testCreate",
      amazon_url: "www.testCreate.com",
      author: "John Doe",
      language: "english",
      pages: 100,
      publisher: "testCPublisher",
      title: "testCTitle",
      year: 2023,
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      book: {
        isbn: "testCreate",
        amazon_url: "www.testCreate.com",
        author: "John Doe",
        language: "english",
        pages: 100,
        publisher: "testCPublisher",
        title: "testCTitle",
        year: 2023,
      },
    });
  });

  test("PUT / books / :isbn / { :isbn, data => updatedBook} ", async function () {
    const resp = await request(app).put("/books/testID").send({
      author: "RYAN BROOME",
      amazon_url: "www.ryanbroome.com",
      language: "espanol",
      pages: 1,
      publisher: "BROOME HOUSE",
      title: "The End",
      year: 1984,
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      book: {
        isbn: "testID",
        amazon_url: "www.ryanbroome.com",
        author: "RYAN BROOME",
        language: "espanol",
        pages: 1,
        publisher: "BROOME HOUSE",
        title: "The End",
        year: 1984,
      },
    });
  });

  test("DELETE / books / :isbn / { :isbn => status : 200 ", async function () {
    const resp = await request(app).delete("/books/testID");
    expect(resp.statusCode).toBe(200);
  });
});
