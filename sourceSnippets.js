/*
 * File: sourceSnippets.js
 * Project: REST-Magic
 * File Created: Wednesday, 15th May 2019 6:07:04 pm
 * Author: Twaha Mukammel (tm@ulkabd.com)
 * -----
 * Last Modified: Wednesday, 15th May 2019 11:52:52 pm
 * Modified By: Twaha Mukammel (tm@ulkabd.com>)
 * -----
 * Copyright (c) 2017 - 2019 Ulka Bangladesh
 * 
 * This file is a template modeling for standard snippets 
 * which acts as the building blocks of basic REST APIs CRUD
 * operations.
 * This model is for creating 3 files and updating 1 file
 * for generating APIs for any data model
 * 1. Updating DBModel created by sequelize lib consuming CRUD sequelize db operations
 * 2. Creating Model for CRUD operations
 * 3. Creating Controller for API interfaces
 * 4. Creating Routes file attaching API URIs with the Controller API interfaces
 * 
 * Considerations:
 * 1. In route use param name same as associated db table field name
 * 
 */

'use strict';

module.exports = {
    dbModel: {
        associations: {
            statements: {
                belongsTo: `@{MODEL}.belongsTo(models.@{ASSOCIATED_MODEL}, {as: '@{LOWER_ASSOCIATED_MODEL}'});`,
                hasOne: `@{MODEL}.hasOne(models.@{ASSOCIATED_MODEL}, {foreignKey: '@{FOREIGNKEY}', sourceKey: '@{SOURCEKEY}', as: '@{AS}');`,
                hasMany: `@{MODEL}.hasMany(models.@{ASSOCIATED_MODEL}, {foreignKey: '@{FOREIGNKEY}', sourceKey: '@{SOURCEKEY}', as: '@{AS}');`
            }
        },
        functions: {
            methods: {
                // Create all these methods regardless of APIs in data source
                getModelById:
`@{MODEL}.get@{MODEL}ById = (id, include = null) => {
    return @{MODEL}.findByPk(id, { include });
  };`,
                getModel:
`@{MODEL}.get@{MODEL} = (query) => {
    return @{MODEL}.findOne(query)
  };`,
                getModels:
`@{MODEL}.get@{PLEURAL_MODEL} = (query) => {
    return @{MODEL}.findAndCountAll(query);
  };`,
                createModel:
`@{MODEL}.create@{MODEL} = (data) => {
    var model = {};
    @{ASSIGN_TO_MODEL}
    return @{MODEL}.create(model);
  };`,
                updateModel:
`@{MODEL}.update@{MODEL} = (model, data) => {
    @{ASSIGN_TO_MODEL}
    return model.save();
  };`,
                deleteModel:
`@{MODEL}.delete@{MODEL} = (where) => {
    return @{MODEL}.destroy({where});
  };`,
            },
            statements: {
                assignToModel: `if (data.@{ATTRIBUTE}) model.@{ATTRIBUTE} = data.@{ATTRIBUTE}.trim();`
            }
        }
    },
    model: {
        body: 
`'use strict'
const db = require("@{RELATIVE_DB_DIR_CHANGE}/database/models/index");
const queryParser = require("@{RELATIVE_QP_DIR_CHANGE}/model/queryParser");
const Promise = require('bluebird');

function @{PLEURAL_MODEL}() {
    @{FUNCTIONS}
}
module.exports = @{PLEURAL_MODEL};
`,
        functions: {
            // Only create methods from here that are required by the APIs in data source
            methods: {
                /**
                 * Parse urls to replace @{STATEMENTS} in getModel()
                 * Use statements from Model.functions.statements
                 * if (url.params does not cointain {id} || url.params.count > 1)
                 *      use mergeParamsInQuery statement
                 *      use getModel()
                 * else
                 *      use getModelById()
                 */
                getModel:
`this.get@{MODEL} = async (req) => {
        let query = await queryParser.parse(req);
        @{STATEMENTS}
    };`,
                /**
                 * Parse urls to replace @{STATEMENTS} in getModels()
                 * Use statements from Model.functions.statements
                 * if (url.params.count > 1)
                 *      use mergeParamsInQuery statement
                 * use getModels()
                 */
                getModels:
`this.get@{PLEURAL_MODEL} = async (req) => {
        let query = await queryParser.parse(req);
        @{STATEMENTS}
    };`,
                createModel:
`this.create@{MODEL} = (req) => {
        const data = {...req.body, ...req.params}
        return db.@{MODEL}.create@{MODEL}(data);
    };`,
                updateModel:
`this.update@{MODEL} = async (req) => {
        let model = await this.get@{MODEL}(req);
        if (model == null) return Promise.resolve(null);
        return db.@{MODEL}.update@{MODEL}(model, req.body);
    };`,
                patchModel:
`this.patch@{MODEL} = async (req) => {
        let model = await this.get@{MODEL}(req);
        if (model == null) return Promise.resolve(null);
        return db.@{MODEL}.update@{MODEL}(model, req.body);
    };`,
                deleteModel:
`this.delete@{MODEL} = (req) => {
        return db.@{MODEL}.delete@{MODEL}(req.params);
    };`
            },
            statements: {
                mergeParamsInQuery: `query.where = {...query.where, ...req.params};`,
                getModelById: `return db.@{MODEL}.get@{MODEL}ById(req.params.id, 'include' in query ? query.include : null);`,
                getModel: `return db.@{MODEL}.get@{MODEL}(query);`,
                getModels: `return db.@{MODEL}.get@{PLEURAL_MODEL}(query);`
            }
        }
    },
    controller: {
        body:
`'use strict'
const @{MODEL} = require("@{RELATIVE_MODEL_DIR_CHANGE}/model/@{MODEL_DIR}/@{SMALL_PLEURAL_MODEL}");

`,
        functions: {
            methods: {
                getModel:
`exports.get@{MODEL} = (req, res) => {
    return (new @{MODEL}()).get@{MODEL}(req)
    .then((@{SMALL_MODEL}) => {
        if(@{SMALL_MODEL} == null) {
            res.status(404).send({
                success: false,
                message: "@{MODEL} reference not found."
            })
        }
        else {
            res.status(200).send({
                success: true,
                message: "@{MODEL} fetch succeeded.",
                data: @{SMALL_MODEL}
            })
        }
    })
    .catch((errors) => {
        res.status(400).send({
            success: false,
            message: "@{MODEL} fetch failed.",
            errors: Array.isArray(errors) == true ? errors : [{msg: errors.message}]
        })
    })
};`,
                getModels:
`exports.get@{PLEURAL_MODEL} = (req, res) => {
    return (new @{MODEL}()).get@{PLEURAL_MODEL}(req)
    .then((@{SMALL_PLEURAL_MODEL}) => {
        res.status(200).send({
            success: true,
            message: "@{PLEURAL_MODEL} fetch succeeded.",
            data: @{SMALL_PLEURAL_MODEL}
        })
    })
    .catch((errors) => {
        res.status(400).send({
            success: false,
            message: "@{PLEURAL_MODEL} fetch failed.",
            errors: Array.isArray(errors) == true ? errors : [{msg: errors.message}]
        })
    })
};`,
                createModel:
`exports.create@{MODEL} = (req, res) => {
    return (new @{MODEL}()).create@{MODEL}(req)
    .then((@{SMALL_MODEL}) => {
        res.status(200).send({
            success: true,
            message: "@{MODEL} creation succeeded.",
            data: @{SMALL_MODEL}
        })
    })
    .catch((errors) => {
        res.status(400).send({
            success: false,
            message: "@{MODEL} creation failed.",
            errors: Array.isArray(errors) == true ? errors : [{msg: errors.message}]
        })
    })
};`,
                updateModel:
`exports.update@{MODEL} = (req, res) => {
    return (new @{MODEL}()).update@{MODEL}(req)
    .then((@{SMALL_MODEL}) => {
        if(@{SMALL_MODEL} == null) {
            res.status(404).send({
                success: false,
                message: "@{MODEL} reference not found."
            })
        }
        else {
            res.status(200).send({
                success: true,
                message: "@{MODEL} update succeeded.",
                data: @{SMALL_MODEL}
            })
        }
    })
    .catch((errors) => {
        res.status(400).send({
            success: false,
            message: "@{MODEL} update failed.",
            errors: Array.isArray(errors) == true ? errors : [{msg: errors.message}]
        })
    })
};`,
                patchModel:
`exports.patch@{MODEL} = (req, res) => {
    return (new @{MODEL}()).patch@{MODEL}(req)
    .then((@{SMALL_MODEL}) => {
        if(@{SMALL_MODEL} == null) {
            res.status(404).send({
                success: false,
                message: "@{MODEL} reference not found."
            })
        }
        else {
            res.status(200).send({
                success: true,
                message: "@{MODEL} patch succeeded.",
                data: @{SMALL_MODEL}
            })
        }
    })
    .catch((errors) => {
        res.status(400).send({
            success: false,
            message: "@{MODEL} patch failed.",
            errors: Array.isArray(errors) == true ? errors : [{msg: errors.message}]
        })
    })
};`,
                deleteModel:
`exports.delete@{MODEL} = (req, res) => {
    return (new @{MODEL}()).delete@{MODEL}(req)
    .then((deleted) => {
        if(deleted == false) {
            res.status(404).send({
                success: false,
                message: "@{MODEL} reference not found."
            })
        }
        else {
            res.status(200).send({
                success: true,
                message: "@{MODEL} delete succeeded."
            })
        }
    })
    .catch((errors) => {
        res.status(400).send({
            success: false,
            message: "@{MODEL} delete failed.",
            errors: Array.isArray(errors) == true ? errors : [{msg: errors.message}]
        })
    })
};`
            }
        }
    },
    routesFile: {
        body:
`'use strict'
const   express =   require("express");
const   router  =   express.Router();
const {@{SMALL_PLEURAL_MODEL}} = require("@{RELATIVE_URLS_DIR_CHANGE}/urls");
const controller = require("@{RELATIVE_CONTROLLER_DIR_CHANGE}/app/controller/@{CONTROLLER_DIR}/@{PLEURAL_MODEL}Controller");

@{ATTACH_ROUTES}
module.exports = router
`,
        statements: {
            getModel: `router.get(@{SMALL_PLEURAL_MODEL}.GET_@{ALL_CAP_MODEL}, controller.get@{MODEL});`,
            getModels: `router.get(@{SMALL_PLEURAL_MODEL}.GET_@{ALL_CAP_PLEURAL_MODEL}, controller.get@{PLEURAL_MODEL});`,
            createModel: `router.post(@{SMALL_PLEURAL_MODEL}.POST_@{ALL_CAP_MODEL}, controller.create@{MODEL});`,
            updateModel: `router.put(@{SMALL_PLEURAL_MODEL}.PUT_@{ALL_CAP_MODEL}, controller.update@{MODEL});`,
            patchModel: `router.patch(@{SMALL_PLEURAL_MODEL}.PATCH_@{ALL_CAP_MODEL}, controller.patch@{MODEL});`,
            deleteModel: `router.delete(@{SMALL_PLEURAL_MODEL}.DELETE_@{ALL_CAP_MODEL}, controller.delete@{MODEL});`
        }
    }
}

/**
 * TODOS:
 * 1. How to find pleural of a model name?
 */