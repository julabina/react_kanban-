const { v4 } = require('uuid');
const { Project, User } = require('../db/sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create a new project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.create = (req, res, next) => {
    if (req.body.title === undefined || req.body.description === undefined || req.body.userId === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    } else {
        if (req.body.userId !== req.auth.userId) {
            const message = "Requete non authorisée.";
            return res.status(403).json({ message });
        }

        User.findOne({ where: { id: req.body.userId } })
            .then(user => {
                if (user === null) {
                    const message = "Aucun utilisateur trouvé.";
                    return res.status(404).json({ message });
                }

                const projectId = v4();
                const project = new Project({
                    id: projectId,
                    userId: req.body.userId,
                    title: req.body.title,
                    description: req.body.description,
                    columns: ["A faire", "En cour", "Terminé"],
                    columnsColor: ["red", "blue", "green"]
                });

                project.save()
                    .then(() => {
                        const message = "Projet bien créé.";
                        res.status(201).json({ message });
                    })
                    .catch(error => {
                        if (error instanceof ValidationError) {
                            return res.status(401).json({ message: error.message, data: error }); 
                        }
                        if (error instanceof UniqueConstraintError) {
                            return res.status(401).json({ message: error.message, data: error });
                        }
                        res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                    });
            })
            .catch(error => res.status(500).json({ message: error }));
    }
};

/**
 * get all project from one user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
    User.findOne({ where: { id: req.params.id } })
        .then(user => {
            if (user === null) {
                const message = "Aucun utilisateur trouvé.";
                return res.status(404).json({ message });
            }
            console.log("1");

            Project.findAll({ where : { userId: req.params.id } })
                .then(projects => {
                    if (projects === null) {
                        const message = "Aucun projets trouvés.";
                        return res.status(404).json({ message });
                    }

                    let message = "Des projets ont bien été trouvés.";
                    if (projects.length === 1) {
                        message = "Un projet a bien été trouvé.";
                    }

                    res.status(200).json({ message, data: projects });
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * update columns column for one project add one column to the project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.addColumn = (req, res, next) => {
    console.log(req.body);
    console.log(req.params.id);
    if (req.body.name === undefined || req.body.color === undefined || req.body.position === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    } else {
        Project.findOne({ where: { id: req.params.id } })
            .then(project => {
                if (project === null) {
                    const message = "Aucun projet trouvé.";
                    return res.status(404).json({ message });
                }
                if (project.userId !== req.auth.userId) {
                    const message = "Requete non authorisée.";
                    return res.status(403).json({ message });
                }
                const actualArr = project.columns;   
                const actualColorArr = project.columnsColor;   
                
                let colArr = [];
                let colColorArr = [];
                
                if (req.body.position === "start") {
                    colArr = [req.body.name];
                    colColorArr = [req.body.color];
                }

                for (let i = 0; i < actualArr.length; i++) {
                    if (req.body.position !== "start" && (parseInt(req.body.position) + 1) === i ) {
                        colArr.push(req.body.name);
                        colColorArr.push(req.body.color);
                    }
                    
                    colArr.push(actualArr[i]);
                    colColorArr.push(actualColorArr[i]);
                }
                if ((parseInt(req.body.position) + 1) === actualArr.length) {
                    colArr.push(req.body.name);
                    colColorArr.push(req.body.color);
                }

                project.columns = colArr;
                project.columnsColor = colColorArr;

                project.save()
                    .then(() => {
                        const message = "Colonne bien ajoutée.";
                        res.status(201).json({ message });
                    })     
                    .catch(error => {
                        if (error instanceof ValidationError) {
                            return res.status(401).json({ message: error.message, data: error }); 
                        }
                        if (error instanceof UniqueConstraintError) {
                            return res.status(401).json({ message: error.message, data: error });
                        }
                        res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                    });           
            })
            .catch(error => res.status(500).json({ message: error }));
    }
};

/**
 * get informations for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getOne = (req, res, next) => {
    Project.findOne({ where: { id: req.params.id } })
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé.";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authorisée.";
                return res.status(403).json({ message });
            }

            const message = "Un projet a bien été trouvé.";
            res.status(200).json({ message, data: project });
        })
        .catch(error => res.status(500).json({ message: error }));
};