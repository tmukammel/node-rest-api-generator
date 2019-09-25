/*
 * File: restAPIGenerator.js
 * Project: cholon-playground
 * File Created: Thursday, 16th May 2019 1:32:37 am
 * Author: Twaha Mukammel (tm@ulkabd.com)
 * -----
 * Last Modified: Thursday, 16th May 2019 1:32:42 am
 * Modified By: Twaha Mukammel (tm@ulkabd.com>)
 * -----
 * Copyright (c) 2017 - 2019 Ulka Bangladesh
 */

'use strict';

const fs = require('fs');
const isWin = process.platform === "win32";
const sourceSnippets = require('./sourceSnippets');
const { execSync } = require('child_process');

// MARK - Accessory Methods

const getFileNameArguments = () => {
    return process.argv.slice(2);
}

const readFile = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    if (isWin)
        content = content.replace(/\r/g, "");
    return content;
}

const mkdirSyncRecursive = (directory) => {
    var path = directory.replace(/\/$/, '').split('/');
    for (var i = 1; i <= path.length; i++) {
        var segment = path.slice(0, i).join('/');
        segment.length > 0 && !fs.existsSync(segment) ? fs.mkdirSync(segment) : null ;
    }
};

const writeJsFile = (directory, fileName, content) => {
    try {
        mkdirSyncRecursive(directory)

        fs.writeFile(
            directory + `${fileName}.js`,
            content,
            function (err) {
                if (err) console.log("Error: ", err);
                else console.log(`${fileName} File constructed successfully!`);
            }
        );

    } catch (err) {
        console.error(err)
    }
}

const runSequelizeCmd = (model) => {
    let sequelizeCmdStr = `sequelize model:generate --name ${model.names.name} --attributes `;
    model.attributes.forEach(attr => {
        sequelizeCmdStr += `${attr.name}:${attr.type},`
    });
    sequelizeCmdStr = sequelizeCmdStr.slice(0, sequelizeCmdStr.length - 1);
    console.log(`Sequelize cmd string: ${sequelizeCmdStr}`);

    execSync(sequelizeCmdStr, { cwd: `${__dirname}/../database/` }, (err, stdout, stderr) => {
        if (err == null) console.log("Sequelize cmd ran successfully!");
    });
}

// MARK - Functional Methods

/**
 * association object model
 * {
        "method": "hasMany",
        "associated_model": "TrackerTypeModel",
        "foreignkey": "trackerTypeModelId"
        "sourcekey": "id"
        "as": "trackerTypeModels",
    }
 */
const addModelAssociations = (file, model) => {
    // REPLACE `// associations can be defined here`
    let associationsCode = '';

    model.associations.forEach(association => {
        switch (association.method) {
            // @{MODEL}.belongsTo(models.@{ASSOCIATED_MODEL}, {as: '@{LOWER_ASSOCIATED_MODEL}'});
            case 'belongsTo':
                {
                    let ascModel = association.associated_model;
                    let lowerAscModel = association.associated_model.charAt(0).toLowerCase() + association.associated_model.substring(1);
                    associationsCode +=
                        `${model.names.name}.belongsTo(models.${ascModel}, {as: '${lowerAscModel}'});
    `;
                }
                break;

            // @{MODEL}.hasOne(models.@{ASSOCIATED_MODEL}, {foreignKey: @{FOREIGNKEY}, sourceKey: @{SOURCEKEY}, as: @{AS});
            case 'hasOne':
                {
                    let ascModel = association.associated_model;
                    let foreignKey = ('foreignkey' in association) ? association.foreignkey : model.names.name.charAt(0).toLowerCase() + model.names.name.substring(1) + 'Id';
                    let sourceKey = ('sourcekey' in association) ? association.sourcekey : 'id';
                    let as = ('as' in association) ? association.as : association.associated_model.charAt(0).toLowerCase() + association.associated_model.substring(1);
                    associationsCode +=
                        `${model.names.name}.hasOne(models.${ascModel}, {foreignKey: '${foreignKey}', sourceKey: '${sourceKey}', as: '${as}'});
    `;
                }
                break;

            // @{MODEL}.hasMany(models.@{ASSOCIATED_MODEL}, {foreignKey: @{FOREIGNKEY}, sourceKey: @{SOURCEKEY}, as: @{AS});
            case 'hasMany':
                {
                    let ascModel = association.associated_model;
                    let foreignKey = ('foreignkey' in association) ? association.foreignkey : model.names.name.charAt(0).toLowerCase() + model.names.name.substring(1) + 'Id';
                    let sourceKey = ('sourcekey' in association) ? association.sourcekey : 'id';
                    let as = ('as' in association) ? association.as : association.associated_model.charAt(0).toLowerCase() + association.associated_model.substring(1) + 's';
                    associationsCode +=
                        `${model.names.name}.hasMany(models.${ascModel}, {foreignKey: '${foreignKey}', sourceKey: '${sourceKey}', as: '${as}'});
    `;
                }
                break;
        }
    });

    if (associationsCode.length > 0) {
        file = file.replace("// associations can be defined here", associationsCode);
    }

    return file;
}

const addModelCRUDFunctions = (file, model) => {
    let functionsCode = '';

    // getModelById()
    functionsCode += (sourceSnippets.dbModel.functions.methods.getModelById.replace(/@{MODEL}/g, model.names.name) + `
  `);

    // getModel()
    functionsCode += (sourceSnippets.dbModel.functions.methods.getModel.replace(/@{MODEL}/g, model.names.name) + `
  `);

    // getModels()
    let getModelsSnippet = sourceSnippets.dbModel.functions.methods.getModels.replace(/@{MODEL}/g, model.names.name);
    getModelsSnippet = getModelsSnippet.replace("@{PLEURAL_MODEL}", model.names.pleural_name);
    functionsCode += (getModelsSnippet + `
  `);

    // createModel()
    let createModelSnippet = sourceSnippets.dbModel.functions.methods.createModel.replace(/@{MODEL}/g, model.names.name);
    let assignments = '';
    model.attributes.forEach(attribute => {
        assignments += (sourceSnippets.dbModel.functions.statements.assignToModel.replace(/@{ATTRIBUTE}/g, attribute.name) + `
    `);
    });
    if (assignments.length > 0) {
        createModelSnippet = createModelSnippet.replace("@{ASSIGN_TO_MODEL}", assignments);
    }
    functionsCode += (createModelSnippet + `
  `);

    // updateModel()
    let updateModelSnippet = sourceSnippets.dbModel.functions.methods.updateModel.replace(/@{MODEL}/g, model.names.name);
    if (assignments.length > 0) {
        updateModelSnippet = updateModelSnippet.replace("@{ASSIGN_TO_MODEL}", assignments);
    }
    functionsCode += (updateModelSnippet + `
  `);

    // deleteModel()
    functionsCode += (sourceSnippets.dbModel.functions.methods.deleteModel.replace(/@{MODEL}/g, model.names.name) + `
  `);

    if (functionsCode.length > 0) {
        // return Model;
        functionsCode += `return ${model.names.name};`;
        file = file.replace(`return ${model.names.name};`, functionsCode);
    }

    return file;
}

const updateSequelizeDBModel = (model) => {
    let file = readFile(`${__dirname}/../database/models/${model.names.name.toLowerCase()}.js`);

    // Add associations in file content
    file = addModelAssociations(file, model);

    // Add CRUD functions in file content
    file = addModelCRUDFunctions(file, model);

    // console.log(file);

    fs.writeFile(
        `${__dirname}/../database/models/${model.names.name.toLowerCase()}.js`,
        file,
        function (err) {
            if (err) console.log("Error: ", err);
            else console.log('SequelizeDBModel File updated successfully!');
        }
    );
}

const modelClassFileDir = (model) => {
    let fileDir = `${__dirname}/../app/model/`;
    if ('model_dir_name' in model && model.model_dir_name.length > 0) fileDir += `${model.model_dir_name}/`
    // filePath += `${fileName}.js`
    return fileDir;
}

const getURLParamNames = (url) => {
    let parts = url.split('/');
    let params = parts.filter(part => part.startsWith(':'));
    return params;
}

const createModelClassFunctions = (file, model) => {
    let functionsCode = '';

    model.routes.forEach(route => {
        let func = sourceSnippets.model.functions.methods[route.method];
        // console.log(`Function for method: ${route.method}`);
        // console.log(func);

        switch (route.method) {
            case 'getModel':
                {
                    func = func.replace(/@{MODEL}/g, model.names.name);
                    
                    const params = getURLParamNames(route.url)
                    // console.log("URL params:");
                    // console.log(params);
                    
                    let statements = '';
                    if (params.length > 1 || params.includes(':id') == false) {
                        statements += `${sourceSnippets.model.functions.statements.mergeParamsInQuery}
        ${sourceSnippets.model.functions.statements.getModel.replace(/@{MODEL}/g, model.names.name)}`;
                    }
                    else {
                        statements += `${sourceSnippets.model.functions.statements.getModelById.replace(/@{MODEL}/g, model.names.name)}`;
                    }

                    func = func.replace('@{STATEMENTS}', statements);
                    
                    functionsCode += (func + `
    
    `);
                }
                break;

            case 'getModels':
                {
                    func = func.replace(/@{PLEURAL_MODEL}/g, model.names.pleural_name);
                    
                    const params = getURLParamNames(route.url)
                    // console.log("URL params:");
                    // console.log(params);
                    
                    let statements = '';
                    if (params.length > 1) {
                        statements += `${sourceSnippets.model.functions.statements.mergeParamsInQuery}
    `;
                    }
                    let getModels = sourceSnippets.model.functions.statements.getModels.replace(/@{MODEL}/g, model.names.name);
                    getModels = getModels.replace(/@{PLEURAL_MODEL}/g, model.names.pleural_name);
                    statements += `${getModels}`;

                    func = func.replace('@{STATEMENTS}', statements);
                    
                    functionsCode += (func + `
    
    `);
                }
                break;
            
            case 'createModel':
            case 'updateModel':
            case 'patchModel':
            case 'deleteModel':
                {
                    func = func.replace(/@{MODEL}/g, model.names.name);
                    functionsCode += (func + `
    
    `);
                }
                break;
        }
        
    });

    file = file.replace("@{FUNCTIONS}", functionsCode);
    return file;
}

const createModelClassFileContents = (model) => {
    let file = sourceSnippets.model.body;
    
    // Set required directory level ups for db and queryParser
    let relative_db_dir_change = '../..';
    let relative_qp_dir_change = '..';
    let dirUps = '';
    const noOfDirUps = model.model_dir_name.split('/').filter(dir => dir.length > 0).length;
    for (let index = 0; index < noOfDirUps; index++) {
        dirUps += '../';
    }
    relative_db_dir_change = dirUps + relative_db_dir_change;
    relative_qp_dir_change = dirUps + relative_qp_dir_change;

    // set db relative dir
    file = file.replace("@{RELATIVE_DB_DIR_CHANGE}", relative_db_dir_change);
    // set query parser relative dir
    file = file.replace("@{RELATIVE_QP_DIR_CHANGE}", relative_qp_dir_change);
    // replace constructor function names
    file = file.replace(/@{PLEURAL_MODEL}/g, model.names.pleural_name);
    // create model operation functions
    file = createModelClassFunctions(file, model);
    return file;
}

const constructModelClass = (model) => {
    let file = createModelClassFileContents(model);
    // console.log("Model Class File Content: ");
    // console.log(file);
    
    const modelClassFileName = model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1);
    const fileDir = modelClassFileDir(model);
    // console.log(`File Dir: ${fileDir}`);

    writeJsFile(fileDir, modelClassFileName, file);
}

const controllerFileDir = (model) => {
    let fileDir = `${__dirname}/../app/controller/`;
    if ('controller_dir_name' in model && model.controller_dir_name.length > 0) fileDir += `${model.controller_dir_name}/`
    return fileDir;
}

const createControllerFunctions = (file, model) => {
    let functionsCode = '';

    model.routes.forEach(route => {
        let func = sourceSnippets.controller.functions.methods[route.method];
        // console.log(`Function for method: ${route.method}`);
        // console.log(func);

        switch (route.method) {
            
            case 'getModels':
                {
                    func = func.replace(/@{MODEL}/g, model.names.name);
                    func = func.replace(/@{PLEURAL_MODEL}/g, model.names.pleural_name);
                    func = func.replace(/@{SMALL_PLEURAL_MODEL}/g, model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1));
                    
                    functionsCode += (func + `
                    
`);
                }
                break;
                
            case 'getModel':
            case 'createModel':
            case 'updateModel':
            case 'patchModel':
            case 'deleteModel':
                {
                    func = func.replace(/@{MODEL}/g, model.names.name);
                    func = func.replace(/@{SMALL_MODEL}/g, model.names.name.charAt(0).toLowerCase() + model.names.name.substring(1));
                    functionsCode += (func + `
    
`);
                }
                break;
        }
    });

    file = file.concat(functionsCode);
    return file;
}

const createControllerFileContents = (model) => {
    let file = sourceSnippets.controller.body;
    
    // set model const class name
    file = file.replace(/@{MODEL}/g, model.names.name);
    // Set required directory level ups for associated model class
    let relative_model_dir_change = '..';
    let dirUps = '';
    const noOfDirUps = model.controller_dir_name.split('/').filter(dir => dir.length > 0).length;
    for (let index = 0; index < noOfDirUps; index++) {
        dirUps += '../';
    }
    relative_model_dir_change = dirUps + relative_model_dir_change;
    // set dir up levels relative to model
    file = file.replace("@{RELATIVE_MODEL_DIR_CHANGE}", relative_model_dir_change);
    // set model dir
    file = file.replace("@{MODEL_DIR}", model.model_dir_name.trim().split('/').filter(dir => dir.length > 0).join('/'));
    // replace model file name
    file = file.replace('@{SMALL_PLEURAL_MODEL}', model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1));    

    // create model operation functions
    file = createControllerFunctions(file, model);
    return file;
}

const constructController = (model) => {
    let file = createControllerFileContents(model);

    const controllerFileName = model.names.pleural_name + 'Controller';
    const fileDir = controllerFileDir(model);

    writeJsFile(fileDir, controllerFileName, file);
}

const routesFileDir = (model) => {
    let fileDir = `${__dirname}/../routes/api/`;
    if ('routes_dir_name' in model && model.routes_dir_name.length > 0) fileDir += `${model.routes_dir_name}/`
    return fileDir;
}

const attachRoutesInFile = (file, model) => {
    let routes = '';

    model.routes.forEach(obj => {
        let route = sourceSnippets.routesFile.statements[obj.method];
        // console.log(`Route for method: ${obj.method}`);
        // console.log(route);

        switch (obj.method) {
            
            case 'getModels':
                {
                    route = route.replace('@{ALL_CAP_PLEURAL_MODEL}', model.names.pleural_name.toUpperCase());
                    route = route.replace('@{PLEURAL_MODEL}', model.names.pleural_name);
                    route = route.replace('@{SMALL_PLEURAL_MODEL}', model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1));
                    
                    routes += (route + `
`);
                }
                break;
                
            case 'getModel':
            case 'createModel':
            case 'updateModel':
            case 'patchModel':
            case 'deleteModel':
                {
                    route = route.replace('@{ALL_CAP_MODEL}', model.names.name.toUpperCase());
                    route = route.replace('@{MODEL}', model.names.name);
                    route = route.replace('@{SMALL_PLEURAL_MODEL}', model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1));
                    routes += (route + `
`);
                }
                break;
        }
    });

    file = file.replace("@{ATTACH_ROUTES}", routes);
    return file;
}

const createRoutesFileContents = (model) => {
    let file = sourceSnippets.routesFile.body;
    
    file = file.replace(/@{SMALL_PLEURAL_MODEL}/g, model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1));
    file = file.replace(/@{PLEURAL_MODEL}/g, model.names.pleural_name);

    // Set required directory level ups for associated controller
    let relative_controller_dir_change = '../..';
    let relative_urls_dir_change = '..';
    let dirUps = '';
    const noOfDirUps = model.routes_dir_name.split('/').filter(dir => dir.length > 0).length;
    for (let index = 0; index < noOfDirUps; index++) {
        dirUps += '../';
    }
    relative_controller_dir_change = dirUps + relative_controller_dir_change;
    relative_urls_dir_change = dirUps + relative_urls_dir_change;
    // set dir up levels relative to model
    file = file.replace("@{RELATIVE_CONTROLLER_DIR_CHANGE}", relative_controller_dir_change);
    file = file.replace("@{RELATIVE_URLS_DIR_CHANGE}", relative_urls_dir_change);
    // set controller dir
    file = file.replace("@{CONTROLLER_DIR}", model.controller_dir_name.trim().split('/').filter(dir => dir.length > 0).join('/'));
    
    // attach routes
    file = attachRoutesInFile(file, model);
    return file;
}

const constructRoutesFile = (model) => {
    let file = createRoutesFileContents(model);

    const routesFileName = model.names.pleural_name.charAt(0).toLowerCase() + model.names.pleural_name.substring(1);
    const fileDir = routesFileDir(model);

    writeJsFile(fileDir, routesFileName, file);
}

const constructAPIsforModel = (model) => {
    // Step 1. run sequelize generate:model cmd
    runSequelizeCmd(model)

    // Step 2. Update sequelize generated db model file
    updateSequelizeDBModel(model)

    // Step 3. Create Model for APIs
    constructModelClass(model)

    // Step 4. Create controller for APIs
    constructController(model)

    // Step 5. Create routes file connecting APIs routes with controller APIs functions
    constructRoutesFile(model)
}

const execute = () => {
    let files = getFileNameArguments();
    console.log("File names: ", files);

    if (files != null && files.length > 0) {
        files.forEach(file => {
            let dataSource = require(`../${file}`);

            dataSource.models.forEach(model => {
                // console.log("constructing for Model:");
                // console.log(model);
                constructAPIsforModel(model);
            });
        });
    }
    else throw new Error("No source files specified. please provide one or more .txt source files seperated by empty space.");
}

// MARK - Test Methods

const testSeqCmd = () => {
    execSync('sequelize model:generate --name ClassType --attributes name:string,email:string,address:string',
        { cwd: './database/' },
        (err, stdout, stderr) => {
            console.log(stdout);
        });
}

// testSeqCmd();

// MARK - Starting Methods

execute();