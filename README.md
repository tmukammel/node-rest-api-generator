# Node REST API Generator
#### This is a beta version

## Supposed project folder structure
> Note: for the generator script to work, the following folder structure is needed

```bash
- app
    - controller
        - <Model_Name>Controller # example: UserController.js
    - model
        - <camel_Plueral_Model_Name> # example: users.js
-  database
    - config
        - config.json
    - migrations
    - models
    - seeders
- routes
    - api
        - <camel_Plueral_Model_Name> # example: users.js
    - index.js
    - urls.js
- app.js
```

## How to use

### 1. I keep this repo inside the project root under a folder /automator

### 2. clone this repo under project-root/automator
```bash
$ git clone url-to-this-repo ./automator
```

### 3. Git ignore the `automator` folder

### 4. Create your Source Data Model like below inside the repo folder `automator/model_source`

#### 4.1 Define the API urls:

- In the `./routes/urls.js` file
- naming conventions
    - METHOD_MODEL(S), e.g: POST_USER, GET_USERS, GET_USER
    - API end point: '/api/models/:id'

```js
exports.users = {
        POST_USER: "/api/users",
        GET_USERS: "/api/users",
        GET_USER: "/api/users/:id",
        PUT_USER: "/api/users/:id",
        PATCH_USER: "/api/users/:id",
        DELETE_USER: "/api/users/:id"
}
```

#### 4.2 Model Generation Instructions:

- names: {'name': ModelName, 'pleural_name': PleuralModelName}
- attributes: only {"name": "field_name", "type": "sequelize_type"}
- associations:
    - { "method": "belongsTo", "associated_model": "Model", "as": "model" }
    - { "method": "hasOne", "associated_model": "Model", "as": "model" }
    - { "method": "hasMany", "associated_model": "Model", "as": "model" }
- routes[].method options: ['createModel', 'updateModel', 'patchModel', 'getModels', 'getModel', 'deleteModel']
- For controller model and route (middleware file) you can choose your own folder name

```js
{
    "models": [
        {
            "names": {
                "name": "User",
                "pleural_name": "Users"
            },
            "attributes": [
                {"name": "firstName", "type": "string"},
                {"name": "lastName", "type": "string"},
                {"name": "firstNameFurigana", "type": "string"},
                {"name": "lastNameFurigana", "type": "string"},
                {"name": "dob", "type": "date"},
                {"name": "email", "type": "string"},
                {"name": "isMember", "type": "boolean"}
            ],
            "associations": [
                {
                    "method": "belongsTo",
                    "associated_model": "Role",
                    "as": "role"
                }
            ],
            "routes": [
                {"url": "/api/activities", "method": "createModel"},
                {"url": "/api/activities/:id", "method": "updateModel"},
                {"url": "/api/activities/:id", "method": "patchModel"},
                {"url": "/api/activities/", "method": "getModels"},
                {"url": "/api/activities:id", "method": "getModel"},
                {"url": "/api/activities:id", "method": "deleteModel"}
            ],
            "controller_dir_name": "user",
            "model_dir_name": "users",
            "routes_dir_name": "users"
        },
        // More models ...
    ]
}
```

### 5. Run API generator script

```bash
$ node ./automator/restAPIGenerator.js ./automator/model_source/Mode.js ./automator/model_source/AnotherMode.js
```

### 6. Before running migration from ./database folder with sequelize cmd you may want to update your migration file for validation and etc.

```bash
$ sequelize db:migrate
```

### 7. In routes/index.js use the router middleware
```js
const model = require("./api/models");
router.use(model);
```

That's it. Now you can try your new APIs with postman or similar.