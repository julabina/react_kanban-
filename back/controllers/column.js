const { Project, Column, Task } = require('../db/sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create one column for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.create = (req, res, next) => {
    if (req.body.name === undefined || req.body.color === undefined || req.body.position === undefined) {
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
            const actualArr = project.columns;   
            let colArr = [];

            let column = new Column({
                projectId: project.id,
                name: req.body.name,
                color: req.body.color
            });

            column.save()
                .then(() => {

                    if (req.body.position === "start") {
                        colArr.push(column.id);
                    }
        
                    for (let i = 0; i < actualArr.length; i++) {
                        if (req.body.position !== "start" && (parseInt(req.body.position) + 1) === i ) {
                            colArr.push(column.id);
                        }
                        
                        colArr.push(actualArr[i]);
                    }
                    if ((parseInt(req.body.position) + 1) === actualArr.length) {
                        colArr.push(column.id);
                    }
        
                    project.columns = colArr;

                    project.save()
                        .then(() => {
                            const message = "Colonne bien ajoutée.";
                            res.status(201).json({ message });
                        })     
                        .catch(error => {
                            Column.destroy({ where: { id: column.id } })
                                .then(() => {
                                    if (error instanceof ValidationError) {
                                        return res.status(401).json({ message: error.message, data: error }); 
                                    }
                                    if (error instanceof UniqueConstraintError) {
                                        return res.status(401).json({ message: error.message, data: error });
                                    }
                                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne.", error });
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
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne.", error });
                });       
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * get all columns and tasks for one project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
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
            
            Column.findAll({ where: { projectId: project.id } })
                .then(columns => {
                    if (columns === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }

                    Task.findAll({ where: { projectId: project.id } })
                        .then(tasks => {
                            let message = "Aucune tache trouvé.";

                            const columnsSorted = [];
                            const colProject = project.columns;

                            for (let i = 0; i < colProject.length; i++) {
                                const arrFiltered = columns.filter(el => {
                                    return el.id === parseInt(colProject[i])
                                });
                                columnsSorted.push(arrFiltered[0]);
                            }

                            let data = [columnsSorted];

                            if (tasks !== null) { 
                                if (tasks.length > 1) {
                                    message = "Des taches ont bien été trouvées.";
                                } else {
                                    message = "Une tache a bien été trouvée.";
                                }

                                data.push(tasks);
                            }

                            res.status(200).json({ message, data });
                        })
                        .catch(error => res.status(500).json({ message: error }));
                })
                .catch(error => res.status(500).json({ message: error }));       
        })
        .catch(error => res.status(500).json({ message: error }));       
};

/**
 * update color and/or color for one column
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.update = (req, res, next) => {
    if (req.body.title === undefined || req.body.color === undefined || req.body.id === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    }

    Column.findByPk(req.body.id)
        .then(column => {
            if (column === null) {
                const message = "Aucune colonne trouvée.";
                return res.status(404).json({ message });
            }
            
            if (req.body.title !== column.name) {
                column.name = req.body.title;
            }
            if (req.body.color !== column.color) {
                column.color = req.body.color;
            }

            column.save()
                .then(() => {
                    const message = "Column bien modifiée.";
                    res.status(201).json({ message });
                })
                .catch(error => {
                    if (error instanceof ValidationError) {
                        return res.status(401).json({ message: error.message, data: error }); 
                    }
                    if (error instanceof UniqueConstraintError) {
                        return res.status(401).json({ message: error.message, data: error });
                    }
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la colonne.", error });
                });  
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * update column position
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updatePosition = (req, res, next) => {
    if (req.body.position === undefined || req.body.id === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    }

    Column.findByPk(req.body.id)
        .then(column => {
            if (column === null) {
                const message = "Aucune colonne trouvée.";
                return res.status(404).json({ message });
            }
            
            Project.findByPk(column.projectId)
            .then(project => {
                    if (project === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }
                    const arr = project.columns;
                    let newArr = [];

                    for (let i = 0; i < arr.length; i++) {
                        if (req.body.position === "0" && i === 0) {
                            newArr.push(req.body.id);
                        } 
                        if (arr[i] !== req.body.id) {
                            newArr.push(arr[i]);
                        }
                        if (i === parseInt(req.body.position) && req.body.position !== "0") {
                            newArr.push(req.body.id);
                        }
                    }

                    project.columns = newArr;

                    project.save()
                        .then(() => {
                            const message = "Projet bien modifié.";
                            res.status(201).json({ message });
                        })
                        .catch(error => res.status(500).json({ message: error }));
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};

/**
 * delete one column
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.delete = (req, res, next) => {
    Column.findByPk(req.params.id)
        .then(column => {
            if (column === null) {
                const message = "Aucune colonne trouvée.";
                return res.status(404).json({ message });
            }
            
            Project.findByPk(column.projectId)
                .then(project => {
                    if (project === null) {
                        const message = "Aucun projet trouvé.";
                        return res.status(404).json({ message });
                    }
                    if (project.userId !== req.auth.userId) {
                        const message = "Requete non authentifiée.";
                        return res.status(403).json({ message });
                    }
                    if (project.columns.length === 1) {
                        const message = "Impossible de supprimer cette colonne.";
                        return res.status(401).json({ message });
                    }

                    const arr = project.columns;
                    let newArr = arr.filter(el => {
                        return el !== req.params.id;
                    });

                    Column.destroy({ where: { id: req.params.id } })
                        .then(() => {
                            const arr = project.columns;
                            let newArr = arr.filter(el => {
                                return el !== req.params.id;
                            });
                            
                            project.columns = newArr;

                            project.save()
                                .then(() => {
                                    Task.findAll({ where : { status: req.params.id } })
                                        .then(tasks => {
                                            if (tasks === null) {
                                                const message = "Colonne bien supprimée.";
                                                return res.status(201).json({ message });
                                            }
                                            
                                            for (let i = 0; i < tasks.length; i++) {
                                                tasks[i].status = newArr[0];
                                                tasks[i].save();
                                            }   
                                            
                                            const message = "Colonne bien supprimée.";
                                            res.status(201).json({ message });
                                        });
                                })

                        })
                        .catch(error => res.status(500).json({ message: error }));
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};