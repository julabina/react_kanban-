const { v4 } = require('uuid');
const { Project, User, Column, Task } = require('../db/sequelize');
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
    }

    if (req.body.userId !== req.auth.userId) {
        const message = "Requete non autorisée.";
        return res.status(403).json({ message });
    }

    User.findByPk(req.body.userId)
        .then(user => {
            if (user === null) {
                const message = "Aucun utilisateur trouvé.";
                return res.status(404).json({ message });
            }
            const projectId = v4();

            const todo = new Column({
                projectId: projectId,
                name: "A faire",
                color: "#FF0000"
            });

            const doing = new Column({
                projectId: projectId,
                name: "En cour",
                color: "#0000FF"
            });

            const done = new Column({
                projectId: projectId,
                name: "Terminé",
                color: "#008000"
            });

            todo.save()
                .then(() => {
                    doing.save()
                        .then(() => {
                            done.save()
                                .then(() => {

                                    
                                    const project = new Project({
                                        id: projectId,
                                        userId: req.body.userId,
                                        title: req.body.title,
                                        description: req.body.description,
                                        columns: [todo.id, doing.id, done.id],
                                    });

                                    project.save()
                                        .then(() => {
                                            const message = "Projet bien créé.";
                                            res.status(201).json({ message });
                                        })
                                        .catch(error => {
                                            const colArr = [todo.id, doing.id, done.id];

                                            Column.destroy({ where: { id: colArr } })
                                                .then(() => {

                                                    if (error instanceof ValidationError) {
                                                        return res.status(401).json({ message: error.message, data: error }); 
                                                    }
                                                    if (error instanceof UniqueConstraintError) {
                                                        return res.status(401).json({ message: error.message, data: error });
                                                    }
                                                    res.status(500).json({ message: "Une erreur est survenue lors de la création du projet.", error });
                                                })
                                                .catch(error => res.status(500).json({ message: error }));
                                        });
                                })
                                .catch(error => {
                                    const colArr = [todo.id, doing.id];
                                    Column.destroy({ where: { id: colArr } })
                                        .then(() => {
                                            if (error instanceof ValidationError) {
                                                return res.status(401).json({ message: error.message, data: error }); 
                                            }
                                            if (error instanceof UniqueConstraintError) {
                                                return res.status(401).json({ message: error.message, data: error });
                                            }
                                            res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne 3.", error });
                                        })
                                        .catch(error => res.status(500).json({ message: error }));
                                });
                                
                        })
                        .catch(error => {
                            Column.destroy({ where : { id: todo.id } })
                                .then(() => { 
                                    if (error instanceof ValidationError) {
                                        return res.status(401).json({ message: error.message, data: error }); 
                                    }
                                    if (error instanceof UniqueConstraintError) {
                                        return res.status(401).json({ message: error.message, data: error });
                                    }
                                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne 2.", error });
                                })
                                .catch(error => res.status(500).json({ message: error }));
                        });
                })
                .catch(error => {
                    if (error instanceof ValidationError) {
                        return res.status(401).json({ message: error.message, data: error }); 
                    }
                    if (error instanceof UniqueConstraintError) {
                        return res.status(401).json({ message: error.message, data: error });
                    }
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne 1.", error });
                });
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * get all project from one user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
    User.findByPk(req.params.id)
        .then(user => {
            if (user === null) {
                const message = "Aucun utilisateur trouvé.";
                return res.status(404).json({ message });
            }

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
 * get informations for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getOne = (req, res, next) => {
    Project.findByPk(req.params.id)
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé.";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non autorisée.";
                return res.status(403).json({ message });
            }

            const message = "Un projet a bien été trouvé.";
            res.status(200).json({ message, data: project });
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * update project informations
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.updateProject = (req, res, next) => {
    if (req.body.title === undefined || req.body.description === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    }

    Project.findByPk(req.params.id)
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authentifiée.";
                return res.status(403).json({ message });
            }

            project.title = req.body.title;
            project.description = req.body.description;

            project.save()
                .then(() => {
                    const message = "Projet bien modifié.";
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
};

/**
 * delete one project with the columns and tasks
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteProject = (req, res, next) => {
    Project.findByPk(req.params.id)
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authentifiée.";
                return res.status(403).json({ message });
            }

            Task.destroy({ where: { projectId: req.params.id } });
            Project.destroy({ where: { id: req.params.id } });
            Column.destroy({ where: { projectId: req.params.id } })             
                .then(() => {
                    const message = "Projet supprimé.";
                    res.status(201).json({ message });
                })              
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};