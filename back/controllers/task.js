const { v4 } = require('uuid');
const { Task, Project } = require('../db/sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create one task for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.create = (req, res, next) => {
    if (req.body.title === undefined || req.body.description === undefined || req.body.subTask === undefined || req.body.status === undefined || req.body.userId === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message }); 
    }

    Project.findByPk(req.params.id)
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé.";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authorisée.";
                return res.status(403).json({ message });
            }
            let checkedArr = [];

            if (req.body.subTask.length > 0) {
                for (let i = 0; i < req.body.subTask.length; i++) {
                    checkedArr.push("false");                    
                }
            }

            const task = new Task({
                id: v4(),
                projectId: project.id,
                title: req.body.title,
                description: req.body.description,
                checked: checkedArr,
                subTask: req.body.subTask,
                status: req.body.status,
            });
            
            task.save()
                .then(() => {
                    project.changed('updatedAt', true);
                    project.save();

                    const message = "Tache bien créée.";
                    res.status(201).json({ message });
                })
                .catch(error => {
                    if (error instanceof ValidationError) {
                        return res.status(401).json({ message: error.message, data: error }); 
                    }
                    if (error instanceof UniqueConstraintError) {
                        return res.status(401).json({ message: error.message, data: error });
                    }
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la tache.", error });
                });
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * update one task column position
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updatePosition = (req, res, next) => {
    if (req.body.tasks === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message }); 
    }

    Task.findByPk(req.body.tasks.id)
        .then(task => {
            if (task === null) {
                const message = "Aucune tache trouvée.";
                return res.status(404).json({ message });
            }
           
            task.status = req.body.tasks.column;

            Project.findByPk(task.projectId)
                .then(project => {
                    if (project === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }
                    if (project.userId !== req.auth.userId) {
                        const message = "Requete non authorisée.";
                        return res.status(403).json({ message });
                    }
                
                    task.save()
                        .then(() => {
                            project.changed('updatedAt', true);
                            project.save();

                            const message = "Tache bien modifiée.";
                            res.status(201).json({ message });
                        })
                        .catch(error => {
                            if (error instanceof ValidationError) {
                                return res.status(401).json({ message: error.message, data: error }); 
                            }
                            if (error instanceof UniqueConstraintError) {
                                return res.status(401).json({ message: error.message, data: error });
                            }
                            res.status(500).json({ message: "Une erreur est survenue lors de la création de la tache.", error });
                        });
            })
            .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * update task informations
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.update = (req, res, next) => {
    if (req.body.title === undefined || req.body.description === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message }); 
    }

    Task.findByPk(req.params.id)
        .then(task => {
            if (task === null) {
                const message = "Aucune tache trouvée.";
                return res.status(404).json({ message });
            }
            if (req.body.title === task.title && req.body.description === task.description) {
                const message = "Aucune valeur n'a été modifiée.";
                return res.status(401).json({ message });
            }

            task.title = req.body.title;
            task.description = req.body.description;

            Project.findByPk(task.projectId)
                .then(project => {
                    if (project === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }
                    if (project.userId !== req.auth.userId) {
                        const message = "Requete non authorisée.";
                        return res.status(403).json({ message });
                    }
                

                    task.save()
                        .then(() => {
                            project.changed('updatedAt', true);
                            project.save();

                            const message = "Tache bien modifiée.";
                            res.status(201).json({ message });
                        })
                        .catch(error => {
                            if (error instanceof ValidationError) {
                                return res.status(401).json({ message: error.message, data: error }); 
                            }
                            if (error instanceof UniqueConstraintError) {
                                return res.status(401).json({ message: error.message, data: error });
                            }
                            res.status(500).json({ message: "Une erreur est survenue lors de la création de la tache.", error });
                        });
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * delete one task
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.delete = (req, res, next) => {
    Task.findByPk(req.params.id)
        .then(task => {
            if (task === null) {
                const message = "Aucune tache trouvée.";
                return res.status(404).json({ message });
            }
            Project.findByPk(task.projectId)
                .then(project => {
                    if (project === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }
                    if (project.userId !== req.auth.userId) {
                        const message = "Requete non authorisée.";
                        return res.status(403).json({ message });
                    }

                    Task.destroy({ where: { id: req.params.id } })
                        .then(() => {
                            project.changed('updatedAt', true);
                            project.save();
                            
                            const message = "Tache bien supprimée.";
                            res.status(201).json({ message });
                        })
                        .catch(error => res.status(500).json({ message: error }));
                    })
                    .catch(error => res.status(500).json({ message: error }));  
        })
        .catch(error => res.status(500).json({ message: error }));  
};

/**
 * update subtask, checked or not
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.check = (req, res, next) => {
    if (req.body.index === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message }); 
    }

    const ind = parseInt(req.body.index);

    Task.findByPk(req.params.id)
        .then(task => {
            if (task === null) {
                const message = "Aucune tache trouvée.";
                return res.status(404).json({ message });
            }
            let checkedArr = task.checked; 

            if (checkedArr[ind] === "false") {
                checkedArr[ind] = "true";
            } else if (checkedArr[ind] === 'true') {
                checkedArr[ind] = "false";
            }

            task.checked = checkedArr;

            task.save()
                .then(() => {
                    const message = "Sous tache modifiée.";
                    res.status(201).json({ message });
                })
                .catch(error => res.status(500).json({ message: error })); 
        })
        .catch(error => res.status(500).json({ message: error })); 
};