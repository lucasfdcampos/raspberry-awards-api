<div align="center">

# 🎬 Raspberry Awards API

[![Issues](https://img.shields.io/github/issues/lucasfdcampos/raspberry-awards-api.svg)](https://github.com/lucasfdcampos/raspberry-awards-api/issues)
[![License](https://img.shields.io/github/license/lucasfdcampos/raspberry-awards-api.svg)](https://github.com/lucasfdcampos/raspberry-awards-api/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/lucasfdcampos/raspberry-awards-api.svg)](https://github.com/lucasfdcampos/raspberry-awards-api/commits/main)

[![NestJS](https://img.shields.io/badge/framework-NestJS-e0234e?logo=nestjs)](https://nestjs.com/)
[![SQLite3](https://img.shields.io/badge/DB-SQLite3-blue?logo=sqlite)](https://www.sqlite.org/index.html)
[![TypeORM](https://img.shields.io/badge/ORM-TypeORM-purple?logo=typeorm)](https://typeorm.io/)
[![fast-csv](https://img.shields.io/badge/CSV-fast--csv-darkred)](https://c2fo.io/fast-csv/)

</div>

## 🎯 About the Project

This project was built to provide a simple, modular and testable RESTful API using NestJS. The goal is to process Raspberry Awards data from a CSV file, identify producers with the shortest and longest intervals between wins, and expose this information through clean endpoints.

The application follows best practices with:
- Modular structure via NestJS
- In-memory database via SQLite + TypeORM
- CSV parsing with fast-csv
- High test coverage using Jest (unit + e2e)

## ⚙️ Technologies Used

- **[NestJS](https://nestjs.com/)** — a progressive Node.js framework for scalable server-side applications
- **[SQLite3](https://www.sqlite.org/index.html)** — lightweight database, ideal for testing and in-memory persistence
- **[TypeORM](https://typeorm.io/)** — a powerful ORM supporting multiple databases
- **[fast-csv](https://c2fo.io/fast-csv/)** — efficient streaming parser for CSV files
- **[Jest](https://jestjs.io/)** — testing framework for unit and e2e tests

## 💡 Features

- CSV loading and parsing with `fast-csv`
- Automatic table creation using TypeORM's `synchronize: true`
- Clean modular architecture with NestJS
- Producer interval logic split into small and testable functions
- Test coverage with Jest

### TypeORM with `synchronize: true`

Quick and easy setup: the `movies` table is created automatically based on the `Movie` entity structure.

> Setting `synchronize: true` shouldn't be used in production - otherwise you can lose production data. [NestJS](https://docs.nestjs.com/recipes/sql-typeorm#:~:text=Setting%20synchronize%3A%20true%20shouldn%27t%20be%20used%20in%20production%20%2D%20otherwise%20you%20can%20lose%20production%20data.)

```ts
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [Movie],
  synchronize: true, // auto-creates the table
}),
```

### CSV loading with fast-csv

```ts
fs.createReadStream(csvPath)
  .pipe(csv.parse({ headers: true, delimiter: ';' }))
  ...
```

## 📦 Project setup
This project was created using the NestJS CLI:
```bash
$ nest new raspberry-awards-api
```
Using the Nest CLI ensures a clean and organized architecture out of the box, following best practices for modularity, testing, and maintainability.

Then, the main module for handling movie data was generated using the CLI:
```bash
$ nest generate resource movie
```
This created the controller, service, module, DTOs, and entity structure following NestJS best practices for a RESTful resource.

## 🚀 Running the Project

1. **Clone the repository**
```bash
❯  git clone git@github.com:lucasfdcampos/raspberry-awards-api.git
```

2. **Enter the directory**
```bash
❯  cd raspberry-awards-api/
```

3. **Start the application**

```bash
# install dependencies
❯  make install

# starts the project (also creates .env if missing)
❯  make start
```

### 🧪 Run tests

```bash
# unit tests
❯  make test

# e2e tests
❯  make test-e2e

# test coverage
❯  make test-cov
```

### 🔗 Available end-points

- `GET /movie`  
  Returns all movies loaded from the CSV.

- `GET /awards/intervals`  
  Returns a JSON with two arrays (`min` and `max`) showing producers with the shortest and longest intervals between wins.

  [![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=raspberry-awards&uri=https%3A%2F%2Fraw.githubusercontent.com%2Flucasfdcampos%2Fraspberry-awards-api%2Frefs%2Fheads%2Fmaster%2Fraspberry-awards.json)

## 🏗️ Project Structure

```
├── app.module.ts
├── main.ts
└── movie
    ├── awards.controller.spec.ts
    ├── awards.controller.ts
    ├── dto
    │   ├── award-interval.dto.ts
    │   └── producer-interval.dto.ts
    ├── entities
    │   └── movie.entity.ts
    ├── movie.controller.spec.ts
    ├── movie.controller.ts
    ├── movielist.csv
    ├── movie.module.ts
    ├── movie.service.spec.ts
    └── movie.service.ts
```

## 🧠 Notes

Link to extra documentation shows organization and formation of ideas for the project.

[![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)](https://lumbar-mall-a1b.notion.site/Challenge-golden-raspberry-awards-1f20ceab98a980479a95c76372433e21)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details
