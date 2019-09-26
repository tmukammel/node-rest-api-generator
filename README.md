# Node REST API Generator
#### This is a beta version

## Supposed project folder structure
> Note: for the generator script to work, the following folder structure is needed

```
- app
    - controller
        - <Model_Name>Controller // UserController.js
    - model
        - <camel_Plueral_Model_Name> // users.js
-  database
    - config
        - config.json
    - migrations
    - models
    - seeders
- routes
    - api
        - <camel_Plueral_Model_Name> // users.js
    - index.js
    - urls.js
- app.js
```

## How to use

### 1. I keep this repo inside the project root under a folder /automator

### 2. clone this repo under project-root/automator
`git clone url-to-this-repo ./automator`

### 3. Git ignore the `automator` folder

### 4. Create your Source Data Model like below inside the repo folder `automator/model_source`

#### Instructions:

- names: {'name': ModelName, 'pleural_name': PleuralModelName}
- attributes: only {"name": "field_name", "type": "sequelize_type"}
- associations:
    - { "method": "belongsTo", "associated_model": "Model", "as": "model" }
    - { "method": "hasOne", "associated_model": "Model", "as": "model" }
    - { "method": "hasMany", "associated_model": "Model", "as": "model" }
- routes[].method options: ['createModel', 'updateModel', 'patchModel', 'getModels', 'getModel', 'deleteModel']
- For controller model and route (middleware file) you can choose your own folder name

```
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

```
node ./automator/restAPIGenerator.js ./automator/model_source/Mode.js ./automator/model_source/AnotherMode.js
```

### 6. Before running migration from ./database folder with sequelize cmd you may want to update your migration file for validation and etc.

`sequelize db:migrate`
