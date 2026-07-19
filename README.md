# Blue Ribbon Egypt - Backend Developer Task

Blue Ribbon is established with a sense of mission to create inspirational communities that harness the positive power of collective good.

We aim to transform the lifestyle industry with bold thinking, continuous innovation and a meticulous focus on execution. If you are passionate like us, ready to build the future and participate in positively and conscientiously impacting the lives of others, there is but one thing to do: join us.

## **Task Objective**

This task is designed to assess your backend engineering skills in a realistic codebase. You will implement a missing feature and improve parts of the existing codebase to make it more correct, consistent, maintainable, and performant without changing the intended business behavior.

We care about clean code, clear reasoning, and practical engineering trade-offs.
This task should take you a maximum of 5 hours to finish.

## **Business Logic**

Blue Ribbon runs a small club with a large member base (**70k+**). The club has several shops that sell products. Members browse shops and products through a mobile app that calls this backend.

Each member has a first and last name, gender (**male** or **female** only), birthdate, and subscription date. A member can optionally have a phone number.

Members may also have family members linked to them, and each family member can be associated with a maximum of one central member. Note that a member can not be their own central member, and family member can not be a central member.

Each shop has a name, opening and closing hours, and availability (**busy**, **open**, **closed**). A product has a name, description, price, and stock count. A product must belong to exactly one shop. Stock count can not be less than 1 for a product.

## **What You’ll Work On**

**This codebase is intentionally incomplete and has a few issues.** Your job is to extend it with a missing feature and improve existing parts without changing the business behavior.

**Tech Stack:**

- **NestJS**
- **PostgreSQL**
- **Sequelize** (`sequelize-typescript`)
- **Validation**: `nestjs-joi` (DTOs already use `@JoiSchema`)

## **Requirements**

### **We need to manage our products**

Implement the **Product** REST API endpoints so we can:

- Create a product
- List **all products in the club**, with optional search by product name
  - Search must be **case-insensitive**
  - Example: searching for `"app"` should match `"Apple Juice"` and `"Pineapple"`
- Fetch a single product (by ID)
- Update a product
- Delete a product

Your API should follow **RESTful conventions** and common best practices (clear routes, correct status codes, predictable response shapes).

### **Fetch shops with products API is too slow**

The endpoint that returns shops with their products performs poorly on large datasets. Can you improve it so it scales well and avoids unnecessary database work?

### **The endpoint ran N+1 query**
<!-- to fix that I added a Shop hasMany Product association and load products with Sequelize's include: { separate: true }, so it runs 2 queries total (one for shops, one batched WHERE shopId IN (...) for their products) regardless of shop count. -->

<!-- Added a page/limit query -->

### **We have so many members in our club!**

The API that fetches all members returns an array with a massive amount of objects. This can add load to the client-side. How can we fix this?

<!-- <!-- to fix `GET /members` no longer returns the whole member base. Added batched results with a default page limit of 20, a case-insensitive on first/last name, and a gender filter so clients fetch a small, targeted page.  -->

### **Validation and correctness**

- The project uses Joi for request validation, but validation is not consistently enforced and some DTO rules do not match the business rules. Make validation **reliable and consistent**, and fix mismatches between DTOs and the requirements.
- Some business rules are not properly enforced in the codebase, which allows clients to bypass them. Ensure the API prevents invalid states (for example: invalid family links, invalid enums, etc.).

### **Testing is part of the job**

Testing is an essential part of our daily workflow. This project currently lacks unit test coverage.

We would like to add unit tests for the **controllers and services** of the members, products and shops modules. Make sure the tests are meaningful (happy paths + at least a couple of real failure cases).

### **Code quality**

Improve consistency of:

- **Error handling:** return correct HTTP errors instead of generic runtime errors
- **Types:** avoid return types that don’t match real runtime behavior
- **Documentation:** keep JSDoc style consistent across key methods
- **Variable naming**: Make sure variable and function names are clear, consistent, and describe what they represent

## **Running the project**

1. Install dependencies:

```jsx
npm install
```

1. Set up environment variables:

- Copy `.env.example` to `.env`
- Set `DATABASE_URL`

1. Run the server:

```jsx
npm run start:dev
```

### **Seeding data**

A seeding script is included to generate a large dataset for testing performance.

```jsx
npm run seed
```

## **Deliverables**

- Working implementation of the missing product endpoints
- Improved performance for the shops-with-products endpoint
- Validation enforced and aligned with the business rules

## **Submission Instructions**

- Fork this repository to your own GitHub account.
- Implement your solution on your fork. It is recommended to commit often with clear messages.
- Make sure everything works locally:
  - `npm run build`
  - `npm test`
- Push your changes to your fork and ensure the repository is accessible via a **public link**.
- Send us an email **by replying to the same email thread where you received this task**, and include the public link to your repository.

## **Evaluation Criteria**

We’ll review your work based on: **Correctness**, **Performance**, **Code quality**, and **Testing**

## **Notes**

- You do not need to implement authentication/authorization for this task.
- If you make assumptions, document them clearly (in code comments where relevant, or in your PR notes).

## **Bonus**

- Add caching where it makes sense (and explain what you cached and why).
- Standardize error response shape (message + code + details) across the application.

## Implementation Summary

- Implemented full Products CRUD API with case-insensitive search.
- Added pagination and filtering for Members.
- Optimized Shops with Products to remove N+1 queries.
- Standardized Joi validation across all DTOs.
- Enforced member family-link and enum business rules.
- Added proper HTTP errors and UUID validation.
- Aligned repository return types with runtime behavior.
- Added controller and service unit tests for all modules.
- Cached the Shops-with-Products endpoint (60s TTL) since it is expensive but rarely changes.

### Environment setup

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/blue_ribbon
PORT=3000
```

Then install, seed a large dataset, and run:

```bash
npm install
npm run seed       
npm run start:dev
```

### API reference

```
# Products
POST   /products
GET    /products?search=app        # case-insensitive, partial match
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id

# Members
POST   /members
GET    /members?search=ahmed&gender=male&page=1&limit=20
GET    /members/:id
PATCH  /members/:id
DELETE /members/:id

# Shops
POST   /shops
GET    /shops
GET    /shops/with-products?page=1&limit=20  
GET    /shops/:id
PUT    /shops/:id
DELETE /shops/:id
```
